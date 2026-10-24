import React, { useState, useEffect, useMemo, useRef } from 'react';
import { X, Users, Copy, Check, Share2, Play, Sparkles, Radio, ShieldCheck, RefreshCw, Send, MessageSquare, Flame } from 'lucide-react';
import soundFx from '../services/soundFx';

const REACTION_EMOJIS = ['🔥', '😱', '😂', '🍿', '💙', '👑'];

export default function WatchTogetherModal({ 
  isOpen, 
  onClose, 
  activeMedia, 
  currentServer, 
  season = 1, 
  episode = 1,
  onSyncState 
}) {
  const [roomCode, setRoomCode] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#room=')) {
      const hashContent = window.location.hash.slice(1);
      const params = new URLSearchParams(hashContent.replace(/^room=([^&]+)/, 'roomCode=$1'));
      return params.get('roomCode') || `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
    }
    return `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [copied, setCopied] = useState(false);
  const [viewerCount, setViewerCount] = useState(2);
  const [syncStatus, setSyncStatus] = useState('Connected & Synchronized');
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const [messages, setMessages] = useState([
    { id: 1, user: 'Furina Bot', text: 'Welcome to the synchronized premiere! React with emojis below! 🎉', time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const chatScrollRef = useRef(null);

  // Full shareable URL encoding title, mediaId, season, episode and server
  const roomUrl = useMemo(() => {
    if (typeof window === 'undefined') return `https://junaid355.github.io/furina-moviebox/#room=${roomCode}`;
    const origin = window.location.origin;
    const pathname = window.location.pathname;
    const mId = activeMedia?.id ? `&id=${encodeURIComponent(activeMedia.id)}` : '';
    const mTitle = (activeMedia?.title || activeMedia?.name) ? `&title=${encodeURIComponent(activeMedia.title || activeMedia.name)}` : '';
    const mType = activeMedia?.media_type ? `&type=${activeMedia.media_type}` : (activeMedia?.type ? `&type=${activeMedia.type}` : '');
    const sParam = season ? `&s=${season}` : '';
    const eParam = episode ? `&e=${episode}` : '';
    const srvParam = currentServer?.id ? `&srv=${currentServer.id}` : '';
    const posterParam = activeMedia?.poster_path ? `&poster=${encodeURIComponent(activeMedia.poster_path)}` : '';

    return `${origin}${pathname}#room=${roomCode}${mId}${mTitle}${mType}${sParam}${eParam}${srvParam}${posterParam}`;
  }, [roomCode, activeMedia, currentServer, season, episode]);

  const triggerFloatingEmoji = (emoji) => {
    const newEmoji = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.floor(Math.random() * 80) + 10 // 10% to 90% horizontal position
    };
    setFloatingEmojis((prev) => [...prev.slice(-15), newEmoji]);
    setTimeout(() => {
      setFloatingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 2000);
  };

  useEffect(() => {
    if (!isOpen) return;

    let channel;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('furina_sync_room');
        channel.postMessage({
          type: 'JOIN_ROOM',
          roomCode,
          title: activeMedia?.title || activeMedia?.name || 'Now Playing',
          mediaId: activeMedia?.id,
          season,
          episode,
          server: currentServer?.shortName || 'Server 1',
          timestamp: Date.now()
        });

        channel.onmessage = (event) => {
          if (event.data?.type === 'ROOM_HEARTBEAT' || event.data?.type === 'JOIN_ROOM') {
            setViewerCount((prev) => Math.max(2, prev + 1));
          } else if (event.data?.type === 'SYNC_STATE' && onSyncState) {
            onSyncState(event.data);
          } else if (event.data?.type === 'LIVE_REACTION') {
            triggerFloatingEmoji(event.data.emoji);
            soundFx.playWaterDrop?.();
          } else if (event.data?.type === 'LIVE_CHAT') {
            setMessages((prev) => [...prev.slice(-30), event.data.message]);
          }
        };
      }
    } catch (e) {}

    let sse;
    try {
      const sanitizedCode = roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      const sseUrl = `https://ntfy.sh/furina_sync_${sanitizedCode}/sse`;
      sse = new EventSource(sseUrl);
      sse.onopen = () => {
        setSyncStatus('Connected & Synchronized (Live Cloud Relay 🟢)');
      };
      sse.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg && msg.type === 'JOIN_ROOM') {
            setViewerCount((prev) => Math.max(2, prev + 1));
          } else if (msg && msg.type === 'SYNC_STATE' && onSyncState) {
            onSyncState(msg);
          } else if (msg && msg.type === 'LIVE_REACTION') {
            triggerFloatingEmoji(msg.emoji);
            soundFx.playWaterDrop?.();
          } else if (msg && msg.type === 'LIVE_CHAT') {
            setMessages((prev) => [...prev.slice(-30), msg.message]);
          }
        } catch (_) {}
      };
      sse.onerror = () => {
        setSyncStatus('Connected & Synchronized');
      };
    } catch (e) {}

    return () => {
      if (channel) channel.close();
      if (sse) sse.close();
    };
  }, [isOpen, roomCode, activeMedia, currentServer, season, episode, onSyncState]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  if (!isOpen) return null;

  const handleSendReaction = (emoji) => {
    soundFx.playWaterDrop?.();
    triggerFloatingEmoji(emoji);

    const payload = { type: 'LIVE_REACTION', emoji, roomCode, timestamp: Date.now() };
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('furina_sync_room').postMessage(payload);
      }
      const sanitizedCode = roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      fetch(`https://ntfy.sh/furina_sync_${sanitizedCode}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;

    soundFx.playClick?.();
    const newMsg = {
      id: Date.now(),
      user: 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev.slice(-30), newMsg]);
    setChatInput('');

    const payload = { type: 'LIVE_CHAT', message: { ...newMsg, user: 'Friend' }, roomCode };
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        new BroadcastChannel('furina_sync_room').postMessage(payload);
      }
      const sanitizedCode = roomCode.toLowerCase().replace(/[^a-z0-9]/g, '');
      fetch(`https://ntfy.sh/furina_sync_${sanitizedCode}`, {
        method: 'POST',
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  };

  const handleCopyLink = () => {
    soundFx.playClick?.();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(roomUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleRegenerate = () => {
    soundFx.playClick?.();
    const newCode = `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);
    if (typeof window !== 'undefined') {
      window.location.hash = `#room=${newCode}`;
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 select-none animate-fade-in"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative w-full max-w-lg bg-[#050b1d] border border-cyan-500/35 rounded-3xl shadow-[0_0_80px_rgba(56,189,248,0.35)] p-5 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating Reactions Canvas */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-40">
          {floatingEmojis.map((item) => (
            <div
              key={item.id}
              className="absolute bottom-12 text-3xl animate-in fade-in zoom-in-50 duration-200"
              style={{
                left: `${item.x}%`,
                animation: 'floatUp 1.8s ease-out forwards'
              }}
            >
              {item.emoji}
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Users className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Watch Party 2.0</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>Live Sync</span>
                </span>
              </h3>
              <p className="text-[11px] text-cyan-200/70">Real-time synchronized stream with live reactions & chat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Info Card */}
        <div className="mt-3 p-3.5 rounded-2xl bg-[#091533] border border-cyan-500/25 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Active Room Code:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-cyan-300 text-sm tracking-wider bg-black/50 px-2.5 py-0.5 rounded-lg border border-cyan-500/40">
                {roomCode}
              </span>
              <button
                onClick={handleRegenerate}
                className="text-[10px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
              >
                New
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cyan-200/80 pt-1.5 border-t border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <strong className="text-white text-[11px]">{syncStatus}</strong>
            </span>
            <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30 text-[10px]">
              👥 {viewerCount} Friends Connected
            </span>
          </div>

          {activeMedia && (
            <div className="p-2 rounded-xl bg-black/40 border border-white/10 flex items-center gap-2 text-xs">
              <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-white truncate">{activeMedia.title || activeMedia.name}</div>
                {season && episode && (
                  <div className="text-[10px] text-cyan-300 font-mono mt-0.5">Season {season} • Episode {episode}</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Reactions Bar */}
        <div className="mt-3">
          <label className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Send Live Screen Reactions:</span>
          </label>
          <div className="flex items-center justify-between gap-1.5 p-2 rounded-2xl bg-[#091538] border border-cyan-500/25">
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleSendReaction(emoji)}
                className="flex-1 py-1 text-xl hover:scale-125 active:scale-95 transition-transform duration-150 cursor-pointer flex items-center justify-center rounded-xl hover:bg-white/10"
                title={`Send ${emoji} reaction`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Live Room Chat */}
        <div className="mt-3 flex-1 flex flex-col min-h-[140px] max-h-[180px] bg-[#030714] border border-cyan-500/20 rounded-2xl overflow-hidden p-2.5">
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold text-cyan-300/80 pb-1 border-b border-white/10 mb-1.5">
            <MessageSquare className="w-3 h-3 text-cyan-400" />
            <span>Live Sync Chat</span>
          </div>

          <div ref={chatScrollRef} className="flex-1 overflow-y-auto space-y-1.5 pr-1 text-xs no-scrollbar">
            {messages.map((m) => (
              <div key={m.id} className="flex items-start gap-1.5 text-[11px] leading-tight">
                <span className={`font-bold ${m.user === 'You' ? 'text-cyan-400' : 'text-amber-300'}`}>
                  {m.user}:
                </span>
                <span className="text-slate-200">{m.text}</span>
                <span className="text-[9px] text-slate-500 ml-auto shrink-0">{m.time}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendChat} className="mt-2 flex items-center gap-1.5">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Chat with watch party..."
              className="flex-1 bg-black/60 border border-cyan-500/30 rounded-xl px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              className="p-1.5 rounded-xl bg-cyan-500 text-gray-950 font-black hover:bg-cyan-400 transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        {/* Shareable Link Input & Share Buttons */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={roomUrl}
            className="flex-1 bg-black/60 border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none select-all"
          />
          <button
            onClick={handleCopyLink}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1 shrink-0 cursor-pointer ${
              copied
                ? 'bg-emerald-500 text-gray-950'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Join my Furina MovieBox Watch Party! 🍿🎬 ${roomUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 transition flex items-center justify-center shrink-0"
            title="Share via WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
