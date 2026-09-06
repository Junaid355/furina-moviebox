import React from 'react';
import { Play, Star, Plus, Check, Sparkles } from 'lucide-react';
import { IMG_BASE } from '../services/tmdb';

export default function MediaCard({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = item.vote_average ? item.vote_average.toFixed(1) : '7.8';
  const isSeries = item.media_type === 'tv' || !!item.first_air_date;
  const isHindi = item.isHindiDubbed || item.original_language === 'hi' || item.category === 'hindi';

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer flex flex-col transition-all duration-300">
      {/* Poster Image Container */}
      <div 
        onClick={() => onPlay(item)}
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#060c1d]"
      >
        <img
          src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : './icon-512.png'}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108 group-hover:brightness-105"
        />

        {/* Quality & Dub Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1.5 z-10">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full shadow-lg">
            4K UHD
          </span>
          {isHindi && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-gray-950 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
              <span>🇮🇳</span>
              <span>HINDI</span>
            </span>
          )}
          {isSeries && (
            <span className="bg-purple-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow">
              SERIES
            </span>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 z-10 border border-white/10 shadow">
          <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
          <span className="text-[10px] font-bold text-white">{rating}</span>
        </div>

        {/* Hover / Play Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040817] via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-400 to-sky-300 text-gray-950 flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.9)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-6 h-6 fill-gray-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-transparent to-[#04091a]">
        <div onClick={() => onPlay(item)}>
          <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>
          <div className="flex items-center justify-between mt-1 text-[11px] text-cyan-200/50">
            <span>{year || '2024'}</span>
            <span className="capitalize text-[10px] font-semibold tracking-wider text-cyan-400/80">
              {isSeries ? 'Web Series' : 'Movie'}
            </span>
          </div>
        </div>

        {/* Quick Watchlist Action */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleWatchlist(item);
          }}
          className={`mt-2.5 w-full py-1.5 px-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition border ${
            isWatchlisted
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
              : 'bg-[#0b1633]/80 border-cyan-500/20 text-cyan-200/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          {isWatchlisted ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          <span>{isWatchlisted ? 'Saved' : '+ Watchlist'}</span>
        </button>
      </div>
    </div>
  );
}
