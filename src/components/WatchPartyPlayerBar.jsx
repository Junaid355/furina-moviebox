import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Play, Pause, RotateCcw, RotateCw, Copy, Check, 
  Radio, MessageSquare, Share2, LogIn
} from 'lucide-react';
import watchPartyService, { formatTimecode } from '../services/watchPartyService';
import soundFx from '../services/soundFx';

const QUICK_REACTIONS = ['🍿', '🔥', '😂', '❤️', '🤯'];

export default function WatchPartyPlayerBar({
  item,
  season = 1,
  episode = 1,
  currentServer,
  videoRef,
  onOpenWatchTogetherModal,
  onRemoteSyncMedia
}) {
  const [partyState, setPartyState] = useState(() => watchPartyService.getState());
  const [liveTime, setLiveTime] = useState(() => watchPartyService.getEstimatedCurrentTime());
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [copied, setCopied] = useState(false);
  const [joinInput, setJoinInput] = useState('');
  const [showJoinBox, setShowJoinBox] = useState(false);
  const [syncToast, setSyncToast] = useState(null);
  const isRemoteActionRef = useRef(false);
  const toastTimerRef = useRef(null);

  const showTempToast = (text) => {
    setSyncToast(text);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSyncToast(null);
    }, 3500);
  };

  // Subscribe to real-time Watch Party room updates
  useEffect(() => {
    const unsubscribe = watchPartyService.subscribe((newState, event) => {
      setPartyState({ ...newState });
      if (!isScrubbing) {
        setLiveTime(watchPartyService.getEstimatedCurrentTime());
      }

      if (event?.type === 'playback:updated' && event.playbackState) {
        const pb = event.playbackState;
        isRemoteActionRef.current = true;

        // 1. Apply to HTML5 <video> element if mounted
        const vid = videoRef?.current;
        if (vid) {
          try {
            if (typeof pb.currentTime === 'number' && Math.abs((vid.currentTime || 0) - pb.currentTime) > 1.5) {
              vid.currentTime = pb.currentTime;
            }
            if (pb.playbackRate && vid.playbackRate !== pb.playbackRate) {
              vid.playbackRate = pb.playbackRate;
            }
            if (pb.isPlaying && vid.paused) {
              vid.play().catch(() => {});
            } else if (!pb.isPlaying && !vid.paused) {
              vid.pause();
            }
          } catch {}
        }

        // 2. Also send postMessage commands to embedded <iframe> player if mounted
        try {
          const iframe = document.querySelector('iframe[data-testid="player-iframe"]');
          if (iframe && iframe.contentWindow) {
            const cmd = pb.isPlaying ? 'play' : 'pause';
            iframe.contentWindow.postMessage(
              JSON.stringify({ event: 'command', func: pb.isPlaying ? 'playVideo' : 'pauseVideo', args: [] }),
              '*'
            );
            iframe.contentWindow.postMessage(
              { type: 'player:command', command: cmd, currentTime: pb.currentTime },
              '*'
            );
            if (pb.lastAction === 'seek') {
              iframe.contentWindow.postMessage(
                JSON.stringify({ event: 'command', func: 'seekTo', args: [pb.currentTime, true] }),
                '*'
              );
            }
          }
        } catch {}

        const msg =
          pb.lastAction === 'play'
            ? `▶️ ${pb.updatedBy} resumed playback (${formatTimecode(pb.currentTime)})`
            : pb.lastAction === 'pause'
            ? `⏸️ ${pb.updatedBy} paused at ${formatTimecode(pb.currentTime)}`
            : pb.lastAction === 'seek'
            ? `⏩ ${pb.updatedBy} seeked to ${formatTimecode(pb.currentTime)}`
            : `⚡ Synced with ${pb.updatedBy}`;
        showTempToast(msg);

        setTimeout(() => {
          isRemoteActionRef.current = false;
        }, 450);
      }

      if (event?.type === 'media:updated' && event.mediaState && onRemoteSyncMedia) {
        onRemoteSyncMedia(event.mediaState);
      }
    });

    return () => {
      unsubscribe();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [isScrubbing, videoRef, onRemoteSyncMedia]);

  // Attach native HTML5 <video> listeners so Play/Pause/Seek on the video itself broadcasts to the room
  useEffect(() => {
    const vid = videoRef?.current;
    if (!vid) return;

    const onVideoPlay = () => {
      if (isRemoteActionRef.current) return;
      watchPartyService.sendPlay(vid.currentTime || 0, vid.duration || 7200);
    };

    const onVideoPause = () => {
      if (isRemoteActionRef.current) return;
      watchPartyService.sendPause(vid.currentTime || 0, vid.duration || 7200);
    };

    const onVideoSeeked = () => {
      if (isRemoteActionRef.current) return;
      watchPartyService.sendSeek(vid.currentTime || 0, !vid.paused, vid.duration || 7200);
    };

    vid.addEventListener('play', onVideoPlay);
    vid.addEventListener('pause', onVideoPause);
    vid.addEventListener('seeked', onVideoSeeked);

    return () => {
      vid.removeEventListener('play', onVideoPlay);
      vid.removeEventListener('pause', onVideoPause);
      vid.removeEventListener('seeked', onVideoSeeked);
    };
  }, [videoRef?.current]);

  // Advance live synchronized clock every 500ms while playing
  useEffect(() => {
    const timer = setInterval(() => {
      if (!isScrubbing) {
        const vid = videoRef?.current;
        if (vid && !vid.paused && vid.currentTime > 0) {
          setLiveTime(vid.currentTime);
        } else {
          setLiveTime(watchPartyService.getEstimatedCurrentTime());
        }
      }
    }, 500);
    return () => clearInterval(timer);
  }, [isScrubbing, videoRef]);

  const playbackState = partyState.playbackState || { isPlaying: true, currentTime: 0, duration: 7200, playbackRate: 1 };
  const duration = Math.max(60, Number(videoRef?.current?.duration || playbackState.duration) || 7200);
  const displayedTime = isScrubbing ? scrubValue : Math.min(duration, liveTime);

  const handleTogglePlayPause = () => {
    soundFx.playClick?.();
    const current = videoRef?.current?.currentTime || watchPartyService.getEstimatedCurrentTime();
    if (playbackState.isPlaying) {
      if (videoRef?.current && !videoRef.current.paused) {
        isRemoteActionRef.current = true;
        videoRef.current.pause();
        setTimeout(() => { isRemoteActionRef.current = false; }, 300);
      }
      watchPartyService.sendPause(current, duration);
      showTempToast(`⏸️ You paused the room at ${formatTimecode(current)}`);
    } else {
      if (videoRef?.current && videoRef.current.paused) {
        isRemoteActionRef.current = true;
        videoRef.current.play().catch(() => {});
        setTimeout(() => { isRemoteActionRef.current = false; }, 300);
      }
      watchPartyService.sendPlay(current, duration);
      showTempToast(`▶️ You resumed playback for the room`);
    }
  };

  const handleSeekBy = (deltaSeconds) => {
    soundFx.playClick?.();
    const base = videoRef?.current?.currentTime || watchPartyService.getEstimatedCurrentTime();
    const target = Math.max(0, Math.min(duration, base + deltaSeconds));
    setLiveTime(target);
    if (videoRef?.current) {
      isRemoteActionRef.current = true;
      try { videoRef.current.currentTime = target; } catch {}
      setTimeout(() => { isRemoteActionRef.current = false; }, 300);
    }
    watchPartyService.sendSeek(target, playbackState.isPlaying, duration);
    showTempToast(`⏩ Synced room to ${formatTimecode(target)}`);
  };

  const handleScrubChange = (e) => {
    setIsScrubbing(true);
    setScrubValue(Number(e.target.value));
  };

  const handleScrubCommit = (e) => {
    const target = Number(e.target.value);
    setIsScrubbing(false);
    setLiveTime(target);
    soundFx.playClick?.();
    if (videoRef?.current) {
      isRemoteActionRef.current = true;
      try { videoRef.current.currentTime = target; } catch {}
      setTimeout(() => { isRemoteActionRef.current = false; }, 300);
    }
    watchPartyService.sendSeek(target, playbackState.isPlaying, duration);
    showTempToast(`⏩ Seeked room to ${formatTimecode(target)}`);
  };

  const handleCopyInvite = () => {
    soundFx.playClick?.();
    watchPartyService.joinRoom(partyState.roomCode, item, false);
    const url = watchPartyService.buildShareableUrl({
      ...item,
      season,
      episode,
      serverId: currentServer?.id || 'vidstuck'
    });
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        showTempToast(`🔗 Room ${partyState.roomCode} invite link copied!`);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  const handleJoinRoomSubmit = (e) => {
    e.preventDefault();
    const clean = joinInput.trim().toUpperCase();
    if (!clean) return;
    soundFx.playStartChime?.();
    const code = clean.startsWith('FURINA-') ? clean : `FURINA-${clean.replace(/[^A-Z0-9]/g, '')}`;
    watchPartyService.joinRoom(code, item, false);
    setJoinInput('');
    setShowJoinBox(false);
    showTempToast(`🎉 Joined Room ${code}!`);
  };

  return (
    <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#07112b] via-[#09183c] to-[#061028] border-b border-cyan-500/25 flex flex-col gap-2">
      {/* Row 1: Room ID, Status Toast, Quick Join & Chat Modal Trigger */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-500/20 border border-purple-400/40 text-purple-200 text-[11px] font-black">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>WATCH TOGETHER</span>
          </span>

          <span className="font-mono font-black text-xs text-cyan-300 bg-black/50 px-2.5 py-1 rounded-lg border border-cyan-500/35">
            ID: {partyState.roomCode}
          </span>

          <span className="text-[11px] font-bold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-lg border border-emerald-500/30">
            👥 {partyState.participants?.length || 1} Watching
          </span>

          {syncToast && (
            <span className="px-2.5 py-0.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 text-[11px] font-bold animate-fade-in">
              {syncToast}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {showJoinBox ? (
            <form onSubmit={handleJoinRoomSubmit} className="flex items-center gap-1">
              <input
                type="text"
                value={joinInput}
                onChange={(e) => setJoinInput(e.target.value)}
                placeholder="Enter Room ID..."
                className="bg-black/70 border border-purple-400/50 rounded-lg px-2 py-1 text-xs font-mono text-white w-28 focus:outline-none"
              />
              <button
                type="submit"
                className="px-2.5 py-1 rounded-lg bg-purple-500 text-white font-black text-[11px] cursor-pointer"
              >
                Join
              </button>
              <button
                type="button"
                onClick={() => setShowJoinBox(false)}
                className="px-1.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setShowJoinBox(true)}
              className="px-2.5 py-1 rounded-lg bg-[#0a183b] hover:bg-purple-500/25 border border-purple-400/35 text-purple-200 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
            >
              <LogIn className="w-3 h-3 text-purple-300" />
              <span>Join Room ID</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCopyInvite}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition cursor-pointer border ${
              copied
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border-cyan-400/40'
            }`}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied Invite!' : 'Invite Friend'}</span>
          </button>

          <button
            type="button"
            onClick={onOpenWatchTogetherModal}
            className="px-2.5 py-1 rounded-lg bg-purple-600/30 hover:bg-purple-600/50 border border-purple-400/50 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
          >
            <MessageSquare className="w-3 h-3 text-purple-300" />
            <span>Room Chat ({partyState.chatHistory?.length || 0})</span>
          </button>
        </div>
      </div>

      {/* Row 2: Shared Playback Controls (Play, Pause, Seek -10s / +10s, Shared Scrubber & Emoji Reactions) */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1 border-t border-white/10">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleTogglePlayPause}
            className={`px-3 py-1 rounded-lg font-black text-xs flex items-center gap-1 transition cursor-pointer ${
              playbackState.isPlaying
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
            }`}
            title="Shared Play / Pause for everyone in the room"
          >
            {playbackState.isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-slate-950" />
                <span>Pause All</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>Play All</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => handleSeekBy(-10)}
            className="px-2 py-1 rounded-lg bg-black/50 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-[11px] font-bold flex items-center gap-0.5 transition cursor-pointer"
            title="Rewind 10s for all viewers"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span>-10s</span>
          </button>

          <button
            type="button"
            onClick={() => handleSeekBy(10)}
            className="px-2 py-1 rounded-lg bg-black/50 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 text-[11px] font-bold flex items-center gap-0.5 transition cursor-pointer"
            title="Fast-forward 10s for all viewers"
          >
            <RotateCw className="w-3 h-3 text-cyan-400" />
            <span>+10s</span>
          </button>
        </div>

        {/* Shared Seek Scrubber */}
        <div className="flex-1 min-w-[160px] flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-cyan-300 shrink-0">
            {formatTimecode(displayedTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration}
            step={1}
            value={Math.floor(displayedTime)}
            onChange={handleScrubChange}
            onMouseUp={handleScrubCommit}
            onTouchEnd={handleScrubCommit}
            aria-label="Shared Watch Together Seek Scrubber"
            className="w-full h-1.5 rounded-lg appearance-none bg-slate-800 accent-cyan-400 cursor-pointer"
          />
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            {formatTimecode(duration)}
          </span>
        </div>

        {/* Quick Emoji Reactions */}
        <div className="hidden md:flex items-center gap-1 shrink-0">
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                watchPartyService.sendReaction(emoji);
                showTempToast(`Sent ${emoji} to room!`);
              }}
              className="w-7 h-7 rounded-lg bg-black/45 hover:bg-cyan-500/25 border border-white/10 flex items-center justify-center text-sm transition transform hover:scale-110 cursor-pointer"
              title={`Send ${emoji} reaction`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
