import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Tv, Play, Radio, Clock, Sparkles, Volume2, VolumeX, ChevronLeft, 
  ChevronRight, Zap, Film, Server, Maximize2, RefreshCw, Info, Shuffle, Users
} from 'lucide-react';
import { LIVE_TV_CHANNELS, getChannelLiveState, pickRandomLiveMovie } from '../services/liveTvService';
import { resolveBackdropUrl, resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import { getStreamUrl } from '../services/streaming';
import soundFx from '../services/soundFx';

const LIVE_SERVERS = [
  { id: 'preview', label: 'Instant Live Broadcast', badge: 'ZERO-WAIT' },
  { id: 'vidstuck', label: 'VidStuck 4K Pro', badge: '4K IMAX' },
  { id: 'vidfast', label: 'VidFast Ultra', badge: 'FAST CDN' },
  { id: 'moviebox', label: 'MovieBox 4K Hub', badge: 'MULTI-DUB' },
  { id: 'nxsha', label: '123Embed Hindi', badge: 'HINDI DUB' }
];

export default function LiveTvHub({ onPlay, onOpenDetails, onWatchTogether, customMoviePool = [] }) {
  const [selectedChannelId, setSelectedChannelId] = useState(LIVE_TV_CHANNELS[0].id);
  const [nowMs, setNowMs] = useState(Date.now());
  const [liveServerId, setLiveServerId] = useState('preview');
  const [audioMode, setAudioMode] = useState('hindi');
  const [isMuted, setIsMuted] = useState(true);
  const [showOsd, setShowOsd] = useState(true);
  const [isZapping, setIsZapping] = useState(false);
  const [manualProgramOverride, setManualProgramOverride] = useState(null);
  const [randomCount, setRandomCount] = useState(0);
  const osdTimerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const triggerOsd = () => {
    setShowOsd(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      setShowOsd(false);
    }, 5500);
  };

  useEffect(() => {
    triggerOsd();
    return () => {
      if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    };
  }, [selectedChannelId, liveServerId, audioMode]);

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

  const switchChannelByDelta = (delta) => {
    soundFx.playClick?.();
    setIsZapping(true);
    setManualProgramOverride(null);
    const nextIdx = (activeChannelIndex + delta + LIVE_TV_CHANNELS.length) % LIVE_TV_CHANNELS.length;
    setSelectedChannelId(LIVE_TV_CHANNELS[nextIdx].id);
    triggerOsd();
    setTimeout(() => setIsZapping(false), 320);
  };

  const selectChannelDirect = (channelId) => {
    soundFx.playClick?.();
    if (channelId !== selectedChannelId) {
      setIsZapping(true);
      setManualProgramOverride(null);
      setSelectedChannelId(channelId);
      setTimeout(() => setIsZapping(false), 320);
    }
    triggerOsd();
  };

  // Tune immediately into a Random Movie from the live movie catalog + Random Movie Pool
  const handleSpinRandomMovie = () => {
    soundFx.playStartChime?.();
    setIsZapping(true);
    const currentId = (manualProgramOverride || activeState?.currentProgram)?.id;
    const randomMovie = pickRandomLiveMovie(customMoviePool, currentId);
    setSelectedChannelId('ch_random_roulette');
    setManualProgramOverride(randomMovie);
    setRandomCount((c) => c + 1);
    triggerOsd();
    setTimeout(() => setIsZapping(false), 320);
  };

  if (!activeState) return null;

  const { channel, nextProgram, laterProgram, elapsedMinutes, remainingMinutes, progressPercent } = activeState;
  const currentProgram = manualProgramOverride || activeState.currentProgram;
  const currentGenres = extractGenres(currentProgram).slice(0, 3);

  const embedStreamUrl = useMemo(() => {
    if (liveServerId === 'preview') return null;
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

  const handleLaunchFullCinema = (prog) => {
    if (!prog || !onPlay) return;
    soundFx.playStartChime?.();
    onPlay({
      ...prog,
      id: prog.tmdbId || prog.id,
      tmdb_id: prog.tmdbId || prog.id,
      preferredServerId: liveServerId === 'preview' ? 'vidstuck' : liveServerId
    });
  };

  const handleLaunchWatchTogether = (prog) => {
    if (!prog || !onWatchTogether) return;
    soundFx.playClick?.();
    onWatchTogether({
      ...prog,
      id: prog.tmdbId || prog.id,
      tmdb_id: prog.tmdbId || prog.id,
      preferredServerId: liveServerId === 'preview' ? 'vidstuck' : liveServerId
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Top Broadcast Control Header with Random Movie Roulette Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#06102b] via-[#081638] to-[#050c20] border border-cyan-500/35 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-3.5">
          <div className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500/25 via-cyan-500/20 to-blue-600/25 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_25px_rgba(244,63,94,0.35)] shrink-0">
            <Radio className="w-6 h-6 text-rose-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 ring-4 ring-[#06102b]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                Fontaine 24/7 Live TV & Random Movie Roulette
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                ON AIR
              </span>
            </div>
            <p className="text-xs text-cyan-200/75 mt-0.5">
              Stream live 4K genre channels, spin a random movie at any moment, or invite friends to Watch Together
            </p>
          </div>
        </div>

        {/* Instant Random Movie Roulette + Channel Zapper Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Prominent Play Random Movie Button */}
          <button
            type="button"
            onClick={handleSpinRandomMovie}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 hover:from-amber-300 hover:to-rose-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-[0_0_24px_rgba(245,158,11,0.5)] transition transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Shuffle className="w-4 h-4 stroke-[2.5]" />
            <span>🎲 Play Random Movie</span>
          </button>

          {onWatchTogether && (
            <button
              type="button"
              onClick={() => handleLaunchWatchTogether(currentProgram)}
              className="min-h-[42px] px-3.5 py-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 border border-purple-400/50 text-purple-200 hover:text-white font-extrabold text-xs flex items-center gap-1.5 shadow-[0_0_16px_rgba(168,85,247,0.3)] transition cursor-pointer"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span>Watch with Friend</span>
            </button>
          )}

          <div className="flex items-center bg-[#04091a] p-1 rounded-xl border border-cyan-500/30">
            <button
              type="button"
              onClick={() => switchChannelByDelta(-1)}
              className="min-h-[36px] px-3 rounded-lg bg-[#0a1636] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
              title="Previous Channel (CH-)"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>CH-</span>
            </button>
            <div className="px-3 text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TUNED</div>
              <div className="text-xs font-mono font-black text-cyan-300">CH {channel.number}</div>
            </div>
            <button
              type="button"
              onClick={() => switchChannelByDelta(1)}
              className="min-h-[36px] px-3 rounded-lg bg-[#0a1636] hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 text-xs font-extrabold flex items-center gap-1 transition cursor-pointer"
              title="Next Channel (CH+)"
            >
              <span>CH+</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main 16:9 Live TV Broadcast Monitor */}
      <div
        onMouseMove={triggerOsd}
        onClick={triggerOsd}
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-cyan-500/40 bg-[#02050d] shadow-[0_25px_70px_rgba(0,0,0,0.95),0_0_40px_rgba(6,182,212,0.2)]"
      >
        {/* Top Monitor Control Bar: Live Server Switcher + Audio Language + Fullscreen */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-5 py-2.5 bg-[#050c21]/95 border-b border-cyan-500/25 z-30 relative">
          {/* Left: Live Channel Indicator */}
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-mono font-black text-xs shadow-[0_0_12px_rgba(225,29,72,0.7)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              CH {channel.number}
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-white truncate max-w-[160px] sm:max-w-xs">
              {channel.name}
            </span>
            {manualProgramOverride && (
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-black">
                🎲 Random Pick #{randomCount}
              </span>
            )}
          </div>

          {/* Center: In-Monitor Live Server Switcher */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0 hidden sm:inline" />
            {LIVE_SERVERS.map((srv) => (
              <button
                key={srv.id}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick?.();
                  setLiveServerId(srv.id);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer border ${
                  liveServerId === srv.id
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 font-black shadow-[0_0_12px_rgba(34,211,238,0.5)]'
                    : 'bg-[#091534] text-slate-300 border-cyan-500/20 hover:text-white hover:border-cyan-400/50'
                }`}
              >
                {srv.label}
              </button>
            ))}
          </div>

          {/* Right: Audio Switcher + Random Shuffle + Full Cinema */}
          <div className="flex items-center gap-1.5">
            {['hindi', 'english', 'japanese'].map((lang) => (
              <button
                key={lang}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  soundFx.playClick?.();
                  setAudioMode(lang);
                  if (liveServerId === 'preview') {
                    setLiveServerId('nxsha');
                  }
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase transition cursor-pointer border ${
                  audioMode === lang
                    ? 'bg-amber-500 text-slate-950 border-amber-300 font-black'
                    : 'bg-[#091534] text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                {lang === 'hindi' ? '🇮🇳 HIN' : lang === 'english' ? '🇺🇸 ENG' : '🇯🇵 JPN'}
              </button>
            ))}

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleSpinRandomMovie();
              }}
              className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 border border-amber-400/40 text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
              title="Spin Next Random Movie"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Shuffle</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLaunchFullCinema(currentProgram);
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500 hover:text-slate-950 text-cyan-300 border border-cyan-400/40 text-[11px] font-black flex items-center gap-1 transition cursor-pointer"
              title="Open in Full Cinema Player"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Full Player</span>
            </button>
          </div>
        </div>

        {/* 16:9 Active Video Stream Viewport */}
        <div className="relative aspect-video w-full bg-black overflow-hidden">
          {/* Channel Zapping Static Transition Effect */}
          {isZapping && (
            <div className="absolute inset-0 z-40 bg-[#050d24]/95 backdrop-blur-md flex flex-col items-center justify-center text-center animate-fade-in">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-400 flex items-center justify-center mb-3 shadow-[0_0_30px_rgba(34,211,238,0.6)]">
                <Tv className="w-7 h-7 text-cyan-300 animate-bounce" />
              </div>
              <div className="text-lg font-mono font-black text-cyan-300">
                TUNING CH {channel.number}...
              </div>
              <div className="text-xs text-slate-300 font-bold mt-1">{currentProgram.title}</div>
            </div>
          )}

          {liveServerId === 'preview' ? (
            <video
              ref={videoRef}
              key={`${channel.id}-${currentProgram.id}`}
              src={currentProgram.previewVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'}
              poster={resolveBackdropUrl(currentProgram.backdrop_path || currentProgram.poster_path)}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <iframe
              key={`${liveServerId}-${currentProgram.id}-${audioMode}`}
              src={embedStreamUrl}
              title={currentProgram.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
              allowFullScreen
              referrerPolicy="origin"
            />
          )}

          {/* Top-Left Live TV Bug / Watermark */}
          <div className="absolute top-3 left-3 sm:top-4 sm:left-5 z-20 flex items-center gap-2 pointer-events-none">
            <div className="px-2.5 py-1 rounded-lg bg-black/75 backdrop-blur-md border border-cyan-500/35 flex items-center gap-2 shadow-lg">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[11px] font-black text-white tracking-wider">LIVE 4K</span>
              <span className="text-slate-500">|</span>
              <span className="text-[11px] font-mono font-bold text-cyan-300">CH {channel.number}</span>
            </div>
          </div>

          {/* Sound Unmute Floating Pill when in Instant Preview Mode */}
          {liveServerId === 'preview' && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted((m) => !m);
              }}
              className={`absolute top-3 right-3 sm:top-4 sm:right-5 z-20 px-3.5 py-1.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow-lg border ${
                isMuted
                  ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse'
                  : 'bg-black/75 text-cyan-300 border-cyan-500/40 hover:bg-black'
              }`}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4" />
                  <span>Tap to Unmute Live Audio</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                  <span>Live Audio On</span>
                </>
              )}
            </button>
          )}

          {/* Realistic Television OSD (On-Screen Display) Bottom Overlay */}
          {liveServerId === 'preview' && (
            <div
              className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#020612] via-[#020612]/90 to-transparent p-4 sm:p-6 transition-opacity duration-300 ${
                showOsd ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 font-mono">
                      NOW PLAYING
                    </span>
                    <span>{channel.category}</span>
                    <span>•</span>
                    <span className="text-amber-300">
                      {currentProgram.isHindiDubbed ? '🇮🇳 Hindi / Multi-Audio' : 'Original Audio'}
                    </span>
                    {!manualProgramOverride && (
                      <>
                        <span>•</span>
                        <span className="font-mono text-slate-300">
                          {elapsedMinutes}m elapsed ({remainingMinutes}m left)
                        </span>
                      </>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
                    {currentProgram.title}
                  </h2>

                  {/* Color-Coded Genre Tags inside OSD */}
                  {currentGenres.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentGenres.map((genre) => {
                        const style = getGenreBadgeStyle(genre);
                        return (
                          <span
                            key={genre}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${style.badgeClass}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                            <span>{style.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 max-w-xl">
                    {currentProgram.overview}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSpinRandomMovie();
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(245,158,11,0.5)] transition cursor-pointer whitespace-nowrap"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    <span>🎲 Next Random Movie</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLiveServerId('vidstuck');
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(34,211,238,0.5)] transition cursor-pointer whitespace-nowrap"
                  >
                    <Zap className="w-3.5 h-3.5 fill-slate-950" />
                    <span>Switch to Full 4K Server</span>
                  </button>

                  {onWatchTogether && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLaunchWatchTogether(currentProgram);
                      }}
                      className="min-h-[42px] px-4 py-2 rounded-xl bg-purple-600/80 hover:bg-purple-500 border border-purple-400/50 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Watch Together</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchFullCinema(currentProgram);
                    }}
                    className="min-h-[42px] px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/35 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cinema Mode</span>
                  </button>
                </div>
              </div>

              {/* Live Broadcast Progress Bar */}
              <div className="mt-3 w-full h-1.5 rounded-full bg-slate-800/90 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-700"
                  style={{ width: `${manualProgramOverride ? 100 : progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Numeric Channel Selector Strip (100 - 106) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {LIVE_TV_CHANNELS.map((ch) => {
          const isSelected = ch.id === selectedChannelId;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                if (ch.isRandomChannel) {
                  handleSpinRandomMovie();
                } else {
                  selectChannelDirect(ch.id);
                }
              }}
              className={`min-h-[44px] px-4 py-2 rounded-xl border font-bold text-xs flex items-center gap-2 transition shrink-0 cursor-pointer ${
                isSelected
                  ? ch.isRandomChannel
                    ? 'bg-gradient-to-r from-amber-500/30 to-rose-500/30 border-amber-400 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                    : 'bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border-cyan-400 text-white shadow-[0_0_18px_rgba(34,211,238,0.3)]'
                  : 'bg-[#060f26] border-cyan-500/20 text-slate-300 hover:text-white hover:border-cyan-400/50'
              }`}
            >
              <span className={`px-2 py-0.5 rounded font-mono font-black text-[11px] ${
                isSelected
                  ? ch.isRandomChannel
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-cyan-400 text-slate-950'
                  : 'bg-slate-900 text-cyan-300'
              }`}>
                {ch.isRandomChannel ? '🎲 100' : ch.number}
              </span>
              <span>{ch.name}</span>
            </button>
          );
        })}
      </div>

      {/* Electronic Program Guide (EPG) Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-cyan-300 flex items-center gap-2">
            <Tv className="w-4 h-4 text-cyan-400" />
            <span>Interactive Channel Guide & Lineup</span>
          </h2>
          <span className="text-xs text-slate-400">
            Click any channel or program to tune immediately
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {channelStates.map((st) => {
            const isSelected = st.channel.id === selectedChannelId;
            const prog = isSelected && manualProgramOverride ? manualProgramOverride : st.currentProgram;
            const progGenres = extractGenres(prog).slice(0, 2);

            return (
              <div
                key={st.channel.id}
                onClick={() => selectChannelDirect(st.channel.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#09193d] to-[#06112b] border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.22)]'
                    : 'bg-[#050d22]/90 border-cyan-500/15 hover:border-cyan-500/45 hover:bg-[#081433]'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div className="relative w-16 h-24 rounded-xl overflow-hidden bg-slate-950 border border-white/10 shrink-0">
                    <img
                      src={resolvePosterUrl(prog.poster_path, 'w342')}
                      alt={prog.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                    />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-rose-600 text-white font-mono font-black text-[9px]">
                      CH {st.channel.number}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-cyan-300 truncate">
                        {st.channel.name}
                      </span>
                      <span className="text-[10px] font-mono text-emerald-300 bg-emerald-500/15 px-2 py-0.5 rounded-md border border-emerald-500/30 shrink-0">
                        {st.channel.isRandomChannel ? '🎲 RANDOM' : `LIVE • ${st.remainingMinutes}m left`}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-white truncate mt-1">
                      {prog.title}
                    </h3>

                    {/* Color-Coded Genre Tags */}
                    {progGenres.length > 0 && (
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        {progGenres.map((g) => {
                          const style = getGenreBadgeStyle(g);
                          return (
                            <span
                              key={g}
                              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-extrabold border ${style.badgeClass}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                              <span>{style.label}</span>
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Channel Lineup */}
                    <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      {st.channel.programs.slice(0, 4).map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            soundFx.playClick?.();
                            setSelectedChannelId(st.channel.id);
                            setManualProgramOverride(p);
                            triggerOsd();
                          }}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition whitespace-nowrap shrink-0 cursor-pointer ${
                            prog.id === p.id && isSelected
                              ? 'bg-cyan-500 text-slate-950 border-cyan-300 font-black'
                              : 'bg-slate-950/70 text-slate-300 border-white/10 hover:text-white hover:border-cyan-400/40'
                          }`}
                        >
                          ▶ {p.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                    style={{ width: `${st.progressPercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
