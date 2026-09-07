import React, { useState } from 'react';
import { Play, Star, Bookmark, Check, Sparkles } from 'lucide-react';
import { IMG_BASE, isHindiAvailable } from '../services/tmdb';

export default function MediaCard({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  if (!item) return null;
  const [imageLoaded, setImageLoaded] = useState(false);
  const title = item.title || item.name || 'Untitled';
  const year = String(item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = typeof item.vote_average === 'number' 
    ? item.vote_average.toFixed(1) 
    : (item.vote_average || '7.8');
  const isSeries = item.media_type === 'tv' || Boolean(item.first_air_date);
  const isHindi = Boolean(isHindiAvailable(item));
  
  const todayStr = new Date().toISOString().split('T')[0];
  const isUpcoming = Boolean(item.release_date && item.release_date > todayStr);

  return (
    <div 
      onClick={() => onPlay(item)}
      className="group relative rounded-2xl overflow-hidden glass-card cursor-pointer flex flex-col transition-all duration-300 transform hover:-translate-y-1.5"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#060c1d]">
        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer z-0" />
        )}

        <img
          src={item.poster_path ? `${IMG_BASE}${item.poster_path}` : './icon-512.png'}
          alt={title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1d] via-transparent to-black/30 pointer-events-none" />

        {/* Quality & Dub Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md shadow-md backdrop-blur-sm">
            4K UHD
          </span>
          {isHindi && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-gray-950 text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1">
              <span>🇮🇳</span>
              <span>HINDI</span>
            </span>
          )}
          {(item.category === 'anime' || item.isAnime) && (
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md shadow flex items-center gap-1">
              <span>🇯🇵</span>
              <span>SUB / 🎙️ DUB</span>
            </span>
          )}
          {isUpcoming ? (
            <span className="bg-amber-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
              UPCOMING
            </span>
          ) : isSeries ? (
            <span className="bg-purple-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow">
              SERIES
            </span>
          ) : null}
        </div>

        {/* Top Right Floating Actions: Rating & Watchlist */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
          {/* Rating */}
          <div className="bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-md flex items-center gap-1 border border-white/10 shadow">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
            <span className="text-[10px] font-bold text-white">{rating}</span>
          </div>

          {/* Watchlist Bookmark Icon */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWatchlist(item);
            }}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`w-6 h-6 rounded-md flex items-center justify-center backdrop-blur-md transition border ${
              isWatchlisted
                ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                : 'bg-black/60 text-white/80 border-white/10 hover:text-white hover:bg-black/80'
            }`}
          >
            {isWatchlisted ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Center Hover Play Button */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-gray-950 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.9)] transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Play className="w-5 h-5 fill-gray-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3 bg-[#050b1d] border-t border-white/[0.04] flex flex-col justify-between">
        <h3 className="font-bold text-xs sm:text-sm text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
          <span>{year || '2024'}</span>
          <span className="text-[10px] font-medium text-cyan-400/80">
            {isSeries ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}
