import React, { useState, useEffect } from 'react';
import { Play, Plus, Check, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { BACKDROP_BASE, isHindiAvailable, isHindiDubbedAnime } from '../services/tmdb';

export default function HeroBanner({ items, item, onPlay, isWatchlisted, onToggleWatchlist }) {
  // Support both items array or single item prop
  const list = (Array.isArray(items) && items.length > 0)
    ? items.filter(Boolean).slice(0, 6)
    : (item ? [item] : []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (list.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 6500);
    return () => clearInterval(timer);
  }, [list.length, isPaused]);

  if (list.length === 0) return null;
  const currentItem = list[currentIndex] || list[0] || {};

  const title = currentItem?.title || currentItem?.name || 'Featured Blockbuster';
  const year = String(currentItem?.release_date || currentItem?.first_air_date || '').substring(0, 4);
  const rating = typeof currentItem?.vote_average === 'number'
    ? currentItem.vote_average.toFixed(1)
    : (currentItem?.vote_average || '8.2');

  const isSeries = Boolean(
    currentItem?.media_type === 'tv' || 
    Boolean(currentItem?.first_air_date) || 
    currentItem?.category === 'series' || 
    currentItem?.category === 'kdrama'
  );

  const isAnime = Boolean(
    currentItem?.category === 'anime' ||
    currentItem?.category === 'ecchi_anime' ||
    currentItem?.isAnime === true ||
    currentItem?.original_language === 'ja' ||
    (Array.isArray(currentItem?.origin_country) && currentItem.origin_country.includes('JP')) ||
    ((currentItem?.genre_ids?.includes(16) || currentItem?.genres?.some((g) => g.id === 16 || g.name === 'Animation')) && currentItem?.original_language === 'ja')
  );

  const isHindi = Boolean(
    currentItem?.languages?.hi?.url ||
    (isAnime ? isHindiDubbedAnime(currentItem) : isHindiAvailable(currentItem))
  );

  const saved = (isWatchlisted && currentItem?.id) ? isWatchlisted(currentItem.id) : false;

  return (
    <div 
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full h-[52vh] sm:h-[65vh] max-h-[580px] overflow-hidden rounded-3xl mb-8 border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] group"
    >
      {/* Background Poster Image with smooth crossfade */}
      <div className="absolute inset-0 bg-[#030712]">
        <img
          key={currentItem?.id}
          src={currentItem?.backdrop_path ? (currentItem.backdrop_path.startsWith('http') ? currentItem.backdrop_path : `${BACKDROP_BASE}${currentItem.backdrop_path}`) : './icon-512.png'}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = './icon-512.png';
          }}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 group-hover:scale-100 filter brightness-95 animate-fade-in"
        />
      </div>

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/60 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent max-w-4xl pointer-events-none" />

      {/* Ambient hydro lighting */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-12 max-w-3xl z-10 animate-fade-in" key={`content-${currentItem?.id}`}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-600 text-gray-950 font-black text-[10px] px-3 py-0.5 rounded-full shadow-lg tracking-wider uppercase">
            4K Ultra HD
          </span>
          {isHindi && (
            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-gray-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>🇮🇳</span>
              <span>Hindi Audio</span>
            </span>
          )}
          {isAnime && (
            <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
              <span>🇯🇵</span>
              <span>SUB / 🎙️ DUB</span>
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
          {currentItem?.overview}
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onPlay(currentItem)}
            className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 font-black px-7 py-3.5 rounded-full text-sm transition-all duration-300 shadow-[0_0_25px_rgba(56,189,248,0.6)] transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
            <span>Watch in 4K</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(currentItem)}
            className={`flex items-center gap-2 px-5 py-3.5 rounded-full text-sm font-bold transition-all border backdrop-blur-md ${
              saved
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.3)]'
                : 'bg-[#0e1b3d]/70 border-cyan-500/30 text-white hover:bg-white/10'
            }`}
          >
            {saved ? <Check className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4" />}
            <span>{saved ? 'Saved' : '+ Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Carousel Dots & Controls (if more than 1 item) */}
      {list.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:bottom-10 sm:right-12 z-20 flex items-center gap-2">
          {/* Previous Arrow */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + list.length) % list.length)}
            aria-label="Previous Featured Slide"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
            {list.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  currentIndex === idx ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

          {/* Next Arrow */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % list.length)}
            aria-label="Next Featured Slide"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
