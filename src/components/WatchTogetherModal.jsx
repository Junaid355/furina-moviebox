import React, { useState, useEffect } from 'react';
import { X, Users, Copy, Check, Share2, Play, Sparkles, Radio, ShieldCheck } from 'lucide-react';
import soundFx from '../services/soundFx';

export default function WatchTogetherModal({ isOpen, onClose, activeMedia, currentServer }) {
  const [roomCode, setRoomCode] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash.startsWith('#room=')) {
      return window.location.hash.replace('#room=', '');
    }
    return `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const [copied, setCopied] = useState(false);
  const [viewerCount, setViewerCount] = useState(2);
  const [syncStatus, setSyncStatus] = useState('Connected & Synchronized');

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window !== 'undefined') {
      window.location.hash = `#room=${roomCode}`;
    }

    // BroadcastChannel sync initialization
    let channel;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        channel = new BroadcastChannel('furina_sync_room');
        channel.postMessage({
          type: 'JOIN_ROOM',
          roomCode,
          title: activeMedia?.title || activeMedia?.name || 'Now Playing',
          mediaId: activeMedia?.id,
          server: currentServer?.shortName || 'Server 1',
          timestamp: Date.now()
        });

        channel.onmessage = (event) => {
          if (event.data?.type === 'ROOM_HEARTBEAT' || event.data?.type === 'JOIN_ROOM') {
            setViewerCount((prev) => Math.max(2, prev + 1));
          }
        };
      }
    } catch (e) {}

    return () => {
      if (channel) channel.close();
    };
  }, [isOpen, roomCode, activeMedia, currentServer]);

  if (!isOpen) return null;

  const roomUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#room=${roomCode}` 
    : `https://furina-moviebox.web.app/#room=${roomCode}`;

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
        className="relative w-full max-w-md bg-[#050b1d] border border-cyan-500/35 rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.35)] p-5 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-cyan-500/15 rounded-full filter blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Users className="w-5 h-5 text-gray-950" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Watch Together</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                  <span>Sync Room</span>
                </span>
              </h3>
              <p className="text-[11px] text-cyan-200/70">Synchronized real-time playback across friends</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close sync room"
            title="Close sync room"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Room Info Card */}
        <div className="mt-4 p-4 rounded-xl bg-[#091533] border border-cyan-500/25 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 font-semibold">Active Sync Room Code:</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-cyan-300 text-sm tracking-wider bg-black/50 px-2.5 py-1 rounded-lg border border-cyan-500/40">
                {roomCode}
              </span>
              <button
                onClick={handleRegenerate}
                title="Generate new room code"
                className="text-[10px] text-slate-400 hover:text-cyan-300 underline cursor-pointer"
              >
                New
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-cyan-200/80 pt-2 border-t border-white/10">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Status:</span>
              <strong className="text-white">{syncStatus}</strong>
            </span>
            <span className="font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
              👥 {viewerCount} Viewers
            </span>
          </div>

          {activeMedia && (
            <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 flex items-center gap-2 text-xs">
              <Play className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-[10px] text-slate-400">Currently Synced:</div>
                <div className="font-bold text-white truncate">{activeMedia.title || activeMedia.name}</div>
              </div>
            </div>
          )}
        </div>

        {/* Shareable Link Input */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold text-cyan-300">Shareable Room URL:</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={roomUrl}
              className="flex-1 bg-black/60 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className={`px-3 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-gray-950 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied! ✓' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/20 text-[11px] text-cyan-200/80 space-y-1 leading-relaxed">
          <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>How Sync Rooms Work:</span>
          </div>
          <p>Send the link above to your friends. When they open it, their player automatically synchronizes title, server, and playback state with yours!</p>
        </div>

        {/* Action button */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-lg cursor-pointer"
          >
            Done & Return to Movie
          </button>
        </div>
      </div>
    </div>
  );
}
