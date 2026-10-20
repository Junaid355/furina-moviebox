import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Tv, Play, Radio, Clock, Volume2, VolumeX, ChevronLeft,
  ChevronRight, Zap, Film, Server, Maximize2, Info, Shuffle, Users, RefreshCw
} from 'lucide-react';
import { LIVE_TV_CHANNELS, getChannelLiveState, pickRandomLiveMovie } from '../services/liveTvService';
import { resolveBackdropUrl, resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import { getStreamUrl } from '../services/streaming';
import soundFx from '../services/soundFx';

const LIVE_SERVERS = [
  { id: 'vidfast', label: 'VidFast 4K', badge: '4K AUTO' },
  { id: 'vidstuck', label: 'VidStuck Pro', badge: 'MULTI-DUB' },
  { id: 'autoembed', label: 'AutoEmbed HD', badge: 'FAST CDN' },
  { id: 'moviebox_cloud', label: 'MovieBox Cloud', badge: 'HINDI/EN' },
  { id: 'one23embed', label: '123Embed', badge: 'HINDI' },
  { id: 'preview', label: 'Instant Preview', badge: 'SAMPLE' }
];

export default function LiveTvHub({ onPlay, onOpenDetails, onWatchTogether, customMoviePool = [] }) {
  const [selectedChannelId, setSelectedChannelId] = useState(LIVE_TV_CHANNELS[0].id);
  const [nowMs, setNowMs] = useState(Date.now());
  const [liveServerId, setLiveServerId] = useState('vidfast');
  const [audioMode, setAudioMode] = useState('hindi');
  const [isMuted, setIsMuted] = useState(false);
  const [showOsd, setShowOsd] = useState(true);
  const [isZapping, setIsZapping] = useState(false);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [manualProgramOverride, setManualProgramOverride] = useState(null);
  const [randomCount, setRandomCount] = useState(0);
  const osdTimerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const triggerOsd = () => {
    setShowOsd(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 4000);
  };

  useEffect(() => {
    setIframeLoading(true);
    triggerOsd();
    const t = setTimeout(() => setIframeLoading(false), 1100);
    return () => {
      clearTimeout(t);
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    };
  }, [selectedChannelId, liveServerId, audioMode, manualProgramOverride?.id]);

  const channelStates = useMemo(() => {
    return LIVE_TV_CHANNELS.map((ch) => getChannelLiveState(ch, nowMs)).filter(Boolean);
  }, [nowMs]);

  const activeState = useMemo(() => {
    return channelStates.find((st) => st.channel.id === selectedChannelId) || channelStates[0];
  }, [channelStates, selectedChannelId]);

  const activeChannelIndex = useMemo(() => {
    const idx = LIVE_TV_CHANNELS.findIndex((c) => c.id === selectedChannelId);
    return idx >= 0 ? idx : 0;
  }, [selectedChannelId]);

  const currentProgram = manualProgramOverride || activeState?.currentProgram || null;

  const currentGenres = useMemo(() => {
    return currentProgram ? extractGenres(currentProgram).slice(0, 3) : [];
  }, [currentProgram]);

  const embedStreamUrl = useMemo(() => {
    if (!currentProgram || liveServerId === 'preview') return null;
    const tmdbId = currentProgram.tmdbId || currentProgram.id;
    const type = currentProgram.media_type === 'tv' ? 'tv' : 'movie';
    return getStreamUrl(
      liveServerId,
      type,
      tmdbId,
      currentProgram.season || 1,
      currentProgram.episode || 1,
      {
        audioMode,
        title: currentProgram.title,
        isAnime: Boolean(currentProgram.genres?.includes('Anime'))
      }
    );
  }, [liveServerId, currentProgram, audioMode]);

  const switchChannelByDelta = (delta) => {
    soundFx.playClick?.();
    setIsZapping(true);
    setManualProgramOverride(null);
    const nextIdx = (activeChannelIndex + delta + LIVE_TV_CHANNELS.length) % LIVE_TV_CHANNELS.length;
    setSelectedChannelId(LIVE_TV_CHANNELS[nextIdx].id);
    setTimeout(() => setIsZapping(false), 220);
  };

  const selectChannelDirect = (channelId) => {
    soundFx.playClick?.();
    if (channelId !== selectedChannelId || manualProgramOverride) {
      setIsZapping(true);
      setManualProgramOverride(null);
      setSelectedChannelId(channelId);
      setTimeout(() => setIsZapping(false), 220);
    } else {
      triggerOsd();
    }
  };

  const handleSpinRandomMovie = () => {
    soundFx.playStartChime?.();
    setIsZapping(true);
    const currentId = currentProgram?.id;
    const randomMovie = pickRandomLiveMovie(customMoviePool, currentId);
    setSelectedChannelId('ch_random_roulette');
    setManualProgramOverride(randomMovie);
    setRandomCount((c) => c + 1);
    setTimeout(() => setIsZapping(false), 220);
  };

  const cycleNextServer = () => {
    soundFx.playClick?.();
    const idx = LIVE_SERVERS.findIndex((s) => s.id === liveServerId);
    const next = LIVE_SERVERS[(idx + 1) % LIVE_SERVERS.length];
    setLiveServerId(next.id);
  };

  if (!activeState || !currentProgram) return null;

  const { channel, nextProgram, laterProgram, elapsedMinutes, remainingMinutes, progressPercent } = activeState;

  const handleLaunchFullCinema = (prog) => {
    if (!prog || !onPlay) return;
    soundFx.playStartChime?.();
    onPlay({
      ...prog,
      id: prog.tmdbId || prog.id,
      tmdb_id: prog.tmdbId || prog.id,
      preferredServerId: liveServerId === 'preview' ? 'vidfast' : liveServerId
    });
  };

  const handleLaunchWatchTogether = (prog) => {
    if (!prog || !onWatchTogether) return;
    soundFx.playClick?.();
    onWatchTogether({
      ...prog,
      id: prog.tmdbId || prog.id,
      tmdb_id: prog.tmdbId || prog.id,
      preferredServerId: liveServerId === 'preview' ? 'vidfast' : liveServerId
    });
  };

  return (
    <div className="space-y-4 sm:space-y-5 animate-fade-in">
      {/* Compact Broadcast Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-[#061028] border border-cyan-500/25 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center shrink-0">
            <Radio className="w-4.5 h-4.5 text-rose-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-sm sm:text-lg font-black text-white tracking-tight">
                24/7 Live TV & Random Movie Roulette
              </h1>
              <span className="px-2 py-0.5 rounded bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[9px] font-black uppercase tracking-wider">
                LIVE STREAM
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Real full-movie streams across {LIVE_TV_CHANNELS.length} channels — zap channels or roll a random movie
            </p>
          </div>
        </div>

        {/* Action Controls: Random Movie + Channel Zapper */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={handleSpinRandomMovie}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs shadow cursor-pointer"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Random Movie</span>
          </button>

          <button
            type="button"
            onClick={() => handleLaunchWatchTogether(currentProgram)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 font-bold text-xs cursor-pointer"
          >
            <Users className="w-3.5 h-3.5" />
            <span>Watch Party</span>
          </button>

          <div className="flex items-center bg-[#040a1a] rounded-lg border border-white/10 p-0.5">
            <button
              type="button"
              onClick={() => switchChannelByDelta(-1)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[11px] font-bold text-slate-200 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>CH-</span>
            </button>
            <span className="px-2 text-[11px] font-mono font-black text-cyan-300">
              {channel.number}
            </span>
            <button
              type="button"
              onClick={() => switchChannelByDelta(1)}
              className="flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white/10 text-[11px] font-bold text-slate-200 cursor-pointer"
            >
              <span>CH+</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Live Monitor + Compact Sidebar EPG */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left 8 Columns: Embedded Live Movie Stream Monitor */}
        <div className="lg:col-span-8 flex flex-col rounded-xl overflow-hidden bg-[#040a1a] border border-cyan-500/25 shadow-xl">
          {/* Compact Server & Audio Switcher Toolbar */}
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-[#07112b] border-b border-white/10 overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1 shrink-0">
              <Server className="w-3.5 h-3.5 text-cyan-400 mr-1" />
              {LIVE_SERVERS.map((srv) => (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    setLiveServerId(srv.id);
                  }}
                  className={`px-2 py-1 rounded-md text-[10px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                    liveServerId === srv.id
                      ? 'bg-cyan-400 text-slate-950 font-black shadow-sm'
                      : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {srv.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {['hindi', 'english', 'sub'].map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    setAudioMode(mode);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase cursor-pointer ${
                    audioMode === mode
                      ? 'bg-amber-400 text-slate-950 font-black'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {mode === 'hindi' ? 'HIN' : mode === 'english' ? 'ENG' : 'JAP'}
                </button>
              ))}

              <button
                type="button"
                onClick={cycleNextServer}
                title="Try Next Mirror Server"
                className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 text-cyan-300 text-[10px] font-bold cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Next Server</span>
              </button>
            </div>
          </div>

          {/* 16:9 Live Video Viewport */}
          <div className="relative aspect-video w-full bg-black overflow-hidden">
            {liveServerId === 'preview' ? (
              <video
                ref={videoRef}
                key={`${channel.id}-${currentProgram.id}`}
                src={currentProgram.streamUrl}
                poster={resolveBackdropUrl(currentProgram)}
                autoPlay
                loop
                playsInline
                muted={isMuted}
                controls
                className="w-full h-full object-cover"
              />
            ) : (
              <iframe
                key={`${channel.id}-${currentProgram.id}-${liveServerId}-${audioMode}`}
                src={embedStreamUrl}
                title={`${channel.name} - ${currentProgram.title}`}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                allowFullScreen
                referrerPolicy="origin"
                onLoad={() => setIframeLoading(false)}
              />
            )}

            {/* Brief Zapping / Tuning Indicator */}
            {(isZapping || iframeLoading) && (
              <div className="absolute inset-0 bg-[#030712]/80 flex flex-col items-center justify-center z-20 pointer-events-none">
                <div className="w-9 h-9 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mb-2" />
                <div className="text-xs font-black text-cyan-300 tracking-wider uppercase">
                  CH {channel.number} • {currentProgram.title}
                </div>
              </div>
            )}

            {/* Top-Left Channel OSD Overlay (Auto-Hides after 4s so player controls are unobstructed) */}
            {showOsd && (
              <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-2 px-2.5 py-1 rounded-lg bg-black/75 border border-white/15">
                <span className="text-[10px] font-mono font-black text-cyan-300">
                  CH {channel.number}
                </span>
                <span className="text-[11px] font-bold text-white truncate max-w-[200px]">
                  {currentProgram.title}
                </span>
                {manualProgramOverride && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/25 text-amber-300 text-[9px] font-black">
                    ROULETTE #{randomCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Compact Under-Monitor Info & Quick Action Bar */}
          <div className="p-3 sm:p-4 bg-[#060f25] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                <span className="text-[10px] font-mono font-bold text-cyan-400">
                  CH {channel.number} • {channel.name}
                </span>
                {currentGenres.map((genre) => {
                  const style = getGenreBadgeStyle(genre);
                  return (
                    <span
                      key={genre}
                      className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${style.classes}`}
                    >
                      <span className={`w-1 h-1 rounded-full ${style.dot}`} />
                      <span>{genre}</span>
                    </span>
                  );
                })}
              </div>
              <h2 className="text-sm sm:text-base font-black text-white truncate">
                {currentProgram.title}
              </h2>
              <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                {currentProgram.overview}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <button
                type="button"
                onClick={handleSpinRandomMovie}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-300 text-[11px] font-bold cursor-pointer"
              >
                <Shuffle className="w-3.5 h-3.5" />
                <span>Next Random</span>
              </button>

              <button
                type="button"
                onClick={() => handleLaunchFullCinema(currentProgram)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-[11px] cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Full Player</span>
              </button>

              {onOpenDetails && (
                <button
                  type="button"
                  onClick={() =>
                    onOpenDetails({
                      ...currentProgram,
                      id: currentProgram.tmdbId || currentProgram.id
                    })
                  }
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-slate-300 cursor-pointer"
                  title="Movie Details"
                >
                  <Info className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Compact Up Next & Channel Guide */}
        <div className="lg:col-span-4 flex flex-col gap-2.5 max-h-[430px] overflow-y-auto pr-1">
          <div className="text-xs font-black uppercase tracking-wider text-cyan-300 px-1 flex items-center justify-between">
            <span>Live Channels ({LIVE_TV_CHANNELS.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Tap to tune</span>
          </div>

          {channelStates.map((st) => {
            const isSelected = st.channel.id === selectedChannelId;
            const prog = isSelected && manualProgramOverride ? manualProgramOverride : st.currentProgram;
            return (
              <div
                key={st.channel.id}
                onClick={() => selectChannelDirect(st.channel.id)}
                className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center gap-2.5 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400 shadow-md'
                    : 'bg-[#060f24] border-white/10 hover:border-cyan-500/40 hover:bg-[#091634]'
                }`}
              >
                <img
                  src={resolvePosterUrl(prog)}
                  alt={prog.title}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="w-10 h-14 rounded-lg object-cover shrink-0 bg-[#040a18]"
                  onError={(e) => {
                    e.currentTarget.src = './icon-512.png';
                  }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <span className="text-[10px] font-mono font-black text-cyan-300">
                      CH {st.channel.number} • {st.channel.name}
                    </span>
                    {isSelected && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-500 text-white text-[8px] font-black uppercase">
                        ON AIR
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-bold text-white truncate">
                    {prog.title}
                  </div>
                  <div className="w-full h-1 rounded-full bg-black/50 overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      style={{ width: `${st.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
