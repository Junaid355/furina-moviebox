import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Check, Star, Info, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { isHindiAvailable } from '../services/tmdb';
import { resolveBackdropUrl, extractGenres } from '../services/contentModel';
import soundFx from '../services/soundFx';
import { BorderBeam } from './ui/border-beam';
import { Spotlight } from './ui/spotlight';
import { SparklesCore } from './ui/sparkles';
import { Ripple } from './ui/ripple';
import { ShimmerButton } from './ui/shimmer-button';
import { GlowEffect } from './ui/glow-effect';

export default function HeroBanner({ 
  items, 
  item, 
  onPlay, 
  isWatchlisted, 
  onToggleWatchlist,
  onOpenDetails 
}) {
  const list = (Array.isArray(items) && items.length > 0)
    ? items.filter(Boolean).slice(0, 8)
    : (item ? [item] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const cardRef = useRef(null);
  const glareRef = useRef(null);
  const rafId = useRef(null);

  useEffect(() => {
    if (list.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % list.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [list.length, isPaused]);

  // 60-120 FPS Direct RAF DOM transform (Zero React re-renders on mousemove)
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -6;
    const rotY = ((x - centerX) / centerX) * 6;
    const gx = Math.round((x / rect.width) * 100);
    const gy = Math.round((y / rect.height) * 100);

    rafId.current = requestAnimationFrame(() => {
      if (cardRef.current) {
        cardRef.current.style.transition = 'none';
        cardRef.current.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.008, 1.008, 1.008)`;
      }
      if (glareRef.current) {
        glareRef.current.style.opacity = '0.28';
        glareRef.current.style.background = `radial-gradient(circle at ${gx}% ${gy}%, rgba(255,255,255,0.22) 0%, rgba(0,242,254,0.15) 30%, transparent 65%)`;
      }
    });
  };

  const handleMouseLeave = () => {
    setIsPaused(false);
    if (rafId.current) cancelAnimationFrame(rafId.current);
    if (cardRef.current) {
      cardRef.current.style.transition = 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      cardRef.current.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    }
    if (glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  };

  if (list.length === 0) return null;
  const currentItem = list[currentIndex] || list[0] || {};

  const title = currentItem?.title || currentItem?.name || 'Featured Blockbuster';
  const year = String(currentItem?.release_date || currentItem?.first_air_date || '').substring(0, 4) || '2024';
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
    currentItem?.original_language === 'ja'
  );

  const isHindi = Boolean(
    currentItem?.languages?.hi?.url ||
    currentItem?.isHindiDubbed ||
    isHindiAvailable(currentItem)
  );

  const genres = extractGenres(currentItem);
  const runtime = currentItem?.runtime || (isSeries ? '45m / ep' : '2h 10m');
  const saved = (isWatchlisted && currentItem?.id) ? isWatchlisted(currentItem.id) : false;

  const handlePlayClick = () => {
    soundFx.playStartChime();
    onPlay(currentItem);
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transformStyle: 'preserve-3d'
      }}
      className="relative w-full h-[40vh] sm:h-[65vh] max-h-[580px] overflow-hidden rounded-2xl sm:rounded-3xl mb-5 sm:mb-8 border-2 border-cyan-400/50 shadow-[0_25px_70px_rgba(0,0,0,0.92),0_0_45px_rgba(0,242,254,0.35),inset_0_0_35px_rgba(0,242,254,0.15)] group [transform-style:preserve-3d]"
    >
      {/* Theatrical Overhead Stage Lamp Fixture with radiant cyan hydro lighting */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent z-20 shadow-[0_0_35px_#00f2fe,0_0_15px_#38bdf8]" />
      <div className="absolute -top-1 left-1/4 -translate-x-1/2 w-48 sm:w-80 h-3 bg-cyan-400/50 rounded-full blur-md z-20 pointer-events-none" />
      <div className="absolute -top-16 left-8 md:left-32 w-80 h-80 bg-[#00f2fe]/25 rounded-full blur-3xl pointer-events-none z-10" />

      {/* Dual Animated Moving Border Beams tracing the perimeter */}
      <BorderBeam size={340} duration={8} colorFrom="#00f2fe" colorTo="#38bdf8" borderWidth={2.5} />
      <BorderBeam size={240} duration={12} delay={4} colorFrom="#38bdf8" colorTo="#2563eb" borderWidth={2} />

      {/* Aceternity Overhead Glowing Lamp / Spotlight Cone illuminating Title */}
      <div 
        className="absolute -top-10 left-0 sm:left-12 w-full max-w-2xl h-[420px] pointer-events-none z-10 opacity-80 mix-blend-screen"
        style={{
          background: 'radial-gradient(ellipse 60% 70% at 30% 0%, rgba(0, 242, 254, 0.45) 0%, rgba(56, 189, 248, 0.22) 40%, rgba(37, 99, 235, 0.08) 65%, transparent 85%)'
        }}
      />
      <Spotlight className="-top-28 left-2 md:left-20 md:-top-16" fill="rgba(0, 242, 254, 0.6)" />

      {/* 3D Specular Glare Reflection Layer */}
      <div 
        ref={glareRef}
        className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300 rounded-2xl sm:rounded-3xl opacity-0"
      />

      {/* Background Poster Image with smooth crossfade */}
      <div className="absolute inset-0 bg-[#030712]">
        <img
          key={currentItem?.id}
          src={resolveBackdropUrl(currentItem?.backdrop_path || currentItem?.poster_path)}
          alt={title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = './icon-512.png';
          }}
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 group-hover:scale-100 filter brightness-95 animate-fade-in"
        />
      </div>

      {/* Cinematic Vignette Gradients */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/65 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/85 to-transparent max-w-4xl pointer-events-none" />

      {/* Ambient hydro lighting and sparkles */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <SparklesCore
        id="hero-sparkles"
        particleDensity={28}
        particleColor="#38bdf8"
        minSize={0.6}
        maxSize={2.2}
        className="opacity-75 z-10"
      />

      {/* Theatrical Fontaine Opera Stage: Lady Furina Performing Prominently */}
      <div 
        className="hidden md:flex absolute top-7 right-8 z-30 flex-col items-center p-3.5 rounded-2xl bg-gradient-to-b from-[#091a42]/90 via-[#050f29]/95 to-[#03081a]/95 border-2 border-cyan-400/50 shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.4)] backdrop-blur-xl group/stage hover:scale-105 transition-all duration-300 pointer-events-auto cursor-pointer"
        style={{ transform: 'translateZ(55px)' }}
        onClick={() => soundFx.playWaterDrop()}
        title="Lady Furina's Fontaine Theatrical Stage"
      >
        {/* Stage Spotlight Glow */}
        <div className="absolute -top-3 w-20 h-20 bg-cyan-400/30 rounded-full blur-xl pointer-events-none" />
        
        {/* Top Stage Header with Gold Trim */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/25 via-cyan-500/20 to-blue-500/25 border border-amber-300/40 text-amber-300 text-[10px] font-black tracking-wider uppercase mb-2 shadow">
          <span>👑</span>
          <span>Fontaine Opera Stage</span>
        </div>

        {/* Animated Furina Mascot Dancing on Platform */}
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-cyan-300 shadow-[0_0_22px_rgba(0,242,254,0.75)] bg-[#040a1c] mb-2">
          <img
            src="./furina_chibi.gif"
            alt="Furina Chibi Mascot Stage Performance"
            className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-200"
          />
          <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-cyan-400/50 to-transparent pointer-events-none" />
        </div>

        {/* Stage Dialogue Pill */}
        <div className="px-2.5 py-1 rounded-xl bg-cyan-950/85 border border-cyan-400/40 text-center max-w-[155px]">
          <span className="text-[10px] font-extrabold text-cyan-200 flex items-center justify-center gap-1">
            <span className="animate-spin text-xs">✨</span>
            <span>Furina Premiere</span>
          </span>
          <p className="text-[8.5px] text-cyan-300/90 mt-0.5 font-medium leading-tight">
            "Behold, Fontaine's finest 4K cinema!"
          </p>
        </div>
      </div>

      {/* Content */}
      <div 
        className="absolute bottom-0 left-0 right-0 p-3 sm:p-8 md:p-12 max-w-3xl z-10 animate-fade-in [transform-style:preserve-3d]" 
        key={`content-${currentItem?.id}`}
      >
        
        {/* Furina Mascot Top Premiere Tag */}
        <div 
          className="flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-3 flex-wrap transition-transform duration-200"
          style={{ transform: 'translateZ(36px)' }}
        >
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 rounded-full bg-cyan-950/85 border border-cyan-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)] backdrop-blur-md">
            <img 
              src="./furina_chibi.gif" 
              alt="Furina Chibi" 
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full object-cover border border-cyan-300"
            />
            <span className="text-[8px] sm:text-[9.5px] font-black uppercase tracking-wider text-cyan-300">Furina Premiere</span>
          </div>

          <span className="badge-4k-uhd text-[8px] sm:text-[10px] px-2 sm:px-3 py-0.5 rounded-full shadow-lg tracking-wider uppercase border border-cyan-300/40">
            4K Ultra HD
          </span>
          {isHindi && (
            <span className="badge-hindi-gold text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-amber-300/40">
              <span>🇮🇳</span>
              <span>Hindi Audio</span>
            </span>
          )}
          {isAnime && (
            <span className="badge-fhd text-[8px] sm:text-[10px] px-1.5 sm:px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-purple-300/40">
              <span>🇯🇵</span>
              <span>SUB / 🎙️ DUB</span>
            </span>
          )}
          {isSeries ? (
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Web Series
            </span>
          ) : (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] sm:text-[11px] font-bold px-2 sm:px-2.5 py-0.5 rounded-full backdrop-blur-sm">
              Cinema Movie
            </span>
          )}
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-1.5 sm:px-2.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 font-extrabold text-[10px] sm:text-xs">
            <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-amber-400" />
            {rating}
          </span>
          <span className="text-cyan-200/70 text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 bg-white/5 rounded-full border border-white/5">{year}</span>
          {runtime && (
            <span className="text-slate-300 text-[10px] sm:text-xs font-medium px-1.5 sm:px-2 py-0.5 bg-white/5 rounded-full border border-white/5 hidden xs:inline">{runtime}</span>
          )}
        </div>

        <h1 
          className="text-lg xs:text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight mb-1 sm:mb-2 leading-tight drop-shadow-[0_4px_18px_rgba(0,242,254,0.45)] transition-transform duration-200 line-clamp-1 xs:line-clamp-2"
          style={{ transform: 'translateZ(50px)' }}
        >
          {title}
        </h1>

        {genres.length > 0 && (
          <div 
            className="hidden xs:flex items-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-3 flex-wrap transition-transform duration-200"
            style={{ transform: 'translateZ(34px)' }}
          >
            {genres.slice(0, 3).map((g) => (
              <span key={g} className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md bg-cyan-950/70 border border-cyan-500/40 text-cyan-300">
                {g}
              </span>
            ))}
          </div>
        )}

        <p 
          className="text-[11px] sm:text-sm text-cyan-100/90 line-clamp-1 sm:line-clamp-3 mb-2.5 sm:mb-6 max-w-xl font-medium leading-relaxed drop-shadow transition-transform duration-200"
          style={{ transform: 'translateZ(28px)' }}
        >
          {currentItem?.overview}
        </p>

        <div 
          className="flex items-center gap-2 sm:gap-3.5 flex-wrap transition-transform duration-200"
          style={{ transform: 'translateZ(60px)' }}
        >
          <div className="relative group/playbtn">
            <GlowEffect mode="rotate" blur="medium" scale={1.05} duration={3} colors={['#00f2fe', '#38bdf8', '#2563eb', '#7c3aed']} />
            <ShimmerButton
              onClick={handlePlayClick}
              shimmerColor="#ffffff"
              shimmerDuration="2.5s"
              background="linear-gradient(135deg, #00f2fe 0%, #0284c7 50%, #2563eb 100%)"
              className="text-gray-950 font-black text-xs sm:text-sm px-4 py-2 sm:px-8 sm:py-3.5 shadow-[0_0_25px_rgba(0,242,254,0.85)] border-2 border-white/60 hover:scale-105 active:scale-95 transition-all"
            >
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-gray-950 ml-0.5" />
              <span className="tracking-wide">Watch in 4K</span>
            </ShimmerButton>
          </div>

          {onOpenDetails && (
            <button
              onClick={() => {
                soundFx.playClick();
                onOpenDetails(currentItem);
              }}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-6 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all border backdrop-blur-xl bg-slate-950/80 border-cyan-400/40 text-cyan-200 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.2)] hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300 bounce-hover" />
              <span>Details</span>
            </button>
          )}

          <button
            onClick={() => {
              soundFx.playClick();
              onToggleWatchlist(currentItem);
            }}
            className={`flex items-center gap-1.5 px-3 py-2 sm:px-6 sm:py-3.5 rounded-full text-xs sm:text-sm font-bold transition-all border backdrop-blur-xl cursor-pointer hover:scale-105 active:scale-95 ${
              saved
                ? 'bg-cyan-500/25 border-cyan-400 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.4)]'
                : 'bg-slate-950/80 border-cyan-400/30 text-slate-200 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-300'
            }`}
          >
            {saved ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> : <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />}
            <span>{saved ? 'Saved' : '+ Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Carousel Dots & Controls (if more than 1 item) */}
      {list.length > 1 && (
        <div className="hidden xs:flex absolute bottom-3 right-3 sm:bottom-10 sm:right-12 z-20 items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + list.length) % list.length)}
            aria-label="Previous Featured Slide"
            className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition hover:scale-110 active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1.5 px-2">
            {list.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx ? 'w-6 bg-cyan-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
              />
            ))}
          </div>

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
