import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, 
  Sparkles, ShieldCheck, Download, Maximize2, Minimize2, Volume2, 
  CheckCircle2, AlertTriangle 
} from 'lucide-react';
import { SERVERS, getStreamUrl, getDownloadUrl } from '../services/streaming';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable, isHindiDubbedAnime } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';

export default function PlayerModal({ item, onClose, preferredServerId, isHindiPreferred }) {
  if (!item) return null;

  // Safe classification and robust fallbacks
  const isSeries = Boolean(
    item?.media_type === 'tv' || 
    (item?.media_type !== 'movie' && Boolean(item?.first_air_date)) || 
    item?.category === 'series' || 
    item?.category === 'kdrama'
  );
  const title = item?.title || item?.name || 'Now Playing';

  // Accurate Anime vs Hindi classification
  const isAnime = Boolean(
    item?.category === 'anime' ||
    item?.category === 'ecchi_anime' ||
    item?.isAnime === true ||
    item?.original_language === 'ja' ||
    (Array.isArray(item?.origin_country) && item?.origin_country.includes('JP')) ||
    ((item?.genre_ids?.includes(16) || item?.genres?.some((g) => g.id === 16 || g.name === 'Animation')) && item?.original_language === 'ja')
  );

  const hasHindiDubOption = isAnime
    ? isHindiDubbedAnime(item)
    : (!isAnime && Boolean(item?.isHindiDubbed || isHindiAvailable(item)));

  const isBollywoodHindi = Boolean(
    !isAnime && (
      item?.original_language === 'hi' ||
      item?.category === 'hindi' ||
      Boolean(item?.isHindiDubbed) ||
      (Array.isArray(item?.origin_country) && item?.origin_country.includes('IN'))
    )
  );

  // Audio Mode: 'english' | 'sub' | 'hindi'
  const [audioMode, setAudioMode] = useState(() => {
    if (isBollywoodHindi) return 'hindi';
    if (isHindiPreferred && hasHindiDubOption) return 'hindi';
    if (item?.dub_type === 'hindi') return 'hindi';
    if (item?.dub_type === 'sub') return 'sub';
    return 'english';
  });

  // Filter servers for anime to prevent autoembed 404s
  const availableServers = isAnime 
    ? SERVERS.filter((s) => s.id !== 'autoembed') 
    : SERVERS;

  // Determine initial server: VidLink Pro for English Dub Anime, VidSrc 4K otherwise
  const getInitialServer = () => {
    if (audioMode === 'english' && isAnime) {
      return availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
    }
    return availableServers.find((s) => s.id === preferredServerId) || availableServers[0];
  };

  const [selectedServer, setSelectedServer] = useState(getInitialServer);

  // Episodes & Season State
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodesList, setEpisodesList] = useState([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const handleReload = () => setReloadKey((k) => k + 1);

  // uBlock / Audio / AI Boost States
  const [showHindiGuide, setShowHindiGuide] = useState(false);
  const [showUBlockGuide, setShowUBlockGuide] = useState(false);
  const [blockedAds, setBlockedAds] = useState(getBlockedCount());
  const [aiBoostMode, setAiBoostMode] = useState(() => {
    return localStorage.getItem('furina_ai_boost') || '4k';
  });

  // Fullscreen Mode States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerWrapperRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  const AI_BOOST_STYLES = {
    off: {},
    '4k': {
      filter: 'contrast(1.09) saturate(1.14) brightness(1.02) drop-shadow(0 0 1px rgba(0,0,0,0.5))',
      transition: 'filter 0.3s ease'
    },
    hdr: {
      filter: 'contrast(1.18) saturate(1.28) brightness(1.04)',
      transition: 'filter 0.3s ease'
    },
    night: {
      filter: 'brightness(1.12) contrast(1.08) saturate(1.08)',
      transition: 'filter 0.3s ease'
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const releaseDate = item?.release_date || item?.first_air_date;
  const isUpcoming = (releaseDate && releaseDate > todayStr) || (item?.vote_count === 0 && !isSeries);

  // Safely close modal and exit browser fullscreen mode
  const handleSafeClose = () => {
    if (document.fullscreenElement || document.webkitFullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
    setIsFullscreen(false);
    onClose();
  };

  // Lock background body and document scroll while modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    const originalDocOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow || '';
      document.documentElement.style.overflow = originalDocOverflow || '';
    };
  }, []);

  // Keyboard Escape and Fullscreen Key Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (document.fullscreenElement || isFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        } else {
          handleSafeClose();
        }
      } else if (e.key === 'f' || e.key === 'F') {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          toggleFullscreen();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  // Fullscreen change listener from browser
  useEffect(() => {
    const handleFsChange = () => {
      const isFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Auto-hide controls in fullscreen
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isFullscreen) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3500);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement && !isFullscreen) {
      setIsFullscreen(true);
      if (playerWrapperRef.current?.requestFullscreen) {
        playerWrapperRef.current.requestFullscreen().catch(() => {});
      } else if (playerWrapperRef.current?.webkitRequestFullscreen) {
        playerWrapperRef.current.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  // Listen to blocked ad popup events
  useEffect(() => {
    const handleBlocked = (e) => {
      setBlockedAds(e.detail?.count || getBlockedCount());
    };
    window.addEventListener('furina-ad-blocked', handleBlocked);
    return () => window.removeEventListener('furina-ad-blocked', handleBlocked);
  }, []);

  // Fetch TV seasons count
  useEffect(() => {
    if (isSeries && item?.id) {
      fetchTvDetails(item.id).then((details) => {
        if (details && details.number_of_seasons) {
          setTotalSeasons(Math.max(1, details.number_of_seasons));
        }
      });
    }
  }, [item?.id, isSeries]);

  // Load episodes if TV series
  useEffect(() => {
    if (isSeries && item?.id) {
      setIsLoadingEpisodes(true);
      fetchSeasonEpisodes(item.id, season).then((eps) => {
        setEpisodesList(eps);
        setIsLoadingEpisodes(false);
      });
    }
  }, [item?.id, season, isSeries]);

  const currentServer = selectedServer || availableServers[0];
  const streamUrl = getStreamUrl(currentServer, item?.id, isSeries ? 'tv' : 'movie', season, episode, audioMode);
  const downloadUrl = getDownloadUrl(item?.id, isSeries ? 'tv' : 'movie', season, episode);

  const openInNewWindow = () => {
    permitPopupOnce();
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNextServer = () => {
    const currentIndex = availableServers.findIndex((s) => s.id === (currentServer?.id || availableServers[0].id));
    const nextServer = availableServers[(currentIndex + 1) % availableServers.length];
    setSelectedServer(nextServer);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-0 sm:p-3 md:p-4 overflow-hidden select-none"
      onClick={(e) => { if (e.target === e.currentTarget && !isFullscreen) handleSafeClose(); }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/25 via-transparent to-transparent" />

      {/* Modal Container: Flex Column with FIXED header and strictly internal scrolling */}
      <div 
        ref={playerWrapperRef}
        onMouseMove={handleUserActivity}
        onTouchStart={handleUserActivity}
        className={`relative flex flex-col bg-[#050b1d] border-0 sm:border sm:border-cyan-500/35 overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'fixed inset-0 z-[99999] w-screen h-screen rounded-none max-w-none max-h-none p-0 bg-black overflow-hidden select-none'
            : 'w-full max-w-5xl h-[100dvh] sm:h-[92vh] max-h-[100dvh] sm:max-h-[92vh] rounded-none sm:rounded-2xl shadow-[0_0_80px_rgba(56,189,248,0.35)] animate-fade-in'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ========================================================================= */}
        {/* 1. CINEMATIC FULLSCREEN OVERLAY HUD (Crunchyroll / Netflix Style)         */}
        {/* ========================================================================= */}
        {isFullscreen && (
          <div 
            className={`absolute top-0 left-0 right-0 z-50 p-4 sm:p-6 bg-gradient-to-b from-black/95 via-black/60 to-transparent flex items-center justify-between transition-opacity duration-300 ${
              showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold shrink-0"
                title="Exit Fullscreen (Esc)"
              >
                <Minimize2 className="w-4 h-4" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </button>

              <div className="min-w-0">
                <h2 className="font-black text-sm sm:text-base text-white truncate flex items-center gap-2">
                  <span>{title}</span>
                  {isSeries && (
                    <span className="text-cyan-300 font-mono text-xs bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40 shrink-0">
                      S{season} E{episode}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-cyan-200/80">
                  <span className="text-emerald-400 font-bold">{selectedServer.badge}</span>
                  <span>•</span>
                  <span className="text-cyan-400 font-mono">{selectedServer.shortName}</span>
                  {audioMode === 'english' && <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold">🎙️ English Dub</span>}
                  {audioMode === 'hindi' && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">🇮🇳 Hindi</span>}
                  {audioMode === 'sub' && <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">🇯🇵 Sub</span>}
                </div>
              </div>
            </div>

            {/* Quick Mirror & Close Controls in Fullscreen */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden md:flex items-center gap-1 bg-black/60 p-1 rounded-xl border border-white/15">
                {availableServers.slice(0, 4).map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedServer(srv)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${
                      selectedServer.id === srv.id
                        ? 'bg-cyan-500 text-gray-950 font-black'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {srv.shortName}
                  </button>
                ))}
              </div>

              <button
                onClick={handleReload}
                title="Reload Stream"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

              <button
                onClick={handleSafeClose}
                title="Close Player (Esc)"
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400 flex items-center justify-center transition shadow-[0_0_20px_rgba(244,63,94,0.8)] cursor-pointer"
              >
                <X className="w-5 h-5 font-black stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 2. REGULAR HEADER (STICKY AT TOP OF MODAL CARD - CANNOT SCROLL AWAY)     */}
        {/* ========================================================================= */}
        {!isFullscreen && (
          <div className="flex items-center justify-between p-3 sm:p-4 border-b border-cyan-500/30 bg-[#050b1d] shrink-0 z-30 shadow-md">
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.45)] shrink-0">
                <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h2 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                  <span>{title}</span>
                  {isSeries && (
                    <span className="text-cyan-300 font-bold text-[11px] bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40 shrink-0">
                      S{season} E{episode}
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-cyan-200/70">
                  <span className="text-emerald-400 font-bold">{selectedServer.badge}</span>
                  <span>•</span>
                  <span className="text-cyan-400/80 font-mono hidden xs:inline">{selectedServer.shortName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Fullscreen Mode Button */}
              <button
                onClick={toggleFullscreen}
                title="Cinema Fullscreen (F)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 text-xs font-extrabold transition shadow-[0_0_15px_rgba(56,189,248,0.45)] transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cinema Mode</span>
              </button>

              {/* 1-Click Download Option */}
              <a
                href={downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={permitPopupOnce}
                title="Download movie or episode in HD / 4K"
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 hover:text-white text-xs font-bold transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </a>

              {/* Auto-Switch Next Working Server button */}
              <button
                onClick={handleNextServer}
                title="Auto-switch to next working mirror if stream buffers"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="hidden sm:inline">Auto-Switch</span>
              </button>

              {/* uBlock 100% Zero-Ad Protection Guide */}
              <button
                onClick={() => setShowUBlockGuide(!showUBlockGuide)}
                title="Zero-Ad Playback Guide"
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  showUBlockGuide
                    ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)] scale-105'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="hidden lg:inline">🛡️ Ad-Free</span>
              </button>

              {/* Reload stream button */}
              <button
                onClick={handleReload}
                title="Reload video player"
                className="p-2 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Open stream in clean external window */}
              <button
                onClick={openInNewWindow}
                title="Open full stream in new clean tab"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Full Player ↗</span>
              </button>

              {/* HIGH-CONTRAST RED CLOSE BUTTON - ALWAYS VISIBLE, NEVER SCROLLS AWAY */}
              <button
                onClick={handleSafeClose}
                aria-label="Close video player modal"
                title="Close Player (Esc)"
                className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400/80 hover:border-white flex items-center justify-center transition shadow-[0_0_18px_rgba(244,63,94,0.7)] hover:shadow-[0_0_28px_rgba(244,63,94,0.95)] shrink-0 ml-1.5 transform hover:scale-105 active:scale-90 touch-manipulation cursor-pointer"
              >
                <X className="w-5 h-5 font-black stroke-[3]" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. DEDICATED AUDIO TRACK SELECTOR BAR (English Dub / Japanese Sub / Hindi) */}
        {/* ========================================================================= */}
        {!isFullscreen && (
          <div className="px-3 sm:px-4 py-2 bg-gradient-to-r from-[#070e24] via-[#09153a] to-[#070e24] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-extrabold text-cyan-300 text-[11px] uppercase tracking-wider">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                Audio Track:
              </span>
              <div className="flex items-center gap-1.5">
                {/* English Dub Option */}
                <button
                  onClick={() => {
                    setAudioMode('english');
                    // Route to verified VidLink Pro English Dub
                    const engServer = availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
                    setSelectedServer(engServer);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                    audioMode === 'english'
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-105'
                      : 'bg-cyan-500/10 text-cyan-200/70 border-cyan-500/30 hover:text-white'
                  }`}
                >
                  <span>🎙️</span>
                  <span>English Dub</span>
                </button>

                {/* Japanese Sub Option */}
                {isAnime && (
                  <button
                    onClick={() => {
                      setAudioMode('sub');
                      const subServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
                      setSelectedServer(subServer);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                      audioMode === 'sub'
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-105'
                        : 'bg-purple-500/10 text-purple-200/70 border-purple-500/30 hover:text-white'
                    }`}
                  >
                    <span>🇯🇵</span>
                    <span>Japanese Sub</span>
                  </button>
                )}

                {/* Hindi Dub Option (for Bollywood or Hindi dubbed anime) */}
                {(isBollywoodHindi || hasHindiDubOption) && (
                  <button
                    onClick={() => {
                      setAudioMode('hindi');
                      const hindiServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
                      setSelectedServer(hindiServer);
                    }}
                    className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                      audioMode === 'hindi'
                        ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105'
                        : 'bg-amber-500/10 text-amber-200/70 border-amber-500/30 hover:text-white'
                    }`}
                  >
                    <span>🇮🇳</span>
                    <span>Hindi Audio</span>
                  </button>
                )}
              </div>
            </div>

            {/* Audio Mode Active Guidance Badge */}
            <div className="text-[11px] text-cyan-200/70">
              {audioMode === 'english' && (
                <span className="text-cyan-300 font-medium">
                  ✓ <strong>English Dub Active</strong> (VidLink Pro & Multi-Audio servers loaded with English audio)
                </span>
              )}
              {audioMode === 'sub' && (
                <span className="text-purple-300 font-medium">
                  ✓ <strong>Japanese Subbed Active</strong> (Original Japanese Audio • Tap 💬 CC for subtitles)
                </span>
              )}
              {audioMode === 'hindi' && (
                <span className="text-amber-300 font-medium">
                  ✓ <strong>Hindi Audio Track Active</strong> (RareAnimes format • Hindi broadcast)
                </span>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SCROLLABLE INNER BODY - Video, Rescue Bar, Audio Info & Episodes        */}
        {/* ========================================================================= */}
        <div className={`flex-1 ${isFullscreen ? 'w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden p-0 m-0' : 'overflow-y-auto overscroll-contain'}`}>
          
          {/* Expandable uBlock Origin Lite Protection Drawer */}
          {!isFullscreen && showUBlockGuide && (
            <div className="p-4 bg-gradient-to-r from-[#061e19] via-[#081b29] to-[#04121d] border-b border-emerald-500/30 text-xs animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>🛡️ How to Block 100% of Ads Across Every Streaming Server:</span>
                </div>
                <button 
                  onClick={() => setShowUBlockGuide(false)} 
                  className="text-emerald-200/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                Embed servers inject popups directly inside cross-origin iframes. <strong>Installing free uBlock Origin Lite</strong> automatically blocks all ads and popups at the browser level:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <a
                  href="https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={permitPopupOnce}
                  className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                      <span>Chrome / Edge / Brave</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400" />
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">1-Click Install from Chrome Web Store.</p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 py-1 text-center rounded">
                    Install uBlock Lite ↗
                  </div>
                </a>
                <a
                  href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={permitPopupOnce}
                  className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                      <span>Firefox Browser</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">Official Mozilla Add-on protection.</p>
                  </div>
                  <div className="mt-2 text-[10px] font-bold text-cyan-400 bg-cyan-500/20 py-1 text-center rounded">
                    Install uBlock ↗
                  </div>
                </a>
                <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/40 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-purple-300 text-xs">
                      <span>iPhone / iPad / Mac</span>
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1">Use <strong>Brave Browser</strong> (built-in shield) or Safari + AdGuard iOS.</p>
                  </div>
                  <div className="mt-2 text-[10px] font-semibold text-purple-300 bg-purple-500/20 py-1 text-center rounded">
                    Mobile Shield Ready
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* AI Boost Filter Switcher */}
          {!isFullscreen && (
            <div className="px-3 sm:px-4 py-2 bg-[#061127] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-extrabold text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  <span>AI Video Boost:</span>
                </span>
                <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-cyan-500/30">
                  {[
                    { id: 'off', label: 'Off', desc: 'Raw stream' },
                    { id: '4k', label: '💎 4K Clarity', desc: 'Sharpening & micro-contrast' },
                    { id: 'hdr', label: '🌈 HDR Cinema', desc: 'Dolby-grade dynamic vibrance' },
                    { id: 'night', label: '🌙 Dark Scene', desc: 'Shadow booster' },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      onClick={() => {
                        setAiBoostMode(mode.id);
                        localStorage.setItem('furina_ai_boost', mode.id);
                      }}
                      title={mode.desc}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                        aiBoostMode === mode.id
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 shadow-[0_0_12px_rgba(56,189,248,0.6)] scale-105'
                          : 'text-slate-300 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {mode.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={toggleFullscreen}
                className="text-[11px] text-cyan-300 hover:text-white font-bold flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Switch to Fullscreen (F)</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. VIDEO PLAYER IFRAME (100% RESPONSIVE, 16:9 PRESERVED, NO CUTOFF)       */}
          {/* ========================================================================= */}
          <div 
            className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
              isFullscreen ? 'w-full h-full flex-1 max-w-full max-h-full' : 'aspect-video'
            }`}
            style={AI_BOOST_STYLES[aiBoostMode] || {}}
          >
            <iframe
              key={`${currentServer.id}-${season}-${episode}-${audioMode}-${reloadKey}`}
              src={streamUrl}
              title={title}
              className={`border-0 ${
                isFullscreen 
                  ? 'w-full h-full aspect-video max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] shadow-2xl' 
                  : 'w-full h-full'
              }`}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          </div>

          {/* ========================================================================= */}
          {/* 6. 404 RESCUE BAR & INSTANT WORKING MIRRORS (ZERO 404 RESCUE ARCHITECTURE)*/}
          {/* ========================================================================= */}
          {!isFullscreen && (
            <div className="px-3 sm:px-4 py-2.5 bg-[#040918] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-cyan-300/90">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                <span className="text-[11px] font-bold">
                  ⚠️ Stream 404 or Buffering? Tap an instant mirror:
                </span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {availableServers.map((srv) => {
                  const isActive = selectedServer.id === srv.id;
                  return (
                    <button
                      key={srv.id}
                      onClick={() => setSelectedServer(srv)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                        isActive
                          ? 'bg-cyan-500 text-gray-950 border-cyan-300 font-black shadow-[0_0_12px_rgba(56,189,248,0.6)] scale-105'
                          : 'bg-[#09132e] text-cyan-200/80 border-cyan-500/30 hover:text-white hover:border-cyan-400/60'
                      }`}
                    >
                      {srv.shortName}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Detailed Audio Guidance & Demon Slayer Dub Routing Card */}
          {!isFullscreen && isAnime && (
            <div className="p-3.5 bg-gradient-to-r from-[#100726] via-[#081126] to-[#070e24] border-b border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-base shrink-0 shadow">
                  {audioMode === 'hindi' ? '🇮🇳' : audioMode === 'english' ? '🎙️' : '🇯🇵'}
                </div>
                <div>
                  <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2 flex-wrap">
                    <span>{title}</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40">
                      {audioMode === 'english' ? 'English Dub Active' : audioMode === 'hindi' ? 'Hindi Dub Active' : 'Japanese Sub Active'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                      {selectedServer.shortName}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200/80 mt-1 leading-relaxed">
                    {audioMode === 'english' 
                      ? 'English Dubbed audio stream is loaded via VidLink Pro (verified multi-audio). If the current mirror plays Japanese audio for this episode, switch to Server 1 (VidLink Pro) or Server 6 (MultiEmbed) above, or tap ⚙️ Settings inside the video player to select English Dub.'
                      : audioMode === 'hindi'
                      ? 'Official Hindi Dub audio broadcast (RareAnimes format). Server 1 and Server 2 provide direct 1080p playback.'
                      : 'Japanese original audio stream with subtitles. Tap 💬 CC inside the player to select subtitle languages.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={handleNextServer}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-black text-xs transition shadow flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Next Server</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. TV SERIES EPISODE & SEASON NAVIGATION GRID                             */}
          {/* ========================================================================= */}
          {!isFullscreen && isSeries && (
            <div className="p-4 bg-[#070d1f] border-t border-cyan-500/20">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Select Season & Episode</span>
                </div>

                {/* Season Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                  {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
                    <button
                      key={sNum}
                      onClick={() => { setSeason(sNum); setEpisode(1); }}
                      className={`px-3 py-1 rounded text-xs font-bold transition ${
                        season === sNum
                          ? 'bg-cyan-500 text-gray-950 font-black shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                          : 'bg-[#0f1d40] text-cyan-200/70 hover:text-white'
                      }`}
                    >
                      Season {sNum}
                    </button>
                  ))}
                </div>
              </div>

              {/* Episode Grid */}
              {isLoadingEpisodes ? (
                <div className="py-8 text-center text-xs text-cyan-300/60 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading episodes for Season {season}...
                </div>
              ) : episodesList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-52 overflow-y-auto pr-1">
                  {episodesList.map((ep) => {
                    const isCurrent = episode === ep.episode_number;
                    return (
                      <button
                        key={ep.episode_number}
                        onClick={() => setEpisode(ep.episode_number)}
                        className={`p-2.5 rounded-xl text-left transition border ${
                          isCurrent
                            ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_12px_rgba(56,189,248,0.3)]'
                            : 'bg-[#0a132b] border-cyan-500/15 text-cyan-200/70 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-[10px] text-cyan-400/90 font-mono font-bold">EP {ep.episode_number}</div>
                        <div className="text-xs font-medium text-white line-clamp-1">{ep.name || `Episode ${ep.episode_number}`}</div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                /* Fallback Episode Buttons */
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((epNum) => (
                    <button
                      key={epNum}
                      onClick={() => setEpisode(epNum)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                        episode === epNum
                          ? 'bg-cyan-500 text-gray-950 font-bold shadow'
                          : 'bg-[#0a132b] text-cyan-200/70 hover:text-white'
                      }`}
                    >
                      Episode {epNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          {!isFullscreen && (
            <div className="p-3 bg-[#040816] border-t border-cyan-500/20 flex items-center justify-between gap-3">
              <button
                onClick={handleSafeClose}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 border border-rose-400 text-white text-xs font-bold transition shadow-[0_0_15px_rgba(244,63,94,0.6)] cursor-pointer"
              >
                <X className="w-4 h-4" />
                <span>Close Video Player (Esc)</span>
              </button>
              <div className="text-[11px] text-cyan-200/50 hidden sm:inline">
                Press <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-mono">F</kbd> for Fullscreen, <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-mono">Esc</kbd> to Close
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
