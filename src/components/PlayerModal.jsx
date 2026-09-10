import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, Pause,
  Sparkles, ShieldCheck, Download, Maximize2, Minimize2, Volume2, VolumeX,
  CheckCircle2, AlertTriangle, ArrowRight, Loader2, ChevronLeft, ChevronRight,
  PictureInPicture, Keyboard, HelpCircle, Subtitles
} from 'lucide-react';
import { SERVERS, getStreamUrl, getDownloadUrl } from '../services/streaming';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable, isHindiDubbedAnime, getGenreNames } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';
import DownloadModal from './DownloadModal';

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

  const isCustom = Boolean(item?.isCustom || item?.languages);

  const isBollywoodHindi = Boolean(
    !isAnime && (
      item?.original_language === 'hi' ||
      (Array.isArray(item?.origin_country) && item?.origin_country.includes('IN') && item?.original_language !== 'en')
    )
  );

  // Authentic Hindi audio is available from:
  // 1. Studio/Custom owned content with a real Hindi asset (item?.languages?.hi?.url)
  // 2. Authentic Bollywood / Indian cinema whose native spoken audio is Hindi (isBollywoodHindi)
  // 3. Known titles with official Hindi dubbing (Squid Game, All of Us Are Dead, Money Heist, MCU movies, anime with Hindi dubs, etc.)
  const hasWorkingHindiSource = isCustom
    ? Boolean(item?.languages?.hi?.url)
    : (isBollywoodHindi || isHindiAvailable(item));

  const hasWorkingEnglishSource = isCustom
    ? Boolean(item?.languages?.en?.url)
    : true;

  const hasWorkingJapaneseSource = isCustom
    ? Boolean(item?.languages?.ja?.url)
    : isAnime;

  // Initial Audio Mode: 'english' | 'sub' | 'hindi'
  const [audioMode, setAudioMode] = useState(() => {
    if (isCustom) {
      if (item?.languages?.hi?.url) return 'hindi';
      if (item?.languages?.en?.url) return 'english';
      if (item?.languages?.ja?.url) return 'sub';
      return 'english';
    }
    if (isBollywoodHindi) return 'hindi';
    // CRITICAL: Check Hindi preference BEFORE anime sub default
    // so that anime titles with verified Hindi dubs start in Hindi when user selected Hindi filter
    if ((isHindiPreferred || item?.isHindiDubbed === true || item?.hasHindiDub === true || item?.dub_type === 'hindi') && hasWorkingHindiSource) return 'hindi';
    if (item?.dub_type === 'sub') return 'sub';
    if (isAnime) return 'sub';
    return 'english';
  });

  // Filter servers for anime to prioritize VidLink and VidSrc
  const availableServers = isAnime 
    ? SERVERS.filter((s) => s.id !== 'autoembed') 
    : SERVERS;

  // Determine initial server — route Hindi to verified multi-audio servers
  const getInitialServer = () => {
    // If Hindi audio mode is active, prioritize Hindi-verified servers
    const willBeHindi = isBollywoodHindi || ((isHindiPreferred || item?.isHindiDubbed === true || item?.hasHindiDub === true || item?.dub_type === 'hindi') && hasWorkingHindiSource);
    if (willBeHindi && !isCustom) {
      if (isBollywoodHindi) {
        return availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
      }
      return availableServers.find((s) => s.id === 'multiembed') || availableServers.find((s) => s.id === 'smashy') || availableServers.find((s) => s.id === 'one23embed') || availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
    }
    if (isAnime) {
      return availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
    }
    return availableServers.find((s) => s.id === preferredServerId) || availableServers[0];
  };

  const [selectedServer, setSelectedServer] = useState(getInitialServer);
  const [iframeLoading, setIframeLoading] = useState(true);

  // Episodes & Season State with Watch Progress Persistence
  const getSavedProgress = () => {
    try {
      if (item?.id) {
        const saved = localStorage.getItem(`furina_progress_${item.id}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && typeof parsed.season === 'number' && typeof parsed.episode === 'number') {
            return { season: parsed.season, episode: parsed.episode };
          }
        }
      }
    } catch (e) {}
    return { season: 1, episode: 1 };
  };

  const initialProgress = getSavedProgress();
  const [season, setSeason] = useState(initialProgress.season);
  const [episode, setEpisode] = useState(initialProgress.episode);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodesList, setEpisodesList] = useState([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const handleReload = () => setReloadKey((k) => k + 1);

  // Next & Previous Episode Navigation Handlers
  const handlePrevEpisode = () => {
    setEpisode((prev) => Math.max(1, prev - 1));
  };
  const handleNextEpisode = () => {
    setEpisode((prev) => prev + 1);
  };

  // Persist Watch Progress on Season / Episode Change
  useEffect(() => {
    if (isSeries && item?.id) {
      try {
        localStorage.setItem(`furina_progress_${item.id}`, JSON.stringify({
          ...item,
          season,
          episode,
          title,
          updatedAt: Date.now()
        }));
      } catch (e) {}
    }
  }, [item?.id, season, episode, isSeries, title]);

  // AdBlock / Guide States
  const [showUBlockGuide, setShowUBlockGuide] = useState(false);
  const [aiBoostMode, setAiBoostMode] = useState(() => {
    return localStorage.getItem('furina_ai_boost') || '4k';
  });
  const [aiBoostToast, setAiBoostToast] = useState(null);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const [activeSubtitle, setActiveSubtitle] = useState('en');

  // Fullscreen Mode States
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const playerWrapperRef = useRef(null);
  const videoRef = useRef(null);
  const controlsTimeoutRef = useRef(null);

  // Download Manager State (0% -> 100% progress)
  const [downloadState, setDownloadState] = useState({
    status: 'idle', // 'idle' | 'preparing' | 'downloading' | 'completed' | 'error'
    progress: 0,
    errorMsg: ''
  });

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
    try {
      if (window.history.state?.modal === 'player_active') {
        window.history.back();
      }
    } catch (e) {}
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

  // Browser Back Button (popstate) navigation handling
  useEffect(() => {
    try {
      window.history.pushState({ modal: 'player_active' }, '');
    } catch (e) {}

    const handlePopState = () => {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      onClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Iframe loading reset & safety timer
  useEffect(() => {
    setIframeLoading(true);
    const timer = setTimeout(() => setIframeLoading(false), 5000);
    return () => clearTimeout(timer);
  }, [selectedServer?.id, season, episode, audioMode, reloadKey]);

  // Sync isFullscreen with native document fullscreen changes
  useEffect(() => {
    const handleFsChange = () => {
      const isNativeFs = Boolean(document.fullscreenElement || document.webkitFullscreenElement);
      setIsFullscreen(isNativeFs);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    document.addEventListener('webkitfullscreenchange', handleFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      document.removeEventListener('webkitfullscreenchange', handleFsChange);
    };
  }, []);

  // Keyboard Escape, Fullscreen, and Video Playback Key Listeners
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Strictly ignore keyboard shortcuts while user is typing in any input, textarea, select, or editable element
      if (
        e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' || 
        e.target.tagName === 'SELECT' || 
        e.target.isContentEditable ||
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key === 'Escape') {
        if (isShortcutsHelpOpen) {
          setIsShortcutsHelpOpen(false);
          return;
        }
        if (document.fullscreenElement || isFullscreen) {
          if (document.exitFullscreen) {
            document.exitFullscreen().catch(() => {});
          }
          setIsFullscreen(false);
        } else {
          handleSafeClose();
        }
      } else if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsHelpOpen((prev) => !prev);
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === ' ' || e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        if (videoRef.current) {
          e.preventDefault();
          if (videoRef.current.paused) {
            videoRef.current.play().catch(() => {});
          } else {
            videoRef.current.pause();
          }
        }
      } else if (e.key === 'j' || e.key === 'J') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 10);
        }
      } else if (e.key === 'l' || e.key === 'L') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + 10);
        }
      } else if (e.key === 'm' || e.key === 'M') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.muted = !videoRef.current.muted;
        }
      } else if (e.key === 'ArrowLeft') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      } else if (e.key === 'ArrowRight') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + 5);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        togglePictureInPicture();
      } else if (e.key === 'ArrowUp') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.volume = Math.min(1, Math.round((videoRef.current.volume + 0.1) * 10) / 10);
        }
      } else if (e.key === 'ArrowDown') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.volume = Math.max(0, Math.round((videoRef.current.volume - 0.1) * 10) / 10);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose]);

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {}
  };

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
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (playerWrapperRef.current?.requestFullscreen) {
        playerWrapperRef.current.requestFullscreen().catch(() => {});
      } else if (playerWrapperRef.current?.webkitRequestFullscreen) {
        playerWrapperRef.current.webkitRequestFullscreen();
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }
  };

  // Fetch TV seasons count
  useEffect(() => {
    if (isSeries && item?.id && !isCustom) {
      fetchTvDetails(item.id).then((details) => {
        if (details && details.number_of_seasons) {
          setTotalSeasons(Math.max(1, details.number_of_seasons));
        }
      });
    }
  }, [item?.id, isSeries, isCustom]);

  // Load episodes if TV series
  useEffect(() => {
    if (isSeries && item?.id && !isCustom) {
      setIsLoadingEpisodes(true);
      fetchSeasonEpisodes(item.id, season).then((eps) => {
        setEpisodesList(eps);
        setIsLoadingEpisodes(false);
      });
    }
  }, [item?.id, season, isSeries, isCustom]);

  // Selected server strictly controls playback. User clicks directly switch servers.
  const currentServer = selectedServer || availableServers[0];

  const todayStr = new Date().toISOString().split('T')[0];
  const itemReleaseDate = item?.release_date || item?.first_air_date || '';
  const isFutureRelease = Boolean(
    !isCustom &&
    itemReleaseDate &&
    itemReleaseDate > todayStr &&
    (!item?.vote_count || item.vote_count < 100)
  );

  const streamUrl = getStreamUrl(currentServer, item?.id, isSeries ? 'tv' : 'movie', season, episode, audioMode, isAnime);
  const downloadUrl = getDownloadUrl(item?.id, isSeries ? 'tv' : 'movie', season, episode);

  // Active custom video URL for owned/studio content - strict 1:1 language mapping
  const activeCustomVideoUrl = isCustom ? (
    audioMode === 'hindi' ? (item.languages?.hi?.url || '') :
    audioMode === 'english' ? (item.languages?.en?.url || '') :
    audioMode === 'sub' ? (item.languages?.ja?.url || '') :
    (item.languages?.hi?.url || item.languages?.en?.url || item.languages?.ja?.url || item.video_url || '')
  ) : null;

  const openInNewWindow = () => {
    permitPopupOnce();
    const url = isCustom ? activeCustomVideoUrl : streamUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleNextServer = () => {
    const currentIndex = availableServers.findIndex((s) => s.id === (currentServer?.id || availableServers[0].id));
    const nextServer = availableServers[(currentIndex + 1) % availableServers.length];
    setSelectedServer(nextServer);
  };

  const changeAiBoost = (mode) => {
    setAiBoostMode(mode);
    try {
      localStorage.setItem('furina_ai_boost', mode);
    } catch (e) {}
    const labels = {
      off: 'AI Video Boost: Disabled (Raw Stream)',
      '4k': '💎 4K AI Clarity Boost Active (Enhanced Micro-Contrast)',
      hdr: '🌈 Cinema HDR Boost Active (Dolby Dynamic Vibrance)',
      night: '🌙 Dark Scene Boost Active (Low-Light & Shadow Enhanced)'
    };
    setAiBoostToast(labels[mode] || 'AI Boost Active');
    setTimeout(() => setAiBoostToast(null), 2500);
  };

  // Open Dedicated Download Center (Resolutions + Mobile Stream Link + Fast CDN Mirrors)
  const handleDownload = () => {
    setIsDownloadModalOpen(true);
  };

  const triggerDirectDownloadLink = (url, filename) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setDownloadState({ status: 'completed', progress: 100, errorMsg: '' });
      setTimeout(() => {
        setDownloadState({ status: 'idle', progress: 0, errorMsg: '' });
      }, 4000);
    } catch (e) {
      setDownloadState({ status: 'error', progress: 0, errorMsg: 'Download failed to start' });
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-0 sm:p-3 md:p-4 overflow-hidden select-none"
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
        {/* 1. CINEMATIC FULLSCREEN OVERLAY HUD                                       */}
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
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
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
                  <span className="text-emerald-400 font-bold">
                    {isCustom ? 'Studio Master' : selectedServer.badge}
                  </span>
                  <span>•</span>
                  {audioMode === 'english' && <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-bold">🎙️ English Dub</span>}
                  {audioMode === 'hindi' && <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold">🇮🇳 Hindi Audio</span>}
                  {audioMode === 'sub' && <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">🇯🇵 Japanese Sub</span>}
                </div>
              </div>
            </div>

            {/* Controls in Fullscreen */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Fullscreen AI Boost Mode Selector */}
              <div className="hidden md:flex items-center gap-1 bg-black/60 px-2 py-1 rounded-xl border border-cyan-500/30">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse mr-0.5" />
                {[
                  { id: 'off', label: 'Off' },
                  { id: '4k', label: '💎 4K' },
                  { id: 'hdr', label: '🌈 HDR' },
                  { id: 'night', label: '🌙 Night' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => changeAiBoost(mode.id)}
                    title={`AI Boost: ${mode.label}`}
                    className={`px-2 py-0.5 rounded text-[11px] font-extrabold transition cursor-pointer ${
                      aiBoostMode === mode.id
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Fullscreen Download Button */}
              <button
                onClick={handleDownload}
                title="Download in HD / 4K / Mobile"
                className="px-2.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Download</span>
              </button>

              {isSeries && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={episode <= 1}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Previous Episode"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Prev</span>
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 transition flex items-center gap-1 text-xs font-bold cursor-pointer"
                    title="Next Episode"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              <button
                onClick={handleReload}
                title="Reload Stream"
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
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
                  {isCustom && (
                    <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/40 shrink-0">
                      Studio Original
                    </span>
                  )}
                </h2>
                <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-cyan-200/70">
                  <span className="text-emerald-400 font-bold">
                    {isCustom ? 'Verified Studio Source' : selectedServer.badge}
                  </span>
                  <span>•</span>
                  <span className="text-cyan-400/80 font-mono hidden xs:inline">
                    {isCustom ? 'Direct Master Video' : selectedServer.shortName}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {isSeries && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={handlePrevEpisode}
                    disabled={episode <= 1}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Previous Episode"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Prev Ep</span>
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white transition text-xs font-bold flex items-center gap-0.5 cursor-pointer"
                    title="Next Episode"
                  >
                    <span className="hidden md:inline">Next Ep</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Fullscreen Mode Button */}
              <button
                onClick={toggleFullscreen}
                title="Cinema Fullscreen (F)"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 text-xs font-extrabold transition shadow-[0_0_15px_rgba(56,189,248,0.45)] transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cinema Mode</span>
              </button>

              {/* Progress-Aware Download Manager */}
              <button
                onClick={handleDownload}
                disabled={downloadState.status === 'downloading' || downloadState.status === 'preparing'}
                title="Download movie or episode in HD / 4K"
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer ${
                  downloadState.status === 'completed'
                    ? 'bg-emerald-500 text-gray-950 border border-emerald-400 font-extrabold shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                    : downloadState.status === 'downloading' || downloadState.status === 'preparing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 hover:text-white'
                }`}
              >
                {downloadState.status === 'preparing' && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
                {downloadState.status === 'downloading' && <Download className="w-3.5 h-3.5 animate-bounce text-amber-400" />}
                {downloadState.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-gray-950" />}
                {downloadState.status === 'idle' && <Download className="w-3.5 h-3.5" />}

                <span>
                  {downloadState.status === 'preparing' && `Preparing ${downloadState.progress}%`}
                  {downloadState.status === 'downloading' && `Downloading ${downloadState.progress}%`}
                  {downloadState.status === 'completed' && 'Downloaded ✓'}
                  {downloadState.status === 'idle' && <span>Download</span>}
                  {downloadState.status === 'error' && 'Retry'}
                </span>
              </button>

              {!isCustom && (
                <button
                  onClick={handleNextServer}
                  title="Auto-switch to next working mirror if stream buffers"
                  className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span>Auto-Switch</span>
                </button>
              )}

              {/* Keyboard Shortcuts modal button */}
              <button
                onClick={() => setIsShortcutsHelpOpen((prev) => !prev)}
                title="Keyboard Shortcuts (?)"
                className="hidden sm:flex items-center gap-1 p-2 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Keyboard className="w-3.5 h-3.5" />
              </button>

              {/* Reload stream button */}
              <button
                onClick={handleReload}
                title="Reload video player"
                className="p-2 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              {/* Open stream in clean external window */}
              <button
                onClick={openInNewWindow}
                title="Open full stream in new clean tab"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm cursor-pointer"
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
        {/* 3. DEDICATED AUDIO TRACK SELECTOR BAR                                     */}
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
                {hasWorkingEnglishSource && (
                  <button
                    data-testid="audio-btn-english"
                    onClick={() => {
                      setAudioMode('english');
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
                )}

                {/* Japanese Sub Option */}
                {hasWorkingJapaneseSource && (
                  <button
                    data-testid="audio-btn-sub"
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

                {/* Hindi Option: Always visible with strict verified or unavailable policy feedback */}
                <button
                  data-testid="audio-btn-hindi"
                  onClick={() => {
                    setAudioMode('hindi');
                    if (hasWorkingHindiSource && !isCustom) {
                      const hindiServer = isBollywoodHindi
                        ? (availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0])
                        : (availableServers.find((s) => s.id === 'multiembed') || availableServers.find((s) => s.id === 'smashy') || availableServers.find((s) => s.id === 'one23embed') || availableServers.find((s) => s.id === 'vidlink') || availableServers[0]);
                      setSelectedServer(hindiServer);
                    }
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
              </div>
            </div>

            {/* Audio Mode Active Guidance Badge */}
            <div className="text-[11px] text-cyan-200/70">
              {audioMode === 'english' && (
                <span className="text-cyan-300 font-medium">
                  ✓ <strong>English Dub Active</strong> ({isCustom ? 'Studio Master Track' : isAnime ? 'VidLink Pro verified English stream • Never Japanese' : 'Original English Audio • Dolby 5.1 / Ultra HD Stream'})
                </span>
              )}
              {audioMode === 'sub' && (
                <span className="text-purple-300 font-medium">
                  ✓ <strong>Japanese Subbed Active</strong> ({isCustom ? 'Studio Master Track' : 'Original Japanese Audio • Tap 💬 CC for subtitles'})
                </span>
              )}
              {audioMode === 'hindi' && hasWorkingHindiSource && (
                <span className="text-amber-300 font-medium">
                  ✓ <strong>Hindi Audio Active</strong> ({isCustom ? 'Studio Master Track' : isBollywoodHindi ? 'Original Hindi Audio Track' : 'Verified Hindi Stream'})
                </span>
              )}
              {audioMode === 'hindi' && !hasWorkingHindiSource && (
                <span className="text-rose-400 font-bold">
                  ⚠️ <strong>{isAnime ? 'Hindi audio unavailable for this anime title.' : isSeries ? 'Hindi audio unavailable for this episode.' : 'Hindi audio unavailable for this title.'}</strong> (Select English Dub or Japanese Sub below)
                </span>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. SCROLLABLE INNER BODY - Video, Rescue Bar, Audio Info & Episodes        */}
        {/* ========================================================================= */}
        <div className={`flex-1 ${isFullscreen ? 'w-full h-full flex flex-col items-center justify-center bg-black overflow-hidden p-0 m-0' : 'overflow-y-auto overscroll-contain'}`}>
          
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
                      onClick={() => changeAiBoost(mode.id)}
                      title={mode.desc}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition cursor-pointer ${
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
                className="text-[11px] text-cyan-300 hover:text-white font-bold flex items-center gap-1 bg-cyan-500/15 border border-cyan-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer"
              >
                <Maximize2 className="w-3 h-3" />
                <span>Switch to Fullscreen (F)</span>
              </button>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 5. VIDEO PLAYER AREA (CUSTOM VIDEO OR STRICT IFRAME STREAM)               */}
          {/* ========================================================================= */}
          <div 
            className={`relative w-full bg-black flex items-center justify-center overflow-hidden ${
              isFullscreen ? 'w-full h-full flex-1 max-w-full max-h-full' : 'aspect-video'
            }`}
            style={AI_BOOST_STYLES[aiBoostMode] || {}}
          >
            {/* CASE 0: Future Unreleased Theatrical Release -> CLEAN THEATRICAL CARD */}
            {isFutureRelease ? (
              <div className="w-full h-full min-h-[340px] bg-gradient-to-b from-[#070e24] via-[#050b1d] to-[#040817] flex flex-col items-center justify-center p-6 text-center border-y border-cyan-500/20">
                <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center text-3xl mb-3 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  🎬
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap justify-center">
                  <span className="text-xs font-black px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wider">
                    Upcoming Theatrical Release
                  </span>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    Release Date: {itemReleaseDate}
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-white mb-2 max-w-xl">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 max-w-lg mb-6 leading-relaxed">
                  This title is currently scheduled for upcoming theatrical distribution. Full HD/4K streaming mirrors will automatically activate upon official digital release.
                </p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={() => {
                      const q = encodeURIComponent(`${title} official trailer`);
                      window.open(`https://www.youtube.com/results?search_query=${q}`, '_blank', 'noopener,noreferrer');
                    }}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs transition shadow-[0_0_20px_rgba(225,29,72,0.5)] transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <span>▶</span>
                    <span>Watch Trailer on YouTube ↗</span>
                  </button>
                  <button
                    onClick={handleSafeClose}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 font-bold text-xs transition cursor-pointer"
                  >
                    Browse Other Movies
                  </button>
                </div>
              </div>
            ) : audioMode === 'hindi' && !hasWorkingHindiSource ? (
              <div className="w-full h-full min-h-[320px] bg-[#050b1d] flex flex-col items-center justify-center p-6 text-center border-y border-amber-500/20">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-3xl mb-3 text-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
                  🇮🇳
                </div>
                <h3 className="text-base sm:text-lg font-black text-white mb-2 flex items-center gap-2">
                  <span>{isAnime ? 'Hindi audio unavailable for this anime title.' : isSeries ? 'Hindi audio unavailable for this episode.' : 'Hindi audio unavailable for this movie.'}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    Strict Audio Policy
                  </span>
                </h3>
                <p className="text-xs text-slate-300 max-w-md mb-5 leading-relaxed">
                  An authorized Hindi dubbed stream is not available from the configured streaming providers for <strong>{title}</strong>. We never silently substitute Japanese or English audio when you selected Hindi.
                </p>
                <div className="flex items-center gap-2.5 flex-wrap justify-center">
                  {hasWorkingEnglishSource && (
                    <button
                      onClick={() => {
                        setAudioMode('english');
                        if (!isCustom) {
                          const engServer = availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
                          setSelectedServer(engServer);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-[0_0_15px_rgba(56,189,248,0.4)] transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🎙️</span>
                      <span>Watch in English {isCustom ? 'Audio (Studio Master)' : 'Dub (VidLink Pro)'}</span>
                    </button>
                  )}
                  {(isAnime || hasWorkingJapaneseSource) && (
                    <button
                      onClick={() => {
                        setAudioMode('sub');
                        if (!isCustom) {
                          const subServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
                          setSelectedServer(subServer);
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-purple-600/25 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 font-bold text-xs transition hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <span>🇯🇵</span>
                      <span>Watch in Japanese {isCustom ? 'Audio (Studio Master)' : 'Sub'}</span>
                    </button>
                  )}
                </div>
              </div>
            ) : isCustom ? (
              /* CASE B: OWNED / STUDIO CREATED MOVIE (HTML5 Custom Video Player) */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {activeCustomVideoUrl ? (
                  <div className="relative w-full h-full group/player flex items-center justify-center">
                    <video
                      ref={videoRef}
                      key={item.id}
                      src={activeCustomVideoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain"
                      style={AI_BOOST_STYLES[aiBoostMode] || {}}
                    >
                      {(item.subtitles && item.subtitles.length > 0 ? item.subtitles : [
                        { lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' },
                        { lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' }
                      ]).map((sub, i) => (
                        <track 
                          key={i} 
                          kind="subtitles" 
                          src={sub.src && sub.src.trim().length > 0 ? sub.src : (sub.lang === 'hi' ? 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' : 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions')} 
                          srcLang={sub.lang || 'en'} 
                          label={sub.label || (sub.lang === 'hi' ? 'Hindi CC' : 'English CC')} 
                          default={i === 0} 
                        />
                      ))}
                      Your browser does not support HTML5 video.
                    </video>
                    {typeof document !== 'undefined' && document.pictureInPictureEnabled && (
                      <button
                        onClick={togglePictureInPicture}
                        title="Picture-in-Picture (P)"
                        className="absolute top-3 right-3 p-2 rounded-xl bg-black/70 hover:bg-black/90 border border-cyan-500/30 text-cyan-300 hover:text-white transition opacity-0 group-hover/player:opacity-100 backdrop-blur-md cursor-pointer z-20 flex items-center gap-1.5 text-xs font-bold"
                      >
                        <PictureInPicture className="w-4 h-4" />
                        <span className="hidden sm:inline">PiP</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-rose-300">
                    No video media asset available for the selected {audioMode} language track.
                  </div>
                )}
              </div>
            ) : (
              /* CASE C: VERIFIED EMBED STREAM (VidLink Pro / MultiEmbed / VidSrc 4K) */
              <>
                {/* Floating AI Boost Toast Notification */}
                {aiBoostToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-cyan-950/95 border border-cyan-400/80 text-cyan-200 text-xs font-black shadow-[0_0_25px_rgba(6,182,212,0.8)] backdrop-blur-md flex items-center gap-2 pointer-events-none animate-bounce">
                    <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" />
                    <span>{aiBoostToast}</span>
                  </div>
                )}

                {iframeLoading && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-[#050b1d]/90 backdrop-blur-sm pointer-events-none">
                    <div className="w-10 h-10 border-3 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin mb-3" />
                    <span className="text-xs font-bold text-cyan-300 tracking-wide">
                      Connecting to {selectedServer.shortName}...
                    </span>
                  </div>
                )}
                <iframe
                  key={`${currentServer.id}-${season}-${episode}-${audioMode}-${reloadKey}`}
                  src={streamUrl}
                  title={title}
                  onLoad={() => setIframeLoading(false)}
                  style={AI_BOOST_STYLES[aiBoostMode] || {}}
                  className={`border-0 ${
                    isFullscreen 
                      ? 'w-full h-full aspect-video max-w-[calc(100vh*16/9)] max-h-[calc(100vw*9/16)] shadow-2xl' 
                      : 'w-full h-full'
                  }`}
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                />
              </>
            )}
          </div>

          {/* ========================================================================= */}
          {/* 6. STREAM RESCUE BAR                                                      */}
          {/* ========================================================================= */}
          {!isFullscreen && !isCustom && (
            <div className="p-3 bg-[#08122c] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-300/80">Available Server Mirrors:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {availableServers.map((srv) => {
                    const isSelected = currentServer.id === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setSelectedServer(srv)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                          isSelected
                            ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                            : 'bg-[#060c20] text-cyan-200/70 border-cyan-500/25 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <span>{srv.shortName}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-cyan-200/80 flex-wrap">
                <span className="flex items-center gap-1 bg-cyan-950/60 border border-cyan-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold text-cyan-300">
                  <Subtitles className="w-3 h-3 text-cyan-400" />
                  <span>Subtitles (CC): Toggle English/Hindi subtitles inside player</span>
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  Stream buffering? Tap <strong>Auto-Switch</strong> or select another mirror.
                </span>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 7. TV SEASONS & EPISODES SELECTOR (IF SERIES)                             */}
          {/* ========================================================================= */}
          {!isFullscreen && isSeries && (
            <div className="p-4 border-b border-cyan-500/20 bg-[#060e24]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs sm:text-sm font-extrabold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>Episodes & Seasons</span>
                </h3>
                {totalSeasons > 1 && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-cyan-200/70">Season:</span>
                    <select
                      value={season}
                      onChange={(e) => {
                        setSeason(Number(e.target.value));
                        setEpisode(1);
                      }}
                      className="bg-[#0b1633] border border-cyan-500/30 text-cyan-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400"
                    >
                      {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
                        <option key={sNum} value={sNum}>Season {sNum}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {isLoadingEpisodes ? (
                <div className="flex items-center justify-center p-6 text-cyan-300 text-xs gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Loading Season {season} episodes...</span>
                </div>
              ) : episodesList && episodesList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                  {episodesList.map((ep) => {
                    const isCurrentEp = episode === ep.episode_number;
                    return (
                      <button
                        key={ep.id || ep.episode_number}
                        onClick={() => setEpisode(ep.episode_number)}
                        className={`p-2 rounded-xl text-left transition border cursor-pointer ${
                          isCurrentEp
                            ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)] font-black'
                            : 'bg-[#08122c] border-cyan-500/20 text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="text-[11px] font-bold truncate">
                          Ep {ep.episode_number}: {ep.name || `Episode ${ep.episode_number}`}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((epNum) => (
                    <button
                      key={epNum}
                      onClick={() => setEpisode(epNum)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition border cursor-pointer ${
                        episode === epNum
                          ? 'bg-cyan-500 text-gray-950 border-cyan-400 font-black shadow'
                          : 'bg-[#08122c] border-cyan-500/20 text-slate-300 hover:bg-white/5'
                      }`}
                    >
                      Ep {epNum}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* 8. OVERVIEW & METADATA SECTION                                            */}
          {/* ========================================================================= */}
          {!isFullscreen && (
            <div className="p-4 sm:p-5 bg-[#050b1e]">
              <div className="flex gap-4">
                <img
                  src={item.poster_path ? (item.poster_path.startsWith('http') ? item.poster_path : `https://image.tmdb.org/t/p/w500${item.poster_path}`) : './icon-512.png'}
                  alt={title}
                  className="w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl border border-cyan-500/30 shrink-0 shadow-md"
                  onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base sm:text-lg font-black text-white">{title}</h3>
                  <div className="flex items-center gap-2 text-xs text-cyan-300/80 mt-1 flex-wrap">
                    <span>★ {item.vote_average ? Number(item.vote_average).toFixed(1) : '8.5'}</span>
                    <span>•</span>
                    <span>{item.release_date || item.first_air_date || '2024'}</span>
                    <span>•</span>
                    <span className="capitalize">{item.media_type || 'Movie'}</span>
                    {isAnime && <span className="bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-bold">Anime</span>}
                  </div>
                  {(() => {
                    const genres = getGenreNames(item);
                    if (!genres || genres.length === 0) return null;
                    return (
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <span className="text-[11px] text-cyan-200/60 font-semibold">Genres:</span>
                        {genres.map((g, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/25 text-cyan-300 text-[10px] font-bold"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {item.overview || 'No synopsis available.'}
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      {isShortcutsHelpOpen && (
        <div 
          className="fixed inset-0 z-[100000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsShortcutsHelpOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-[#08122c] border border-cyan-500/40 rounded-2xl p-5 shadow-[0_0_50px_rgba(6,182,212,0.4)] text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Keyboard className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black tracking-wide text-cyan-100">Keyboard Shortcuts</h3>
              </div>
              <button 
                onClick={() => setIsShortcutsHelpOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              {[
                { key: 'Space or K', desc: 'Play / Pause video' },
                { key: 'J / L', desc: 'Rewind / Fast-forward 10s' },
                { key: '← / →', desc: 'Seek backward / forward 5s' },
                { key: '↑ / ↓', desc: 'Increase / Decrease volume' },
                { key: 'M', desc: 'Mute / Unmute audio' },
                { key: 'F', desc: 'Toggle Cinema Fullscreen' },
                { key: 'P', desc: 'Picture-in-Picture mode (PiP)' },
                { key: 'Esc', desc: 'Exit Fullscreen / Close Player' },
                { key: '?', desc: 'Toggle this shortcut guide' },
              ].map((sc, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-300 font-medium">{sc.desc}</span>
                  <kbd className="px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 font-mono font-bold text-[11px] shadow-sm">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsShortcutsHelpOpen(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-md cursor-pointer"
            >
              Got it (Esc)
            </button>
          </div>
        </div>
      )}

      {/* Dedicated Download Center Modal (Resolutions, Fast Mirrors, Mobile 1-Tap) */}
      <DownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        item={item}
        season={season}
        episode={episode}
        audioMode={audioMode}
        isSeries={isSeries}
        activeCustomVideoUrl={activeCustomVideoUrl}
      />
    </div>
  );
}
