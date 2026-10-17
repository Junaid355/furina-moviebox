import React, { useState, memo } from 'react';
import { Play, Star, Bookmark, Check, Info, Volume2 } from 'lucide-react';
import { isHindiAvailable } from '../services/tmdb';
import { resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import soundFx from '../services/soundFx';

const MediaCard = memo(function MediaCard({
  item,
  onPlay,
  onPlayDirect,
  onOpenDetails,
  onSelect,
  isWatchlisted,
  onToggleWatchlist,
  progressInfo
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  if (!item) return null;

  const playHandler = onPlay || onPlayDirect;
  const detailsHandler = onOpenDetails || onSelect;
  const watchlistedBool = typeof isWatchlisted === 'function' ? isWatchlisted(item.id) : Boolean(isWatchlisted);

  const title = item.title || item.name || 'Untitled';
  const year = (item.release_date || item.first_air_date || item.year || '').toString().slice(0, 4) || '2025';
  const rating = item.vote_average ? Number(item.vote_average).toFixed(1) : '8.4';
  const isSeries = item.media_type === 'tv' || item.type === 'tv' || Boolean(item.first_air_date);
  const hasHindi = Boolean(
    item.hasHindiDub ||
    item.isHindiDubbed ||
    item.category === 'hindi' ||
    item.original_language === 'hi' ||
    isHindiAvailable(item)
  );
  const isAnime = Boolean(
    item.isAnime ||
    item.category === 'anime' ||
    item.original_language === 'ja'
  );

  // Resolve real TMDB poster URL cleanly
  const resolvedUrl = resolvePosterUrl(item, 'w500');
  const posterSrc = imgError ? './icon-512.png' : resolvedUrl;

  const genres = extractGenres(item).slice(0, 2);

  const handleCardClick = () => {
    soundFx.playClick?.();
    if (playHandler) playHandler(item);
    else if (detailsHandler) detailsHandler(item);
  };

  const handlePlayNow = (e) => {
    e.stopPropagation();
    soundFx.playClick?.();
    if (playHandler) playHandler(item);
    else if (detailsHandler) detailsHandler(item);
  };

  const handleDetailsClick = (e) => {
    e.stopPropagation();
    soundFx.playClick?.();
    if (detailsHandler) detailsHandler(item);
    else if (playHandler) playHandler(item);
  };

  const handleWatchlistClick = (e) => {
    e.stopPropagation();
    soundFx.playClick?.();
    if (onToggleWatchlist) onToggleWatchlist(item);
  };

  return (
    <div
      data-testid="media-card"
      onClick={handleCardClick}
      className="group relative flex flex-col rounded-2xl bg-[#071026]/95 border border-cyan-500/25 hover:border-cyan-400/80 overflow-hidden cursor-pointer select-none card-3d shadow-[0_10px_28px_rgba(0,0,0,0.65)]"
    >
      {/* Top 3D Specular Highlight Line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/75 to-transparent opacity-60 group-hover:opacity-100 z-20 transition-opacity" />

      {/* 2:3 Poster Frame */}
      <div className="relative aspect-[2/3] w-full bg-[#040917] overflow-hidden">
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#091534] to-slate-950 animate-pulse" />
        )}

        <img
          src={posterSrc}
          alt={title}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoaded(true)}
          onError={() => {
            setImgError(true);
            setImgLoaded(true);
          }}
          className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Cinema Gradient Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#040918] via-[#040918]/25 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

        {/* Top Left: Rating & Multi-Dub Audio Pill */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-950/90 backdrop-blur-md border border-amber-400/45 text-[10px] font-black text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
            {rating}
          </span>
          {hasHindi ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500/95 to-orange-500/95 text-gray-950 text-[8.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(245,158,11,0.5)]">
              🇮🇳 HI + EN
            </span>
          ) : isAnime ? (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-purple-500/95 to-indigo-500/95 text-white text-[8.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(168,85,247,0.5)]">
              🇯🇵 JA + EN
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-cyan-500/90 text-gray-950 text-[8.5px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.45)]">
              🎧 MULTI-DUB
            </span>
          )}
        </div>

        {/* Top Right: Watchlist Bookmark */}
        {onToggleWatchlist && (
          <button
            type="button"
            onClick={handleWatchlistClick}
            title={watchlistedBool ? 'Remove from Watchlist' : 'Add to Watchlist'}
            className={`absolute top-2 right-2 z-20 w-7 h-7 rounded-xl flex items-center justify-center border backdrop-blur-md transition-all cursor-pointer ${
              watchlistedBool
                ? 'bg-cyan-500 text-gray-950 border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.7)]'
                : 'bg-slate-950/80 text-slate-200 border-white/20 opacity-85 group-hover:opacity-100 hover:bg-cyan-500/30 hover:border-cyan-400'
            }`}
          >
            {watchlistedBool ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>
        )}

        {/* Center 3D Hover Play Orb */}
        <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-950/45 backdrop-blur-[2px]">
          <button
            type="button"
            onClick={handlePlayNow}
            title="Play in 4K Multi-Dub"
            className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-gray-950 flex items-center justify-center shadow-[0_0_25px_rgba(56,189,248,0.9)] border-2 border-white/80 hover:scale-110 active:scale-95 transition-transform cursor-pointer"
          >
            <Play className="w-5 h-5 fill-gray-950 text-gray-950 ml-0.5" />
          </button>
          {detailsHandler && (
            <button
              type="button"
              onClick={handleDetailsClick}
              title="Details & Episodes"
              className="w-9 h-9 rounded-full bg-slate-900/90 text-cyan-300 border border-cyan-400/50 flex items-center justify-center hover:bg-cyan-500/25 hover:text-white transition cursor-pointer shadow-lg"
            >
              <Info className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Bottom Poster Overlay: Color-Coded Genre Tags */}
        <div className="absolute bottom-2 left-2 right-2 z-10 flex flex-wrap items-center gap-1 pointer-events-none">
          {genres.map((genre) => {
            const style = getGenreBadgeStyle(genre);
            return (
              <span
                key={genre}
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-extrabold tracking-wide backdrop-blur-md ${style.badgeClass}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                {style.label}
              </span>
            );
          })}
        </div>

        {/* Resume Watch Progress Bar */}
        {progressInfo && (
          <div className="absolute bottom-0 inset-x-0 h-1 bg-slate-900/90 z-20">
            <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 w-2/3 shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
          </div>
        )}
      </div>

      {/* Card Footer: Title & Year/Format */}
      <div className="p-2.5 flex flex-col justify-between gap-1 bg-gradient-to-b from-[#071128] to-[#040918]">
        <h3
          className="text-xs sm:text-[13px] font-extrabold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 leading-snug"
          title={title}
        >
          {title}
        </h3>
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-semibold">
          <div className="flex items-center gap-1">
            <span>{year}</span>
            <span className="text-cyan-400/70">•</span>
            <span className="text-cyan-300/90 font-bold flex items-center gap-0.5">
              <Volume2 className="w-2.5 h-2.5 text-cyan-400" />
              <span>Multi-Dub</span>
            </span>
          </div>
          <span className="uppercase text-[9px] font-black tracking-wider px-1.5 py-0.2 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
            {progressInfo ? `S${progressInfo.season || 1}:E${progressInfo.episode || 1}` : isSeries ? 'SERIES' : '4K'}
          </span>
        </div>
      </div>
    </div>
  );
});

export default MediaCard;
