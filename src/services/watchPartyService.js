// src/services/watchPartyService.js
// Real-Time Multi-User Watch Together Client Engine
// Synchronizes Room ID, Media State, Shared Playback Controls (Play, Pause, Seek, Speed),
// Active Participants, Live Chat, and Floating Reactions via WebSocket (/ws-watch-party),
// BroadcastChannel (multi-tab), and ntfy.sh cloud SSE/POST relay.

const USER_PROFILE_KEY = 'furina_watch_party_profile_v1';
const ACTIVE_ROOM_KEY = 'furina_watch_party_room_v1';

const AVATAR_COLORS = [
  '#22d3ee', // Cyan
  '#f59e0b', // Amber/Gold
  '#f43f5e', // Rose
  '#a855f7', // Purple
  '#10b981', // Emerald
  '#3b82f6'  // Blue
];

export function formatTimecode(totalSeconds) {
  const sec = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = sec % 60;
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

class WatchPartyService {
  constructor() {
    this.ws = null;
    this.bc = null;
    this.sse = null;
    this.reconnectTimer = null;
    this.listeners = new Set();

    this.userProfile = this.loadUserProfile();
    this.roomCode = this.loadInitialRoomCode();
    this.isSessionActive = this.checkInitialSessionActive();
    this.isConnected = false;
    this.connectionMode = 'Connecting...';
    this.participants = [this.userProfile];
    this.mediaState = null;
    this.playbackState = {
      isPlaying: true,
      currentTime: 0,
      duration: 7200,
      playbackRate: 1,
      lastUpdatedAt: Date.now(),
      updatedBy: this.userProfile.name,
      lastAction: 'init'
    };
    this.chatHistory = [];
    this.seenMessageIds = new Set();
    this.seenReactionIds = new Set();

    if (this.isSessionActive) {
      setTimeout(() => {
        this.connectTransports(this.roomCode, false);
      }, 50);
    }
  }

  checkInitialSessionActive() {
    try {
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#room=')) {
        return true;
      }
      return Boolean(sessionStorage.getItem(ACTIVE_ROOM_KEY));
    } catch {
      return false;
    }
  }

  loadUserProfile() {
    try {
      const saved = localStorage.getItem(USER_PROFILE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.userId && parsed.name) return parsed;
      }
    } catch {}
    const profile = {
      userId: `usr_${Math.random().toString(36).slice(2, 10)}`,
      name: `CinemaFan_${Math.floor(100 + Math.random() * 899)}`,
      color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]
    };
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
    } catch {}
    return profile;
  }

  updateUserProfile(name, color) {
    const cleanName = String(name || '').trim().slice(0, 24) || this.userProfile.name;
    this.userProfile = {
      ...this.userProfile,
      name: cleanName,
      color: color || this.userProfile.color
    };
    try {
      localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(this.userProfile));
    } catch {}
    if (this.roomCode) {
      this.sendWs({
        type: 'room:join',
        roomCode: this.roomCode,
        user: this.userProfile,
        mediaState: this.mediaState
      });
    }
    this.notify();
    return this.userProfile;
  }

  loadInitialRoomCode() {
    try {
      if (typeof window !== 'undefined' && window.location.hash.startsWith('#room=')) {
        const rawHash = window.location.hash.slice(1);
        const params = new URLSearchParams(rawHash.replace(/^room=([^&]+)/, 'roomCode=$1'));
        const fromUrl = params.get('roomCode');
        if (fromUrl) return fromUrl.trim().toUpperCase();
      }
      const saved = sessionStorage.getItem(ACTIVE_ROOM_KEY);
      if (saved) return saved;
    } catch {}
    return `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  getEstimatedCurrentTime() {
    const pb = this.playbackState;
    if (!pb) return 0;
    const base = Math.max(0, Number(pb.currentTime) || 0);
    const dur = Math.max(60, Number(pb.duration) || 7200);
    const rate = Number(pb.playbackRate) || 1;
    if (!pb.isPlaying || !pb.lastUpdatedAt) {
      return Math.min(dur, base);
    }
    const elapsedSec = Math.max(0, (Date.now() - pb.lastUpdatedAt) / 1000) * rate;
    return Math.min(dur, base + elapsedSec);
  }

  getState() {
    return {
      roomCode: this.roomCode,
      isSessionActive: this.isSessionActive,
      userProfile: this.userProfile,
      isConnected: this.isConnected,
      connectionMode: this.connectionMode,
      participants: this.participants,
      mediaState: this.mediaState,
      playbackState: {
        ...this.playbackState,
        estimatedTime: this.getEstimatedCurrentTime()
      },
      chatHistory: this.chatHistory
    };
  }

  subscribe(fn) {
    this.listeners.add(fn);
    fn(this.getState(), null);
    return () => this.listeners.delete(fn);
  }

  notify(extraEvent = null) {
    const state = this.getState();
    for (const fn of this.listeners) {
      try {
        fn(state, extraEvent);
      } catch {}
    }
  }

  joinRoom(roomCode, initialMedia = null, isHost = false) {
    const cleanCode = String(roomCode || this.roomCode || `FURINA-${Math.floor(1000 + Math.random() * 9000)}`)
      .trim()
      .toUpperCase();

    const roomChanged = this.roomCode !== cleanCode;
    this.roomCode = cleanCode;
    this.isSessionActive = true;

    try {
      sessionStorage.setItem(ACTIVE_ROOM_KEY, cleanCode);
    } catch {}

    if (initialMedia && (isHost || !this.mediaState || roomChanged)) {
      this.mediaState = this.formatMediaState(initialMedia);
    }

    if (roomChanged) {
      this.chatHistory = [];
      this.participants = [this.userProfile];
    }

    this.connectTransports(cleanCode, isHost);
    this.notify({ type: 'room:joined', roomCode: cleanCode });
    return cleanCode;
  }

  formatMediaState(item, extras = {}) {
    if (!item) return this.mediaState;
    return {
      id: item.id || item.tmdbId || item.tmdb_id,
      tmdbId: item.tmdbId || item.tmdb_id || (typeof item.id === 'number' ? item.id : undefined),
      title: item.title || item.name || 'Untitled',
      name: item.name || item.title || 'Untitled',
      media_type: item.media_type || item.type || (item.first_air_date ? 'tv' : 'movie'),
      type: item.type || item.media_type || (item.first_air_date ? 'tv' : 'movie'),
      poster_path: item.poster_path || item.poster || '',
      backdrop_path: item.backdrop_path || item.backdrop || '',
      vote_average: item.vote_average || 8.0,
      release_date: item.release_date || item.first_air_date || '2024',
      isHindiDubbed: Boolean(item.isHindiDubbed || item.hasHindiDub),
      season: Number(extras.season || item.season || 1),
      episode: Number(extras.episode || item.episode || 1),
      serverId: extras.serverId || item.preferredServerId || 'vidstuck',
      audioMode: extras.audioMode || 'hindi',
      updatedAt: Date.now(),
      updatedBy: this.userProfile.name
    };
  }

  connectTransports(roomCode, isHost = false) {
    // 1. WebSocket connection to /ws-watch-party on the server
    this.connectWebSocket(roomCode, isHost);

    // 2. BroadcastChannel for instant multi-tab sync
    try {
      if (this.bc) this.bc.close();
      if (typeof BroadcastChannel !== 'undefined') {
        this.bc = new BroadcastChannel(`furina_party_${roomCode}`);
        this.bc.onmessage = (event) => {
          this.handleIncomingPayload(event.data);
        };
        this.bc.postMessage({
          type: 'peer:hello',
          roomCode,
          user: this.userProfile,
          mediaState: this.mediaState,
          playbackState: this.playbackState
        });
      }
    } catch {}

    // 3. Cross-Network Cloud SSE Relay (ntfy.sh)
    try {
      if (this.sse) this.sse.close();
      const topic = `furina_wp_${roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      this.sse = new EventSource(`https://ntfy.sh/${topic}/sse`);
      this.sse.onopen = () => {
        if (!this.isConnected) {
          this.isConnected = true;
          this.connectionMode = 'Live Cloud Relay Connected';
          this.notify();
        }
      };
      this.sse.onmessage = (e) => {
        try {
          const wrapper = JSON.parse(e.data);
          const payload = wrapper?.message ? JSON.parse(wrapper.message) : wrapper;
          if (payload && payload.senderId !== this.userProfile.userId) {
            this.handleIncomingPayload(payload);
          }
        } catch {}
      };
    } catch {}
  }

  connectWebSocket(roomCode, isHost = false) {
    if (typeof window === 'undefined') return;
    try {
      if (this.ws) {
        this.ws.onclose = null;
        this.ws.close();
      }
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
      }

      const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${proto}//${window.location.host}/ws-watch-party`;
      const ws = new WebSocket(wsUrl);
      this.ws = ws;

      ws.onopen = () => {
        this.isConnected = true;
        this.connectionMode = 'Real-Time WebSocket Synced';
        this.sendWs({
          type: 'room:join',
          roomCode,
          user: this.userProfile,
          mediaState: this.mediaState,
          isHost
        });
        this.notify();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleIncomingPayload(data);
        } catch {}
      };

      ws.onclose = () => {
        this.reconnectTimer = setTimeout(() => {
          if (this.roomCode === roomCode) {
            this.connectWebSocket(roomCode, false);
          }
        }, 3500);
      };
    } catch {}
  }

  sendWs(payload) {
    try {
      if (this.ws && this.ws.readyState === 1) {
        this.ws.send(JSON.stringify(payload));
        return true;
      }
    } catch {}
    return false;
  }

  publishCloudRelay(payload) {
    try {
      if (this.bc) {
        this.bc.postMessage(payload);
      }
    } catch {}

    try {
      const topic = `furina_wp_${this.roomCode.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      fetch(`https://ntfy.sh/${topic}`, {
        method: 'POST',
        body: JSON.stringify({
          ...payload,
          senderId: this.userProfile.userId
        })
      }).catch(() => {});
    } catch {}
  }

  handleIncomingPayload(data) {
    if (!data || typeof data !== 'object') return;

    if (data.type === 'room:state') {
      if (Array.isArray(data.participants) && data.participants.length > 0) {
        this.participants = this.dedupeParticipants([this.userProfile, ...data.participants]);
      }
      if (data.mediaState) {
        this.mediaState = data.mediaState;
      }
      if (data.playbackState) {
        this.playbackState = {
          ...this.playbackState,
          ...data.playbackState,
          lastUpdatedAt: Date.now()
        };
      }
      if (Array.isArray(data.chatHistory)) {
        data.chatHistory.forEach((msg) => {
          if (msg?.id && !this.seenMessageIds.has(msg.id)) {
            this.seenMessageIds.add(msg.id);
            this.chatHistory.push(msg);
          }
        });
      }
      this.notify({ type: 'room:state', mediaState: this.mediaState, playbackState: this.playbackState });
    } else if (data.type === 'room:participants') {
      if (Array.isArray(data.participants)) {
        this.participants = this.dedupeParticipants([this.userProfile, ...data.participants]);
        this.notify({ type: 'room:participants', joinedUser: data.joinedUser });
      }
    } else if (data.type === 'peer:hello') {
      if (data.user) {
        this.participants = this.dedupeParticipants([...this.participants, data.user]);
        this.notify();
      }
    } else if (data.type === 'media:updated') {
      if (data.mediaState) {
        this.mediaState = data.mediaState;
      }
      if (data.playbackState) {
        this.playbackState = {
          ...this.playbackState,
          ...data.playbackState,
          lastUpdatedAt: Date.now()
        };
      }
      this.notify({ type: 'media:updated', mediaState: data.mediaState, playbackState: this.playbackState });
    } else if (data.type === 'playback:updated' && data.playbackState) {
      this.playbackState = {
        ...this.playbackState,
        ...data.playbackState,
        lastUpdatedAt: Date.now()
      };
      this.notify({ type: 'playback:updated', playbackState: this.playbackState });
    } else if (data.type === 'chat:message' && data.message) {
      const msg = data.message;
      if (msg.id && !this.seenMessageIds.has(msg.id)) {
        this.seenMessageIds.add(msg.id);
        this.chatHistory = [...this.chatHistory, msg].slice(-60);
        this.notify({ type: 'chat:message', message: msg });
      }
    } else if (data.type === 'reaction:fired' && data.reaction) {
      const rx = data.reaction;
      if (rx.id && !this.seenReactionIds.has(rx.id)) {
        this.seenReactionIds.add(rx.id);
        this.notify({ type: 'reaction:fired', reaction: rx });
      }
    }
  }

  dedupeParticipants(list) {
    const map = new Map();
    for (const p of list) {
      if (p && p.userId) {
        map.set(p.userId, p);
      }
    }
    return Array.from(map.values());
  }

  syncMedia(item, extras = {}) {
    const formatted = this.formatMediaState(item, extras);
    this.mediaState = formatted;
    this.isSessionActive = true;
    const payload = {
      type: 'media:sync',
      roomCode: this.roomCode,
      mediaState: formatted,
      updatedBy: this.userProfile.name
    };
    this.sendWs(payload);
    this.publishCloudRelay({
      type: 'media:updated',
      roomCode: this.roomCode,
      mediaState: formatted
    });
    this.notify({ type: 'media:local-sync', mediaState: formatted });
    return formatted;
  }

  /**
   * Synchronize shared playback controls (Play, Pause, Seek, Playback Speed) across all users in the room
   */
  syncPlaybackControl({ action = 'sync', isPlaying, currentTime, duration, playbackRate }) {
    this.isSessionActive = true;
    const nextState = {
      isPlaying: typeof isPlaying === 'boolean' ? isPlaying : this.playbackState.isPlaying,
      currentTime: Math.max(0, Number(currentTime ?? this.getEstimatedCurrentTime()) || 0),
      duration: Math.max(60, Number(duration || this.playbackState.duration) || 7200),
      playbackRate: Number(playbackRate || this.playbackState.playbackRate) || 1,
      lastUpdatedAt: Date.now(),
      updatedBy: this.userProfile.name,
      lastAction: action
    };

    this.playbackState = nextState;

    this.sendWs({
      type: 'playback:control',
      roomCode: this.roomCode,
      action,
      playbackState: nextState,
      updatedBy: this.userProfile.name
    });

    this.publishCloudRelay({
      type: 'playback:updated',
      roomCode: this.roomCode,
      playbackState: nextState
    });

    this.notify({ type: 'playback:local', playbackState: nextState });
    return nextState;
  }

  sendPlay(currentTime, duration) {
    return this.syncPlaybackControl({
      action: 'play',
      isPlaying: true,
      currentTime: currentTime ?? this.getEstimatedCurrentTime(),
      duration
    });
  }

  sendPause(currentTime, duration) {
    return this.syncPlaybackControl({
      action: 'pause',
      isPlaying: false,
      currentTime: currentTime ?? this.getEstimatedCurrentTime(),
      duration
    });
  }

  sendSeek(targetTime, isPlaying, duration) {
    return this.syncPlaybackControl({
      action: 'seek',
      isPlaying: typeof isPlaying === 'boolean' ? isPlaying : this.playbackState.isPlaying,
      currentTime: Math.max(0, Number(targetTime) || 0),
      duration
    });
  }

  sendPlaybackRate(rate, currentTime) {
    return this.syncPlaybackControl({
      action: 'rate',
      isPlaying: this.playbackState.isPlaying,
      currentTime: currentTime ?? this.getEstimatedCurrentTime(),
      playbackRate: Number(rate) || 1
    });
  }

  sendChatMessage(text) {
    const clean = String(text || '').trim().slice(0, 400);
    if (!clean) return null;
    const message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: this.userProfile.userId,
      userName: this.userProfile.name,
      color: this.userProfile.color,
      text: clean,
      timestamp: Date.now()
    };
    this.seenMessageIds.add(message.id);
    this.chatHistory = [...this.chatHistory, message].slice(-60);
    this.notify({ type: 'chat:message', message });

    this.sendWs({
      type: 'chat:message',
      roomCode: this.roomCode,
      message
    });
    this.publishCloudRelay({
      type: 'chat:message',
      roomCode: this.roomCode,
      message
    });
    return message;
  }

  sendReaction(emoji) {
    const rx = {
      id: `rx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      emoji: String(emoji || '🍿'),
      userName: this.userProfile.name,
      timestamp: Date.now()
    };
    this.seenReactionIds.add(rx.id);
    this.notify({ type: 'reaction:fired', reaction: rx });

    this.sendWs({
      type: 'reaction:send',
      roomCode: this.roomCode,
      reaction: rx
    });
    this.publishCloudRelay({
      type: 'reaction:fired',
      roomCode: this.roomCode,
      reaction: rx
    });
    return rx;
  }

  buildShareableUrl(mediaOverride = null) {
    const m = mediaOverride || this.mediaState;
    const t = Math.floor(this.getEstimatedCurrentTime());
    if (typeof window === 'undefined') {
      return `https://junaid355.github.io/furina-moviebox/#room=${this.roomCode}`;
    }
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const mId = m?.id ? `&id=${encodeURIComponent(m.id)}` : '';
    const mTitle = (m?.title || m?.name) ? `&title=${encodeURIComponent(m.title || m.name)}` : '';
    const mType = m?.media_type ? `&type=${m.media_type}` : '';
    const sParam = m?.season ? `&s=${m.season}` : '';
    const eParam = m?.episode ? `&e=${m.episode}` : '';
    const srvParam = m?.serverId ? `&srv=${m.serverId}` : '';
    const posterParam = m?.poster_path ? `&poster=${encodeURIComponent(m.poster_path)}` : '';
    const tParam = t > 0 ? `&t=${t}` : '';

    return `${origin}${pathname}#room=${this.roomCode}${mId}${mTitle}${mType}${sParam}${eParam}${srvParam}${posterParam}${tParam}`;
  }
}

const watchPartyService = new WatchPartyService();
export default watchPartyService;
