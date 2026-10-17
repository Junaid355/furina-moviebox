import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight, Sparkles, Volume2, Users } from 'lucide-react';
import { isHindiAvailable } from '../services/tmdb';
import { resolveBackdropUrl, resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import soundFx from '../services/soundFx';

export default function HeroBanner({
  items = [],
  item: propItem,
  onPlay,
  isWatchlisted,
  onToggleWatchlist,
  onOpenDetails,
  onWatchTogether
}) {
  const slides = Array.isArray(items) && items.length > 0
    ? items.slice(0, 8)
    : propItem
    ? [propItem]
    : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef(null);

  useEffect(() => {
    setCurrentIndex(0);
  }, [items]);

  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [slides.length, isPaused]);

  if (slides.length === 0) return null;

  const item = slides[currentIndex] || slides[0];
  if (!item) return null;

  const backdropUrl = resolveBackdropUrl(item.backdrop_path || item.poster_path);
  const title = item.title || item.name || 'Featured Premiere';
  const year = item.year || String(item.release_date || item.first_air_date || '').substring(0, 4) || '2025';
  const rating = typeof item.vote_average === 'number'
    ? item.vote_average.toFixed(1)
    : item.rating || '8.5';

  const isAnime = Boolean(
    item.category === 'anime' ||
    item.category === 'ecchi_anime' ||
    item.isAnime === true ||
    item.original_language === 'ja'
  );

  const isHindi = Boolean(
    item.isHindiDubbed ||
    item.hasHindiDub ||
    item.languages?.hi ||
    isHindiAvailable(item)
  );

  const genres = extractGenres(item).slice(0, 3);
  const saved = isWatchlisted ? isWatchlisted(item.id) : false;

  const prevSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e) => {
    if (e.touches && e.touches.length > 0) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e) => {
    if (touchStartXRef.current === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(deltaX) > 45) {
      if (deltaX > 0) prevSlide();
      else nextSlide();
    }
    touchStartXRef.current = null;
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-[340px] sm:min-h-[450px] md:min-h-[520px] rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-9 border border-cyan-500/35 shadow-[0_25px_70px_rgba(0,0,0,0.9),0_0_45px_rgba(6,182,212,0.18)] group select-none bg-[#040814]"
    >
      {/* Top Neon Laser Highlight */}
      <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80 z-20" />

      {/* Backdrop Image with Smooth Cinematic Scale */}
      <img
        key={`${item.id}-${currentIndex}`}
        src={backdropUrl}
        alt={title}
        referrerPolicy="no-referrer"
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = './icon-512.png';
        }}
        className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 scale-105 group-hover:scale-100 opacity-85"
      />

      {/* Rich Multi-Layer Fontaine Hydro Cinema Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/65 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent sm:w-4/5" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/15 rounded-full blur-[110px] pointer-events-none" />

      {/* Prev / Next Glass Arrows on Desktop */}
      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-cyan-500 hover:text-slate-950 text-white border border-cyan-500/35 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-3.5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/70 hover:bg-cyan-500 hover:text-slate-950 text-white border border-cyan-500/35 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer shadow-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Foreground Content */}
      <div className="relative z-10 h-full min-h-[340px] sm:min-h-[450px] md:min-h-[520px] flex flex-col justify-end p-5 sm:p-9 md:p-12">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 w-full">
          
          {/* Left Hero Details */}
          <div className="max-w-2xl space-y-3 sm:space-y-4">
            {/* Glowing Cinema Badges Row */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-[0_0_15px_rgba(34,211,238,0.6)] flex items-center gap-1">
                <Sparkles className="w-3 h-3 fill-slate-950" />
                <span>4K DOLBY VISION</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-500/40 text-amber-400 font-black text-[11px] flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{rating}</span>
              </span>

              <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/30 text-cyan-200 font-mono font-bold text-[11px]">
                {year}
              </span>

              {isHindi && (
                <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 backdrop-blur-md border border-amber-400/50 text-amber-300 font-extrabold text-[11px] flex items-center gap-1">
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>🇮🇳 Hindi Dub + Multi-Audio</span>
                </span>
              )}

              {isAnime && (
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 backdrop-blur-md border border-purple-400/50 text-purple-200 font-extrabold text-[11px]">
                  🇯🇵 Anime Sub/Dub
                </span>
              )}
            </div>

            {/* Hero Display Title */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)] [text-wrap:balance]">
              {title}
            </h1>

            {/* Color-Coded Genre Tags */}
            {genres.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {genres.map((genre) => {
                  const style = getGenreBadgeStyle(genre);
                  return (
                    <span
                      key={genre}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-extrabold tracking-wide border backdrop-blur-md ${style.badgeClass}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                      <span>{style.label}</span>
                    </span>
                  );
                })}
              </div>
            )}

            {/* Concise Synopsis */}
            <p className="text-xs sm:text-sm md:text-base text-slate-200/90 line-clamp-2 sm:line-clamp-3 max-w-xl leading-relaxed font-normal">
              {item.overview || 'Stream instantly in 4K Ultra HD with verified multi-audio dubs and zero buffering.'}
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex items-center gap-2.5 sm:gap-3 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  soundFx.playStartChime?.();
                  onPlay(item);
                }}
                className="min-h-[46px] px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_30px_rgba(34,211,238,0.6)] transition transform hover:scale-[1.03] active:scale-95 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-slate-950" />
                <span>Watch 4K Stream</span>
              </button>

              {onWatchTogether && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onWatchTogether(item);
                  }}
                  className="min-h-[46px] px-4 sm:px-5 py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/35 backdrop-blur-md border border-purple-400/50 text-purple-200 hover:text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap shadow-[0_0_18px_rgba(168,85,247,0.3)]"
                >
                  <Users className="w-4 h-4 text-purple-300" />
                  <span>Watch Together</span>
                </button>
              )}

              {onOpenDetails && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onOpenDetails(item);
                  }}
                  className="min-h-[46px] px-4 sm:px-5 py-3 rounded-xl bg-slate-900/85 hover:bg-slate-800 backdrop-blur-md border border-cyan-500/35 hover:border-cyan-400 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Info className="w-4 h-4 text-cyan-400" />
                  <span>Details</span>
                </button>
              )}

              {onToggleWatchlist && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onToggleWatchlist(item);
                  }}
                  aria-label={saved ? 'Remove from Watchlist' : 'Add to Watchlist'}
                  className={`min-h-[46px] px-4 py-3 rounded-xl backdrop-blur-md border font-bold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer whitespace-nowrap ${
                    saved
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                      : 'bg-slate-900/80 border-white/15 text-slate-200 hover:text-white hover:border-cyan-500/40'
                  }`}
                >
                  {saved ? <Check className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4" />}
                  <span className="hidden xs:inline">{saved ? 'Saved' : 'Watchlist'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right Interactive Poster Thumbnail Strip (Desktop & Tablet) */}
          {slides.length > 1 && (
            <div className="hidden md:flex items-center gap-2 bg-[#040a1c]/85 backdrop-blur-xl p-2 rounded-2xl border border-cyan-500/30 shadow-2xl shrink-0">
              {slides.slice(0, 6).map((s, idx) => {
                const isSelected = idx === currentIndex;
                return (
                  <button
                    key={`thumb-${s.id}-${idx}`}
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      setCurrentIndex(idx);
                    }}
                    className={`relative w-12 h-16 lg:w-14 lg:h-20 rounded-xl overflow-hidden transition-all duration-300 cursor-pointer shrink-0 ${
                      isSelected
                        ? 'ring-2 ring-cyan-400 scale-110 shadow-[0_0_20px_rgba(34,211,238,0.75)] z-10'
                        : 'opacity-55 hover:opacity-95 hover:scale-105'
                    }`}
                    title={s.title || s.name}
                  >
                    <img
                      src={resolvePosterUrl(s.poster_path, 'w342')}
                      alt={s.title || s.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = './icon-512.png'; }}
                    />
                  </button>
                );
              })}
            </div>
          )}

        </div>

        {/* Mobile Slide Indicator Dots */}
        {slides.length > 1 && (
          <div className="flex md:hidden items-center gap-1.5 mt-4">
            {slides.map((s, idx) => (
              <button
                key={s.id || idx}
                type="button"
                aria-label={`Slide ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentIndex
                    ? 'w-7 bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                    : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
