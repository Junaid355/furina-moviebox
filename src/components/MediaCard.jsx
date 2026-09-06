import React from 'react';
import { Play, Star, Plus, Check } from 'lucide-react';
import { IMG_BASE } from '../services/tmdb';

export default function MediaCard({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.5';
  const isSeries = item.media_type === 'tv' || !!item.first_air_date;

  return (
    <div className="group relative rounded-xl overflow-hidden glass-card cursor-pointer flex flex-col">
      {/* Poster Image Container */}
      <div 
        onClick={() => onPlay(item)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#0a1226]"
      >
        <img
          src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : '/icon-512.png'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Quality Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow">
            4K
          </span>
          {isSeries && (
            <span className="bg-purple-600/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
              SERIES
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-1.5 py-0.5 rounded flex items-center gap-1 z-10 border border-white/10">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white">{rating}</span>
        </div>

        {/* Hover / Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050811] via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-cyan-400/90 text-gray-950 flex items-center justify-center shadow-[0_0_20px_rgba(77,197,249,0.8)] transform scale-75 group-hover:scale-100 transition">
            <Play className="w-5 h-5 fill-gray-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div onClick={() => onPlay(item)}>
          <h3 className="font-semibold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-cyan-300 transition">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[11px] text-cyan-200/50">
            <span>{year || '2024'}</span>
            <span className="capitalize">{isSeries ? 'TV Show' : 'Movie'}</span>
          </div>
        </div>

        {/* Quick Watchlist Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(item);
          }}
          className={`mt-2.5 w-full py-1.5 px-2 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1.5 transition border ${
            isWatchlisted
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
              : 'bg-[#0f1d40]/60 border-cyan-500/20 text-cyan-200/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {isWatchlisted ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          {isWatchlisted ? 'In Watchlist' : 'Watchlist'}
        </button>
      </div>
    </div>
  );
}
