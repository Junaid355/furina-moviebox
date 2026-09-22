import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MediaCard from './MediaCard';

export default function MediaShelf({ 
  title, 
  subtitle, 
  icon: Icon, 
  items = [], 
  onPlay, 
  isWatchlisted, 
  onToggleWatchlist,
  onViewAll,
  badgeText,
  badge,
  onOpenDetails
}) {
  const displayBadge = badgeText || badge;
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [items]);

  const handleScroll = (direction) => {
    if (!scrollRef.current) return;
    const distance = scrollRef.current.clientWidth * 0.75;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 350);
  };

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <section className="relative my-6 sm:my-8 group/shelf">
      {/* Shelf Header */}
      <div className="flex items-center justify-between gap-3 mb-3 sm:mb-4 px-1">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
          {Icon && (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shrink-0 shadow-sm">
              <Icon className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight truncate drop-shadow-sm">
                {title}
              </h2>
              {displayBadge && (
                <span className="hidden sm:inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {displayBadge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[11px] sm:text-xs text-slate-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Shelf Actions & Arrows */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="text-[11px] sm:text-xs font-bold text-cyan-400 hover:text-cyan-300 px-2 sm:px-2.5 py-1 rounded-lg hover:bg-cyan-500/10 transition border border-transparent hover:border-cyan-500/30 mr-1"
            >
              Explore All →
            </button>
          )}

          {/* Left Arrow */}
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
              canScrollLeft
                ? 'bg-black/70 hover:bg-cyan-500 hover:text-gray-950 text-white border-white/10 hover:border-cyan-400 shadow-md cursor-pointer'
                : 'bg-black/30 text-white/20 border-transparent cursor-not-allowed opacity-30'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Right Arrow */}
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center backdrop-blur-md border transition ${
              canScrollRight
                ? 'bg-black/70 hover:bg-cyan-500 hover:text-gray-950 text-white border-white/10 hover:border-cyan-400 shadow-md cursor-pointer'
                : 'bg-black/30 text-white/20 border-transparent cursor-not-allowed opacity-30'
            }`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal Carousel Track */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-3 sm:gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-2 pt-1 px-1 snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {items.map((item) => (
          <div
            key={`shelf-${item.id}-${item.title}`}
            className="w-[140px] sm:w-[170px] md:w-[190px] lg:w-[205px] shrink-0 snap-start"
          >
            <MediaCard
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              isWatchlisted={isWatchlisted ? isWatchlisted(item.id) : false}
              onToggleWatchlist={onToggleWatchlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
