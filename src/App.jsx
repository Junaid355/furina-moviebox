import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Navbar, { HanimeIcon } from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaCard from './components/MediaCard';
import PlayerModal from './components/PlayerModal';
import SettingsModal, { getStoredSettings, applyThemeAndAppSettings } from './components/SettingsModal';
import IPhoneAppModal from './components/IPhoneAppModal';
import AndroidAppModal from './components/AndroidAppModal';
import MovieStudioModal, { getStoredStudioMovies } from './components/MovieStudioModal';
import ErrorBoundary from './components/ErrorBoundary';
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
  searchContent,
  deduplicateMedia,
  isHindiAvailable
} from './services/tmdb';
import { SERVERS } from './services/streaming';
import { Flame, Film, Tv, Sparkles, Heart, RefreshCw, Shield, Settings, ChevronDown, Clock, Play, X } from 'lucide-react';

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
  return items.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [animeAudioFilter, setAnimeAudioFilter] = useState('all');
  const [movieFilter, setMovieFilter] = useState('hollywood');
  const [kdramaFilter, setKdramaFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [items, setItems] = useState([]);
  const [heroItem, setHeroItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [page, setPage] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);

  const handleRetry = useCallback(() => {
    setError(null);
    setLoading(true);
    setRetryCount((prev) => prev + 1);
  }, []);

  // Debounce search query changes (immediate when cleared, 250ms when typing)
  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const [continueWatching, setContinueWatching] = useState(getContinueWatchingList);

  useEffect(() => {
    setContinueWatching(getContinueWatchingList());
  }, [activeMedia, activeCategory]);

  // Apply theme, accent, and appearance settings on mount & react to updates (Requirement 11)
  useEffect(() => {
    applyThemeAndAppSettings(getStoredSettings());
    const handleSettingsChange = (e) => {
      if (e.detail) applyThemeAndAppSettings(e.detail);
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

  // Settings & Secret Master Mode (Passcode: 2030)
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
      if (saved && validIds.includes(saved) && saved !== 'vidlink_hindi' && saved !== 'smashystream' && saved !== 'autoembed') {
        return saved;
      }
    } catch (e) {}
    return 'vidsrc_in';
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
        if (localStorage.getItem('furina_master_mode') === 'true' && !isMasterMode) {
          setIsMasterMode(true);
        }
      } catch {}
    };
    window.addEventListener('storage', syncMasterMode);
    const interval = setInterval(syncMasterMode, 200);
    return () => {
      window.removeEventListener('storage', syncMasterMode);
      clearInterval(interval);
    };
  }, [isMasterMode]);

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

  const isWatchlisted = useCallback((id) => {
    if (!id) return false;
    return watchlistIdSet.has(id);
  }, [watchlistIdSet]);

  // Request sequence ref for stale-request protection
  const requestSeqRef = useRef(0);

  // Helper function to fetch data for given category & page
  const fetchCategoryItems = async (cat, pageNum, query = '') => {
    if (query && query.trim()) {
      return await searchContent(query.trim(), pageNum, includeMature);
    }
    if (cat === 'trending') return await fetchTrendingAll(pageNum);
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

  // Initial load when category or search changes (with stale-request protection)
  useEffect(() => {
    const currentSeq = ++requestSeqRef.current;
    setPage(1);
    setLoading(true);
    setError(null);

    if (activeCategory === 'watchlist') {
      const cleanWatchlist = deduplicateMedia(watchlist);
      setItems(cleanWatchlist);
      setHeroItem(cleanWatchlist[0] || null);
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

    fetchCategoryItems(activeCategory, 1, debouncedQuery)
      .then((results) => {
        // Discard stale responses from previously triggered fetches
        if (currentSeq !== requestSeqRef.current) return;
        const uniqueResults = deduplicateMedia(results);
        setItems(uniqueResults);
        if (uniqueResults && uniqueResults.length > 0) {
          setHeroItem(uniqueResults[0]);
          setError(null);
        } else {
          setHeroItem(null);
          // If no query and not watchlist/studio and returned empty array, mark error for retry
          if (!debouncedQuery && activeCategory !== 'watchlist' && activeCategory !== 'studio') {
            setError("Couldn't load movies");
          }
        }
        setLoading(false);
      })
      .catch(() => {
        if (currentSeq !== requestSeqRef.current) return;
        setError("Couldn't load movies");
        setLoading(false);
      });
  }, [activeCategory, debouncedQuery, animeAudioFilter, movieFilter, kdramaFilter, includeMature, isMasterMode, watchlist.length, studioVersion, retryCount]);

  // Load More (Pagination) with strict dual deduplication
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

  const [globalMediaFilter, setGlobalMediaFilter] = useState('all');

  const displayedItems = useMemo(() => {
    if (globalMediaFilter === 'all') return items;
    if (globalMediaFilter === 'hindi') return items.filter((item) => isHindiAvailable(item));
    if (globalMediaFilter === 'english') return items.filter((item) => item.original_language !== 'hi' || item.languages?.en);
    if (globalMediaFilter === 'japanese') return items.filter((item) => item.original_language === 'ja' || item.category === 'anime' || item.languages?.ja);
    if (globalMediaFilter === 'multiaudio') return items.filter((item) => (isHindiAvailable(item) && item.original_language !== 'hi') || item.languages || (item.category === 'anime' && isHindiAvailable(item)));
    if (globalMediaFilter === 'subtitles') return items.filter((item) => item.subtitles?.length > 0 || item.category === 'anime' || item.languages);
    if (globalMediaFilter === 'movies') return items.filter((item) => item.media_type === 'movie' || (!item.first_air_date && item.category !== 'series'));
    if (globalMediaFilter === 'anime') return items.filter((item) => item.category === 'anime' || item.original_language === 'ja');
    if (globalMediaFilter === 'series') return items.filter((item) => item.media_type === 'tv' || Boolean(item.first_air_date) || item.category === 'series');
    return items;
  }, [items, globalMediaFilter]);

  // Mobile & Desktop Keyboard and Back-Navigation Protection (Requirement 12, 21, 24)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable;

      // Prevent accidental browser back-navigation on Backspace outside of inputs
      if (e.key === 'Backspace' && !isInput) {
        e.preventDefault();
        return;
      }

      // Never intercept hotkeys when typing into inputs!
      if (isInput) return;

      // ESC: Exit fullscreen / close open menus and modals (Requirement 24)
      if (e.key === 'Escape') {
        if (isSettingsOpen) { setIsSettingsOpen(false); return; }
        if (isStudioOpen) { setIsStudioOpen(false); return; }
        if (isIPhoneModalOpen) { setIsIPhoneModalOpen(false); return; }
        if (isAndroidModalOpen) { setIsAndroidModalOpen(false); return; }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isStudioOpen, isIPhoneModalOpen, isAndroidModalOpen, activeMedia]);

  return (
    <div className={`min-h-screen ${isStealthMode ? 'bg-[#080b11]' : 'bg-[#030712]'} text-white flex flex-col selection:bg-cyan-500 selection:text-gray-950 pb-20 lg:pb-8 relative overflow-hidden`}>
      
      {/* Background Ambient Hydro Glow Blobs (GPU Layered) */}
      <div className="fixed -top-40 left-1/4 w-[650px] h-[650px] bg-cyan-500/[0.07] rounded-full blur-[160px] pointer-events-none -z-10 transform-gpu" style={{ transform: 'translateZ(0)' }} />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] bg-blue-600/[0.06] rounded-full blur-[160px] pointer-events-none -z-10 transform-gpu" style={{ transform: 'translateZ(0)' }} />
      <div className="fixed -bottom-40 left-10 w-[600px] h-[600px] bg-indigo-600/[0.05] rounded-full blur-[160px] pointer-events-none -z-10 transform-gpu" style={{ transform: 'translateZ(0)' }} />
      
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
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1 relative z-10">
        
        {/* Stealth Mode Indicator */}
        {isStealthMode && (
          <div className="mb-5 bg-slate-900/90 border border-slate-700/60 rounded-2xl px-5 py-2.5 flex items-center justify-between text-xs text-slate-300 shadow-md">
            <span>🛡️ Stealth Mode Active: Neutral cinema theme & Furina branding disguised</span>
            <button 
              onClick={() => setIsStealthMode(false)}
              className="text-cyan-400 hover:underline text-[11px] font-bold"
            >
              Restore Furina Theme
            </button>
          </div>
        )}

        {/* Featured Hero Carousel Banner */}
        {!searchQuery.trim() && activeCategory !== 'watchlist' && items && items.length > 0 && (
          <ErrorBoundary inline>
            <HeroBanner
              items={items}
              item={heroItem}
              onPlay={setActiveMedia}
              isWatchlisted={isWatchlisted}
              onToggleWatchlist={toggleWatchlist}
            />
          </ErrorBoundary>
        )}

        {/* Continue Watching Section */}
        {!searchQuery.trim() && activeCategory === 'trending' && continueWatching && continueWatching.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-black text-white">Continue Watching</h3>
              </div>
              <span className="text-[11px] text-cyan-200/60 font-medium">
                {continueWatching.length} in progress
              </span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              {continueWatching.map((cw) => {
                const cwTitle = cw.title || cw.name || 'Untitled';
                const poster = cw.poster_path ? (cw.poster_path.startsWith('http') ? cw.poster_path : `https://image.tmdb.org/t/p/w500${cw.poster_path}`) : './icon-512.png';
                return (
                  <div
                    key={cw.id}
                    onClick={() => setActiveMedia(cw)}
                    className="relative flex-shrink-0 w-36 sm:w-44 bg-[#081534] border border-cyan-500/30 hover:border-cyan-400 rounded-xl overflow-hidden cursor-pointer group transition shadow-md"
                  >
                    <div className="aspect-[16/10] w-full bg-[#050c20] relative overflow-hidden">
                      <img
                        src={cw.backdrop_path ? (cw.backdrop_path.startsWith('http') ? cw.backdrop_path : `https://image.tmdb.org/t/p/w500${cw.backdrop_path}`) : poster}
                        alt={cwTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        onError={(e) => { e.currentTarget.src = poster; }}
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full bg-cyan-400 text-gray-950 flex items-center justify-center shadow-md transform scale-90 group-hover:scale-100 transition">
                          <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
                        </div>
                      </div>
                      <button
                        onClick={(e) => removeContinueWatching(cw.id, e)}
                        title="Remove from Continue Watching"
                        className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center text-xs transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="p-2">
                      <h4 className="font-bold text-xs text-white truncate">{cwTitle}</h4>
                      <div className="flex items-center justify-between text-[10px] text-cyan-300/80 mt-1">
                        <span className="font-bold bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300">
                          S{cw.season || 1}:E{cw.episode || 1}
                        </span>
                        <span className="text-slate-400">Resume ▶</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Section Header & Quick Filter Pills */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${activeCategory === 'mature' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]'}`} />
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize drop-shadow-sm">
                {searchQuery.trim()
                  ? `Results for "${searchQuery.trim()}"`
                  : activeCategory === 'trending'
                  ? '🔥 Trending Worldwide (Movies & Series)'
                  : activeCategory === 'hollywood'
                  ? '🎬 Hollywood Cinema (English)'
                  : activeCategory === 'hindi'
                  ? '🇮🇳 Bollywood & Hindi Dubbed Blockbusters'
                  : activeCategory === 'series'
                  ? '📺 Top Global Web Series'
                  : activeCategory === 'kdrama'
                  ? '🇰🇷 Top Korean Dramas (K-Drama)'
                  : activeCategory === 'horror'
                  ? '👻 Horror & Supernatural Thrillers'
                  : activeCategory === 'anime'
                  ? '🌸 Anime & Japanese Animations (Sub/Dub)'
                  : activeCategory === 'ecchi_anime'
                  ? '🔞 Hanime Vault (Exclusive Uncut Collection)'
                  : activeCategory === 'mature'
                  ? '🎬 Master Cinema Vault (Uncut Cinema)'
                  : '❤️ My Saved Watchlist'}
              </h1>
            </div>
            <span className="text-xs text-cyan-300/60 font-semibold bg-[#0a132b] px-3 py-1 rounded-full border border-cyan-500/15">
              {items.length} titles loaded (Page {page})
            </span>
          </div>

          {/* Quick Search & Filter Suggestions Chips */}
          {searchQuery.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-cyan-200/50 text-[11px] whitespace-nowrap font-medium">Quick Filters:</span>
              <button
                onClick={() => setSearchQuery(searchQuery.replace(/\s*hindi\s*/gi, '').trim() + ' Hindi')}
                className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold whitespace-nowrap hover:bg-amber-500/25 transition flex items-center gap-1"
              >
                <span>🇮🇳</span>
                <span>Search in Hindi Dubbed</span>
              </button>
              <button
                onClick={() => setSearchQuery(searchQuery.replace(/\s*hindi\s*/gi, '').trim())}
                className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold whitespace-nowrap hover:bg-cyan-500/25 transition"
              >
                Original Version
              </button>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('hindi'); }}
                className="px-3 py-1 rounded-full bg-[#0c1836] border border-cyan-500/20 text-cyan-200/70 font-medium whitespace-nowrap hover:text-white transition"
              >
                Browse All Bollywood / Hindi
              </button>
            </div>
          )}

          {/* Anime Quick Sub / Dub Filter Chips (Zero Hanime in normal anime) */}
          {activeCategory === 'anime' && !searchQuery.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-cyan-200/50 text-[11px] whitespace-nowrap font-medium">Anime Audio:</span>
              <button
                onClick={() => setAnimeAudioFilter('all')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  animeAudioFilter === 'all'
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                }`}
              >
                <span>⭐</span>
                <span>All Anime</span>
              </button>
              <button
                onClick={() => setAnimeAudioFilter('english')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  animeAudioFilter === 'english'
                    ? 'bg-blue-500 text-white border-blue-400 shadow'
                    : 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                }`}
              >
                <span>🎙️</span>
                <span>English Dubbed</span>
              </button>
              <button
                onClick={() => setAnimeAudioFilter('hindi')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  animeAudioFilter === 'hindi'
                    ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] font-black'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <span>🇮🇳</span>
                <span>Studio Hindi Dubs</span>
              </button>
              <button
                onClick={() => setAnimeAudioFilter('sub')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  animeAudioFilter === 'sub'
                    ? 'bg-purple-500 text-white border-purple-400 shadow'
                    : 'bg-purple-500/15 border-purple-500/40 text-purple-300 hover:bg-purple-500/25'
                }`}
              >
                <span>🇯🇵</span>
                <span>Japanese Subbed</span>
              </button>
            </div>
          )}

          {/* Hindi Dubbed & Bollywood Quick Filters */}
          {activeCategory === 'hindi' && !searchQuery.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-amber-300/70 text-[11px] whitespace-nowrap font-medium">Audio Collection:</span>
              <button
                onClick={() => { setSearchQuery(''); }}
                className="px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border bg-amber-500 text-gray-950 border-amber-400 shadow cursor-pointer"
              >
                <span>🇮🇳</span>
                <span>All Bollywood & Hindi Dubbed</span>
              </button>
              <button
                onClick={() => setSearchQuery('Hindi Dubbed')}
                className="px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25 cursor-pointer"
              >
                <span>🎬</span>
                <span>Hollywood in Hindi Dub</span>
              </button>
              <button
                onClick={() => { setActiveCategory('anime'); setAnimeAudioFilter('hindi'); }}
                className="px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25 cursor-pointer"
              >
                <span>🌸</span>
                <span>Hindi Anime (Naruto, DBZ, Doraemon)</span>
              </button>
            </div>
          )}

          {/* Hollywood & Movies Dedicated Tabs */}
          {activeCategory === 'hollywood' && !searchQuery.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-cyan-200/50 text-[11px] whitespace-nowrap font-medium">Movie Curation:</span>
              <button
                onClick={() => setMovieFilter('hollywood')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  movieFilter === 'hollywood'
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                }`}
              >
                <span>🎬</span>
                <span>Hollywood Blockbusters</span>
              </button>
              <button
                onClick={() => setMovieFilter('hindi')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  movieFilter === 'hindi'
                    ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] font-black'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <span>🇮🇳</span>
                <span>Hollywood Hindi Dubs</span>
              </button>
              <button
                onClick={() => setMovieFilter('popular')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  movieFilter === 'popular'
                    ? 'bg-blue-500 text-white border-blue-400 shadow'
                    : 'bg-blue-500/15 border-blue-500/40 text-blue-300 hover:bg-blue-500/25'
                }`}
              >
                <span>⭐</span>
                <span>Popular Movies</span>
              </button>
            </div>
          )}

          {/* K-Drama Quick Filters */}
          {activeCategory === 'kdrama' && !searchQuery.trim() && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-cyan-200/50 text-[11px] whitespace-nowrap font-medium">K-Drama Audio:</span>
              <button
                onClick={() => setKdramaFilter('all')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  kdramaFilter === 'all'
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                }`}
              >
                <span>🇰🇷</span>
                <span>All K-Dramas</span>
              </button>
              <button
                onClick={() => setKdramaFilter('hindi')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border cursor-pointer ${
                  kdramaFilter === 'hindi'
                    ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)] font-black'
                    : 'bg-amber-500/15 border-amber-500/30 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <span>🇮🇳</span>
                <span>Hindi Dubbed K-Dramas (Squid Game, All of Us Are Dead)</span>
              </button>
            </div>
          )}
        </div>

        {/* Universal Multi-Language & Media Filter Bar (Requirement 9) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs mb-4">
          {[
            { id: 'all', label: 'All' },
            { id: 'hindi', label: '🇮🇳 Hindi Dubbed', highlight: 'amber' },
            { id: 'english', label: '🇺🇸 English' },
            { id: 'japanese', label: '🇯🇵 Japanese' },
            { id: 'multiaudio', label: '🎧 Multi-Audio' },
            { id: 'subtitles', label: '💬 Subtitles' },
            { id: 'movies', label: '🎬 Movies' },
            { id: 'anime', label: '🌸 Anime' },
            { id: 'series', label: '📺 Series' }
          ].map((pill) => {
            const isSelected = globalMediaFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setGlobalMediaFilter(pill.id)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border flex items-center gap-1 cursor-pointer text-xs ${
                  isSelected
                    ? pill.id === 'hindi'
                      ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black'
                      : 'bg-gradient-to-r from-cyan-500 to-blue-600 text-gray-950 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] font-black'
                    : pill.id === 'hindi'
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                    : 'bg-[#0a132b] text-slate-300 border-cyan-500/20 hover:bg-white/10 hover:text-white'
                }`}
              >
                <span>{pill.label}</span>
              </button>
            );
          })}
        </div>

        {/* Skeleton Shimmer Loading Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden glass-card flex flex-col animate-pulse">
                <div className="aspect-[2/3] w-full skeleton-shimmer" />
                <div className="p-3 bg-[#050b1d] border-t border-white/[0.04] space-y-2">
                  <div className="h-3.5 bg-white/10 rounded-md skeleton-shimmer w-3/4" />
                  <div className="h-2.5 bg-white/5 rounded-md skeleton-shimmer w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : error && items.length === 0 ? (
          /* Error State with Retry */
          <div className="py-24 text-center max-w-md mx-auto px-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400 shadow-[0_0_25px_rgba(244,63,94,0.2)]">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mb-2">Couldn't load movies</h3>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Unable to reach media catalog servers. Please check your internet connection and try again.
            </p>
            <button
              onClick={handleRetry}
              className="px-6 py-2.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold text-xs flex items-center gap-2 mx-auto transition shadow-[0_0_15px_rgba(56,189,248,0.4)] cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        ) : displayedItems.length > 0 ? (
          <>
            {/* Media Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {displayedItems.map((item, idx) => (
                <MediaCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  onPlay={setActiveMedia}
                  isWatchlisted={isWatchlisted(item.id)}
                  onToggleWatchlist={toggleWatchlist}
                />
              ))}
            </div>

            {/* Pagination: Load More Titles */}
            {activeCategory !== 'watchlist' && (
              <div className="mt-10 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#0d1c44] hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 font-bold text-sm shadow-[0_0_20px_rgba(77,197,249,0.2)] transition transform hover:scale-105 active:scale-95 disabled:opacity-50"
                >
                  {loadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Loading more titles...
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Load More Titles (Page {page + 1})
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          /* Empty State */
          <div className="py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-[#0c1938] border border-cyan-500/20 flex items-center justify-center mx-auto mb-3 text-cyan-400">
              <Film className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">No movies found</h3>
            <p className="text-xs text-cyan-200/50 max-w-sm mx-auto">
              Try searching for another title or change category.
            </p>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {activeMedia && (
        <ErrorBoundary inline>
          <PlayerModal
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
              (activeCategory === 'hollywood' && movieFilter === 'hindi')
            }
            onClose={() => setActiveMedia(null)}
          />
        </ErrorBoundary>
      )}

      {/* Settings & Secret Master Vault Modal (Passcode: 2030) */}
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
        onSelectCategory={(cat) => { setActiveCategory(cat); setSearchQuery(''); }}
      />

      {/* iPhone & iPad Installation & Zero-Ads Guide Modal */}
      <IPhoneAppModal
        isOpen={isIPhoneModalOpen}
        onClose={() => setIsIPhoneModalOpen(false)}
      />

      {/* Android Native PWA & APK Installation Modal */}
      <AndroidAppModal
        isOpen={isAndroidModalOpen}
        onClose={() => setIsAndroidModalOpen(false)}
      />

      {/* Furina Movie Studio & Creator Modal */}
      <MovieStudioModal
        isOpen={isStudioOpen}
        onClose={() => setIsStudioOpen(false)}
        onPlayMovie={(movie) => setActiveMedia(movie)}
        onMoviesChanged={() => setStudioVersion((v) => v + 1)}
      />

      {/* Mobile iOS Style Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#070d1e]/95 backdrop-blur-2xl border-t border-cyan-500/20 px-1 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.7)]">
        {[
          { id: 'trending', label: 'Trending', icon: Flame },
          { id: 'hollywood', label: 'Movies', icon: Film },
          { id: 'hindi', label: 'Hindi', icon: Sparkles },
          { id: 'anime', label: 'Anime', icon: Sparkles },
          { id: 'studio', label: 'Studio', icon: Film },
          ...(isMasterMode ? [
            { id: 'mature', label: 'Uncut', icon: Flame },
            { id: 'ecchi_anime', label: 'Hanime', icon: HanimeIcon }
          ] : []),
          { id: 'watchlist', label: 'Saved', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id && !searchQuery.trim();
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveCategory(tab.id); setSearchQuery(''); }}
              className={`flex flex-col items-center gap-1 transition active:scale-95 ${
                isActive ? 'text-cyan-400 font-bold scale-105' : 'text-cyan-200/50 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-[9px] sm:text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Mobile Settings Button - Secret code hidden */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex flex-col items-center gap-1 transition active:scale-95 ${
            isMasterMode ? 'text-emerald-400 font-bold' : 'text-cyan-200/50 hover:text-white'
          }`}
        >
          {isMasterMode ? <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Settings className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span className="text-[9px] sm:text-[10px] tracking-tight">{isMasterMode ? 'VIP' : 'Settings'}</span>
        </button>
      </nav>
    </div>
  );
}
