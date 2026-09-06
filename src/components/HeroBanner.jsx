import React from 'react';
import { Play, Plus, Check, Star, Sparkles } from 'lucide-react';
import { BACKDROP_BASE } from '../services/tmdb';

export default function HeroBanner({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  if (!item) return null;

  const title = item.title || item.name || 'Featured';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '8.0';
  const isSeries = item.media_type === 'tv' || !!item.first_air_date;

  return (
    <div className="relative w-full h-[52vh] sm:h-[62vh] max-h-[560px] overflow-hidden rounded-2xl mb-8 border border-cyan-500/20 shadow-[0_15px_40px_rgba(0,0,0,0.7)]">
      {/* Background Poster Image */}
      <img
        src={item.backdrop_path ? `${BACKDROP_BASE}${item.backdrop_path}` : '/icon-512.png'}
        alt={title}
        className="w-full h-full object-cover object-center scale-105 transition duration-700 hover:scale-100"
      />

      {/* Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-[#050811]/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050811] via-[#050811]/70 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-3xl">
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-extrabold text-[11px] px-2.5 py-0.5 rounded-full shadow-lg tracking-wider uppercase">
            4K Ultra HD
          </span>
          {isSeries ? (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[11px] font-bold px-2 py-0.5 rounded-md">
              Web Series
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold px-2 py-0.5 rounded-md">
              Movie
            </span>
          )}
          <span className="flex items-center gap-1 text-amber-400 font-bold text-xs">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            {rating}
          </span>
          <span className="text-cyan-200/60 text-xs">{year}</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mb-3 leading-tight drop-shadow-md">
          {title}
        </h1>

        <p className="text-xs sm:text-sm text-cyan-100/70 line-clamp-2 sm:line-clamp-3 mb-6 max-w-xl font-normal leading-relaxed">
          {item.overview}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(item)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 font-extrabold px-6 py-3 rounded-full text-sm transition shadow-[0_0_20px_rgba(77,197,249,0.5)] transform hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-gray-950" />
            Watch in 4K
          </button>

          <button
            onClick={() => onToggleWatchlist(item)}
            className={`flex items-center gap-2 px-4 py-3 rounded-full text-sm font-semibold transition border ${
              isWatchlisted
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                : 'bg-[#0f1d40]/80 border-cyan-500/30 text-white hover:bg-white/10'
            }`}
          >
            {isWatchlisted ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isWatchlisted ? 'Saved' : 'Watchlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
