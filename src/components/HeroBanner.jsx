import React from 'react';
import { Play, Plus, Check, Star, Sparkles } from 'lucide-react';
import { BACKDROP_BASE } from '../services/tmdb';

export default function HeroBanner({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  if (!item) return null;

  const title = item.title || item.name || 'Featured Blockbuster';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.2';
  const isSeries = item.media_type === 'tv' || !!item.first_air_date;
  const isHindi = item.isHindiDubbed || item.original_language === 'hi' || item.category === 'hindi';

  return (
    <div className="relative w-full h-[52vh] sm:h-[65vh] max-h-[580px] overflow-hidden rounded-3xl mb-8 border border-cyan-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.85)] group">
      {/* Background Poster Image */}
      <img
        src={item.backdrop_path ? `${BACKDROP_BASE}${item.backdrop_path}` : './icon-512.png'}
        alt={title}
        className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 group-hover:scale-100 filter brightness-95"
      />

      {/* Cinematic Dual Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent max-w-4xl" />

      {/* Ambient hydro lighting */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-3xl z-10">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 text-gray-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow-lg tracking-wider uppercase">
            4K Ultra HD
          </span>
          {isHindi && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>🇮🇳</span>
              <span>Hindi Dub Available</span>
            </span>
          )}
          {isSeries ? (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Web Series
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Cinema Movie
            </span>
          )}
          <span className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 font-extrabold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {rating}
          </span>
          <span className="text-cyan-200/70 text-xs font-semibold px-2 py-0.5 bg-white/5 rounded-full border border-white/5">{year || '2024'}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-3 leading-tight drop-shadow-lg">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-cyan-100/80 line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl font-medium leading-relaxed drop-shadow">
          {item.overview}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(item)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 font-black px-7 py-3.5 rounded-full text-sm transition-all duration-300 shadow-[0_0_25px_rgba(56,189,248,0.6)] transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
            <span>Watch in 4K</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(item)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold transition-all border backdrop-blur-md ${
              isWatchlisted
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-[#0e1b3d]/70 border-cyan-500/30 text-white hover:bg-white/10'
            }`}
          >
            {isWatchlisted ? <Check className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4" />}
            <span>{isWatchlisted ? 'Saved' : '+ Watchlist'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
