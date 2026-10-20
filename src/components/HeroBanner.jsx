import React, { useState, useEffect, useRef, memo } from 'react';
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight, Volume2, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isHindiAvailable } from '../services/tmdb';
import { resolveBackdropUrl, resolvePosterUrl, extractGenres, getGenreBadgeStyle } from '../services/contentModel';
import soundFx from '../services/soundFx';

const HeroBanner = memo(function HeroBanner({
  items = [],
  item,
  onPlay,
  onOpenDetails,
  onSelectInfo,
  onWatchTogether,
  onOpenWatchTogether,
  isWatchlisted,
  watchlist = [],
  onToggleWatchlist,
  isPaused = false
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const timerRef = useRef(null);

  const slides = Array.isArray(items) && items.length > 0 ? items.slice(0, 6) : item ? [item] : [];

  useEffect(() => {
    if (slides.length <= 1 || isHovered || isPaused) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [slides.length, isHovered, isPaused]);

  if (!slides.length) return null;

  const current = slides[currentIndex] || slides[0];
  const title = current.title || current.name || 'Featured Premiere';
  const overview = current.overview || 'Stream in 4K Ultra HD with synchronized Multi-Dub audio (Hindi, English & Japanese) and Watch Together rooms.';
  const year = (current.release_date || current.first_air_date || current.year || '2025').toString().slice(0, 4);
  const rating = current.vote_average ? Number(current.vote_average).toFixed(1) : '8.7';
  const isSeries = current.media_type === 'tv' || current.type === 'tv' || Boolean(current.first_air_date);
  const hasHindi = Boolean(
    current.hasHindiDub ||
    current.isHindiDubbed ||
    current.category === 'hindi' ||
    current.original_language === 'hi' ||
    isHindiAvailable(current)
  );
  const genres = extractGenres(current).slice(0, 3);
  const backdropUrl = resolveBackdropUrl(current);
  const posterUrl = resolvePosterUrl(current, 'w500');

  const detailsHandler = onOpenDetails || onSelectInfo;
  const watchTogetherHandler = onWatchTogether || onOpenWatchTogether;
  const inWatchlist = typeof isWatchlisted === 'function'
    ? isWatchlisted(current.id)
    : Array.isArray(watchlist) && watchlist.some((w) => String(w.id) === String(current.id));

  const goPrev = () => {
    soundFx.playClick?.();
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goNext = () => {
    soundFx.playClick?.();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full pt-2 pb-3 select-none perspective-1000"
    >
      <div className="relative w-full min-h-[270px] sm:min-h-[340px] md:min-h-[390px] rounded-3xl overflow-hidden border border-cyan-400/35 bg-[#040a1a] shadow-[0_24px_60px_rgba(0,0,0,0.85),0_0_35px_rgba(6,182,212,0.2)] flex items-end">
        {/* Top 3D Specular Highlight */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-300/90 to-transparent z-20" />

        {/* Animated Backdrop Image */}
        <AnimatePresence mode="wait">
          <motion.img
            key={`backdrop-${current.id}`}
            src={backdropUrl}
            alt={title}
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 0.72, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            onError={(e) => {
              e.currentTarget.src = posterUrl || './icon-512.png';
            }}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        </AnimatePresence>

        {/* Multi-Stop Cinema Vignettes */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent sm:w-4/5" />

        {/* Content & 3D Floating Poster Card */}
        <div className="relative z-10 w-full p-4 sm:p-7 md:p-9 flex items-end justify-between gap-6">
          <motion.div
            key={`info-${current.id}`}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="max-w-2xl space-y-2.5 sm:space-y-3.5"
          >
            {/* Official Cinema Brand Logo Badge + Multi-Dub Pill */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 shadow-[0_0_16px_rgba(56,189,248,0.65)]">
                <Sparkles className="w-3 h-3 fill-gray-950" />
                FURINA 4K PREMIERE
              </span>

              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-950/90 text-amber-300 border border-amber-400/45 shadow-[0_0_10px_rgba(245,158,11,0.25)]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {rating}
              </span>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-200 border border-white/15">
                {year} • {isSeries ? 'TV SERIES' : '4K MOVIE'}
              </span>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-400/45 shadow-[0_0_12px_rgba(245,158,11,0.3)]">
                <Volume2 className="w-3 h-3 text-amber-400" />
                {hasHindi ? '🇮🇳 Hindi • 🇬🇧 EN • 🇯🇵 JA' : '🎧 Multi-Dub (HI / EN / JA)'}
              </span>

              {/* Color-Coded Genre Tags */}
              {genres.map((genre) => {
                const style = getGenreBadgeStyle(genre);
                return (
                  <span
                    key={genre}
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${style.badgeClass}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${style.dotClass}`} />
                    {style.label}
                  </span>
                );
              })}
            </div>

            {/* Movie Title Emblem */}
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] neon-text line-clamp-2">
              {title}
            </h1>

            {/* Overview */}
            <p className="text-xs sm:text-sm text-slate-300/95 line-clamp-2 max-w-xl leading-relaxed">
              {overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  onPlay?.(current);
                }}
                className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_25px_rgba(56,189,248,0.65)] hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-gray-950 text-gray-950" />
                <span>Watch Now (Multi-Dub 4K)</span>
              </button>

              {watchTogetherHandler && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    watchTogetherHandler(current);
                  }}
                  className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-purple-500/25 hover:bg-purple-500/35 text-purple-200 border border-purple-400/50 font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-[0_0_18px_rgba(168,85,247,0.3)] transition cursor-pointer"
                >
                  <Users className="w-3.5 h-3.5 text-purple-300" />
                  <span>Watch Together</span>
                </button>
              )}

              {detailsHandler && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    detailsHandler(current);
                  }}
                  className="px-3.5 py-2 sm:py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Info className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Details</span>
                </button>
              )}

              {onToggleWatchlist && (
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    onToggleWatchlist(current);
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl border transition cursor-pointer ${
                    inWatchlist
                      ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-slate-900/80 border-white/15 text-slate-300 hover:text-white hover:border-cyan-400/40'
                  }`}
                  title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                >
                  {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </button>
              )}
            </div>
          </motion.div>

          {/* Right Side: 3D Floating Movie Poster & Official Emblem Card */}
          <motion.div
            key={`poster-${current.id}`}
            initial={{ opacity: 0, rotateY: -16, scale: 0.92 }}
            animate={{ opacity: 1, rotateY: -8, scale: 1 }}
            transition={{ duration: 0.45 }}
            onClick={() => onPlay?.(current)}
            className="hidden md:flex flex-col items-center shrink-0 mr-10 cursor-pointer group/heroposter"
          >
            <div className="relative w-32 lg:w-36 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-cyan-400/60 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(56,189,248,0.45)] group-hover/heroposter:scale-105 transition-transform duration-300">
              <img
                src={posterUrl}
                alt={title}
                onError={(e) => {
                  e.currentTarget.src = './icon-512.png';
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end justify-center p-2">
                <span className="px-2 py-0.5 rounded-md bg-cyan-500/90 text-gray-950 text-[9px] font-black uppercase tracking-wider shadow">
                  ▶ PLAY 4K
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Slide Navigation & Dots */}
        {slides.length > 1 && (
          <div className="absolute bottom-3 right-3 sm:bottom-5 sm:right-5 z-20 flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 mr-1">
              {slides.map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setCurrentIndex(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.9)]' : 'w-1.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous slide"
              className="w-8 h-8 rounded-xl bg-slate-950/85 hover:bg-cyan-500/30 border border-cyan-500/35 text-cyan-200 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next slide"
              className="w-8 h-8 rounded-xl bg-slate-950/85 hover:bg-cyan-500/30 border border-cyan-500/35 text-cyan-200 flex items-center justify-center transition cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

export default HeroBanner;
