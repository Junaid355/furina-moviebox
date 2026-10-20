import React, { useRef, useState, useEffect, useMemo, memo, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import MediaCard from './MediaCard';
import { BlurFade } from './ui/blur-fade';

const MediaShelf = memo(function MediaShelf({
  title,
  subtitle,
  icon: Icon,
  items = [],
  onPlay,
  onPlayDirect,
  onOpenDetails,
  onSelect,
  onToggleWatchlist,
  isWatchlisted,
  watchlistIds = new Set(),
  progressMap = {},
  accentColor = 'from-cyan-400 to-blue-500',
  badge = '',
  badgeText = '',
  onViewAll
}) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const dragStateRef = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    movedDistance: 0
  });

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 16);
  }, [items]);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [visibleItems.length, checkScroll]);

  // Attach non-passive wheel listener for horizontal gestures (Shift+Wheel or trackpad deltaX)
  // while allowing regular vertical mouse wheel (deltaY) to natively scroll the page.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e) => {
      const isHorizontalGesture = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (!isHorizontalGesture) {
        // Pure vertical mouse wheel: do not intercept so window scrolls vertically without friction
        return;
      }

      const delta = e.shiftKey && e.deltaY !== 0 ? e.deltaY : e.deltaX;
      const canGoLeft = el.scrollLeft > 0 && delta < 0;
      const canGoRight = el.scrollLeft + el.clientWidth < el.scrollWidth - 2 && delta > 0;

      if (canGoLeft || canGoRight) {
        e.preventDefault();
        el.scrollLeft += delta * 1.25;
        checkScroll();
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [checkScroll]);

  // Desktop PC Click-and-Drag Horizontal Carousel Scrolling
  const handleMouseDown = (e) => {
    const el = scrollRef.current;
    if (!el || e.button !== 0) return;
    dragStateRef.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft,
      movedDistance: 0
    };
  };

  const handleMouseMove = (e) => {
    const state = dragStateRef.current;
    const el = scrollRef.current;
    if (!state.isDown || !el) return;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - state.startX) * 1.4;
    state.movedDistance = Math.abs(walk);
    if (state.movedDistance > 6) {
      if (!isDragging) setIsDragging(true);
      e.preventDefault();
      el.scrollLeft = state.scrollLeft - walk;
      checkScroll();
    }
  };

  const stopDragging = () => {
    dragStateRef.current.isDown = false;
    if (isDragging) {
      setTimeout(() => setIsDragging(false), 40);
    }
  };

  const handleClickCapture = (e) => {
    if (dragStateRef.current.movedDistance > 10) {
      e.stopPropagation();
      e.preventDefault();
      dragStateRef.current.movedDistance = 0;
    }
  };

  if (!visibleItems.length) return null;

  const scrollByAmount = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = Math.max(320, el.clientWidth * 0.78);
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
  };

  const resolvedBadge = badge || badgeText;

  return (
    <BlurFade delay={0.04} inView>
      <section data-mcp-shelf="true" className="relative py-2.5 sm:py-3.5 select-none">
        {/* Shelf Header */}
        <div className="mb-2.5 sm:mb-3.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={`w-1.5 h-6 sm:h-7 rounded-full bg-gradient-to-b ${accentColor} shrink-0 shadow-[0_0_14px_rgba(56,189,248,0.65)]`} />
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-400/35 flex items-center justify-center text-cyan-300 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-lg md:text-xl font-black text-white tracking-tight truncate neon-text">
                  {title}
                </h2>
                {resolvedBadge && (
                  <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                    {resolvedBadge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-[10px] sm:text-xs text-cyan-200/65 truncate hidden sm:block">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="px-2.5 py-1 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/35 text-cyan-300 text-[10px] sm:text-xs font-extrabold transition cursor-pointer mr-1"
              >
                View All →
              </button>
            )}
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              disabled={!canScrollLeft}
              aria-label="Scroll shelf left"
              title="Scroll Left (or Drag / Shift+Wheel)"
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                canScrollLeft
                  ? 'bg-[#081533]/90 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/40 border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              disabled={!canScrollRight}
              aria-label="Scroll shelf right"
              title="Scroll Right (or Drag / Shift+Wheel)"
              className={`w-8 h-8 rounded-xl border flex items-center justify-center transition cursor-pointer ${
                canScrollRight
                  ? 'bg-[#081533]/90 border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/25 hover:border-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                  : 'bg-slate-900/40 border-white/5 text-slate-600 opacity-40 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 3D Perspective Horizontal Carousel (No scroll-smooth class so wheel & drag respond immediately) */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={stopDragging}
          onMouseLeave={stopDragging}
          onClickCapture={handleClickCapture}
          style={{ touchAction: 'pan-x pan-y', scrollBehavior: 'auto' }}
          className={`flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar py-2.5 perspective-1000 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
        >
          {visibleItems.map((item, idx) => {
            const idKey = String(item.id);
            const watchlisted = typeof isWatchlisted === 'function'
              ? isWatchlisted(item.id)
              : watchlistIds instanceof Set
              ? watchlistIds.has(item.id) || watchlistIds.has(Number(item.id)) || watchlistIds.has(idKey)
              : Boolean(isWatchlisted);

            return (
              <motion.div
                key={`${item.id}-${item.media_type || 'media'}`}
                initial={{ opacity: 0, y: 14, rotateX: 8 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.38,
                  delay: Math.min(idx * 0.03, 0.24),
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="w-[125px] xs:w-[138px] sm:w-[156px] md:w-[172px] shrink-0"
              >
                <MediaCard
                  item={item}
                  onPlay={onPlay}
                  onPlayDirect={onPlayDirect}
                  onOpenDetails={onOpenDetails || onSelect}
                  onToggleWatchlist={onToggleWatchlist}
                  isWatchlisted={watchlisted}
                  progress={progressMap[item.id] || progressMap[idKey]}
                />
              </motion.div>
            );
          })}
        </div>
      </section>
    </BlurFade>
  );
});

export default MediaShelf;
