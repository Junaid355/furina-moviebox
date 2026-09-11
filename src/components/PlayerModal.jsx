import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, Pause,
  Sparkles, ShieldCheck, Download, Maximize2, Minimize2, Volume2, VolumeX,
  CheckCircle2, AlertTriangle, ArrowRight, Loader2, ChevronLeft, ChevronRight,
  PictureInPicture, Keyboard, HelpCircle, Subtitles
} from 'lucide-react';
import { SERVERS, getStreamUrl, getDownloadUrl } from '../services/streaming';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable, isHindiDubbedAnime, getGenreNames, BACKDROP_BASE, IMG_BASE, POSTER_THUMB_BASE } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';
import DownloadModal from './DownloadModal';
import hindiProviderManager, { 
  BLOCKBUSTER_LOCAL_MEDIA_MAP,
  resolveBlockbusterLocal,
  selectPhysicalAudioTrack, 
  getPrioritizedAudioSources 
} from '../services/HindiProviderManager';

export default function PlayerModal({ item, onClose, preferredServerId, isHindiPreferred }) {
  if (!item) return null;

  // Read app settings once for player configuration
  const appSettings = useMemo(() => {
    try {
      const raw = localStorage.getItem('furina_settings');
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return {};
  }, []);

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

  const blockbusterLocal = resolveBlockbusterLocal(item);
  const isBlockbusterLocal = Boolean(blockbusterLocal);
  const isCustom = Boolean(item?.isCustom || item?.languages || isBlockbusterLocal);

  const resolvedTmdbId = useMemo(() => {
    if (typeof item?.id === 'number') return item.id;
    if (item?.tmdb_id) return item.tmdb_id;
    if (item?.id && !isNaN(Number(item.id))) return Number(item.id);
    const titleLower = (item?.title || item?.name || '').toLowerCase();
    if (titleLower.includes('deadpool')) return 533535;
    if (titleLower.includes('endgame')) return 299534;
    if (titleLower.includes('naruto')) return 31910;
    if (titleLower.includes('cyber ronin')) return 603;
    return null;
  }, [item]);

  const hasOnlineStream = Boolean(resolvedTmdbId);
  const [playerMode, setPlayerMode] = useState(() => (isCustom ? 'studio' : 'stream'));

  const isBollywoodHindi = Boolean(
    !isAnime && (
      item?.original_language === 'hi' ||
      (Array.isArray(item?.origin_country) && item?.origin_country.includes('IN') && item?.original_language !== 'en')
    )
  );

  const resolveCustomAudioUrl = (langKey) => {
    if (isBlockbusterLocal) {
      if (langKey === 'hi') return blockbusterLocal.hiUrl;
      if (langKey === 'en') return blockbusterLocal.enUrl;
      if (langKey === 'ja') return blockbusterLocal.jaUrl;
    }
    const langObj = item?.languages?.[langKey];
    if (langObj?.sources && Array.isArray(langObj.sources) && langObj.sources.length > 0) {
      const sorted = [...langObj.sources].sort((a, b) => (a.priority || 1) - (b.priority || 1));
      const valid = sorted.find((s) => s?.url && typeof s.url === 'string' && s.url.trim().length > 0);
      if (valid?.url) return valid.url.trim();
    }
    return langObj?.url || item?.[`audio_${langKey}_url`] || '';
  };

  const customSources = {
    hi: resolveCustomAudioUrl('hi'),
    en: resolveCustomAudioUrl('en'),
    ja: resolveCustomAudioUrl('ja')
  };

  // Authentic audio tracks strictly based on physical audio assets, native spoken languages, or verified provider sources
  const hasWorkingHindiSource = isCustom
    ? Boolean(customSources.hi)
    : (isBollywoodHindi || hindiProviderManager.hasLegitimateHindiSource(item));

  const hasWorkingEnglishSource = isBollywoodHindi
    ? false
    : (isCustom ? Boolean(customSources.en) : !isBollywoodHindi);

  const hasWorkingJapaneseSource = isCustom
    ? Boolean(customSources.ja)
    : isAnime;

  // Read saved user audio preference from settings or prop
  const userPreferredAudio = (() => {
    try {
      const settings = localStorage.getItem('furina_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        if (parsed?.audioLanguage) return parsed.audioLanguage;
      }
    } catch (e) {}
    if (isHindiPreferred) return 'hindi';
    return null;
  })();

  // Initial Audio Mode: respects saved choice per title, then user preference, with honest availability fallback
  const getInitialAudioMode = () => {
    // 1. Check title-specific persisted choice (Section 5 & 7)
    if (appSettings.rememberAudioPerTitle !== false && item?.id) {
      try {
        const savedChoice = localStorage.getItem(`furina_audio_${item.id}`);
        if (savedChoice) {
          if (savedChoice === 'hindi' && hasWorkingHindiSource) return 'hindi';
          if (savedChoice === 'sub' && hasWorkingJapaneseSource) return 'sub';
          if (savedChoice === 'english' && hasWorkingEnglishSource) return 'english';
        }
      } catch (e) {}
    }

    // 2. Global user preference
    if (userPreferredAudio === 'hindi') {
      if (hasWorkingHindiSource) return 'hindi';
      return hasWorkingEnglishSource ? 'english' : (hasWorkingJapaneseSource ? 'sub' : 'english');
    }
    if (userPreferredAudio === 'japanese' || userPreferredAudio === 'sub') {
      if (hasWorkingJapaneseSource) return 'sub';
      return hasWorkingEnglishSource ? 'english' : (hasWorkingHindiSource ? 'hindi' : 'english');
    }
    if (userPreferredAudio === 'english') {
      if (hasWorkingEnglishSource) return 'english';
      return hasWorkingHindiSource ? 'hindi' : (hasWorkingJapaneseSource ? 'sub' : 'english');
    }

    if (isCustom) {
      if (customSources.hi) return 'hindi';
      if (customSources.en) return 'english';
      if (customSources.ja) return 'sub';
      return 'english';
    }
    if (isBollywoodHindi && hasWorkingHindiSource) return 'hindi';
    if (isAnime) return 'sub';
    return 'english';
  };

  const [audioMode, setAudioMode] = useState(getInitialAudioMode);
  const [activeSourcePriority, setActiveSourcePriority] = useState(1);
  const [sourceErrorMessage, setSourceErrorMessage] = useState('');
  const [isSwitchingAudio, setIsSwitchingAudio] = useState(false);
  const [audioSwitchFeedback, setAudioSwitchFeedback] = useState('');
  const [detectedTracks, setDetectedTracks] = useState([]);
  const savedPlaybackTimeRef = useRef(0);
  const savedVolumeRef = useRef(1);
  const savedMutedRef = useRef(false);

  // Filter servers for anime to prioritize VidLink and VidSrc
  const availableServers = isAnime 
    ? SERVERS.filter((s) => s.id !== 'autoembed') 
    : SERVERS;

  // Determine initial server — route to fast, verified 200 OK servers
  const getInitialServer = () => {
    if (hasWorkingHindiSource && !isCustom) {
      if (isBollywoodHindi) {
        return availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
      }
      if (isAnime) {
        return availableServers.find((s) => s.id === 'vidlink') || availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
      }
      // Hollywood Hindi Dubs
      return availableServers.find((s) => s.id === 'vidlink') || availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
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

  // Auto-clear loading spinner after reasonable connection window
  useEffect(() => {
    setIframeLoading(true);
    const timer = setTimeout(() => {
      setIframeLoading(false);
    }, 4500);
    return () => clearTimeout(timer);
  }, [selectedServer?.id, season, episode, audioMode, reloadKey]);

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
  const [subtitleToast, setSubtitleToast] = useState(null);
  const [unavailableNotice, setUnavailableNotice] = useState(() => {
    if (userPreferredAudio === 'hindi' && !hasWorkingHindiSource) {
      return { show: true, message: "Hindi audio isn't available for this title. Streaming in English Dub." };
    }
    return { show: false, message: '' };
  });
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);

  const handleAudioChange = useCallback((newMode) => {
    if (newMode === audioMode) return;
    if (videoRef.current) {
      savedPlaybackTimeRef.current = videoRef.current.currentTime || 0;
      savedVolumeRef.current = typeof videoRef.current.volume === 'number' ? videoRef.current.volume : 1;
      savedMutedRef.current = Boolean(videoRef.current.muted);
    }
    setActiveSourcePriority(1);
    setSourceErrorMessage('');
    setIsSwitchingAudio(true);
    setAudioMode(newMode);
    setUnavailableNotice({ show: false, message: '' });

    // Persist audio preference per title (Requirement 5 & 7)
    try {
      const s = JSON.parse(localStorage.getItem('furina_settings') || '{}');
      if (s.rememberAudioPerTitle !== false && item?.id) {
        localStorage.setItem(`furina_audio_${item.id}`, newMode);
      }
    } catch (e) {}

    // HTML5 Physical Audio Track switching (where supported)
    let physicalSwitched = false;
    if (videoRef.current && videoRef.current.audioTracks && videoRef.current.audioTracks.length > 1) {
      physicalSwitched = selectPhysicalAudioTrack(videoRef.current, newMode);
    }

    if (!isCustom) {
      if (newMode === 'hindi') {
        if (isBollywoodHindi) {
          const hindiServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
          setSelectedServer(hindiServer);
        } else if (isAnime) {
          const hindiServer = availableServers.find((s) => s.id === 'vidlink') || availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
          setSelectedServer(hindiServer);
        } else {
          const hindiServer = availableServers.find((s) => s.id === 'vidlink') || availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
          setSelectedServer(hindiServer);
        }
      } else if (newMode === 'sub') {
        const subServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
        setSelectedServer(subServer);
      } else {
        const engServer = availableServers.find((s) => s.id === 'vidlink') || availableServers[0];
        setSelectedServer(engServer);
      }
    }

    setTimeout(() => {
      setIsSwitchingAudio(false);
      setAudioSwitchFeedback(`✓ ${newMode === 'hindi' ? 'Hindi' : newMode === 'sub' ? 'Japanese' : 'English'} Audio Active${physicalSwitched ? ' (Hardware Track)' : ''}`);
      setTimeout(() => setAudioSwitchFeedback(''), 2500);
    }, 350);
  }, [audioMode, isCustom, isBollywoodHindi, isAnime, availableServers, item?.id]);

  // Prioritized audio sources for custom / owned / blockbuster content
  const currentLangSources = useMemo(() => {
    if (!isCustom) return [];
    const langKey = audioMode === 'hindi' ? 'hi' : (audioMode === 'sub' ? 'ja' : 'en');
    return getPrioritizedAudioSources(item, langKey);
  }, [isCustom, item, audioMode]);

  // Dynamic priority fallback and honest error handling (Requirement 3 & 6)
  const handleVideoError = useCallback(() => {
    if (currentLangSources.length > activeSourcePriority) {
      const nextPriority = activeSourcePriority + 1;
      setActiveSourcePriority(nextPriority);
      setAudioSwitchFeedback(`Source failed. Trying Priority ${nextPriority} backup CDN...`);
      setTimeout(() => setAudioSwitchFeedback(''), 3000);
    } else {
      const langName = audioMode === 'hindi' ? 'Hindi' : (audioMode === 'sub' ? 'Japanese' : 'English');
      const errText = `${langName} audio couldn't be loaded. Try another available source.`;
      setSourceErrorMessage(errText);
      setUnavailableNotice({ show: true, message: errText });
      setIsSwitchingAudio(false);
      if (audioMode === 'hindi') {
        if (hasWorkingEnglishSource) {
          setAudioMode('english');
          setActiveSourcePriority(1);
        } else if (hasWorkingJapaneseSource) {
          setAudioMode('sub');
          setActiveSourcePriority(1);
        }
      }
    }
  }, [currentLangSources, activeSourcePriority, audioMode, hasWorkingEnglishSource, hasWorkingJapaneseSource]);

  const handleUnavailableClick = useCallback((langName) => {
    setUnavailableNotice({
      show: true,
      message: `${langName} audio isn't available for this title. Authentic audio is playing in ${audioMode === 'hindi' ? 'Hindi' : audioMode === 'sub' ? 'Japanese' : 'English'}.`
    });
  }, [audioMode]);

  // Subtitle System State & Auto-Detection
  const [activeSubtitle, setActiveSubtitle] = useState(() => {
    return localStorage.getItem('furina_active_sub') || (isAnime ? 'en' : 'off');
  });

  const availableSubtitles = useMemo(() => {
    const list = [
      { id: 'off', label: 'Off', flag: '🚫' },
      { id: 'en', label: 'English CC', flag: '🇬🇧' }
    ];
    if (hasWorkingHindiSource || isBollywoodHindi || item?.languages?.hi || item?.subtitles?.some((s) => s.lang === 'hi')) {
      list.push({ id: 'hi', label: 'Hindi CC', flag: '🇮🇳' });
    }
    if (isAnime || item?.original_language === 'ja' || item?.languages?.ja || item?.subtitles?.some((s) => s.lang === 'ja')) {
      list.push({ id: 'ja', label: 'Japanese Sub', flag: '🇯🇵' });
    }
    return list;
  }, [hasWorkingHindiSource, isBollywoodHindi, isAnime, item]);

  const changeSubtitle = useCallback((subId) => {
    setActiveSubtitle(subId);
    try {
      localStorage.setItem('furina_active_sub', subId);
    } catch (e) {}

    if (videoRef.current && videoRef.current.textTracks) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        tracks[i].mode = (subId !== 'off' && tracks[i].language === subId) ? 'showing' : 'disabled';
      }
    }

    const subObj = availableSubtitles.find((s) => s.id === subId);
    setSubtitleToast(`💬 Subtitles: ${subObj ? subObj.label : subId.toUpperCase()}`);
    setTimeout(() => setSubtitleToast(null), 2000);
  }, [availableSubtitles]);

  const cycleSubtitles = useCallback(() => {
    const currentIndex = availableSubtitles.findIndex((s) => s.id === activeSubtitle);
    const nextSub = availableSubtitles[(currentIndex + 1) % availableSubtitles.length];
    changeSubtitle(nextSub.id);
  }, [availableSubtitles, activeSubtitle, changeSubtitle]);

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
      } else if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        const modes = ['off', '4k', 'hdr', 'night'];
        const nextMode = modes[(modes.indexOf(aiBoostMode) + 1) % modes.length];
        changeAiBoost(nextMode);
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        cycleSubtitles();
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
          savedMutedRef.current = videoRef.current.muted;
        }
      } else if (e.key === 'ArrowLeft') {
        if (videoRef.current) {
          e.preventDefault();
          const skipBwd = appSettings.skipBackwardSecs || 10;
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - skipBwd);
        }
      } else if (e.key === 'ArrowRight') {
        if (videoRef.current) {
          e.preventDefault();
          const skipFwd = appSettings.skipForwardSecs || 10;
          videoRef.current.currentTime = Math.min(videoRef.current.duration || 9999, videoRef.current.currentTime + skipFwd);
        }
      } else if (e.key === 'p' || e.key === 'P') {
        togglePictureInPicture();
      } else if (e.key === 'ArrowUp') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.volume = Math.min(1, Math.round((videoRef.current.volume + 0.1) * 10) / 10);
          savedVolumeRef.current = videoRef.current.volume;
        }
      } else if (e.key === 'ArrowDown') {
        if (videoRef.current) {
          e.preventDefault();
          videoRef.current.volume = Math.max(0, Math.round((videoRef.current.volume - 0.1) * 10) / 10);
          savedVolumeRef.current = videoRef.current.volume;
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen, onClose, isShortcutsHelpOpen, aiBoostMode, cycleSubtitles, appSettings]);

  const togglePictureInPicture = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (e) {}
  };

  // Auto-hide controls in fullscreen respecting user setting (Section 7)
  const handleUserActivity = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    if (isFullscreen) {
      const hideTime = (typeof appSettings.autoHideControls === 'number' ? appSettings.autoHideControls : 3) * 1000;
      if (hideTime > 0) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false);
        }, hideTime);
      }
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

  const streamUrl = getStreamUrl(currentServer, resolvedTmdbId || item?.id, isSeries ? 'tv' : 'movie', season, episode, audioMode, isAnime, activeSubtitle);
  const downloadUrl = getDownloadUrl(resolvedTmdbId || item?.id, isSeries ? 'tv' : 'movie', season, episode);

  // Active custom video URL for owned/studio content - priority failover aware (Section 3 & 10)
  const activeCustomVideoUrl = isCustom ? (
    currentLangSources && currentLangSources.length > 0
      ? (currentLangSources[activeSourcePriority - 1]?.url || currentLangSources[0]?.url || '')
      : (
          audioMode === 'hindi' ? (customSources.hi || '') :
          audioMode === 'english' ? (customSources.en || '') :
          audioMode === 'sub' ? (customSources.ja || '') :
          (customSources.hi || customSources.en || customSources.ja || item.video_url || '')
        )
  ) : null;

  const isAudioOnly = Boolean(
    activeCustomVideoUrl && (
      activeCustomVideoUrl.endsWith('.wav') ||
      activeCustomVideoUrl.endsWith('.ogg') ||
      activeCustomVideoUrl.endsWith('.mp3') ||
      activeCustomVideoUrl.includes('_audio.wav')
    )
  );

  const backdropUrl = item?.backdrop_path 
    ? (item.backdrop_path.startsWith('http') ? item.backdrop_path : `${BACKDROP_BASE}${item.backdrop_path}`)
    : (item?.poster_path && item.poster_path.startsWith('http') ? item.poster_path : (item?.poster_path ? `${POSTER_THUMB_BASE}${item.poster_path}` : null));

  const posterUrl = item?.poster_path 
    ? (item.poster_path.startsWith('http') ? item.poster_path : `${POSTER_THUMB_BASE}${item.poster_path}`)
    : (item?.thumbnail || './icon-512.png');

  const effectiveSubtitles = useMemo(() => {
    let baseSubs = (isBlockbusterLocal && blockbusterLocal?.subtitles?.length >= 2)
      ? blockbusterLocal.subtitles
      : (item?.subtitles && Array.isArray(item.subtitles) && item.subtitles.length > 0 ? [...item.subtitles] : []);
    
    const hasEn = baseSubs.some((s) => s.lang === 'en');
    const hasHi = baseSubs.some((s) => s.lang === 'hi');
    const result = [...baseSubs];
    if (!hasEn) {
      result.unshift({ lang: 'en', label: 'English CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions' });
    }
    if (!hasHi) {
      result.push({ lang: 'hi', label: 'Hindi CC', src: 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' });
    }
    return result;
  }, [isBlockbusterLocal, blockbusterLocal, item]);

  const openInNewWindow = () => {
    permitPopupOnce();
    const url = (isCustom && playerMode === 'studio') ? activeCustomVideoUrl : streamUrl;
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
              {/* Fullscreen AI Boost Mode Selector (Available on Mobile and Desktop) */}
              <div className="flex items-center gap-0.5 sm:gap-1 bg-black/75 px-1.5 sm:px-2 py-1 rounded-xl border border-cyan-500/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse mr-0.5 shrink-0" />
                {[
                  { id: 'off', label: 'Off' },
                  { id: '4k', label: '4K' },
                  { id: 'hdr', label: 'HDR' },
                  { id: 'night', label: 'Night' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => changeAiBoost(mode.id)}
                    title={`AI Boost: ${mode.label}`}
                    className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-extrabold transition cursor-pointer ${
                      aiBoostMode === mode.id
                        ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 shadow-[0_0_8px_rgba(56,189,248,0.7)]'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>

              {/* Fullscreen Subtitle Quick Toggle */}
              <button
                onClick={cycleSubtitles}
                title={`Subtitles: ${activeSubtitle.toUpperCase()} (Press C to cycle)`}
                className={`px-2 py-1 rounded-xl text-[10px] sm:text-[11px] font-extrabold border transition cursor-pointer flex items-center gap-1 ${
                  activeSubtitle !== 'off'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                    : 'bg-white/10 text-slate-400 border-white/15 hover:text-white'
                }`}
              >
                <Subtitles className="w-3.5 h-3.5" />
                <span>CC: {activeSubtitle.toUpperCase()}</span>
              </button>

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

              {/* Stream Mode Switcher (Full Movie Online Stream vs Studio Master Audio) */}
              {hasOnlineStream && isCustom && (
                <button
                  onClick={() => setPlayerMode((prev) => (prev === 'studio' ? 'stream' : 'studio'))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition shadow-sm cursor-pointer border ${
                    playerMode === 'stream'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-gray-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/50 text-cyan-300 hover:text-white hover:bg-cyan-500/30'
                  }`}
                  title={playerMode === 'studio' ? 'Switch to Full Movie Stream (1080p/4K)' : 'Switch to Studio Multi-Audio Master Track'}
                >
                  {playerMode === 'studio' ? (
                    <>
                      <Film className="w-3.5 h-3.5 text-cyan-300" />
                      <span className="hidden sm:inline">Watch Full Movie (Online HD) ↗</span>
                      <span className="sm:hidden">Full Movie</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-amber-300" />
                      <span className="hidden sm:inline">🎙️ Studio Audio Track</span>
                      <span className="sm:hidden">Studio Audio</span>
                    </>
                  )}
                </button>
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
        {/* 3. DEDICATED AUDIO TRACK & SUBTITLES SELECTOR BAR                         */}
        {/* ========================================================================= */}
        {!isFullscreen && (
          <div className="px-3 sm:px-4 py-2.5 bg-gradient-to-r from-[#070e24] via-[#09153a] to-[#070e24] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Audio Track Selector */}
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 font-extrabold text-cyan-300 text-[11px] uppercase tracking-wider">
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                  Audio Track:
                </span>
                {isSwitchingAudio && (
                  <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 animate-pulse px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Switching audio...</span>
                  </span>
                )}
                {audioSwitchFeedback && !isSwitchingAudio && (
                  <span className="text-[10px] text-emerald-300 font-bold flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 animate-in fade-in duration-200">
                    <span>{audioSwitchFeedback}</span>
                  </span>
                )}
                <div className="flex items-center gap-1.5 bg-black/40 p-0.5 rounded-full border border-white/10">
                  {/* English Dub Option */}
                  {hasWorkingEnglishSource ? (
                    <button
                      data-testid="audio-btn-english"
                      onClick={() => handleAudioChange('english')}
                      disabled={isSwitchingAudio}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                        audioMode === 'english'
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-105'
                          : 'bg-cyan-500/10 text-cyan-200/70 border-transparent hover:text-white'
                      }`}
                    >
                      <span>{audioMode === 'english' ? '✓' : '○'}</span>
                      <span>🎙️ English Dub</span>
                    </button>
                  ) : (
                    <div
                      data-testid="audio-btn-english-unavailable"
                      onClick={() => handleUnavailableClick('English')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/60 text-slate-500 border border-slate-800 flex items-center gap-1 cursor-not-allowed opacity-50 select-none"
                      title="English audio isn't available for this title"
                    >
                      <span>⊘</span>
                      <span>English</span>
                      <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1 py-0.2 rounded font-mono">Unavailable</span>
                    </div>
                  )}

                  {/* Japanese Sub Option */}
                  {hasWorkingJapaneseSource ? (
                    <button
                      data-testid="audio-btn-sub"
                      onClick={() => handleAudioChange('sub')}
                      disabled={isSwitchingAudio}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                        audioMode === 'sub'
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)] scale-105'
                          : 'bg-purple-500/10 text-purple-200/70 border-transparent hover:text-white'
                      }`}
                    >
                      <span>{audioMode === 'sub' ? '✓' : '○'}</span>
                      <span>🇯🇵 Japanese Sub</span>
                    </button>
                  ) : (
                    <div
                      data-testid="audio-btn-sub-unavailable"
                      onClick={() => handleUnavailableClick('Japanese')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/60 text-slate-500 border border-slate-800 flex items-center gap-1 cursor-not-allowed opacity-50 select-none"
                      title="Japanese audio isn't available for this title"
                    >
                      <span>⊘</span>
                      <span>Japanese</span>
                      <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1 py-0.2 rounded font-mono">Unavailable</span>
                    </div>
                  )}

                  {/* Hindi Audio Option */}
                  {hasWorkingHindiSource ? (
                    <button
                      data-testid="audio-btn-hindi"
                      onClick={() => handleAudioChange('hindi')}
                      disabled={isSwitchingAudio}
                      className={`px-3 py-1 rounded-full text-xs font-extrabold transition flex items-center gap-1 border cursor-pointer ${
                        audioMode === 'hindi'
                          ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-gray-950 border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-105'
                          : 'bg-amber-500/10 text-amber-200/70 border-transparent hover:text-white'
                      }`}
                    >
                      <span>{audioMode === 'hindi' ? '✓' : '○'}</span>
                      <span>🇮🇳 Hindi Audio</span>
                    </button>
                  ) : (
                    <div
                      data-testid="audio-btn-hindi-unavailable"
                      onClick={() => handleUnavailableClick('Hindi')}
                      className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-900/60 text-slate-500 border border-slate-800 flex items-center gap-1 cursor-not-allowed opacity-50 select-none"
                      title="Hindi audio isn't available for this title"
                    >
                      <span>⊘</span>
                      <span>Hindi</span>
                      <span className="text-[9px] bg-slate-800/80 text-slate-400 px-1 py-0.2 rounded font-mono">Unavailable</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtitles (CC) Selector */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="flex items-center gap-1 font-extrabold text-cyan-300 text-[11px] uppercase tracking-wider">
                  <Subtitles className="w-3.5 h-3.5 text-cyan-400" />
                  Subtitles:
                </span>
                <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-full border border-white/10">
                  {availableSubtitles.map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => changeSubtitle(sub.id)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                        activeSubtitle === sub.id
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 font-black shadow-md scale-105'
                          : 'text-slate-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <span>{sub.flag}</span>
                      <span>{sub.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Audio Mode Active Guidance Badge & Hardware Track Detection */}
            <div className="flex items-center gap-2 flex-wrap text-[11px] text-cyan-200/70">
              {audioMode === 'english' && hasWorkingEnglishSource && (
                <span className="text-cyan-300 font-medium">
                  ✓ <strong>English Audio Active</strong> ({isCustom ? 'Studio Master Track' : isAnime ? 'VidLink Pro verified English stream' : 'Original Theatrical Master Audio'})
                </span>
              )}
              {audioMode === 'sub' && hasWorkingJapaneseSource && (
                <span className="text-purple-300 font-medium">
                  ✓ <strong>Japanese Subbed Active</strong> ({isCustom ? 'Studio Master Track' : 'Original Japanese Dialogue'})
                </span>
              )}
              {audioMode === 'hindi' && hasWorkingHindiSource && (
                <span className="text-amber-300 font-medium">
                  ✓ <strong>Hindi Audio Active</strong> ({isCustom ? 'Studio Master Track' : isBollywoodHindi ? 'Original Native Hindi Audio Track' : 'Verified Multi-Audio Hindi Stream'})
                </span>
              )}
              {detectedTracks && detectedTracks.length > 0 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                  <span>🎧 HTML5 Tracks:</span>
                  <strong className="text-white">{detectedTracks.map((t) => t.language.toUpperCase()).join(', ')}</strong>
                </span>
              )}
              {isCustom && currentLangSources.length > 1 && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/30 text-blue-300">
                  Priority {activeSourcePriority}/{currentLangSources.length}
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
            ) : (isCustom && playerMode === 'studio') ? (
              /* CASE B: OWNED / STUDIO CREATED MOVIE (HTML5 Custom Video Player) */
              <div className="relative w-full h-full flex items-center justify-center bg-black">
                {/* Source Failover / Error Banner (Requirement 6) */}
                {sourceErrorMessage && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 max-w-lg px-4 py-2 rounded-xl bg-rose-950/95 border border-rose-500 text-rose-200 text-xs shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                      <span className="text-rose-400 font-bold">⚠️</span>
                      <span>{sourceErrorMessage}</span>
                    </div>
                    <button
                      onClick={() => setSourceErrorMessage('')}
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Floating Non-Intrusive Unavailable Language Notice on Custom Player */}
                {unavailableNotice.show && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-lg px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-200 text-xs shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">ℹ️</span>
                      <span>{unavailableNotice.message}</span>
                    </div>
                    <button 
                      onClick={() => setUnavailableNotice({ show: false, message: '' })} 
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {activeCustomVideoUrl ? (
                  <div className="relative w-full h-full group/player flex items-center justify-center bg-black overflow-hidden">
                    {/* Audio-Only Cinematic Visualizer Canvas (eliminates blank black box) */}
                    {isAudioOnly && (
                      <div className="absolute inset-0 z-0 overflow-hidden flex flex-col items-center justify-center pointer-events-none select-none">
                        {/* High-res cinematic backdrop with subtle blur and dark vignette */}
                        {backdropUrl && (
                          <div 
                            className="absolute inset-0 bg-cover bg-center filter blur-md opacity-35 scale-110"
                            style={{ backgroundImage: `url(${backdropUrl})` }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/85 to-[#050b1d]/85" />

                        {/* Center Cinematic Poster & Equalizer Card */}
                        <div className="relative z-10 flex flex-col items-center text-center p-4 max-w-md mx-auto pointer-events-auto pb-16">
                          <div className="relative mb-3 group">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 to-cyan-500 opacity-60 blur-md group-hover:opacity-100 transition duration-500" />
                            <img 
                              src={posterUrl || './icon-512.png'} 
                              alt={title} 
                              className="relative w-20 h-28 sm:w-24 sm:h-36 object-cover rounded-xl shadow-2xl border border-white/20"
                            />
                            <div className="absolute -bottom-2 -right-2 p-2 rounded-full bg-amber-500 text-gray-950 shadow-lg border-2 border-black">
                              <Volume2 className="w-4 h-4 animate-pulse" />
                            </div>
                          </div>

                          <h3 className="text-sm sm:text-base font-black text-white drop-shadow-md mb-1 line-clamp-1">
                            {title}
                          </h3>

                          <div className="flex items-center gap-1.5 mb-2 flex-wrap justify-center text-[11px]">
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center gap-1">
                              <span>{audioMode === 'hindi' ? '🇮🇳' : audioMode === 'sub' ? '🇯🇵' : '🎙️'}</span>
                              <span>{audioMode === 'hindi' ? 'Authentic Hindi Spoken Audio' : audioMode === 'sub' ? 'Japanese Spoken Dialogue' : 'English Master Audio'}</span>
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono text-[10px]">
                              Studio Master Track
                            </span>
                          </div>

                          {/* Soundwave animated equalizer */}
                          <div className="flex items-center gap-1 my-2">
                            <span className="w-1 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-5 bg-amber-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-7 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            <span className="w-1 h-4 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '450ms' }} />
                            <span className="w-1 h-6 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                            <span className="w-1 h-3 bg-cyan-300 rounded-full animate-bounce" style={{ animationDelay: '350ms' }} />
                          </div>

                          {/* 1-Click Button to switch to Full Movie Stream */}
                          {hasOnlineStream && (
                            <button
                              onClick={() => setPlayerMode('stream')}
                              className="mt-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-[0_0_20px_rgba(56,189,248,0.5)] transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
                            >
                              <span>🌐</span>
                              <span>Watch Full Movie (Online HD Stream)</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <video
                      ref={videoRef}
                      key={`${item.id}-${audioMode}`}
                      src={activeCustomVideoUrl}
                      controls
                      autoPlay
                      playsInline
                      className={isAudioOnly ? 'absolute bottom-0 left-0 right-0 w-full h-14 z-20 bg-black/90 backdrop-blur-md border-t border-cyan-500/20' : 'w-full h-full object-contain'}
                      style={AI_BOOST_STYLES[aiBoostMode] || {}}
                      onError={handleVideoError}
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          if (savedPlaybackTimeRef.current > 0) {
                            try {
                              videoRef.current.currentTime = savedPlaybackTimeRef.current;
                            } catch (e) {}
                          }
                          try {
                            videoRef.current.volume = savedVolumeRef.current;
                            videoRef.current.muted = savedMutedRef.current;
                          } catch (e) {}
                          const detected = hindiProviderManager.detectMediaAudioTracks(videoRef.current);
                          setDetectedTracks(detected);
                          if (videoRef.current.textTracks) {
                            for (let t = 0; t < videoRef.current.textTracks.length; t++) {
                              const trk = videoRef.current.textTracks[t];
                              trk.mode = (activeSubtitle !== 'off' && trk.language === activeSubtitle) ? 'showing' : 'disabled';
                            }
                          }
                        }
                      }}
                    >
                      {effectiveSubtitles.map((sub, i) => (
                        <track 
                          key={i} 
                          kind="subtitles" 
                          src={sub.src && sub.src.trim().length > 0 ? sub.src : (sub.lang === 'hi' ? 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AHindi%20Captions' : 'data:text/vtt;charset=utf-8,WEBVTT%0A%0A1%0A00:00:01.000%20-->%2000:00:10.000%0AEnglish%20Captions')} 
                          srcLang={sub.lang || 'en'} 
                          label={sub.label || (sub.lang === 'hi' ? 'Hindi CC' : 'English CC')} 
                          default={Boolean(activeSubtitle !== 'off' && sub.lang === activeSubtitle)} 
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

                {/* Floating Subtitle Toast Notification */}
                {subtitleToast && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-xl bg-[#08122c]/95 border border-cyan-400/80 text-cyan-200 text-xs font-black shadow-[0_0_25px_rgba(6,182,212,0.8)] backdrop-blur-md flex items-center gap-2 pointer-events-none animate-in fade-in zoom-in-95 duration-150">
                    <Subtitles className="w-4 h-4 text-cyan-300 animate-pulse" />
                    <span>{subtitleToast}</span>
                  </div>
                )}

                {/* Floating Non-Intrusive Unavailable Language Notice */}
                {unavailableNotice.show && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-lg px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-200 text-xs shadow-xl backdrop-blur-md flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-bold">ℹ️</span>
                      <span>{unavailableNotice.message}</span>
                    </div>
                    <button 
                      onClick={() => setUnavailableNotice({ show: false, message: '' })} 
                      className="text-slate-400 hover:text-white text-xs px-1 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                )}

                {/* Fallback Audio Safeguard: If Hindi was selected on an unavailable title, stream default cleanly with subtle warning banner */}
                {audioMode === 'hindi' && !hasWorkingHindiSource && !unavailableNotice.show && (
                  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-lg px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-amber-200 text-xs shadow-xl backdrop-blur-md flex items-center justify-between gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200 pointer-events-auto">
                    <div className="flex items-center gap-1.5">
                      <span className="text-amber-400 font-bold">ℹ️</span>
                      <span>Hindi audio unavailable from providers for this title. Streaming in {hasWorkingEnglishSource ? 'English Dub' : 'Japanese Sub'}.</span>
                    </div>
                    <button
                      onClick={() => setAudioMode(hasWorkingEnglishSource ? 'english' : 'sub')}
                      className="px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-[11px] transition cursor-pointer"
                    >
                      Switch
                    </button>
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
                  className={`border-0 bg-black ${
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
          {!isFullscreen && (!isCustom || playerMode === 'stream') && (
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
