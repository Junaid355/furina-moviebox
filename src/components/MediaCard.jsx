import React, { useState } from 'react';
import { Play, Star, Bookmark, Check, Info } from 'lucide-react';
import { isHindiAvailable } from '../services/tmdb';
import { resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import soundFx from '../services/soundFx';

export default function MediaCard({ item, onPlay, isWatchlisted, onToggleWatchlist, onOpenDetails }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);

  if (!item) return null;

  const computedPoster = resolvePosterUrl(item.poster_path || item.backdrop_path, 'w500');
  const activeSrc = imgSrc || computedPoster || './icon-512.png';

  const title = item.title || item.name || 'Untitled';
  const year = item.year || String(item.release_date || item.first_air_date || '').substring(0, 4) || '2025';
  const rating = typeof item.vote_average === 'number' && item.vote_average > 0
    ? item.vote_average.toFixed(1)
    : item.rating || '8.2';

  const isAnime = Boolean(
    item.category === 'anime' ||
    item.category === 'ecchi_anime' ||
    item.isAnime === true ||
    item.original_language === 'ja'
  );

  const isHindi = Boolean(
    item.isHindiDubbed ||
    item.hasHindiDub ||
    item.original_language === 'hi' ||
    item.category === 'hindi' ||
    item.languages?.hi ||
    isHindiAvailable(item)
  );

  const isSeries = Boolean(
    item.media_type === 'tv' ||
    item.type === 'tv' ||
    item.first_air_date ||
    item.category === 'series' ||
    item.category === 'kdrama'
  );

  const genres = extractGenres(item).slice(0, 2);
  const saved = Boolean(isWatchlisted);

  const handleImageError = () => {
    if (imgSrc !== './icon-512.png') {
      setImgSrc('./icon-512.png');
      setImageLoaded(true);
    }
  };

  return (
    <div
      onClick={() => {
        soundFx.playClick?.();
        onPlay(item);
      }}
      onMouseEnter={() => soundFx.playHover?.()}
      className="group relative rounded-2xl overflow-hidden bg-[#060d21] border border-cyan-500/20 hover:border-cyan-400/80 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_rgba(0,0,0,0.85),0_0_25px_rgba(34,211,238,0.28)] cursor-pointer flex flex-col select-none"
    >
      {/* 2:3 Poster Viewport */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#040917]">
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}

        <img
          src={activeSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#060d21] via-[#060d21]/60 to-transparent pointer-events-none" />

        {/* Top-Left Neon Quality & Audio Badges */}
        <div className="absolute top-2 left-2 z-20 flex flex-col items-start gap-1 pointer-events-none">
          <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[9.5px] tracking-wider uppercase shadow-[0_0_12px_rgba(34,211,238,0.6)]">
            {item.qualityBadge || '4K UHD'}
          </span>
          {isHindi && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500/95 text-slate-950 font-black text-[9px] tracking-tight shadow-md">
              🇮🇳 HINDI DUB
            </span>
          )}
        </div>

        {/* Top-Right Watchlist & Info Buttons */}
        <div className="absolute top-2 right-2 z-20 flex items-center gap-1">
          {onOpenDetails && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick?.();
                onOpenDetails(item);
              }}
              aria-label="Details and Episodes"
              title="Details & Episodes"
              className="w-8 h-8 rounded-full bg-slate-950/75 hover:bg-cyan-500 hover:text-slate-950 text-slate-200 border border-white/15 backdrop-blur-md flex items-center justify-center transition opacity-0 group-hover:opacity-100 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          )}

          {onToggleWatchlist && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                soundFx.playClick?.();
                onToggleWatchlist(item);
              }}
              aria-label={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
              title={saved ? 'Saved in Watchlist' : 'Add to Watchlist'}
              className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition cursor-pointer ${
                saved
                  ? 'bg-cyan-400 border-cyan-200 text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.8)]'
                  : 'bg-slate-950/75 border-white/15 text-white/85 hover:text-white hover:bg-slate-900'
              }`}
            >
              {saved ? <Check className="w-4 h-4 stroke-[2.5]" /> : <Bookmark className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Center Neon 3D Play Button Overlay on Hover */}
        <div className="absolute inset-0 bg-slate-950/35 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-400 to-blue-500 text-slate-950 flex items-center justify-center shadow-[0_0_28px_rgba(34,211,238,0.9)] border-2 border-white/60 transform scale-90 group-hover:scale-100 transition-transform duration-200">
            <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
          </div>
        </div>
      </div>

      {/* Card Footer with Color-Coded Genre Tags */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 bg-gradient-to-b from-[#060d21] to-[#040918] border-t border-cyan-500/15 gap-1.5">
        <h3
          className="font-extrabold text-xs sm:text-sm text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug"
          title={title}
        >
          {title}
        </h3>

        {/* Color-Coded Genre Tags Row (Action in Red, Comedy in Gold, Sci-Fi in Cyan, etc.) */}
        {genres.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {genres.map((genre) => {
              const style = getGenreBadgeStyle(genre);
              return (
                <span
                  key={genre}
                  className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9.5px] font-extrabold tracking-wide border transition-all ${style.badgeClass}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dotClass}`} />
                  <span className="truncate max-w-[78px]">{style.label}</span>
                </span>
              );
            })}
          </div>
        )}

        <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400 pt-0.5 font-medium">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="flex items-center gap-0.5 text-amber-400 font-bold shrink-0">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{rating}</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="font-mono text-slate-300 shrink-0">{year}</span>
          </div>

          <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded shrink-0 ${
            isAnime
              ? 'text-purple-300 bg-purple-500/15'
              : isSeries
              ? 'text-emerald-300 bg-emerald-500/15'
              : 'text-cyan-300 bg-cyan-500/15'
          }`}>
            {isAnime ? 'Anime' : isSeries ? 'Series' : 'Movie'}
          </span>
        </div>
      </div>
    </div>
  );
}
