import React, { useState } from 'react';
import { Play, Star, Bookmark, Check, Sparkles, Volume2, Film, Tv } from 'lucide-react';
import { POSTER_THUMB_BASE, isHindiAvailable } from '../services/tmdb';

const MediaCard = React.memo(function MediaCard({ item, onPlay, isWatchlisted, onToggleWatchlist }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  if (!item) return null;
  const title = item.title || item.name || 'Untitled';
  const year = String(item.release_date || item.first_air_date || '').substring(0, 4);
  const rating = typeof item.vote_average === 'number' 
    ? item.vote_average.toFixed(1) 
    : (item.vote_average || '7.8');

  const isSeries = Boolean(
    item.media_type === 'tv' || 
    Boolean(item.first_air_date) || 
    item.category === 'series' || 
    item.category === 'kdrama'
  );

  const isAnime = Boolean(
    item.category === 'anime' ||
    item.category === 'ecchi_anime' ||
    item.isAnime === true ||
    item.original_language === 'ja' ||
    (Array.isArray(item.origin_country) && item.origin_country.includes('JP')) ||
    ((item.genre_ids?.includes(16) || item.genres?.some((g) => g.id === 16 || g.name === 'Animation')) && item.original_language === 'ja')
  );

  const isHindi = Boolean(
    item.languages?.hi?.url ||
    isHindiAvailable(item)
  );

  const savedProgress = (() => {
    try {
      if (item?.id && isSeries) {
        const raw = localStorage.getItem(`furina_progress_${item.id}`);
        if (raw) {
          const p = JSON.parse(raw);
          if (p && typeof p.season === 'number' && typeof p.episode === 'number') {
            return `S${p.season}:E${p.episode}`;
          }
        }
      }
    } catch (e) {}
    return null;
  })();

  const todayStr = new Date().toISOString().split('T')[0];
  const isUpcoming = Boolean(item.release_date && item.release_date > todayStr);

  return (
    <div 
      onClick={() => onPlay(item)}
      data-media-id={item.id}
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden glass-card cursor-pointer flex flex-col transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(56,189,248,0.2)]"
    >
      {/* Poster Image Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#060c1d]">
        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton-shimmer z-0" />
        )}

        {imageError || !item.poster_path ? (
          <div className="w-full h-full bg-gradient-to-br from-[#0c1838] via-[#070f24] to-[#030611] flex flex-col items-center justify-center p-4 text-center relative overflow-hidden border border-cyan-500/20">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition duration-300">
              {isAnime ? (
                <Sparkles className="w-6 h-6 text-cyan-300" />
              ) : isSeries ? (
                <Tv className="w-6 h-6 text-sky-400" />
              ) : (
                <Film className="w-6 h-6 text-cyan-400" />
              )}
            </div>
            <p className="font-extrabold text-xs sm:text-sm text-white line-clamp-3 leading-snug px-1 drop-shadow-md">
              {title}
            </p>
            {year && (
              <span className="text-[11px] text-cyan-300/80 font-bold mt-1.5 tracking-wider">
                {year}
              </span>
            )}
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/60 font-black mt-2 px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800/40">
              {isAnime ? 'Anime Series' : isSeries ? 'Web Series' : 'Cinema Film'}
            </span>
          </div>
        ) : (
          <img
            src={item.poster_path.startsWith('http') ? item.poster_path : `${POSTER_THUMB_BASE}${item.poster_path}`}
            alt={title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImageLoaded(true)}
            onError={() => {
              setImageError(true);
              setImageLoaded(true);
            }}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1d] via-transparent to-black/30 pointer-events-none" />

        {/* Quality & Dub Badges (Cozy scale) */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          <span className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-sm backdrop-blur-sm">
            4K UHD
          </span>
          {isHindi && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-600 text-gray-950 text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span>🇮🇳</span>
              <span>{isAnime ? 'HINDI DUB' : 'HINDI'}</span>
            </span>
          )}
          {isAnime && (
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span>🇯🇵</span>
              <span>SUB / 🎙️ DUB</span>
            </span>
          )}
          {savedProgress && (
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 text-[8.5px] font-black tracking-wider px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span>▶</span>
              <span>RESUME {savedProgress}</span>
            </span>
          )}
          {isUpcoming ? (
            <span className="bg-amber-600/90 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow-sm">
              UPCOMING
            </span>
          ) : isSeries ? (
            <span className="bg-purple-600/90 text-white text-[8.5px] font-bold px-1.5 py-0.5 rounded shadow-sm">
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

      {/* Info Container (Cozy scale) */}
      <div className="p-2.5 sm:p-3 bg-[#050b1d] border-t border-white/[0.04] flex flex-col justify-between">
        <h3 className="font-bold text-xs sm:text-[13px] text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-400">
          <span>{year || '2024'}</span>
          <span className="text-[9.5px] font-medium text-cyan-400/80">
            {isSeries ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default MediaCard;
