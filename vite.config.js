import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { WebSocketServer } from 'ws';

/**
 * Vite plugin that attaches a real-time Server-Authoritative WebSocket server
 * at /ws-watch-party on the same HTTP server port (3000 / 5173) for Watch Together rooms.
 * Synchronizes Room ID, Media State, Shared Playback Controls (Play, Pause, Seek, Rate),
 * Active Participants, Live Chat, and Floating Reactions.
 */
function watchPartyWebSocketPlugin() {
  const rooms = new Map();

  function getOrCreateRoom(roomCode) {
    const normalized = String(roomCode || 'FURINA-1000').trim().toUpperCase();
    if (!rooms.has(normalized)) {
      rooms.set(normalized, {
        roomCode: normalized,
        participants: new Map(),
        mediaState: null,
        playbackState: {
          isPlaying: true,
          currentTime: 0,
          duration: 7200,
          playbackRate: 1,
          lastUpdatedAt: Date.now(),
          updatedBy: 'System',
          lastAction: 'init'
        },
        chatHistory: []
      });
    }
    return rooms.get(normalized);
  }

  function computeLivePlaybackState(playbackState) {
    if (!playbackState) return null;
    const now = Date.now();
    let currentTime = Number(playbackState.currentTime) || 0;
    const duration = Number(playbackState.duration) || 7200;
    const rate = Number(playbackState.playbackRate) || 1;

    if (playbackState.isPlaying && playbackState.lastUpdatedAt) {
      const elapsedSec = Math.max(0, (now - playbackState.lastUpdatedAt) / 1000) * rate;
      currentTime = Math.min(duration, currentTime + elapsedSec);
    }

    return {
      ...playbackState,
      currentTime: Math.round(currentTime * 10) / 10,
      lastUpdatedAt: now
    };
  }

  function broadcastToRoom(room, payload, excludeWs = null) {
    const serialized = JSON.stringify(payload);
    for (const [clientWs] of room.participants.entries()) {
      if (clientWs !== excludeWs && clientWs.readyState === 1) {
        try {
          clientWs.send(serialized);
        } catch {}
      }
    }
  }

  function getParticipantsList(room) {
    return Array.from(room.participants.values());
  }

  function attachWsServer(httpServer) {
    if (!httpServer || httpServer.__furinaWsAttached) return;
    httpServer.__furinaWsAttached = true;

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on('upgrade', (request, socket, head) => {
      try {
        const url = new URL(request.url || '', `http://${request.headers.host || 'localhost'}`);
        if (url.pathname === '/ws-watch-party') {
          wss.handleUpgrade(request, socket, head, (ws) => {
            wss.emit('connection', ws, request);
          });
        }
      } catch {}
    });

    wss.on('connection', (ws) => {
      let currentRoomCode = null;

      ws.on('message', (raw) => {
        try {
          const msg = JSON.parse(String(raw));
          if (!msg || typeof msg !== 'object') return;

          if (msg.type === 'room:join') {
            const code = String(msg.roomCode || 'FURINA-1000').trim().toUpperCase();
            if (currentRoomCode && currentRoomCode !== code) {
              const prevRoom = rooms.get(currentRoomCode);
              if (prevRoom) {
                prevRoom.participants.delete(ws);
                broadcastToRoom(prevRoom, {
                  type: 'room:participants',
                  roomCode: prevRoom.roomCode,
                  participants: getParticipantsList(prevRoom)
                });
              }
            }

            currentRoomCode = code;
            const room = getOrCreateRoom(code);

            const participant = {
              userId: String(msg.user?.userId || `user_${Date.now()}`),
              name: String(msg.user?.name || 'Cinema Guest').slice(0, 28),
              color: String(msg.user?.color || '#22d3ee'),
              joinedAt: Date.now()
            };

            room.participants.set(ws, participant);

            if (msg.mediaState && (!room.mediaState || msg.isHost)) {
              room.mediaState = {
                ...msg.mediaState,
                updatedAt: Date.now(),
                updatedBy: participant.name
              };
            }

            const livePlayback = computeLivePlaybackState(room.playbackState);

            // Send full authoritative room state to the joining client
            ws.send(
              JSON.stringify({
                type: 'room:state',
                roomCode: room.roomCode,
                participants: getParticipantsList(room),
                mediaState: room.mediaState,
                playbackState: livePlayback,
                chatHistory: room.chatHistory
              })
            );

            // Broadcast updated participants list to everyone else in the room
            broadcastToRoom(
              room,
              {
                type: 'room:participants',
                roomCode: room.roomCode,
                participants: getParticipantsList(room),
                joinedUser: participant
              },
              ws
            );
          } else if (msg.type === 'media:sync' && currentRoomCode) {
            const room = getOrCreateRoom(currentRoomCode);
            const sender = room.participants.get(ws);
            room.mediaState = {
              ...room.mediaState,
              ...msg.mediaState,
              updatedAt: Date.now(),
              updatedBy: sender?.name || msg.updatedBy || 'Friend'
            };
            // Reset playback time to 0 when switching to a brand new title/episode
            room.playbackState = {
              isPlaying: true,
              currentTime: 0,
              duration: Number(msg.mediaState?.duration) || 7200,
              playbackRate: 1,
              lastUpdatedAt: Date.now(),
              updatedBy: sender?.name || msg.updatedBy || 'Friend',
              lastAction: 'change_media'
            };

            broadcastToRoom(
              room,
              {
                type: 'media:updated',
                roomCode: room.roomCode,
                mediaState: room.mediaState,
                playbackState: room.playbackState
              },
              ws
            );
          } else if (msg.type === 'playback:control' && currentRoomCode) {
            const room = getOrCreateRoom(currentRoomCode);
            const sender = room.participants.get(ws);
            const incoming = msg.playbackState || {};

            room.playbackState = {
              isPlaying: typeof incoming.isPlaying === 'boolean' ? incoming.isPlaying : room.playbackState.isPlaying,
              currentTime: Math.max(0, Number(incoming.currentTime ?? room.playbackState.currentTime) || 0),
              duration: Math.max(60, Number(incoming.duration || room.playbackState.duration) || 7200),
              playbackRate: Number(incoming.playbackRate || room.playbackState.playbackRate) || 1,
              lastUpdatedAt: Date.now(),
              updatedBy: sender?.name || msg.updatedBy || 'Friend',
              lastAction: String(incoming.lastAction || msg.action || 'sync')
            };

            broadcastToRoom(
              room,
              {
                type: 'playback:updated',
                roomCode: room.roomCode,
                playbackState: room.playbackState
              },
              ws
            );
          } else if (msg.type === 'chat:message' && currentRoomCode) {
            const room = getOrCreateRoom(currentRoomCode);
            const sender = room.participants.get(ws);
            const chatMsg = {
              id: String(msg.message?.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`),
              userId: sender?.userId || msg.message?.userId || 'anon',
              userName: sender?.name || msg.message?.userName || 'Friend',
              color: sender?.color || msg.message?.color || '#22d3ee',
              text: String(msg.message?.text || '').trim().slice(0, 400),
              timestamp: Date.now()
            };

            if (!chatMsg.text) return;
            if (!room.chatHistory.some((m) => m.id === chatMsg.id)) {
              room.chatHistory.push(chatMsg);
              if (room.chatHistory.length > 60) {
                room.chatHistory.shift();
              }
            }

            broadcastToRoom(room, {
              type: 'chat:message',
              roomCode: room.roomCode,
              message: chatMsg
            });
          } else if (msg.type === 'reaction:send' && currentRoomCode) {
            const room = getOrCreateRoom(currentRoomCode);
            const sender = room.participants.get(ws);
            broadcastToRoom(room, {
              type: 'reaction:fired',
              roomCode: room.roomCode,
              reaction: {
                id: String(msg.reaction?.id || `rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`),
                emoji: String(msg.reaction?.emoji || '🍿').slice(0, 8),
                userName: sender?.name || msg.reaction?.userName || 'Friend',
                timestamp: Date.now()
              }
            });
          }
        } catch {}
      });

      ws.on('close', () => {
        if (currentRoomCode && rooms.has(currentRoomCode)) {
          const room = rooms.get(currentRoomCode);
          room.participants.delete(ws);
          if (room.participants.size === 0) {
            setTimeout(() => {
              if (room.participants.size === 0) {
                rooms.delete(currentRoomCode);
              }
            }, 600000);
          } else {
            broadcastToRoom(room, {
              type: 'room:participants',
              roomCode: room.roomCode,
              participants: getParticipantsList(room)
            });
          }
        }
      });
    });
  }

  return {
    name: 'furina-watch-party-ws',
    configureServer(server) {
      attachWsServer(server.httpServer);
    },
    configurePreviewServer(server) {
      attachWsServer(server.httpServer);
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), watchPartyWebSocketPlugin()],
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-icons': ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
