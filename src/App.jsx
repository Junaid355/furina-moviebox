import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaCard from './components/MediaCard';
import MediaShelf from './components/MediaShelf';
import ErrorBoundary from './components/ErrorBoundary';
import soundFx from './services/soundFx';
import { getStoredSettings, applyThemeAndAppSettings } from './services/settingsService';
import { getStoredStudioMovies } from './services/studioService';
import watchPartyService from './services/watchPartyService';
import MobileExploreSheet from './components/MobileExploreSheet';
import { BackgroundBeams } from './components/ui/background-beams';
import { Marquee } from './components/ui/marquee';
import { FloatingDock } from './components/ui/floating-dock';
import { FurinaMascot } from './components/ui/FurinaMascot';
import { resolvePosterUrl } from './services/contentModel';

// Lazy-loaded modals and dedicated hubs
const PlayerModal = lazy(() => import('./components/PlayerModal'));
const MediaDetailsModal = lazy(() => import('./components/MediaDetailsModal'));
const SearchOverlay = lazy(() => import('./components/SearchOverlay'));
const SettingsModal = lazy(() => import('./components/SettingsModal'));
const IPhoneAppModal = lazy(() => import('./components/IPhoneAppModal'));
const AndroidAppModal = lazy(() => import('./components/AndroidAppModal'));
const MovieStudioModal = lazy(() => import('./components/MovieStudioModal'));
const FranchiseTimelineModal = lazy(() => import('./components/FranchiseTimelineModal'));
const WatchTogetherModal = lazy(() => import('./components/WatchTogetherModal'));
const MovieBoxHub = lazy(() => import('./components/MovieBoxHub'));
const LiveTvHub = lazy(() => import('./components/LiveTvHub'));
const LibraryHub = lazy(() => import('./components/LibraryHub'));

import {
  fetchTrendingAll,
  fetchHollywoodMovies,
  fetchHindiMovies,
  fetchHindiDubbedHollywood,
  fetchTrendingSeries,
  fetchAnime,
  fetchKDramas,
  fetchHorrorMovies,
  fetchMatureMovies,
  fetchEcchiAnime,
  fetchPopularMovies,
  fetchPopularAnime,
  fetchLatestMovies,
  searchContent,
  deduplicateMedia,
  isHindiAvailable,
  CURATED_HOLLYWOOD_BLOCKBUSTERS,
  CURATED_BOLLYWOOD_BLOCKBUSTERS,
  CURATED_HINDI_DUBBED_ANIME,
  CURATED_HOLLYWOOD_HINDI_DUBS,
  FALLBACK_MEDIA
} from './services/tmdb';
import { SERVERS } from './services/streaming';
import { CURATED_MOVIEBOX_TITLES, fetchMovieBoxTrending } from './services/movieboxService';
import { syncWorldAnimeNow, getLastAnimeSyncDisplay } from './services/animeAutoSync';
import {
  Flame, Film, Tv, Sparkles, RefreshCw, ChevronDown, Clock, Play, X,
  Milestone, Radio, Compass, FolderHeart, Users, Search, Settings
} from 'lucide-react';

function getContinueWatchingList() {
  const items = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('furina_progress_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && (parsed.id || key.replace('furina_progress_', ''))) {
            items.push(parsed);
          }
        }
      }
    }
  } catch (e) {}
  return items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0)).slice(0, 12);
}

