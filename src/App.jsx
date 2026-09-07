import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaCard from './components/MediaCard';
import PlayerModal from './components/PlayerModal';
import SettingsModal from './components/SettingsModal';
import IPhoneAppModal from './components/IPhoneAppModal';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  fetchTrendingAll, 
  fetchHollywoodMovies, 
  fetchHindiMovies, 
  fetchTrendingSeries, 
  fetchAnime,
  fetchKDramas,
  fetchHorrorMovies,
  fetchMatureMovies,
  fetchEcchiAnime,
  searchContent 
} from './services/tmdb';
import { SERVERS } from './services/streaming';
import { Flame, Film, Tv, Sparkles, Heart, RefreshCw, Shield, Settings, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [animeAudioFilter, setAnimeAudioFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [heroItem, setHeroItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);
  
  // Settings & Secret Master Mode (Passcode: 2030)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isIPhoneModalOpen, setIsIPhoneModalOpen] = useState(false);
  const [isMasterMode, setIsMasterMode] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [includeMature, setIncludeMature] = useState(false);
  const [preferredServer, setPreferredServer] = useState(() => {
    try {
      const saved = localStorage.getItem('furina_moviebox_server');
      const validIds = SERVERS.map((s) => s.id);
      if (saved && validIds.includes(saved) && saved !== 'vidlink_hindi' && saved !== 'smashystream') {
        return saved;
      }
    } catch (e) {}
    return SERVERS[0]?.id || 'autoembed';
  });

  useEffect(() => {
    try {
      localStorage.setItem('furina_moviebox_server', preferredServer);
    } catch (e) {}
  }, [preferredServer]);

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

  const toggleWatchlist = (item) => {
    if (!item || !item.id) return;
    setWatchlist((prev) => {
      const arr = Array.isArray(prev) ? prev : [];
      const exists = arr.some((x) => x && x.id === item.id);
      if (exists) {
        return arr.filter((x) => x && x.id !== item.id);
      }
      return [item, ...arr];
    });
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    if (activeCategory === 'watchlist') {
      setItems([]);
      setHeroItem(null);
    }
  };

  const isWatchlisted = (id) => {
    if (!id || !Array.isArray(watchlist)) return false;
    return watchlist.some((x) => x && x.id === id);
  };

  // Helper function to fetch data for given category & page
  const fetchCategoryItems = async (cat, pageNum, query = '') => {
    if (query.trim()) {
      return await searchContent(query, pageNum, includeMature);
    }
    if (cat === 'trending') return await fetchTrendingAll(pageNum);
    if (cat === 'hollywood') return await fetchHollywoodMovies(pageNum);
    if (cat === 'hindi') return await fetchHindiMovies(pageNum);
    if (cat === 'series') return await fetchTrendingSeries(pageNum);
    if (cat === 'kdrama') return await fetchKDramas(pageNum);
    if (cat === 'horror') return await fetchHorrorMovies(pageNum);
    if (cat === 'anime') return await fetchAnime(pageNum, animeAudioFilter);
    if (cat === 'ecchi_anime' || cat === 'mature_anime') {
      if (!isMasterMode) return await fetchTrendingAll(pageNum);
      return await fetchEcchiAnime(pageNum);
    }
    if (cat === 'mature') return await fetchMatureMovies(pageNum);
    if (cat === 'watchlist') return watchlist;
    return [];
  };

  // Initial load when category or search changes
  useEffect(() => {
    setPage(1);
    setLoading(true);

    if (activeCategory === 'watchlist') {
      setItems(watchlist);
      setHeroItem(watchlist[0] || null);
      setLoading(false);
      return;
    }

    fetchCategoryItems(activeCategory, 1, searchQuery).then((results) => {
      setItems(results);
      if (results && results.length > 0) {
        setHeroItem(results[0]);
      } else {
        setHeroItem(null);
      }
      setLoading(false);
    });
  }, [activeCategory, searchQuery, animeAudioFilter, includeMature, isMasterMode, watchlist.length]);

  // Load More (Pagination)
  const handleLoadMore = async () => {
    if (loadingMore || activeCategory === 'watchlist') return;
    setLoadingMore(true);
    const nextPage = page + 1;
    const moreItems = await fetchCategoryItems(activeCategory, nextPage, searchQuery);
    if (moreItems && moreItems.length > 0) {
      setItems((prev) => [...prev, ...moreItems]);
      setPage(nextPage);
    }
    setLoadingMore(false);
  };

  return (
    <div className={`min-h-screen ${isStealthMode ? 'bg-[#080b11]' : 'bg-[#030712]'} text-white flex flex-col selection:bg-cyan-500 selection:text-gray-950 pb-20 lg:pb-8 relative overflow-hidden`}>
      
      {/* Background Ambient Hydro Glow Blobs */}
      <div className="fixed -top-40 left-1/4 w-[650px] h-[650px] bg-cyan-500/[0.07] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed top-1/3 -right-40 w-[550px] h-[550px] bg-blue-600/[0.06] rounded-full blur-[160px] pointer-events-none -z-10" />
      <div className="fixed -bottom-40 left-10 w-[600px] h-[600px] bg-indigo-600/[0.05] rounded-full blur-[160px] pointer-events-none -z-10" />
      
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
        {!searchQuery && activeCategory !== 'watchlist' && items && items.length > 0 && (
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

        {/* Section Header & Quick Filter Pills */}
        <div className="mb-6 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className={`w-3 h-3 rounded-full ${activeCategory === 'mature' ? 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)]' : 'bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]'}`} />
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white capitalize drop-shadow-sm">
                {searchQuery
                  ? `Results for "${searchQuery}"`
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
                  ? '🔞 Secret 18+ Anime Vault (Overflow, ComicFesta & Ecchi Uncut)'
                  : activeCategory === 'mature'
                  ? '🔞 18+ Mature & Uncut Cinema'
                  : '❤️ My Saved Watchlist'}
              </h2>
            </div>
            <span className="text-xs text-cyan-300/60 font-semibold bg-[#0a132b] px-3 py-1 rounded-full border border-cyan-500/15">
              {items.length} titles loaded (Page {page})
            </span>
          </div>

          {/* Quick Search & Filter Suggestions Chips */}
          {searchQuery && (
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

          {/* Anime Quick Sub / Dub Filter Chips (Zero 18+ Hanime in normal anime) */}
          {activeCategory === 'anime' && !searchQuery && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
              <span className="text-cyan-200/50 text-[11px] whitespace-nowrap font-medium">Anime Audio:</span>
              <button
                onClick={() => setAnimeAudioFilter('all')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border ${
                  animeAudioFilter === 'all'
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow'
                    : 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/25'
                }`}
              >
                <span>⭐</span>
                <span>All Popular Anime</span>
              </button>
              <button
                onClick={() => setAnimeAudioFilter('english')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border ${
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
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border ${
                  animeAudioFilter === 'hindi'
                    ? 'bg-amber-500 text-gray-950 border-amber-400 shadow'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <span>🇮🇳</span>
                <span>Hindi Dubbed Anime</span>
              </button>
              <button
                onClick={() => setAnimeAudioFilter('sub')}
                className={`px-3 py-1 rounded-full font-bold whitespace-nowrap transition flex items-center gap-1 border ${
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
        ) : items.length > 0 ? (
          <>
            {/* Media Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-5">
              {items.map((item, idx) => (
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
            <h3 className="text-base font-bold text-white mb-1">No titles found</h3>
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
              activeMedia?.category === 'hindi'
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

      {/* Mobile iOS Style Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#070d1e]/95 backdrop-blur-2xl border-t border-cyan-500/20 px-1 py-2 flex items-center justify-around shadow-[0_-5px_25px_rgba(0,0,0,0.7)]">
        {[
          { id: 'trending', label: 'Trending', icon: Flame },
          { id: 'hollywood', label: 'Movies', icon: Film },
          { id: 'hindi', label: 'Hindi', icon: Sparkles },
          { id: 'anime', label: 'Anime', icon: Sparkles },
          { id: 'mature', label: '18+ Cinema', icon: Flame },
          ...(isMasterMode ? [{ id: 'ecchi_anime', label: '18+ Hanime', icon: Flame }] : []),
          { id: 'watchlist', label: 'Saved', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id && !searchQuery;
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
