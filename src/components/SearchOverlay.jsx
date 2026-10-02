import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, X, Flame, Sparkles, Film, Tv, Clock, Star, 
  ChevronRight, ArrowRight, Trash2, Filter, Play, Compass
} from 'lucide-react';
import { searchContent, isHindiAvailable } from '../services/tmdb';
import { resolvePosterUrl } from '../services/contentModel';
import soundFx from '../services/soundFx';
import { Spotlight } from './ui/spotlight';
import { BorderBeam } from './ui/border-beam';
import { SparklesCore } from './ui/sparkles';

const RECENT_SEARCHES_KEY = 'furina_recent_searches';

const SUGGESTED_QUICK_TAGS = [
  'Deadpool & Wolverine', 'Naruto', 'House of the Dragon', 
  'Solo Leveling', 'Demon Slayer', 'Spider-Man', 'Attack on Titan', 'Stree 2'
];

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
      soundFx.playSearchBeam();
      setTimeout(() => inputRef.current?.focus(), 80);
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
    soundFx.playClick();
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
    }, 200);

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
      if (e.key === 'Escape' && isOpen) {
        soundFx.playModalClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-start p-2 sm:p-6 md:p-10 bg-black/85 backdrop-blur-2xl animate-fade-in overflow-y-auto"
      onClick={() => {
        soundFx.playModalClose();
        onClose();
      }}
    >
      {/* 3D Spotlight Beam */}
      <Spotlight className="-top-40 left-1/4" fill="rgba(56, 189, 248, 0.35)" />

      {/* Main 3D Card Window */}
      <div 
        className="relative w-full max-w-4xl rounded-3xl bg-[#060e24]/95 border border-cyan-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_50px_rgba(56,189,248,0.25)] flex flex-col overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ perspective: '1200px' }}
      >
        <BorderBeam size={220} duration={10} colorFrom="#38bdf8" colorTo="#2563eb" borderWidth={1.5} />

        {/* Header with Furina Chibi Mascot */}
        <div className="border-b border-cyan-500/20 bg-[#08122c]/90 p-4 sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="relative w-9 h-9 rounded-full overflow-hidden border border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.6)] shrink-0">
                <img src="./furina_chibi.gif" alt="Furina" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                    3D Spotlight Search
                  </h2>
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    Fontaine Hub
                  </span>
                </div>
                <p className="text-[10px] text-cyan-200/60 hidden sm:block">
                  Search across Hollywood, Hindi dubs, anime series, and 4K cinema
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block text-[10px] font-mono px-2 py-1 rounded-md bg-white/5 border border-white/10 text-slate-300">
                ESC to close
              </span>
              <button
                onClick={() => {
                  soundFx.playModalClose();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
                title="Close (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative flex items-center mt-1">
            <Search className="w-5 h-5 text-cyan-400 absolute left-3.5 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              placeholder="Search 10,000+ movies, anime, series, & Hindi dubs..."
              style={{ touchAction: 'manipulation' }}
              className="w-full bg-[#050b1a] border border-cyan-500/40 rounded-2xl pl-11 pr-11 py-3 text-sm sm:text-base text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition shadow-inner font-medium"
            />
            {query && (
              <button
                onClick={() => {
                  soundFx.playClick();
                  setQuery('');
                }}
                className="absolute right-3.5 p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer"
                title="Clear query"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filter Pills & Sorting */}
          <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
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
                  onClick={() => {
                    soundFx.playClick();
                    setFilterType(f.id);
                  }}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition border cursor-pointer ${
                    filterType === f.id
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)] scale-105'
                      : 'bg-[#050b1a] text-cyan-200/70 border-cyan-500/30 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 text-slate-300 text-xs font-semibold">
              <span className="text-[10px] text-cyan-300 uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#050b1a] border border-cyan-500/30 rounded-lg px-2 py-0.5 text-cyan-300 text-xs focus:outline-none cursor-pointer"
              >
                <option value="popularity">Popularity</option>
                <option value="rating">Rating</option>
                <option value="year">Release Year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results / Suggestions Scrollable Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 sm:p-6 space-y-5">
          {!query.trim() ? (
            <div className="space-y-6">
              {/* Quick Suggested Tags */}
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 mb-2.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
                  <span>Popular Trending Right Now</span>
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {SUGGESTED_QUICK_TAGS.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        soundFx.playClick();
                        setQuery(tag);
                      }}
                      className="px-3.5 py-1.5 rounded-full bg-[#08122c] hover:bg-cyan-500/25 border border-cyan-500/30 hover:border-cyan-400 text-xs text-white font-medium transition cursor-pointer shadow-sm hover:scale-105"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Recent Searches</span>
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-[11px] text-slate-400 hover:text-rose-400 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Clear</span>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          soundFx.playClick();
                          setQuery(s);
                        }}
                        className="px-3.5 py-1.5 rounded-full bg-[#08122c] hover:bg-cyan-500/20 border border-cyan-500/30 hover:border-cyan-400 text-xs text-white font-medium transition cursor-pointer"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(56,189,248,0.7)] bg-[#070e24]">
                  <img
                    src="./furina_chibi.gif"
                    alt="Furina Searching"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = './favicon.png'; }}
                  />
                </div>
                <div className="absolute -inset-1.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              </div>
              <p className="text-xs sm:text-sm font-bold text-cyan-300">Searching Fontaine's cinematic vaults for "{query}"...</p>
              <p className="text-[11px] text-cyan-200/60 mt-0.5">Furina is diving through 4K streams and multi-audio archives ✨</p>
            </div>
          ) : processedResults.length === 0 ? (
            <div className="py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 mb-3 shadow">
                <Compass className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="text-sm font-bold text-white mb-1">No matching titles found</h4>
              <p className="text-xs text-cyan-200/60 max-w-sm">
                Try searching for general keywords like "Spider", "Dragon", "Naruto", or clear your filter.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-3 text-xs text-cyan-200/70">
                <span className="font-semibold">Found {processedResults.length} matching titles</span>
                <span className="font-mono text-[10px]">Click any title to stream in 4K</span>
              </div>

              {/* 3D Result Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {processedResults.map((item) => {
                  const title = item.title || item.name || 'Untitled';
                  const year = String(item.release_date || item.first_air_date || '').substring(0, 4) || '2024';
                  const rating = typeof item.vote_average === 'number' ? item.vote_average.toFixed(1) : (item.vote_average || '7.8');
                  const poster = resolvePosterUrl(item.poster_path || item.backdrop_path, 'w500');
                  const isHindi = isHindiAvailable(item) || item.isHindiDubbed;
                  const isSeries = item.media_type === 'tv' || Boolean(item.first_air_date);

                  return (
                    <div
                      key={`search-${item.id}-${title}`}
                      onClick={() => {
                        soundFx.playStartChime();
                        onPlay(item);
                        onClose();
                      }}
                      className="group flex items-center gap-3 p-2.5 rounded-2xl bg-[#050b1d] border border-cyan-500/25 hover:border-cyan-400 hover:bg-[#081438] transition-all duration-200 cursor-pointer shadow-md hover:shadow-[0_8px_24px_rgba(56,189,248,0.3)] hover:-translate-y-1"
                    >
                      <div className="relative w-14 h-20 rounded-xl overflow-hidden bg-black shrink-0 border border-white/10">
                        <img 
                          src={poster} 
                          alt={title} 
                          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300"
                          onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                        />
                        <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                          <Play className="w-5 h-5 fill-white text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-extrabold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                          {title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{year}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {rating}
                          </span>
                          <span>•</span>
                          <span className="text-cyan-400">{isSeries ? 'Series' : 'Movie'}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                          <span className="badge-4k-uhd text-[8px] px-1 py-0.2 rounded font-black">4K</span>
                          {isHindi && (
                            <span className="badge-hindi-gold text-[8px] px-1 py-0.2 rounded font-bold">🇮🇳 HINDI</span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-cyan-400/50 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
