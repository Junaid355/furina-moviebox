import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Users, Copy, Check, Share2, Play, Pause, Sparkles, Radio, 
  RefreshCw, Send, MessageSquare, Shuffle, UserCheck, LogIn,
  RotateCcw, RotateCw, FastForward
} from 'lucide-react';
import watchPartyService, { formatTimecode } from '../services/watchPartyService';
import { pickRandomLiveMovie } from '../services/liveTvService';
import { resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import soundFx from '../services/soundFx';

const REACTION_EMOJIS = ['🍿', '🔥', '😂', '❤️', '🤯', '👏'];

export default function WatchTogetherModal({ 
  isOpen, 
  onClose, 
  activeMedia, 
  currentServer, 
  season = 1, 
  episode = 1,
  onSyncState,
  onPlaySyncedMedia,
  customMoviePool = []
}) {
  const [partyState, setPartyState] = useState(() => watchPartyService.getState());
  const [liveTime, setLiveTime] = useState(() => watchPartyService.getEstimatedCurrentTime());
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubValue, setScrubValue] = useState(0);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [nicknameInput, setNicknameInput] = useState(() => watchPartyService.getState().userProfile.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState([]);
  const [lastPlaybackBanner, setLastPlaybackBanner] = useState(null);
  const chatEndRef = useRef(null);

  // Join or sync room when modal opens or activeMedia changes
  useEffect(() => {
    if (!isOpen) return;

    const currentRoom = watchPartyService.getState().roomCode;
    watchPartyService.joinRoom(currentRoom, activeMedia, false);

    if (activeMedia) {
      watchPartyService.syncMedia(activeMedia, {
        season,
        episode,
        serverId: currentServer?.id || activeMedia.preferredServerId || 'vidstuck'
      });
    }

    const unsubscribe = watchPartyService.subscribe((newState, event) => {
      setPartyState({ ...newState });
      setLiveTime(watchPartyService.getEstimatedCurrentTime());

      if (event?.type === 'media:updated' && event.mediaState) {
        if (onSyncState) {
          onSyncState(event.mediaState);
        }
      }

      if ((event?.type === 'playback:updated' || event?.type === 'playback:local') && event.playbackState) {
        const pb = event.playbackState;
        const actionLabel =
          pb.lastAction === 'play'
            ? `▶️ ${pb.updatedBy} started playback at ${formatTimecode(pb.currentTime)}`
            : pb.lastAction === 'pause'
            ? `⏸️ ${pb.updatedBy} paused at ${formatTimecode(pb.currentTime)}`
            : pb.lastAction === 'seek'
            ? `⏩ ${pb.updatedBy} seeked to ${formatTimecode(pb.currentTime)}`
            : pb.lastAction === 'rate'
            ? `⚡ ${pb.updatedBy} set speed to ${pb.playbackRate}x`
            : null;
        if (actionLabel) {
          setLastPlaybackBanner(actionLabel);
        }
        if (onSyncState) {
          onSyncState({
            ...newState.mediaState,
            playbackState: pb
          });
        }
      }

      if (event?.type === 'reaction:fired' && event.reaction) {
        const rx = {
          ...event.reaction,
          left: Math.floor(15 + Math.random() * 70)
        };
        setFloatingReactions((prev) => [...prev.slice(-12), rx]);
        setTimeout(() => {
          setFloatingReactions((prev) => prev.filter((item) => item.id !== rx.id));
        }, 2400);
      }
    });

    return () => unsubscribe();
  }, [isOpen, activeMedia?.id, season, episode, currentServer?.id]);

  // Smoothly advance live synchronized clock while room playbackState.isPlaying === true
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      if (!isScrubbing) {
        setLiveTime(watchPartyService.getEstimatedCurrentTime());
      }
    }, 500);
    return () => clearInterval(interval);
  }, [isOpen, isScrubbing, partyState.playbackState?.isPlaying]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [partyState.chatHistory?.length]);

  if (!isOpen) return null;

  const syncedMedia = partyState.mediaState || activeMedia;
  const playbackState = partyState.playbackState || { isPlaying: true, currentTime: 0, duration: 7200, playbackRate: 1 };
  const duration = Math.max(60, Number(playbackState.duration) || 7200);
  const displayedTime = isScrubbing ? scrubValue : Math.min(duration, liveTime);
  const shareUrl = watchPartyService.buildShareableUrl(syncedMedia);
  const mediaGenres = extractGenres(syncedMedia).slice(0, 2);

  const handleTogglePlayPause = () => {
    soundFx.playClick?.();
    const current = watchPartyService.getEstimatedCurrentTime();
    if (playbackState.isPlaying) {
      watchPartyService.sendPause(current, duration);
    } else {
      watchPartyService.sendPlay(current, duration);
    }
  };

  const handleSeekRelative = (deltaSec) => {
    soundFx.playClick?.();
    const target = Math.max(0, Math.min(duration, watchPartyService.getEstimatedCurrentTime() + deltaSec));
    setLiveTime(target);
    watchPartyService.sendSeek(target, playbackState.isPlaying, duration);
  };

  const handleScrubChange = (e) => {
    const val = Number(e.target.value);
    setIsScrubbing(true);
    setScrubValue(val);
  };

  const handleScrubCommit = (e) => {
    const val = Number(e.target.value);
    setIsScrubbing(false);
    setLiveTime(val);
    soundFx.playClick?.();
    watchPartyService.sendSeek(val, playbackState.isPlaying, duration);
  };

  const handleChangeSpeed = (rate) => {
    soundFx.playClick?.();
    watchPartyService.sendPlaybackRate(rate, watchPartyService.getEstimatedCurrentTime());
  };

  const handleCopyInviteLink = () => {
    soundFx.playClick?.();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  };

  const handleCopyRoomCode = () => {
    soundFx.playClick?.();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(partyState.roomCode).then(() => {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      });
    }
  };

  const handleJoinFriendRoom = (e) => {
    e.preventDefault();
    const clean = joinCodeInput.trim().toUpperCase();
    if (!clean) return;
    soundFx.playStartChime?.();
    const formattedCode = clean.startsWith('FURINA-') ? clean : `FURINA-${clean.replace(/[^A-Z0-9]/g, '')}`;
    watchPartyService.joinRoom(formattedCode, syncedMedia, false);
    if (typeof window !== 'undefined') {
      window.location.hash = `#room=${formattedCode}`;
    }
    setJoinCodeInput('');
  };

  const handleCreateNewRoom = () => {
    soundFx.playClick?.();
    const newCode = `FURINA-${Math.floor(1000 + Math.random() * 9000)}`;
    watchPartyService.joinRoom(newCode, syncedMedia, true);
    if (typeof window !== 'undefined') {
      window.location.hash = `#room=${newCode}`;
    }
  };

  const handleSaveNickname = (e) => {
    e.preventDefault();
    soundFx.playClick?.();
    watchPartyService.updateUserProfile(nicknameInput);
    setIsEditingName(false);
  };

  const handlePickRandomMovieForParty = () => {
    soundFx.playStartChime?.();
    const randomMovie = pickRandomLiveMovie(customMoviePool, syncedMedia?.id);
    const synced = watchPartyService.syncMedia(randomMovie, {
      season: 1,
      episode: 1,
      serverId: currentServer?.id || 'vidstuck'
    });
    watchPartyService.sendChatMessage(`🎲 Rolled a random movie for the room: ${synced.title}!`);
    if (onSyncState) {
      onSyncState(synced);
    }
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    soundFx.playClick?.();
    watchPartyService.sendChatMessage(chatInput);
    setChatInput('');
  };

  const handleSendReaction = (emoji) => {
    soundFx.playClick?.();
    watchPartyService.sendReaction(emoji);
  };

  const handleWatchTogetherNow = () => {
    soundFx.playStartChime?.();
    if (syncedMedia && onPlaySyncedMedia) {
      onPlaySyncedMedia(syncedMedia);
    }
    onClose();
  };

  const handleWhatsAppShare = () => {
    const text = `🍿 Join my Furina 4K Watch Together Room (${partyState.roomCode}) to watch "${syncedMedia?.title || 'a movie'}" together with shared playback controls!\n${shareUrl}`;
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-2.5 sm:p-4 select-none animate-fade-in overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#040a1c] border border-cyan-500/40 rounded-2xl sm:rounded-3xl shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(34,211,238,0.25)] overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Neon Laser Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-purple-500 via-cyan-400 to-blue-500" />

        {/* Floating Reactions Overlay */}
        <div className="pointer-events-none absolute inset-0 z-40 overflow-hidden">
          {floatingReactions.map((rx) => (
            <div
              key={rx.id}
              style={{ left: `${rx.left}%` }}
              className="absolute bottom-14 flex flex-col items-center animate-bounce transition-all duration-1000"
            >
              <span className="text-3xl sm:text-4xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]">
                {rx.emoji}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                {rx.userName}
              </span>
            </div>
          ))}
        </div>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 bg-[#06102a] border-b border-cyan-500/25">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 via-cyan-400 to-blue-500 p-[1.5px] shadow-[0_0_20px_rgba(56,189,248,0.45)]">
              <div className="w-full h-full rounded-[14px] bg-[#050c20] flex items-center justify-center">
                <Users className="w-5 h-5 text-cyan-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-xl font-black text-white tracking-tight">
                  Watch Together Cinema Party
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-black flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{partyState.connectionMode}</span>
                </span>
              </div>
              <p className="text-xs text-cyan-200/70">
                Unique Room ID session with shared Play, Pause, and Seek playback controls across all friends
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Watch Together"
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition border border-white/15 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Two-Column Body: Left = Room Controls, Shared Playback Deck & Synced Movie | Right = Live Party Chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-cyan-500/20">
          
          {/* Left Column (7 cols): Room ID, Shared Playback Controls, Synced Movie & Share */}
          <div className="lg:col-span-7 p-4 sm:p-6 space-y-4">
            
            {/* Room ID & Join Friend Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Active Unique Room ID Card */}
              <div className="p-3.5 rounded-2xl bg-[#081536] border border-cyan-500/30 flex flex-col justify-between gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300/80">
                    Unique Room ID
                  </span>
                  <button
                    type="button"
                    onClick={handleCreateNewRoom}
                    className="text-[11px] font-bold text-cyan-300 hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Generate a fresh room ID"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>New Room</span>
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-black text-base sm:text-lg tracking-wider text-cyan-300 bg-black/50 px-3 py-1.5 rounded-xl border border-cyan-500/40 select-all">
                    {partyState.roomCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyRoomCode}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition cursor-pointer ${
                      copiedCode
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-400/40'
                    }`}
                  >
                    {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode ? 'Copied' : 'Copy ID'}</span>
                  </button>
                </div>
              </div>

              {/* Join a Friend's Room ID */}
              <form
                onSubmit={handleJoinFriendRoom}
                className="p-3.5 rounded-2xl bg-[#081536] border border-purple-500/30 flex flex-col justify-between gap-2"
              >
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-300">
                  Join Friend's Room ID
                </span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={joinCodeInput}
                    onChange={(e) => setJoinCodeInput(e.target.value)}
                    placeholder="e.g. FURINA-4829"
                    className="w-full min-w-0 bg-black/60 border border-purple-500/40 rounded-xl px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-1 shrink-0 transition cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Join</span>
                  </button>
                </div>
              </form>
            </div>

            {/* SHARED PLAYBACK CONTROLS DECK (Play, Pause, Seek -10s / +10s, Timeline Scrubber, Speed) */}
            <div className="p-4 rounded-2xl bg-[#06122e] border border-cyan-400/35 shadow-[0_0_25px_rgba(34,211,238,0.12)] space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${playbackState.isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                  <span className="text-xs font-black uppercase tracking-wider text-white">
                    Shared Room Playback Controls
                  </span>
                </div>
                <span className="text-[11px] font-mono text-cyan-300 bg-black/50 px-2.5 py-0.5 rounded-lg border border-cyan-500/30">
                  {lastPlaybackBanner || (playbackState.isPlaying ? `▶️ Playing (${playbackState.playbackRate || 1}x)` : '⏸️ Paused for Room')}
                </span>
              </div>

              {/* Interactive Shared Timeline Seek Scrubber */}
              <div className="space-y-1">
                <input
                  type="range"
                  min={0}
                  max={duration}
                  step={1}
                  value={Math.floor(displayedTime)}
                  onChange={handleScrubChange}
                  onMouseUp={handleScrubCommit}
                  onTouchEnd={handleScrubCommit}
                  aria-label="Shared Room Playback Seek Timeline"
                  className="w-full h-2 rounded-lg appearance-none bg-slate-800 accent-cyan-400 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-300">
                  <span className="text-cyan-300 font-bold">{formatTimecode(displayedTime)}</span>
                  <span className="text-[10px] text-slate-400">Drag slider to seek all viewers</span>
                  <span>{formatTimecode(duration)}</span>
                </div>
              </div>

              {/* Shared Transport Buttons: Play/Pause, Seek -10s, Seek +10s, Speed */}
              <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    className={`min-h-[38px] px-4 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md ${
                      playbackState.isPlaying
                        ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                        : 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950'
                    }`}
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
                    onClick={() => handleSeekRelative(-10)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0a1b42] hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Rewind 10 seconds for everyone"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>-10s</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSeekRelative(10)}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#0a1b42] hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    title="Fast-forward 10 seconds for everyone"
                  >
                    <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                    <span>+10s</span>
                  </button>
                </div>

                {/* Shared Playback Speed */}
                <div className="flex items-center gap-1 bg-black/45 p-1 rounded-xl border border-white/10">
                  {[1, 1.25, 1.5, 2].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => handleChangeSpeed(spd)}
                      className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition cursor-pointer ${
                        (playbackState.playbackRate || 1) === spd
                          ? 'bg-cyan-400 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Currently Synced Movie Showcase + Random Movie Roulette Button */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#071330] via-[#0a193d] to-[#061029] border border-cyan-500/35 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>Currently Synced Content</span>
                </span>
                <button
                  type="button"
                  onClick={handlePickRandomMovieForParty}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-[11px] flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.45)] transition transform hover:scale-105 cursor-pointer"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                  <span>🎲 Pick Random Movie</span>
                </button>
              </div>

              {syncedMedia ? (
                <div className="flex items-center gap-3.5">
                  <img
                    src={resolvePosterUrl(syncedMedia.poster_path, 'w342')}
                    alt={syncedMedia.title || syncedMedia.name}
                    className="w-16 h-24 rounded-xl object-cover border border-cyan-500/30 shrink-0 bg-slate-950"
                    onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                  />
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <h3 className="text-base sm:text-lg font-black text-white truncate">
                      {syncedMedia.title || syncedMedia.name}
                    </h3>

                    {mediaGenres.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {mediaGenres.map((g) => {
                          const style = getGenreBadgeStyle(g);
                          return (
                            <span
                              key={g}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${style.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                              <span>{style.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-xs text-cyan-200/80 flex-wrap font-mono">
                      <span>
                        {syncedMedia.media_type === 'tv'
                          ? `Season ${syncedMedia.season || season} • Episode ${syncedMedia.episode || episode}`
                          : '4K Feature Film'}
                      </span>
                      <span>•</span>
                      <span className="text-amber-300">🇮🇳 Multi-Audio Sync</span>
                    </div>

                    <div className="pt-1 flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={handleWatchTogetherNow}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.5)] transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5 fill-slate-950" />
                        <span>Open Synced Player Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">
                  Click "🎲 Pick Random Movie" above or select any movie to start watching with friends!
                </div>
              )}
            </div>

            {/* Shareable Invite Link + WhatsApp Direct Share */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-cyan-300 flex items-center justify-between">
                <span>Invite Friend via Direct Room Link:</span>
                <span className="text-[11px] text-slate-400 font-normal">Syncs room ID, movie & timestamp</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 min-w-0 bg-black/65 border border-cyan-500/30 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyInviteLink}
                  className={`min-h-[38px] px-3.5 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    copiedLink
                      ? 'bg-emerald-500 text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                  }`}
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Link Copied!' : 'Copy Link'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleWhatsAppShare}
                  className="min-h-[38px] px-3 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Active Room Members & Your Nickname */}
            <div className="p-3.5 rounded-2xl bg-[#07112b] border border-cyan-500/20 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  <span>Connected Viewers ({partyState.participants?.length || 1})</span>
                </span>

                {!isEditingName ? (
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="text-[11px] text-cyan-300 hover:underline cursor-pointer"
                  >
                    Your Name: <strong>{partyState.userProfile.name}</strong> (Edit)
                  </button>
                ) : (
                  <form onSubmit={handleSaveNickname} className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={nicknameInput}
                      onChange={(e) => setNicknameInput(e.target.value)}
                      placeholder="Your name"
                      className="bg-black/70 border border-cyan-400/50 rounded-lg px-2 py-1 text-xs text-white w-28 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 rounded-lg bg-cyan-400 text-slate-950 font-black text-[11px] cursor-pointer"
                    >
                      Save
                    </button>
                  </form>
                )}
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {(partyState.participants || [partyState.userProfile]).map((p) => (
                  <div
                    key={p.userId}
                    className="px-2.5 py-1 rounded-full bg-black/50 border border-cyan-500/30 flex items-center gap-1.5 text-xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#22d3ee' }}
                    />
                    <span className="font-bold text-white">{p.name}</span>
                    {p.userId === partyState.userProfile.userId && (
                      <span className="text-[10px] text-cyan-300 font-mono">(You)</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Live Party Chat & Instant Cinema Emoji Reactions */}
          <div className="lg:col-span-5 p-4 sm:p-6 flex flex-col justify-between bg-[#030817] min-h-[380px] max-h-[600px]">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-cyan-500/20">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-black text-white">Live Watch Party Chat</h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-300/70">
                  Room {partyState.roomCode}
                </span>
              </div>

              {/* Emoji Reaction Bar */}
              <div className="py-2.5 flex items-center justify-between gap-1 border-b border-white/10">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  React:
                </span>
                <div className="flex items-center gap-1.5">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSendReaction(emoji)}
                      className="w-8 h-8 rounded-xl bg-[#091534] hover:bg-cyan-500/25 border border-cyan-500/25 hover:border-cyan-400 flex items-center justify-center text-base transition transform hover:scale-110 active:scale-90 cursor-pointer"
                      title={`Send ${emoji} reaction`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 max-h-[320px]">
              {(!partyState.chatHistory || partyState.chatHistory.length === 0) ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-8 text-slate-400 space-y-1.5">
                  <Sparkles className="w-6 h-6 text-cyan-400/60" />
                  <p className="text-xs font-bold text-slate-300">Room Chat is Ready!</p>
                  <p className="text-[11px] text-slate-500 max-w-[220px]">
                    Use the Shared Playback Controls on the left to Play, Pause, or Seek for everyone, or send a message below!
                  </p>
                </div>
              ) : (
                partyState.chatHistory.map((msg) => {
                  const isMe = msg.userId === partyState.userProfile.userId;
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-1.5 mb-0.5 px-1">
                        <span
                          className="text-[10px] font-extrabold"
                          style={{ color: msg.color || '#22d3ee' }}
                        >
                          {msg.userName}
                        </span>
                        <span className="text-[9px] text-slate-500 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div
                        className={`px-3 py-2 rounded-2xl text-xs max-w-[85%] leading-relaxed break-words ${
                          isMe
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold rounded-br-xs'
                            : 'bg-[#0b193d] text-slate-100 border border-cyan-500/25 rounded-bl-xs'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendChat} className="pt-2 border-t border-cyan-500/20 flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Message your friends in room..."
                className="flex-1 min-w-0 bg-black/70 border border-cyan-500/35 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
