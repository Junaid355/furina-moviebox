import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Heart, Sparkles, X, Shield, Lock, Settings, Smartphone, Skull, Volume2, VolumeX } from 'lucide-react';
import soundFx from '../services/soundFx';

export function HanimeIcon({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4", ...props }) {
  return (
    <img 
      src="./hanime_icon.png" 
      alt="Hanime Vault" 
      className={`rounded-full object-contain inline-block filter drop-shadow-[0_0_6px_rgba(255,20,147,0.7)] ${className}`}
      {...props} 
    />
  );
}

export default function Navbar({ 
  activeCategory, 
  setActiveCategory, 
  onSearch, 
  searchQuery, 
  setSearchQuery,
  isStealthMode,
  isMasterMode,
  includeMature,
  onOpenSettings,
  onOpenIPhoneModal,
  onOpenAndroidModal,
  onOpenStudio
}) {
  // Base categories: Studio removed from pills to eliminate duplication (available in right actions)
  const baseCategories = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'hollywood', label: 'Hollywood', icon: Film },
    { id: 'hindi', label: 'Hindi', icon: Sparkles },
    { id: 'kdrama', label: 'K-Drama', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: 'horror', label: 'Horror', icon: Skull },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'watchlist', label: 'Watchlist', icon: Heart }
  ];

  const categories = isMasterMode
    ? [
        ...baseCategories.slice(0, 5),
        { id: 'mature', label: 'Uncut', icon: Flame, isVault: true },
        { id: 'ecchi_anime', label: 'Hanime', icon: HanimeIcon, isVault: true },
        ...baseCategories.slice(5)
      ]
    : baseCategories;

  // Local state buffering & caret preservation to eliminate mobile keyboard cursor reset ("backwalk")
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isSoundOn, setIsSoundOn] = useState(() => !soundFx.isMuted());
  const inputRef = useRef(null);
  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const lastEmittedQueryRef = useRef(searchQuery || '');

  // Synchronize local search with external parent changes
  useEffect(() => {
    if (!isFocusedRef.current) {
      setLocalSearch(searchQuery || '');
      lastEmittedQueryRef.current = searchQuery || '';
    }
  }, [searchQuery]);

  const handleInputChange = (e) => {
    const nextVal = e.target.value;
    setLocalSearch(nextVal);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!nextVal.trim()) {
      lastEmittedQueryRef.current = '';
      onSearch('');
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      if (!isComposingRef.current) {
        lastEmittedQueryRef.current = nextVal;
        onSearch(nextVal);
      }
    }, 300);
  };

  const handleKeyDown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      lastEmittedQueryRef.current = localSearch;
      onSearch(localSearch);
      e.target.blur();
    } else if (e.key === 'Escape') {
      if (localSearch) {
        handleClear();
      }
      e.target.blur();
    }
  };

  const handleClear = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    lastEmittedQueryRef.current = '';
    setLocalSearch('');
    onSearch('');
  };

  return (
    <header className="sticky top-0 z-40 glass-nav px-2 sm:px-4 py-2 w-full overflow-hidden">
      <div className="w-full max-w-full mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Brand Logo - Compact Cozy Scale */}
        <div 
          onClick={() => { setActiveCategory('trending'); setSearchQuery(''); }}
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group shrink-0"
        >
          {isStealthMode ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600/50 flex items-center justify-center text-cyan-400 font-black text-xs shadow">
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </div>
          ) : (
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-cyan-400/60 shadow-[0_0_8px_rgba(77,197,249,0.5)] group-hover:scale-105 transition">
              <img src="./favicon.png" alt="Furina MovieBox" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="shrink-0">
            <div className="flex items-center gap-1">
              <span className={`font-extrabold text-sm sm:text-base tracking-tight ${
                isStealthMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent'
              }`}>
                {isStealthMode ? 'Stream' : 'Furina'}
              </span>
              <span className="font-bold text-sm sm:text-base text-white">
                {isStealthMode ? 'Cinema' : 'MovieBox'}
              </span>
            </div>
            <div className="text-[8.5px] text-cyan-300/80 font-medium tracking-wider uppercase hidden 2xl:block">
              {isStealthMode ? 'HD Stream Player' : '4K Movies & Web Series'}
            </div>
          </div>
        </div>

        {/* Cozy Compact Search Bar */}
        <div className="w-36 sm:w-48 lg:w-44 xl:w-56 focus-within:w-64 transition-all duration-300 relative shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={localSearch}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { isFocusedRef.current = true; }}
              onBlur={() => { isFocusedRef.current = false; }}
              onCompositionStart={() => { isComposingRef.current = true; }}
              onCompositionEnd={(e) => {
                isComposingRef.current = false;
                handleInputChange(e);
              }}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="none"
              spellCheck="false"
              enterKeyHint="search"
              placeholder="Search..."
              className="w-full bg-[#0b1633]/90 border border-cyan-500/25 rounded-full pl-7 pr-7 py-1 text-xs text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition shadow-inner"
            />
            {localSearch && (
              <>
                <button 
                  onClick={handleClear}
                  className="absolute right-2 text-cyan-400/60 hover:text-white cursor-pointer"
                  type="button"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClear}
                  className="sr-only"
                  type="button"
                  aria-label="Clear search input"
                  tabIndex={-1}
                />
              </>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation: shrinks flexibly, internal scroll if tight, NEVER forces parent overflow */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0a1329]/80 p-0.5 rounded-full border border-cyan-500/20 min-w-0 shrink overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                  setLocalSearch('');
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition shrink-0 cursor-pointer ${
                  cat.isVault
                    ? isActive
                      ? 'bg-amber-500 text-gray-950 font-bold shadow'
                      : 'text-amber-400 hover:bg-amber-500/10'
                    : isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_10px_rgba(77,197,249,0.4)]'
                    : 'text-cyan-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Movie Studio, Apps, Audio FX, Settings (Pinned inside right margin, zero overflow) */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          <button
            onClick={onOpenStudio}
            data-testid="studio-btn"
            title="Furina Movie Studio & Content Platform"
            className="px-2.5 py-1 rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 text-cyan-300 hover:text-white transition flex items-center gap-1 text-[11px] font-bold cursor-pointer shadow-sm shrink-0"
          >
            <Film className="w-3 h-3 text-cyan-400" />
            <span>Studio</span>
          </button>

          <button
            onClick={onOpenAndroidModal}
            title="Install App on Android (1-Tap Standalone PWA & Native)"
            className="px-2 py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:text-white hover:bg-emerald-500/25 transition flex items-center gap-1 text-[11px] font-bold cursor-pointer shrink-0"
          >
            <Smartphone className="w-3 h-3 text-emerald-400" />
            <span className="hidden sm:inline">Android App</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={onOpenIPhoneModal}
            title="Install App on iPhone / iPad (Zero Ads)"
            className="hidden sm:flex px-2 py-1 rounded-full border border-cyan-500/30 bg-[#0b1633] text-cyan-300 hover:text-white hover:bg-white/10 transition items-center gap-1 text-[11px] font-semibold cursor-pointer shrink-0"
          >
            <Smartphone className="w-3 h-3 text-cyan-400" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => {
              const unmuted = soundFx.toggleMute();
              setIsSoundOn(unmuted);
            }}
            data-testid="cozy-sound-btn"
            title={isSoundOn ? 'Cozy Sound FX: Active (Click to Mute)' : 'Cozy Sound FX: Muted (Click to Enable)'}
            className={`p-1.5 rounded-full border transition flex items-center gap-1 cursor-pointer shrink-0 ${
              isSoundOn
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_8px_rgba(251,146,60,0.3)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-300" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden 2xl:inline text-[11px] font-semibold">
              {isSoundOn ? 'Audio' : 'Muted'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            data-testid="settings-btn"
            title="Settings & Master Vault"
            className={`px-2 py-1 rounded-full border transition flex items-center gap-1 cursor-pointer shrink-0 ${
              isMasterMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {isMasterMode ? <Shield className="w-3.5 h-3.5 text-emerald-400" /> : <Settings className="w-3.5 h-3.5 text-cyan-400" />}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isMasterMode ? 'VIP Active' : 'Settings'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Category Scrollable Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1.5 pt-2 pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id && !searchQuery;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition border ${
                cat.isVault
                  ? isActive
                    ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(77,197,249,0.3)] font-semibold'
                  : 'bg-[#0c1836]/60 border-cyan-500/15 text-cyan-200/60'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
