import React, { useState, useRef } from 'react';
import { Play, Star, Bookmark, Check, Sparkles, Volume2, Film, Tv, Info } from 'lucide-react';
import { isHindiAvailable } from '../services/tmdb';
import { resolvePosterUrl } from '../services/contentModel';
import soundFx from '../services/soundFx';

const MediaCard = React.memo(function MediaCard({ 
  item, 
  onPlay, 
  onOpenDetails, 
  isWatchlisted, 
  onToggleWatchlist 
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef(null);

  if (!item) return null;

  const title = item.title || item.name || 'Untitled';
  const year = String(item.release_date || item.first_air_date || item.year || '').substring(0, 4) || '2024';
  const rating = typeof item.vote_average === 'number' 
    ? item.vote_average.toFixed(1) 
    : (item.rating || (item.vote_average ? String(item.vote_average) : '7.8'));

  const isSeries = Boolean(
    item.type === 'tv' ||
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
    (Array.isArray(item.origin_country) && item.origin_country.includes('JP'))
  );

  const isHindi = Boolean(
    item.languages?.hi?.url ||
    item.isHindiDubbed ||
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

  const rawPoster = item.poster_path || item.poster || item.backdrop_path || item.backdrop;
  const posterSrc = resolvePosterUrl(rawPoster, 'w500');

  return (
    <div 
      ref={cardRef}
      onClick={() => {
        soundFx.playClick();
        onPlay(item);
      }}
      data-media-id={item.id}
      className="group relative rounded-xl sm:rounded-2xl overflow-hidden glass-card cursor-pointer flex flex-col border border-cyan-500/25 hover:border-cyan-400/90 shadow-[0_8px_20px_rgba(0,0,0,0.7)] hover:shadow-[0_14px_35px_rgba(0,0,0,0.9),0_0_25px_rgba(0,242,254,0.35)] transition-all duration-200 transform-gpu hover:-translate-y-1 hover:scale-[1.015]"
    >
      {/* Poster Image Container */}
      <div 
        className="relative aspect-[2/3] w-full overflow-hidden bg-[#04091c]"
      >
        {/* Poster Image */}
        <img
          src={imageError ? './icon-512.png' : posterSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            setImageError(true);
            setImageLoaded(true);
            e.currentTarget.onerror = null;
            e.currentTarget.src = './icon-512.png';
          }}
          className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-108 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Shimmer Placeholder while loading */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton-shimmer z-0" />
        )}

        {/* Elegant overlay when image falls back */}
        {imageError && (
          <div className="absolute inset-0 bg-[#060c1d]/85 flex flex-col items-center justify-center p-3 text-center pointer-events-none z-10">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center mb-2 shadow">
              {isAnime ? (
                <Sparkles className="w-5 h-5 text-cyan-300" />
              ) : isSeries ? (
                <Tv className="w-5 h-5 text-sky-400" />
              ) : (
                <Film className="w-5 h-5 text-cyan-400" />
              )}
            </div>
            <p className="font-bold text-xs text-white line-clamp-2 leading-snug px-1">
              {title}
            </p>
            {year && (
              <span className="text-[10px] text-cyan-300 font-bold mt-1">
                {year}
              </span>
            )}
          </div>
        )}

        {/* Cinematic Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050b1d] via-transparent to-black/30 pointer-events-none" />

        {/* Quality & Dub Badges */}
        <div 
          className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-0.5 sm:gap-1 z-20 pointer-events-none"
        >
          <span className="badge-4k-uhd text-[7.5px] sm:text-[8.5px] px-1 sm:px-1.5 py-0.5 rounded shadow-sm tracking-wider border border-cyan-300/30">
            4K UHD
          </span>
          {isHindi && (
            <span className="badge-hindi-gold text-[7.5px] sm:text-[8.5px] px-1 sm:px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 tracking-wider border border-amber-300/30">
              <span>🇮🇳</span>
              <span>{isAnime ? 'HINDI' : 'HINDI'}</span>
            </span>
          )}
          {isAnime && (
            <span className="badge-fhd text-[7.5px] sm:text-[8.5px] px-1 sm:px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5 tracking-wider border border-purple-300/30">
              <span>🇯🇵</span>
              <span>SUB / DUB</span>
            </span>
          )}
          {savedProgress && (
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 text-[7.5px] sm:text-[8.5px] font-black tracking-wider px-1 sm:px-1.5 py-0.5 rounded shadow-sm flex items-center gap-0.5">
              <span>▶</span>
              <span>RESUME {savedProgress}</span>
            </span>
          )}
          {isSeries ? (
            <span className="bg-purple-600/90 text-white text-[7px] sm:text-[8px] font-black px-1 sm:px-1.5 py-0.5 rounded shadow-sm tracking-wider">
              SERIES
            </span>
          ) : null}
        </div>

        {/* Top Right Actions: Rating, Watchlist, Details */}
        <div 
          className="absolute top-1.5 right-1.5 sm:top-2.5 sm:right-2.5 flex items-center gap-1 sm:gap-1.5 z-20"
        >
          <div className="bg-black/65 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-0.5 sm:gap-1 border border-white/10 shadow">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 fill-amber-400" />
            <span className="text-[9px] sm:text-[10px] font-bold text-white">{rating}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onToggleWatchlist) onToggleWatchlist(item);
            }}
            title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md flex items-center justify-center backdrop-blur-md transition border cursor-pointer ${
              isWatchlisted
                ? 'bg-cyan-500 text-gray-950 border-cyan-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]'
                : 'bg-black/60 text-white/80 border-white/10 hover:text-white hover:bg-black/80 hover:border-cyan-400/50'
            }`}
          >
            {isWatchlisted ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Bookmark className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
          </button>
        </div>

        {/* Center Hover Play & Info Overlay */}
        <div 
          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 backdrop-blur-[2px] z-20"
        >
          <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-gray-950 flex items-center justify-center shadow-[0_0_24px_rgba(56,189,248,0.9)] transform scale-75 group-hover:scale-100 transition-transform duration-300 animate-pulse-play">
            <Play className="w-5 h-5 fill-gray-950 ml-0.5" />
          </div>

          {onOpenDetails && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(item);
              }}
              title="View Title Details"
              className="w-8 h-8 rounded-full bg-black/70 hover:bg-cyan-500 hover:text-gray-950 text-white flex items-center justify-center backdrop-blur-md border border-white/20 hover:border-cyan-400 transition transform scale-75 group-hover:scale-100 cursor-pointer"
            >
              <Info className="w-4 h-4 bounce-hover" />
            </button>
          )}
        </div>
      </div>

      {/* Card Info Container */}
      <div 
        className="p-2 sm:p-3 bg-[#050b1d] border-t border-white/[0.05] flex flex-col justify-between"
      >
        <h3 className="font-bold text-[11px] sm:text-[13px] text-white line-clamp-1 group-hover:text-cyan-300 transition-colors">
          {title}
        </h3>
        <div className="flex items-center justify-between mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] text-slate-400">
          <span>{year}</span>
          <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-cyan-400/80">
            {isSeries ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default MediaCard;
