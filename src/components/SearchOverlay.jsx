import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Flame, Sparkles, Film, Tv, Clock, Star, 
  ChevronRight, ArrowRight, Trash2, Filter 
} from 'lucide-react';
import { searchContent, isHindiAvailable } from '../services/tmdb';
import { resolvePosterUrl } from '../services/contentModel';

const RECENT_SEARCHES_KEY = 'furina_recent_searches';

export default function SearchOverlay({ 
  isOpen, 
  onClose, 
  onPlay, 
  isMasterMode, 
  includeMature 
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'movie' | 'tv' | 'anime' | 'hindi'
  const [sortBy, setSortBy] = useState('popularity'); // 'popularity' | 'rating' | 'year'

  const [recentSearches, setRecentSearches] = useState(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      return saved ? JSON.parse(saved) : ['Deadpool', 'Naruto', 'House of the Dragon', 'Solo Leveling'];
    } catch {
      return ['Deadpool', 'Naruto', 'House of the Dragon', 'Solo Leveling'];
    }
  });

  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const saveRecentSearch = (text) => {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {}
  };

  // Perform search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const data = await searchContent(query.trim(), 1, includeMature);
        if (!isCancelled) {
          setResults(Array.isArray(data) ? data : []);
          saveRecentSearch(query.trim());
        }
      } catch {
        if (!isCancelled) setResults([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [query, includeMature]);

  // Filter and Sort results
  const processedResults = results.filter((item) => {
    if (!item) return false;
    if (filterType === 'movie') return item.media_type === 'movie' || item.type === 'movie';
    if (filterType === 'tv') return item.media_type === 'tv' || item.type === 'tv';
    if (filterType === 'anime') return item.isAnime === true || item.category === 'anime' || item.original_language === 'ja';
    if (filterType === 'hindi') return isHindiAvailable(item) || item.isHindiDubbed;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.vote_average || 0) - (a.vote_average || 0);
    if (sortBy === 'year') {
      const yearA = parseInt(String(a.release_date || a.first_air_date || '0').substring(0, 4)) || 0;
      const yearB = parseInt(String(b.release_date || b.first_air_date || '0').substring(0, 4)) || 0;
      return yearB - yearA;
    }
    return (b.popularity || 0) - (a.popularity || 0);
  });

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col bg-black/85 backdrop-blur-2xl animate-fade-in"
      onClick={onClose}
    >
      {/* Top Search Input Bar */}
      <div 
        className="w-full border-b border-cyan-500/20 bg-[#060b1c]/95 p-3 sm:p-5 flex flex-col gap-3 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto w-full flex items-center gap-3">
          <div className="relative flex-1 flex items-center">
            <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search 10,000+ movies, anime, series, & Hindi dubs..."
              className="w-full bg-[#08122c] border border-cyan-500/30 rounded-2xl pl-11 pr-10 py-3 text-sm sm:text-base text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition shadow-inner"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs sm:text-sm font-bold transition border border-white/10 shrink-0"
          >
            Cancel
          </button>
        </div>

        {/* Filter Pills & Sorting */}
        <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'all', label: 'All Media' },
              { id: 'movie', label: '🎬 Movies' },
              { id: 'tv', label: '📺 Series' },
              { id: 'anime', label: '🌸 Anime' },
              { id: 'hindi', label: '🇮🇳 Hindi Dubbed' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1 rounded-lg font-bold transition border ${
                  filterType === f.id
                    ? 'bg-cyan-500 text-gray-950 border-cyan-300 shadow-sm'
                    : 'bg-[#08122c] text-cyan-200/70 border-cyan-500/30 hover:bg-white/10 hover:text-white'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <span className="text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-[#08122c] border border-cyan-500/30 rounded-lg px-2 py-0.5 text-cyan-300 text-xs focus:outline-none"
            >
              <option value="popularity">Popularity</option>
              <option value="rating">Rating</option>
              <option value="year">Release Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Results or Recent Searches Area */}
      <div 
        className="flex-1 overflow-y-auto p-4 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto w-full">
          {!query.trim() ? (
            /* Recent Searches & Suggested Trending */
            <div className="space-y-6 pt-2">
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3.5 py-1.5 rounded-full bg-[#08122c] hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-xs text-white font-medium transition"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Discovery Suggestions */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Trending Discoveries</span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Deadpool & Wolverine', 'House of the Dragon', 'Spider-Man', 'Attack on Titan', 'Solo Leveling', 'Jujutsu Kaisen', 'Demon Slayer', 'Avengers: Endgame'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setQuery(s)}
                      className="px-3 py-1.5 rounded-full bg-cyan-950/40 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400 text-xs text-cyan-200 font-medium transition flex items-center gap-1.5"
                    >
                      <span>🔥</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : loading ? (
            /* Loading State */
            <div className="py-20 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-cyan-300/80">Searching library for "{query}"...</p>
            </div>
          ) : processedResults.length === 0 ? (
            /* Empty State */
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-bold text-white">No titles matched "{query}"</p>
              <p className="text-xs text-slate-400">Try searching for a different keyword or browse our curated categories.</p>
              <div className="pt-4 flex items-center justify-center gap-2">
                <button
                  onClick={() => setQuery('Deadpool')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold"
                >
                  Try "Deadpool"
                </button>
                <button
                  onClick={() => setQuery('One Piece')}
                  className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold"
                >
                  Try "One Piece"
                </button>
              </div>
            </div>
          ) : (
            /* Results Grid */
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {processedResults.map((item) => {
                const title = item.title || item.name || 'Untitled';
                const year = String(item.release_date || item.first_air_date || '').substring(0, 4);
                const isHindi = isHindiAvailable(item);
                const isAnime = item.isAnime || item.original_language === 'ja';

                return (
                  <div
                    key={`search-res-${item.id}`}
                    onClick={() => {
                      onClose();
                      onPlay(item);
                    }}
                    className="group relative rounded-xl overflow-hidden glass-card cursor-pointer flex flex-col transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/50"
                  >
                    <div className="relative aspect-[2/3] w-full bg-[#060c1d] overflow-hidden">
                      <img
                        src={resolvePosterUrl(item.poster_path, 'w342')}
                        alt={title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = './icon-512.png';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                        {isHindi && (
                          <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-[8.5px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            🇮🇳 HINDI
                          </span>
                        )}
                        {isAnime && (
                          <span className="bg-indigo-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            ANIME
                          </span>
                        )}
                      </div>
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 text-[9.5px] font-bold text-amber-400 border border-white/10">
                        <Star className="w-3 h-3 fill-amber-400" />
                        <span>{(item.vote_average || 7.5).toFixed ? item.vote_average.toFixed(1) : item.vote_average}</span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-[#070e24] flex flex-col justify-between flex-1">
                      <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-cyan-300 transition">
                        {title}
                      </h4>
                      <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
                        <span>{year || '2024'}</span>
                        <span className="text-cyan-400/80 font-medium">
                          {item.media_type === 'tv' ? 'Series' : 'Movie'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
