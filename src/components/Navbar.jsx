import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Heart, Sparkles, X, Shield, Lock, Settings, Smartphone, Skull, Volume2, VolumeX, Command } from 'lucide-react';
import soundFx from '../services/soundFx';

export function HanimeIcon({ className = "w-3.5 h-3.5 sm:w-4 sm:h-4", ...props }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (imgFailed) {
    return (
      <span 
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-pink-400 text-white font-black text-[9px] sm:text-[10px] leading-none shadow-[0_0_8px_rgba(244,63,94,0.6)] select-none border border-pink-300/40 shrink-0 ${className}`}
        title="Hanime Vault"
        {...props}
      >
        H
      </span>
    );
  }
  return (
    <img 
      src="./hanime_icon.png" 
      alt="Hanime Vault" 
      onError={() => setImgFailed(true)}
      className={`rounded-full object-contain inline-block filter drop-shadow-[0_0_6px_rgba(255,20,147,0.7)] shrink-0 ${className}`}
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
  onOpenStudio,
  onOpenSearchOverlay
}) {
  const baseCategories = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'new_movies', label: 'New Movies', icon: Sparkles },
    { id: 'moviebox', label: 'MovieBox', icon: Film },
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
        ...baseCategories.slice(0, 6),
        { id: 'mature', label: 'Uncut', icon: Flame, isVault: true },
        { id: 'ecchi_anime', label: 'Hanime', icon: HanimeIcon, isVault: true },
        ...baseCategories.slice(6)
      ]
    : baseCategories;

  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [isSoundOn, setIsSoundOn] = useState(() => !soundFx.isMuted());
  const inputRef = useRef(null);
  const isFocusedRef = useRef(false);
  const isComposingRef = useRef(false);
  const debounceTimerRef = useRef(null);
  const lastEmittedQueryRef = useRef(searchQuery || '');

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
    <header className="sticky top-0 z-40 glass-nav px-2 sm:px-4 py-1.5 sm:py-2 pt-[max(0.75rem,calc(env(safe-area-inset-top,0px)+0.25rem))] w-full border-b border-cyan-500/20 backdrop-blur-2xl">
      <div className="w-full max-w-full mx-auto flex items-center justify-between gap-1 sm:gap-2">
        
        {/* Brand Logo with Cute Furina Chibi Animated Mascot */}
        <div 
          onClick={() => { 
            soundFx.playWaterDrop();
            setActiveCategory('trending'); 
            setSearchQuery(''); 
          }}
          className="flex items-center gap-1 sm:gap-2.5 cursor-pointer group shrink-0"
        >
          {isStealthMode ? (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600/50 flex items-center justify-center text-cyan-400 font-black text-xs shadow">
              <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </div>
          ) : (
            <div className="relative w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.75)] group-hover:scale-110 group-active:scale-95 transition-all duration-300 bg-[#060d24] shrink-0">
              <img 
                src="./furina-avatar.jpg" 
                alt="Furina MovieBox" 
                className="w-full h-full object-cover" 
                onError={(e) => { e.currentTarget.src = './favicon.png'; }}
              />
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
              <span className="font-bold text-sm sm:text-base text-white hidden xs:inline">
                {isStealthMode ? 'Cinema' : 'MovieBox'}
              </span>
            </div>
            <div className="text-[8.5px] text-cyan-300/80 font-medium tracking-wider uppercase hidden 2xl:block">
              {isStealthMode ? 'HD Stream Player' : '4K Movies & Web Series'}
            </div>
          </div>
        </div>

        {/* Compact Search Bar with 3D Spotlight Overlay Shortcut Trigger */}
        <div className="flex-1 min-w-[110px] max-w-[190px] sm:max-w-xs md:max-w-sm relative transition-all duration-300">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={localSearch}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => { 
                isFocusedRef.current = true;
              }}
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
              style={{ touchAction: 'manipulation' }}
              className="w-full bg-[#0b1633]/90 border border-cyan-500/25 rounded-full pl-7 pr-7 py-1 sm:py-1 text-base sm:text-xs text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition shadow-inner"
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

        {/* 3D Spotlight Launcher Button (Desktop & Tablet) */}
        {onOpenSearchOverlay && (
          <button
            onClick={() => {
              soundFx.playSearchBeam();
              onOpenSearchOverlay();
            }}
            title="Open 3D Spotlight Search (Ctrl+K or /)"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 hover:text-white hover:border-cyan-400 text-xs font-semibold shadow-sm transition shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="hidden xl:inline">Spotlight</span>
            <kbd className="hidden lg:inline text-[9px] bg-black/50 border border-cyan-500/40 px-1 rounded font-mono text-cyan-200">
              Ctrl+K
            </kbd>
          </button>
        )}

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#0a1329]/80 p-0.5 rounded-full border border-cyan-500/20 min-w-0 shrink overflow-x-auto no-scrollbar">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundFx.playClick();
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

        {/* Action Controls: Movie Studio, Apps, Audio FX, Settings */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 ml-auto">
          <button
            onClick={onOpenStudio}
            data-testid="studio-btn"
            title="Furina Movie Studio & Content Platform"
            className="btn-shine p-1.5 sm:px-2.5 sm:py-1 rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 text-cyan-300 hover:text-white transition-all duration-200 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold cursor-pointer shadow-sm shrink-0 group/studio hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
          >
            <Film className="w-3.5 h-3.5 sm:w-3 sm:h-3 text-cyan-400 group-hover/studio:scale-110 group-hover/studio:rotate-6 transition-transform duration-200" />
            <span className="hidden sm:inline">Studio</span>
          </button>

          <button
            onClick={onOpenAndroidModal}
            title="Install App on Android (1-Tap Standalone PWA & Native)"
            className="hidden sm:flex p-1 sm:px-2 sm:py-1 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:text-white hover:bg-emerald-500/25 transition-all duration-200 items-center gap-1 text-[10px] sm:text-[11px] font-bold cursor-pointer shrink-0 group/android hover:shadow-[0_0_12px_rgba(16,185,129,0.4)]"
          >
            <Smartphone className="w-3 h-3 text-emerald-400 group-hover/android:scale-110 transition-transform duration-200" />
            <span className="hidden sm:inline">Android App</span>
          </button>

          <button
            onClick={onOpenIPhoneModal}
            title="Install App on iPhone / iPad (Zero Ads)"
            className="hidden sm:flex px-2 py-1 rounded-full border border-cyan-500/30 bg-[#0b1633] text-cyan-300 hover:text-white hover:bg-white/10 transition-all duration-200 items-center gap-1 text-[11px] font-semibold cursor-pointer shrink-0 group/iphone hover:border-cyan-400/50"
          >
            <Smartphone className="w-3 h-3 text-cyan-400 group-hover/iphone:scale-110 transition-transform duration-200" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => {
              const unmuted = soundFx.toggleMute();
              setIsSoundOn(unmuted);
            }}
            data-testid="cozy-sound-btn"
            title={isSoundOn ? '3D Sound FX: Active (Click to Mute)' : '3D Sound FX: Muted (Click to Enable)'}
            className={`p-1.5 sm:p-1.5 rounded-full border transition-all duration-200 flex items-center gap-1 cursor-pointer shrink-0 ${
              isSoundOn
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(251,146,60,0.35)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden 2xl:inline text-[11px] font-semibold">
              {isSoundOn ? 'Audio' : 'Muted'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            data-testid="settings-btn"
            aria-label="Settings"
            title="Settings & Master Vault"
            className={`p-1.5 sm:px-2 sm:py-1 rounded-full border transition-all duration-200 flex items-center gap-1 cursor-pointer shrink-0 group/settings ${
              isMasterMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10 hover:border-cyan-400/50'
            }`}
          >
            {isMasterMode ? (
              <Shield className="w-3.5 h-3.5 text-emerald-400 group-hover/settings:scale-110 transition-transform" />
            ) : (
              <Settings className="w-3.5 h-3.5 text-cyan-400 group-hover/settings:rotate-90 transition-transform duration-500" />
            )}
            <span className="hidden sm:inline text-[11px] font-semibold">
              {isMasterMode ? 'VIP Active' : 'Settings'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Category Scrollable Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-1 pt-1.5 pb-0.5 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id && !searchQuery;
          return (
            <button
              key={cat.id}
              data-category={cat.id}
              onClick={() => { 
                soundFx.playClick();
                setActiveCategory(cat.id); 
                setSearchQuery(''); 
              }}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium whitespace-nowrap transition border ${
                cat.isVault
                  ? isActive
                    ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(77,197,249,0.3)] font-semibold'
                  : 'bg-[#0c1836]/60 border-cyan-500/15 text-cyan-200/60'
              }`}
            >
              <Icon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
