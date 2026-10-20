import React, { useRef, useState, useEffect, useMemo, memo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

  const visibleItems = useMemo(() => {
    if (!Array.isArray(items)) return [];
    return items.slice(0, 16);
  }, [items]);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 12);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 12);
  };

  useEffect(() => {
    checkScroll();
  }, [visibleItems.length]);

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
    <BlurFade delay={0.05} inView>
      <section className="relative py-2.5 sm:py-3.5 select-none">
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

        {/* 3D Perspective Horizontal Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-2 perspective-1000"
        >
          {visibleItems.map((item) => {
            const idKey = String(item.id);
            const watchlisted = typeof isWatchlisted === 'function'
              ? isWatchlisted(item.id)
              : watchlistIds instanceof Set
              ? watchlistIds.has(item.id) || watchlistIds.has(Number(item.id)) || watchlistIds.has(idKey)
              : Boolean(isWatchlisted);

            return (
              <div
                key={`${item.id}-${item.media_type || 'media'}`}
                className="w-[125px] xs:w-[138px] sm:w-[156px] md:w-[172px] shrink-0"
              >
                <MediaCard
                  item={item}
                  onPlay={onPlay || onPlayDirect}
                  onOpenDetails={onOpenDetails || onSelect}
                  isWatchlisted={watchlisted}
                  onToggleWatchlist={onToggleWatchlist}
                  progressInfo={progressMap[item.id]}
                />
              </div>
            );
          })}
        </div>
      </section>
    </BlurFade>
  );
});

export default MediaShelf;
