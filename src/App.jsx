import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import MediaCard from './components/MediaCard';
import PlayerModal from './components/PlayerModal';
import SettingsModal from './components/SettingsModal';
import { 
  fetchTrendingAll, 
  fetchHollywoodMovies, 
  fetchHindiMovies, 
  fetchTrendingSeries, 
  fetchAnime,
  fetchMatureMovies,
  searchContent 
} from './services/tmdb';
import { Flame, Film, Tv, Sparkles, Heart, RefreshCw, Shield, Settings, ChevronDown } from 'lucide-react';

export default function App() {
  const [activeCategory, setActiveCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState([]);
  const [heroItem, setHeroItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [activeMedia, setActiveMedia] = useState(null);
  
  // Settings & Secret Master Mode (Passcode: 2030)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMasterMode, setIsMasterMode] = useState(false);
  const [isStealthMode, setIsStealthMode] = useState(false);
  const [includeMature, setIncludeMature] = useState(false);
  const [preferredServer, setPreferredServer] = useState(() => {
    return localStorage.getItem('furina_moviebox_server') || 'vidlink_hd';
  });

  useEffect(() => {
    localStorage.setItem('furina_moviebox_server', preferredServer);
  }, [preferredServer]);

  const [watchlist, setWatchlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('furina_moviebox_watchlist')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('furina_moviebox_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  const toggleWatchlist = (item) => {
    setWatchlist((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      if (exists) {
        return prev.filter((x) => x.id !== item.id);
      }
      return [item, ...prev];
    });
  };

  const clearWatchlist = () => {
    setWatchlist([]);
    if (activeCategory === 'watchlist') {
      setItems([]);
      setHeroItem(null);
    }
  };

  const isWatchlisted = (id) => watchlist.some((x) => x.id === id);

  // Helper function to fetch data for given category & page
  const fetchCategoryItems = async (cat, pageNum, query = '') => {
    if (query.trim()) {
      return await searchContent(query, pageNum, includeMature);
    }
    if (cat === 'trending') return await fetchTrendingAll(pageNum);
    if (cat === 'hollywood') return await fetchHollywoodMovies(pageNum);
    if (cat === 'hindi') return await fetchHindiMovies(pageNum);
    if (cat === 'series') return await fetchTrendingSeries(pageNum);
    if (cat === 'anime') return await fetchAnime(pageNum);
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
  }, [activeCategory, searchQuery, includeMature, watchlist.length]);

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
    <div className={`min-h-screen ${isStealthMode ? 'bg-[#080b11]' : 'bg-[#050811]'} text-white flex flex-col selection:bg-cyan-500 selection:text-gray-950 pb-20 lg:pb-8`}>
      
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
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 flex-1">
        
        {/* Stealth Mode Indicator (Discreet banner) */}
        {isStealthMode && (
          <div className="mb-4 bg-slate-900/90 border border-slate-700/60 rounded-xl px-4 py-2 flex items-center justify-between text-xs text-slate-300">
            <span>🛡️ Stealth Mode Active: Neutral theme & Furina artwork hidden</span>
            <button 
              onClick={() => setIsStealthMode(false)}
              className="text-cyan-400 hover:underline text-[11px] font-semibold"
            >
              Restore Furina Theme
            </button>
          </div>
        )}

        {/* Featured Hero Banner */}
        {!searchQuery && activeCategory !== 'watchlist' && heroItem && (
          <HeroBanner
            item={heroItem}
            onPlay={setActiveMedia}
            isWatchlisted={isWatchlisted(heroItem.id)}
            onToggleWatchlist={toggleWatchlist}
          />
        )}

        {/* Section Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${activeCategory === 'mature' ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'bg-cyan-400 shadow-[0_0_8px_rgba(77,197,249,0.8)]'}`} />
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white capitalize">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : activeCategory === 'trending'
                ? '🔥 Trending Movies & Series'
                : activeCategory === 'hollywood'
                ? '🎬 Hollywood (English)'
                : activeCategory === 'hindi'
                ? '🇮🇳 Bollywood & Hindi Dubbed'
                : activeCategory === 'series'
                ? '📺 Latest Web Series'
                : activeCategory === 'anime'
                ? '✨ Anime & Animations'
                : activeCategory === 'mature'
                ? '🔞 18+ Mature & Uncut Cinema'
                : '❤️ My Saved Watchlist'}
            </h2>
          </div>
          <span className="text-xs text-cyan-300/50 font-medium">
            {items.length} titles loaded (Page {page})
          </span>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3 text-cyan-400">
            <RefreshCw className="w-8 h-8 animate-spin" />
            <p className="text-xs text-cyan-200/60 font-medium">Fetching 4K catalog...</p>
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
        <PlayerModal
          item={activeMedia}
          preferredServerId={preferredServer}
          onClose={() => setActiveMedia(null)}
        />
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
      />

      {/* Mobile iOS Style Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#070d1e]/90 backdrop-blur-xl border-t border-cyan-500/20 px-3 py-2 flex items-center justify-around">
        {[
          { id: 'trending', label: 'Trending', icon: Flame },
          { id: 'hollywood', label: 'Movies', icon: Film },
          { id: 'hindi', label: 'Hindi', icon: Sparkles },
          { id: 'series', label: 'Series', icon: Tv },
          ...(includeMature ? [{ id: 'mature', label: '18+', icon: Flame }] : []),
          { id: 'watchlist', label: 'Saved', icon: Heart },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id && !searchQuery;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveCategory(tab.id); setSearchQuery(''); }}
              className={`flex flex-col items-center gap-1 transition ${
                isActive ? 'text-cyan-400 font-bold scale-105' : 'text-cyan-200/50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] tracking-tight">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Mobile Settings Button */}
        <button
          onClick={() => setIsSettingsOpen(true)}
          className={`flex flex-col items-center gap-1 transition ${
            isMasterMode ? 'text-emerald-400 font-bold' : 'text-cyan-200/50'
          }`}
        >
          {isMasterMode ? <Shield className="w-5 h-5 text-emerald-400" /> : <Settings className="w-5 h-5" />}
          <span className="text-[10px] tracking-tight">{isMasterMode ? '2030' : 'Settings'}</span>
        </button>
      </nav>
    </div>
  );
}