export default function App() {
  const [activeCategory, setActiveCategoryState] = useState('trending');
  const [animeAudioFilter, setAnimeAudioFilter] = useState('all');
  const [movieFilter, setMovieFilter] = useState('hollywood');
  const [kdramaFilter, setKdramaFilter] = useState('all');
  const [globalMediaFilter, setGlobalMediaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Reset sub-filters cleanly when switching top-level category
  const setActiveCategory = useCallback((cat) => {
    setActiveCategoryState(cat);
    setGlobalMediaFilter('all');
  }, []);

  const [items, setItems] = useState(() => {
    try {
      const cached = localStorage.getItem('furina_cached_trending');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return deduplicateMedia(parsed);
      }
    } catch (e) {}
    return deduplicateMedia([...FALLBACK_MEDIA, ...CURATED_HOLLYWOOD_BLOCKBUSTERS]);
  });

  const [heroItem, setHeroItem] = useState(() => FALLBACK_MEDIA[0] || null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);
  const [detailsItem, setDetailsItem] = useState(null);
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isWatchTogetherOpen, setIsWatchTogetherOpen] = useState(false);
  const [watchPartyTarget, setWatchPartyTarget] = useState(null);
  const [isMobileExploreOpen, setIsMobileExploreOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState(() => getLastAnimeSyncDisplay());
  const [isSyncingAnime, setIsSyncingAnime] = useState(false);

  useEffect(() => {
    const handleSynced = (e) => {
      if (e?.detail?.lastSyncDisplay) {
        setSyncStatus(e.detail.lastSyncDisplay);
      }
    };
    window.addEventListener('furina-anime-synced', handleSynced);
    return () => window.removeEventListener('furina-anime-synced', handleSynced);
  }, []);

  const handleManualAnimeSync = async () => {
    if (isSyncingAnime) return;
    setIsSyncingAnime(true);
    try {
      soundFx.playClick?.();
      const res = await syncWorldAnimeNow(true);
      setSyncStatus(res?.lastSyncDisplay || 'Updated just now');
      setRetryCount((prev) => prev + 1);
    } catch (e) {
      setSyncStatus('Updated just now');
    } finally {
      setIsSyncingAnime(false);
    }
  };

  // Listen for #room= hash on mount & hashchange to auto-open synchronized stream
  useEffect(() => {
    const handleHash = () => {
      try {
        if (typeof window !== 'undefined' && window.location.hash.startsWith('#room=')) {
          const rawHash = window.location.hash.slice(1);
          const params = new URLSearchParams(rawHash.replace(/^room=([^&]+)/, 'roomCode=$1'));
          const roomCode = params.get('roomCode');
          const mId = params.get('id');
          const mTitle = params.get('title');
          const mType = params.get('type') || 'movie';
          const s = Number(params.get('s')) || 1;
          const e = Number(params.get('e')) || 1;
          const srv = params.get('srv') || 'vidstuck';
          const poster = params.get('poster') || '';
          const tSec = Number(params.get('t')) || 0;

          if (mId && mTitle) {
            const syncItem = {
              id: isNaN(Number(mId)) ? mId : Number(mId),
              title: decodeURIComponent(mTitle),
              name: decodeURIComponent(mTitle),
              media_type: mType,
              type: mType,
              poster_path: poster ? decodeURIComponent(poster) : '',
              season: s,
              episode: e,
              preferredServerId: srv
            };
            watchPartyService.joinRoom(roomCode, syncItem, false);
            if (tSec > 0) {
              watchPartyService.playbackState.currentTime = tSec;
              watchPartyService.playbackState.lastUpdatedAt = Date.now();
            }
            setWatchPartyTarget(syncItem);
            setActiveMedia(syncItem);
          } else {
            if (roomCode) {
              watchPartyService.joinRoom(roomCode, null, false);
            }
            setIsWatchTogetherOpen(true);
          }
        }
      } catch (e) {}
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // 4 Lightweight Curated Shelves for 60fps Homepage
  const [shelvesData, setShelvesData] = useState({
    moviebox: CURATED_MOVIEBOX_TITLES.slice(0, 14),
    popularMovies: CURATED_HOLLYWOOD_BLOCKBUSTERS.slice(0, 14),
    popularAnime: CURATED_HINDI_DUBBED_ANIME.slice(0, 14),
    hindiDubbed: [...CURATED_BOLLYWOOD_BLOCKBUSTERS.slice(0, 8), ...CURATED_HOLLYWOOD_HINDI_DUBS.slice(0, 6)]
  });

  useEffect(() => {
    let cancelled = false;
    const loadShelves = async () => {
      try {
        const [popMovies, popAnime, hindi, moviebox] = await Promise.allSettled([
          fetchPopularMovies(1),
          fetchPopularAnime(1),
          fetchHindiMovies(1),
          fetchMovieBoxTrending()
        ]);
        if (cancelled) return;
        setShelvesData({
          moviebox: (moviebox.status === 'fulfilled' && moviebox.value?.length > 0 ? moviebox.value : CURATED_MOVIEBOX_TITLES).slice(0, 14),
          popularMovies: (popMovies.status === 'fulfilled' && popMovies.value?.length > 0 ? popMovies.value : CURATED_HOLLYWOOD_BLOCKBUSTERS).slice(0, 14),
          popularAnime: (popAnime.status === 'fulfilled' && popAnime.value?.length > 0 ? popAnime.value : CURATED_HINDI_DUBBED_ANIME).slice(0, 14),
          hindiDubbed: (hindi.status === 'fulfilled' && hindi.value?.length > 0 ? hindi.value : CURATED_BOLLYWOOD_BLOCKBUSTERS).slice(0, 14)
        });
      } catch (e) {}
    };
    loadShelves();
    return () => {
      cancelled = true;
    };
  }, []);

  // Direct player URL navigation support (?id=...)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const searchStr = window.location.search || (window.location.hash.includes('?') ? window.location.hash.slice(window.location.hash.indexOf('?')) : '');
      const params = new URLSearchParams(searchStr);
      const urlId = params.get('id');
      const urlType = params.get('type') || 'movie';
      const urlServer = params.get('server');
      if (urlId) {
        const numId = Number(urlId);
        const matchedItem =
          CURATED_HOLLYWOOD_HINDI_DUBS.find((m) => Number(m.id) === numId) ||
          CURATED_HOLLYWOOD_BLOCKBUSTERS.find((m) => Number(m.id) === numId) || {
            id: numId || urlId,
            media_type: urlType,
            isHindiDubbed: isHindiAvailable({ id: numId || urlId })
          };
        setActiveMedia(matchedItem);
        if (urlServer !== null) {
          const srvIdx = parseInt(urlServer, 10);
          if (!isNaN(srvIdx) && SERVERS[srvIdx]) {
            setPreferredServer(SERVERS[srvIdx].id);
          }
        }
      }
    } catch (e) {}
  }, []);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  // Fast 120ms debounce for search input
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 120);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [continueWatching, setContinueWatching] = useState(getContinueWatchingList);

  useEffect(() => {
    setContinueWatching(getContinueWatchingList());
    const handleProgressChange = () => setContinueWatching(getContinueWatchingList());
    window.addEventListener('storage', handleProgressChange);
    window.addEventListener('furina:progress-updated', handleProgressChange);
    return () => {
      window.removeEventListener('storage', handleProgressChange);
      window.removeEventListener('furina:progress-updated', handleProgressChange);
    };
  }, [activeMedia, activeCategory]);

  useEffect(() => {
    applyThemeAndAppSettings(getStoredSettings(), false);
    const handleSettingsChange = (e) => {
      if (e.detail) applyThemeAndAppSettings(e.detail, false);
    };
    window.addEventListener('furina:settings-changed', handleSettingsChange);
    return () => window.removeEventListener('furina:settings-changed', handleSettingsChange);
  }, []);

  const removeContinueWatching = (id, e) => {
    if (e) e.stopPropagation();
    try {
      localStorage.removeItem(`furina_progress_${id}`);
      setContinueWatching((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {}
  };

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIPhoneModalOpen, setIsIPhoneModalOpen] = useState(false);
  const [isAndroidModalOpen, setIsAndroidModalOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioVersion, setStudioVersion] = useState(0);
  const [isMasterMode, setIsMasterMode] = useState(() => {
    try {
      return localStorage.getItem('furina_master_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [includeMature, setIncludeMature] = useState(false);
  const [preferredServer, setPreferredServer] = useState(() => {
    try {
      const saved = localStorage.getItem('furina_moviebox_server');
      const validIds = SERVERS.map((s) => s.id);
      if (saved && validIds.includes(saved)) {
        return saved;
      }
    } catch (e) {}
    return 'vidstuck';
  });

  useEffect(() => {
    try {
      localStorage.setItem('furina_moviebox_server', preferredServer);
    } catch (e) {}
  }, [preferredServer]);

  useEffect(() => {
    try {
      localStorage.setItem('furina_master_mode', isMasterMode ? 'true' : 'false');
    } catch {}
  }, [isMasterMode]);

  useEffect(() => {
    const syncMasterMode = () => {
      try {
        if (localStorage.getItem('furina_master_mode') === 'true') {
          setIsMasterMode(true);
        }
      } catch {}
    };
    window.addEventListener('storage', syncMasterMode);
    return () => window.removeEventListener('storage', syncMasterMode);
  }, []);

  const [watchlist, setWatchlist] = useState(() => {
    try {
      const saved = localStorage.getItem('furina_moviebox_watchlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('furina_moviebox_watchlist', JSON.stringify(Array.isArray(watchlist) ? watchlist : []));
    } catch (e) {}
  }, [watchlist]);

  useEffect(() => {
    const handleRestored = () => {
      try {
        const saved = localStorage.getItem('furina_moviebox_watchlist');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setWatchlist(parsed.filter(Boolean));
        }
      } catch (e) {}
    };
    window.addEventListener('furina:watchlist-restored', handleRestored);
    return () => window.removeEventListener('furina:watchlist-restored', handleRestored);
  }, []);

  const toggleWatchlist = useCallback((item) => {
    if (!item || !item.id) return;
    setWatchlist((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const exists = arr.some((x) => x && x.id === item.id);
      if (exists) {
        return arr.filter((x) => x && x.id !== item.id);
      }
      return [item, ...arr];
    });
  }, []);

  const clearWatchlist = useCallback(() => {
    setWatchlist([]);
    if (activeCategory === 'watchlist') {
      setItems([]);
      setHeroItem(null);
    }
  }, [activeCategory]);

  const watchlistIdSet = useMemo(() => {
    return new Set((Array.isArray(watchlist) ? watchlist : []).map((x) => x && x.id).filter(Boolean));
  }, [watchlist]);

  const isWatchlisted = useCallback(
    (id) => {
      if (!id) return false;
      return watchlistIdSet.has(id);
    },
    [watchlistIdSet]
  );

  // Monotonic Request Sequence Counter for Race-Condition-Free Category Switching
  const requestSeqRef = useRef(0);

  const fetchCategoryItems = async (cat, pageNum, query = '') => {
    if (query && query.trim()) {
      return await searchContent(query.trim(), pageNum, includeMature);
    }
    if (cat === 'trending') return await fetchTrendingAll(pageNum);
    if (cat === 'new_movies') return await fetchLatestMovies(pageNum);
    if (cat === 'moviebox') return await fetchMovieBoxTrending();
    if (cat === 'hollywood') {
      if (movieFilter === 'hindi') return await fetchHindiDubbedHollywood(pageNum);
      if (movieFilter === 'popular') return await fetchTrendingAll(pageNum);
      return await fetchHollywoodMovies(pageNum);
    }
    if (cat === 'hindi') return await fetchHindiMovies(pageNum);
    if (cat === 'series') return await fetchTrendingSeries(pageNum);
    if (cat === 'kdrama') return await fetchKDramas(pageNum, kdramaFilter);
    if (cat === 'horror') return await fetchHorrorMovies(pageNum);
    if (cat === 'anime') return await fetchAnime(pageNum, animeAudioFilter);
    if (cat === 'ecchi_anime' || cat === 'mature_anime') {
      if (!isMasterMode) return await fetchTrendingAll(pageNum);
      return await fetchEcchiAnime(pageNum);
    }
    if (cat === 'mature') return await fetchMatureMovies(pageNum);
    if (cat === 'watchlist') return watchlist;
    if (cat === 'studio') return getStoredStudioMovies();
    return [];
  };

  useEffect(() => {
    const currentSeq = ++requestSeqRef.current;
    setPage(1);
    setError(null);

    if (activeCategory === 'watchlist' || activeCategory === 'livetv' || (activeCategory === 'moviebox' && !debouncedQuery)) {
      const cleanList = activeCategory === 'watchlist' ? deduplicateMedia(watchlist) : CURATED_MOVIEBOX_TITLES;
      setItems(cleanList);
      setHeroItem(cleanList[0] || null);
      setLoading(false);
      return;
    }

    if (activeCategory === 'studio') {
      const studioList = deduplicateMedia(getStoredStudioMovies());
      setItems(studioList);
      setHeroItem(studioList[0] || null);
      setLoading(false);
      return;
    }

    if (activeCategory !== 'trending' || debouncedQuery) {
      setLoading(true);
    }

    fetchCategoryItems(activeCategory, 1, debouncedQuery)
      .then((results) => {
        if (currentSeq !== requestSeqRef.current) return;
        const uniqueResults = deduplicateMedia(results);
        if (uniqueResults && uniqueResults.length > 0) {
          setItems(uniqueResults);
          setHeroItem(uniqueResults[0]);
          setError(null);
          if (activeCategory === 'trending' && !debouncedQuery) {
            try {
              localStorage.setItem('furina_cached_trending', JSON.stringify(uniqueResults.slice(0, 35)));
            } catch (e) {}
          }
        } else if (!debouncedQuery && activeCategory !== 'watchlist' && activeCategory !== 'studio') {
          setError("Couldn't load titles");
        }
        setLoading(false);
      })
      .catch(() => {
        if (currentSeq !== requestSeqRef.current) return;
        if (items.length === 0) {
          setError("Couldn't load titles");
        }
        setLoading(false);
      });
  }, [activeCategory, debouncedQuery, animeAudioFilter, movieFilter, kdramaFilter, includeMature, isMasterMode, studioVersion, retryCount]);

  const handleLoadMore = async () => {
    if (loadingMore || activeCategory === 'watchlist') return;
    setLoadingMore(true);
    const nextPage = page + 1;
    try {
      const moreItems = await fetchCategoryItems(activeCategory, nextPage, debouncedQuery);
      if (moreItems && moreItems.length > 0) {
        setItems((prev) => deduplicateMedia([...prev, ...moreItems]));
        setPage(nextPage);
      }
    } catch (e) {}
    setLoadingMore(false);
  };

  const displayedItems = useMemo(() => {
    if (globalMediaFilter === 'all') return items;
    if (globalMediaFilter === 'moviebox') return items.filter((item) => String(item.id).startsWith('mb_') || item.corner?.includes('MovieBox') || isHindiAvailable(item));
    if (globalMediaFilter === 'hindi') return items.filter((item) => isHindiAvailable(item));
    if (globalMediaFilter === 'english') return items.filter((item) => item.original_language !== 'hi' || item.languages?.en);
    if (globalMediaFilter === 'japanese') return items.filter((item) => item.original_language === 'ja' || item.category === 'anime' || item.languages?.ja);
    if (globalMediaFilter === 'multiaudio') return items.filter((item) => (isHindiAvailable(item) && item.original_language !== 'hi') || item.languages || (item.category === 'anime' && isHindiAvailable(item)));
    if (globalMediaFilter === 'movies') return items.filter((item) => item.media_type === 'movie' || (!item.first_air_date && item.category !== 'series'));
    if (globalMediaFilter === 'anime') return items.filter((item) => item.category === 'anime' || item.original_language === 'ja');
    if (globalMediaFilter === 'series') return items.filter((item) => item.media_type === 'tv' || Boolean(item.first_air_date) || item.category === 'series');
    return items;
  }, [items, globalMediaFilter]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable;
      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        return;
      }
      if (isInput) return;
      if (e.key === 'Escape') {
        if (detailsItem) { setDetailsItem(null); return; }
        if (isSearchOverlayOpen) { setIsSearchOverlayOpen(false); return; }
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isStudioOpen) { setIsStudioOpen(false); return; }
        if (isIPhoneModalOpen) { setIsIPhoneModalOpen(false); return; }
        if (isAndroidModalOpen) { setIsAndroidModalOpen(false); return; }
        return;
      }
      if ((e.key === 'k' && (e.ctrlKey || e.metaKey)) || e.key === '/') {
        e.preventDefault();
        setIsSearchOverlayOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isStudioOpen, isIPhoneModalOpen, isAndroidModalOpen, detailsItem, isSearchOverlayOpen]);

  return (
    <div className={`min-h-screen ${isStealthMode ? 'bg-[#080b11]' : 'bg-[#030712]'} text-white flex flex-col selection:bg-cyan-500 selection:text-gray-950 pb-16 md:pb-16 relative overflow-x-hidden`}>
      {/* 3D Animated Fontaine Hydro Background Beams */}
      {!isStealthMode && !activeMedia && (
        <div className="fixed inset-0 pointer-events-none z-0 opacity-75">
          <BackgroundBeams />
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearch={setSearchQuery}
        isStealthMode={isStealthMode}
        isMasterMode={isMasterMode}
        includeMature={includeMature}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenIPhoneModal={() => setIsIPhoneModalOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenSearchOverlay={() => setIsSearchOverlayOpen(true)}
        onOpenWatchTogether={() => setIsWatchTogetherOpen(true)}
      />

      {/* Compact Main Container (1400px max width) */}
      <main className="max-w-[1400px] mx-auto w-full px-3 sm:px-5 pt-3.5 pb-20 md:pb-8 flex-1 relative z-10">
        {isStealthMode && (
          <div className="mb-3 bg-slate-900 border border-slate-700/60 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-300">
            <span>Stealth Mode Active — Disguised neutral cinema UI</span>
            <button
              onClick={() => setIsStealthMode(false)}
              className="text-cyan-400 hover:underline text-[11px] font-bold cursor-pointer"
            >
              Restore Furina Theme
            </button>
          </div>
        )}

        {/* Dedicated Views for MovieBox, Live TV, and Watchlist */}
        {!searchQuery.trim() && activeCategory === 'moviebox' ? (
          <Suspense fallback={<div className="py-12 text-center text-cyan-300 text-xs font-bold">Loading MovieBox Hub...</div>}>
            <MovieBoxHub
              onPlay={setActiveMedia}
              onOpenDetails={setDetailsItem}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={toggleWatchlist}
              preferredServer={preferredServer}
              setPreferredServer={setPreferredServer}
            />
          </Suspense>
        ) : !searchQuery.trim() && activeCategory === 'livetv' ? (
          <Suspense fallback={<div className="py-12 text-center text-cyan-300 text-xs font-bold">Tuning Live TV Channels...</div>}>
            <LiveTvHub
              onPlay={setActiveMedia}
              onOpenDetails={setDetailsItem}
              customMoviePool={items}
              onWatchTogether={(m) => {
                setWatchPartyTarget(m);
                setIsWatchTogetherOpen(true);
              }}
            />
          </Suspense>
        ) : !searchQuery.trim() && activeCategory === 'watchlist' ? (
          <Suspense fallback={<div className="py-12 text-center text-cyan-300 text-xs font-bold">Loading Library...</div>}>
            <LibraryHub
              watchlist={watchlist}
              onToggleWatchlist={toggleWatchlist}
              onClearWatchlist={clearWatchlist}
              onPlay={setActiveMedia}
              onOpenDetails={setDetailsItem}
              isWatchlisted={isWatchlisted}
            />
          </Suspense>
        ) : (
          <>
            {/* 3D Hero Spotlight Banner + Infinite Motion Marquee Strip */}
            {!searchQuery.trim() && items && items.length > 0 && (
              <ErrorBoundary inline>
                <HeroBanner
                  items={items}
                  item={heroItem}
                  onPlay={setActiveMedia}
                  isWatchlisted={isWatchlisted}
                  onToggleWatchlist={toggleWatchlist}
                  onOpenDetails={setDetailsItem}
                  isPaused={Boolean(activeMedia)}
                  onWatchTogether={(m) => {
                    setWatchPartyTarget(m);
                    setIsWatchTogetherOpen(true);
                  }}
                />
                {activeCategory === 'trending' && (
                  <div className="my-2 rounded-2xl bg-[#050d24]/85 border border-cyan-500/25 overflow-hidden backdrop-blur-md shadow-[0_8px_25px_rgba(0,0,0,0.5)]">
                    <Marquee pauseOnHover className="[--duration:38s] py-1.5">
                      {items.slice(0, 10).map((m) => (
                        <button
                          key={`marquee-${m.id}`}
                          type="button"
                          onClick={() => setActiveMedia(m)}
                          className="flex items-center gap-2 px-3 py-1 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/25 border border-cyan-400/30 transition cursor-pointer group"
                        >
                          <img
                            src={resolvePosterUrl(m, 'w342')}
                            alt={m.title || m.name}
                            className="w-5 h-7 rounded object-cover border border-cyan-300/40"
                            onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                          />
                          <span className="text-[11px] font-extrabold text-white group-hover:text-cyan-300 whitespace-nowrap">
                            {m.title || m.name}
                          </span>
                          <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-400/40">
                            🇮🇳 HI / EN / JA
                          </span>
                        </button>
                      ))}
                    </Marquee>
                  </div>
                )}
              </ErrorBoundary>
            )}

            {/* Compact Continue Watching Strip */}
            {!searchQuery.trim() && activeCategory === 'trending' && continueWatching.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <h3 className="text-xs sm:text-sm font-extrabold text-white">Continue Watching</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">{continueWatching.length} in progress</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar">
                  {continueWatching.map((cw) => {
                    const cwTitle = cw.title || cw.name || 'Untitled';
                    const poster = cw.poster_path
                      ? cw.poster_path.startsWith('http')
                        ? cw.poster_path
                        : `https://image.tmdb.org/t/p/w500${cw.poster_path}`
                      : './icon-512.png';
                    return (
                      <div
                        key={cw.id}
                        onClick={() => setActiveMedia(cw)}
                        className="relative shrink-0 w-28 sm:w-36 bg-[#071026] border border-cyan-500/25 hover:border-cyan-400 rounded-xl overflow-hidden cursor-pointer group"
                      >
                        <div className="aspect-video w-full bg-[#040a18] relative overflow-hidden">
                          <img
                            src={
                              cw.backdrop_path
                                ? cw.backdrop_path.startsWith('http')
                                  ? cw.backdrop_path
                                  : `https://image.tmdb.org/t/p/w500${cw.backdrop_path}`
                                : poster
                            }
                            alt={cwTitle}
                            loading="lazy"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = poster;
                            }}
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-cyan-400 text-gray-950 flex items-center justify-center">
                              <Play className="w-3 h-3 fill-gray-950 ml-0.5" />
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => removeContinueWatching(cw.id, e)}
                            title="Remove"
                            className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 hover:bg-rose-600 text-white flex items-center justify-center text-[10px]"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <div className="p-1.5">
                          <h4 className="font-bold text-[10px] sm:text-[11px] text-white truncate">{cwTitle}</h4>
                          <div className="flex items-center justify-between text-[9px] text-cyan-300/80 mt-0.5">
                            <span>S{cw.season || 1}:E{cw.episode || 1}</span>
                            <span className="text-slate-400">Resume</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Single Unified Filter & Category Sub-Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
              {/* Category-Specific Filter or Universal Filter Bar */}
              {activeCategory === 'anime' && !searchQuery.trim() ? (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs w-full">
                  {[
                    { id: 'all', label: 'All Anime' },
                    { id: 'hindi', label: '🇮🇳 Hindi Dubbed' },
                    { id: 'english', label: '🇬🇧 English Dubbed' },
                    { id: 'sub', label: '🇯🇵 Japanese Sub' },
                    { id: 'airing', label: '⚡ Airing Now' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setAnimeAudioFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border cursor-pointer ${
                        animeAudioFilter === f.id
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                          : 'bg-[#071128] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleManualAnimeSync}
                    disabled={isSyncingAnime}
                    className="ml-auto px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-bold flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncingAnime ? 'animate-spin' : ''}`} />
                    <span>{isSyncingAnime ? 'Syncing...' : syncStatus}</span>
                  </button>
                </div>
              ) : activeCategory === 'hollywood' && !searchQuery.trim() ? (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                  {[
                    { id: 'hollywood', label: '🎬 Hollywood Blockbusters' },
                    { id: 'hindi', label: '🇮🇳 Hollywood in Hindi Dub' },
                    { id: 'popular', label: '⭐ Popular Worldwide' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setMovieFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border cursor-pointer ${
                        movieFilter === f.id
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                          : 'bg-[#071128] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              ) : activeCategory === 'kdrama' && !searchQuery.trim() ? (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                  {[
                    { id: 'all', label: '🇰🇷 All K-Dramas' },
                    { id: 'hindi', label: '🇮🇳 Hindi Dubbed K-Dramas' }
                  ].map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setKdramaFilter(f.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border cursor-pointer ${
                        kdramaFilter === f.id
                          ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                          : 'bg-[#071128] text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
                  {[
                    { id: 'all', label: 'All' },
                    { id: 'hindi', label: '🇮🇳 Hindi Dubbed' },
                    { id: 'english', label: '🇺🇸 English' },
                    { id: 'multiaudio', label: '🎧 Multi-Audio' },
                    { id: 'movies', label: '🎬 Movies' },
                    { id: 'series', label: '📺 Series' },
                    { id: 'anime', label: '🌸 Anime' }
                  ].map((pill) => {
                    const isSelected = globalMediaFilter === pill.id;
                    return (
                      <button
                        key={pill.id}
                        type="button"
                        onClick={() => setGlobalMediaFilter(pill.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap border cursor-pointer ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                            : 'bg-[#071128] text-slate-300 border-white/10 hover:text-white'
                        }`}
                      >
                        {pill.label}
                      </button>
                    );
                  })}
                </div>
              )}

              {(Boolean(searchQuery.trim()) || activeCategory !== 'trending') && (
                <span className="text-[10px] text-slate-400 font-mono">
                  {displayedItems.length} titles • Page {page}
                </span>
              )}
            </div>

            {/* Loading Skeleton Grid (Compact 6-7 Columns) */}
            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                {[...Array(14)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl overflow-hidden bg-[#060d20] border border-white/5 flex flex-col"
                  >
                    <div className="aspect-[2/3] w-full skeleton-shimmer" />
                    <div className="p-2 space-y-1.5">
                      <div className="h-3 bg-white/10 rounded skeleton-shimmer w-3/4" />
                      <div className="h-2 bg-white/5 rounded skeleton-shimmer w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : error && items.length === 0 ? (
              <div className="py-16 text-center max-w-sm mx-auto px-4">
                <h3 className="text-sm font-bold text-white mb-1.5">Couldn't load catalog</h3>
                <p className="text-xs text-slate-400 mb-4">
                  Please check your connection and try again.
                </p>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry</span>
                </button>
              </div>
            ) : displayedItems.length > 0 ? (
              <>
                {!searchQuery.trim() && activeCategory === 'trending' && globalMediaFilter === 'all' ? (
                  <div className="space-y-4 sm:space-y-5">
                    {/* Shelf 1: MovieBox 2026 Picks & Multi-Dub */}
                    {shelvesData.moviebox?.length > 0 && (
                      <MediaShelf
                        title="MovieBox 2026 Picks & Multi-Dub"
                        icon={Film}
                        badge="4K HUB"
                        items={shelvesData.moviebox}
                        onPlay={setActiveMedia}
                        onOpenDetails={setDetailsItem}
                        isWatchlisted={isWatchlisted}
                        onToggleWatchlist={toggleWatchlist}
                        onViewAll={() => setActiveCategory('moviebox')}
                      />
                    )}

                    {/* Shelf 2: Trending Worldwide */}
                    <MediaShelf
                      title="Trending Worldwide"
                      icon={Flame}
                      badge="HOT"
                      items={items}
                      onPlay={setActiveMedia}
                      onOpenDetails={setDetailsItem}
                      isWatchlisted={isWatchlisted}
                      onToggleWatchlist={toggleWatchlist}
                    />

                    {/* Shelf 3: Popular Anime (Sub & Dub) */}
                    {shelvesData.popularAnime?.length > 0 && (
                      <MediaShelf
                        title="Popular Anime (Sub & Dub)"
                        icon={Sparkles}
                        badge="ANIME"
                        items={shelvesData.popularAnime}
                        onPlay={setActiveMedia}
                        onOpenDetails={setDetailsItem}
                        isWatchlisted={isWatchlisted}
                        onToggleWatchlist={toggleWatchlist}
                        onViewAll={() => setActiveCategory('anime')}
                      />
                    )}

                    {/* Shelf 4: Bollywood & Hindi Dubbed */}
                    {shelvesData.hindiDubbed?.length > 0 && (
                      <MediaShelf
                        title="Bollywood & Hindi Dubbed"
                        icon={Sparkles}
                        badge="HINDI DUB"
                        items={shelvesData.hindiDubbed}
                        onPlay={setActiveMedia}
                        onOpenDetails={setDetailsItem}
                        isWatchlisted={isWatchlisted}
                        onToggleWatchlist={toggleWatchlist}
                        onViewAll={() => setActiveCategory('hindi')}
                      />
                    )}

                    {/* Compact Franchise Chronological Timelines Strip */}
                    <div className="my-4 p-3.5 sm:p-4 rounded-xl bg-[#07112a] border border-purple-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-400/35 flex items-center justify-center text-purple-300 shrink-0">
                          <Milestone className="w-4 h-4" />
                        </div>
                        <div>
                          <h2 className="text-xs sm:text-sm font-black text-white">
                            Franchise Chronological Watch Orders (MCU, Spider-Verse, Star Wars, Naruto)
                          </h2>
                          <p className="text-[11px] text-slate-400">
                            Verified no-filler canon watch orders
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          soundFx.playClick?.();
                          setIsTimelineOpen(true);
                        }}
                        className="px-3.5 py-1.5 rounded-lg bg-purple-500 hover:bg-purple-400 text-slate-950 font-black text-xs cursor-pointer shrink-0"
                      >
                        Open Timelines →
                      </button>
                    </div>

                    {/* Compact 6-7 Column Explore Grid */}
                    <div className="pt-2">
                      <h2 className="text-sm sm:text-base font-extrabold text-white mb-2.5">
                        Explore All Trending Titles
                      </h2>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                        {displayedItems.map((item, idx) => (
                          <MediaCard
                            key={`home-grid-${item.id}-${idx}`}
                            item={item}
                            onPlay={setActiveMedia}
                            onOpenDetails={setDetailsItem}
                            isWatchlisted={isWatchlisted(item.id)}
                            onToggleWatchlist={toggleWatchlist}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Dedicated Category or Search Compact 6-7 Column Grid */
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                    {displayedItems.map((item, idx) => (
                      <MediaCard
                        key={`${item.id}-${idx}`}
                        item={item}
                        onPlay={setActiveMedia}
                        onOpenDetails={setDetailsItem}
                        isWatchlisted={isWatchlisted(item.id)}
                        onToggleWatchlist={toggleWatchlist}
                      />
                    ))}
                  </div>
                )}

                {/* Compact Pagination Button */}
                {activeCategory !== 'watchlist' && (
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#091534] hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-xs cursor-pointer disabled:opacity-50"
                    >
                      {loadingMore ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3.5 h-3.5" />
                          <span>Load More (Page {page + 1})</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="py-16 text-center">
                <Film className="w-8 h-8 text-cyan-400/60 mx-auto mb-2" />
                <h3 className="text-sm font-bold text-white mb-1">No titles found</h3>
                <p className="text-xs text-slate-400">
                  Try another search or switch category tabs above.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Lazy-Loaded Async Modals */}
      <Suspense fallback={null}>
        {activeMedia && (
          <ErrorBoundary inline>
            <PlayerModal
              key={activeMedia.id}
              item={activeMedia}
              preferredServerId={preferredServer}
              isHindiPreferred={
                activeCategory === 'hindi' ||
                (Boolean(searchQuery) && searchQuery.toLowerCase().includes('hindi')) ||
                activeMedia?.category === 'hindi' ||
                activeMedia?.isHindiDubbed === true ||
                activeMedia?.hasHindiDub === true ||
                (activeCategory === 'anime' && animeAudioFilter === 'hindi') ||
                (activeCategory === 'kdrama' && kdramaFilter === 'hindi') ||
                (activeCategory === 'hollywood' && movieFilter === 'hindi') ||
                globalMediaFilter === 'hindi'
              }
              onClose={() => setActiveMedia(null)}
            />
          </ErrorBoundary>
        )}

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          isMasterMode={isMasterMode}
          setIsMasterMode={setIsMasterMode}
          isStealthMode={isStealthMode}
          setIsStealthMode={setIsStealthMode}
          includeMature={includeMature}
          setIncludeMature={setIncludeMature}
          preferredServer={preferredServer}
          setPreferredServer={setPreferredServer}
          onClearWatchlist={clearWatchlist}
          onPlayMedia={setActiveMedia}
          onSelectCategory={(cat) => {
            setActiveCategory(cat);
            setSearchQuery('');
          }}
        />

        <IPhoneAppModal
          isOpen={isIPhoneModalOpen}
          onClose={() => setIsIPhoneModalOpen(false)}
        />

        <AndroidAppModal
          isOpen={isAndroidModalOpen}
          onClose={() => setIsAndroidModalOpen(false)}
        />

        <MovieStudioModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          onPlayMovie={(movie) => setActiveMedia(movie)}
          onMoviesChanged={() => setStudioVersion((v) => v + 1)}
        />

        {detailsItem && (
          <MediaDetailsModal
            item={detailsItem}
            onClose={() => setDetailsItem(null)}
            onPlay={(itemToPlay) => {
              setDetailsItem(null);
              setActiveMedia(itemToPlay);
            }}
            isWatchlisted={isWatchlisted}
            onToggleWatchlist={toggleWatchlist}
          />
        )}

        <SearchOverlay
          isOpen={isSearchOverlayOpen}
          onClose={() => setIsSearchOverlayOpen(false)}
          onPlay={(itemToPlay) => {
            setIsSearchOverlayOpen(false);
            setActiveMedia(itemToPlay);
          }}
          onOpenDetails={(itemToDetail) => {
            setIsSearchOverlayOpen(false);
            setDetailsItem(itemToDetail);
          }}
          isWatchlisted={isWatchlisted}
          onToggleWatchlist={toggleWatchlist}
          isMasterMode={isMasterMode}
          includeMature={includeMature}
        />

        <FranchiseTimelineModal
          isOpen={isTimelineOpen}
          onClose={() => setIsTimelineOpen(false)}
          onSelectMedia={(itemToPlay) => {
            setIsTimelineOpen(false);
            setActiveMedia(itemToPlay);
          }}
        />

        <WatchTogetherModal
          isOpen={isWatchTogetherOpen}
          onClose={() => setIsWatchTogetherOpen(false)}
          activeMedia={watchPartyTarget || activeMedia || heroItem}
          currentServer={SERVERS[0]}
          customMoviePool={items}
          onPlaySyncedMedia={(m) => {
            setWatchPartyTarget(m);
            setActiveMedia(m);
          }}
          onSyncState={(m) => {
            setWatchPartyTarget(m);
            if (activeMedia) {
              setActiveMedia(m);
            }
          }}
        />
      </Suspense>

      {/* Mobile Explore Bottom Sheet */}
      <MobileExploreSheet
        isOpen={isMobileExploreOpen}
        onClose={() => setIsMobileExploreOpen(false)}
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          setSearchQuery('');
        }}
        isMasterMode={isMasterMode}
        onOpenTimeline={() => setIsTimelineOpen(true)}
        onOpenSyncRoom={() => setIsWatchTogetherOpen(true)}
        onOpenStudio={() => setIsStudioOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAndroidModal={() => setIsAndroidModalOpen(true)}
        onOpenIPhoneModal={() => setIsIPhoneModalOpen(true)}
      />

      {/* Compact Mobile Bottom Navigation Bar (h-13) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#040a18]/95 backdrop-blur-lg border-t border-cyan-500/20 px-1.5 py-1 safe-bottom grid grid-cols-5 items-center">
        {[
          { id: 'trending', label: 'Home', icon: Flame },
          { id: 'moviebox', label: 'MovieBox', icon: Film },
          { id: 'livetv', label: 'Live TV', icon: Radio },
          { id: 'watchlist', label: 'Library', icon: FolderHeart }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id && !searchQuery.trim() && !isMobileExploreOpen;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                setIsMobileExploreOpen(false);
                setActiveCategory(tab.id);
                setSearchQuery('');
              }}
              className={`flex flex-col items-center justify-center min-h-[44px] rounded-lg gap-0.5 cursor-pointer ${
                isActive ? 'text-cyan-400 font-extrabold bg-cyan-500/10' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${tab.id === 'livetv' && isActive ? 'text-rose-400' : ''}`} />
              <span className="text-[10px] tracking-tight truncate">{tab.label}</span>
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            soundFx.playClick?.();
            setIsMobileExploreOpen((prev) => !prev);
          }}
          className={`flex flex-col items-center justify-center min-h-[44px] rounded-lg gap-0.5 cursor-pointer ${
            isMobileExploreOpen ? 'text-cyan-400 font-extrabold bg-cyan-500/10' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4 shrink-0" />
          <span className="text-[10px] tracking-tight">Explore</span>
        </button>
      </nav>

      {/* Desktop 3D Magnifying Floating Dock */}
      {!isStealthMode && !activeMedia && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 hidden md:block">
          <FloatingDock
            items={[
              {
                title: 'Home Premiere',
                icon: <Flame className="w-full h-full text-cyan-300" />,
                active: activeCategory === 'trending',
                onClick: () => { setActiveCategory('trending'); setSearchQuery(''); }
              },
              {
                title: 'MovieBox 4K Hub',
                icon: <Film className="w-full h-full text-emerald-300" />,
                active: activeCategory === 'moviebox',
                onClick: () => { setActiveCategory('moviebox'); setSearchQuery(''); }
              },
              {
                title: 'Anime (HI / EN / JA)',
                icon: <Sparkles className="w-full h-full text-purple-300" />,
                active: activeCategory === 'anime',
                onClick: () => { setActiveCategory('anime'); setSearchQuery(''); }
              },
              {
                title: 'Live TV & Random',
                icon: <Radio className="w-full h-full text-rose-400" />,
                active: activeCategory === 'livetv',
                onClick: () => { setActiveCategory('livetv'); setSearchQuery(''); }
              },
              {
                title: 'Watch Together',
                icon: <Users className="w-full h-full text-amber-300" />,
                active: isWatchTogetherOpen,
                onClick: () => setIsWatchTogetherOpen(true)
              },
              {
                title: 'Spotlight Search',
                icon: <Search className="w-full h-full text-sky-300" />,
                active: isSearchOverlayOpen,
                onClick: () => setIsSearchOverlayOpen(true)
              },
              {
                title: 'My Library',
                icon: <FolderHeart className="w-full h-full text-pink-300" />,
                active: activeCategory === 'watchlist',
                onClick: () => { setActiveCategory('watchlist'); setSearchQuery(''); }
              },
              {
                title: 'Settings & Vault',
                icon: <Settings className="w-full h-full text-cyan-200" />,
                active: isSettingsOpen,
                onClick: () => setIsSettingsOpen(true)
              }
            ]}
          />
        </div>
      )}

      {/* Interactive Furina Chibi Mascot Companion */}
      {!isStealthMode && !activeMedia && (
        <FurinaMascot onOpenSearch={() => setIsSearchOverlayOpen(true)} />
      )}
    </div>
  );
}
