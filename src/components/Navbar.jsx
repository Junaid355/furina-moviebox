import React, { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Flame, Heart, Sparkles, X, Shield, Lock, Settings, Smartphone, Skull, Volume2, VolumeX } from 'lucide-react';
import soundFx from '../services/soundFx';

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
  const baseCategories = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'hollywood', label: 'Hollywood', icon: Film },
    { id: 'hindi', label: 'Bollywood & Hindi', icon: Sparkles },
    { id: 'kdrama', label: '🇰🇷 K-Drama', icon: Tv },
    { id: 'anime', label: '🌸 Anime', icon: Sparkles },
    { id: 'horror', label: '👻 Horror', icon: Skull },
    { id: 'series', label: 'Web Series', icon: Tv },
    { id: 'watchlist', label: 'Watchlist', icon: Heart },
    { id: 'studio', label: '🎬 Studio', icon: Film },
  ];

  const categories = isMasterMode
    ? [
        ...baseCategories.slice(0, 5),
        { id: 'mature', label: '🎬 Uncut Cinema', icon: Flame, isVault: true },
        { id: 'ecchi_anime', label: '✨ Master Vault', icon: Sparkles, isVault: true },
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

  // Synchronize local search with external parent changes (e.g. category pill click, clear button)
  // CRITICAL FOR MOBILE: NEVER overwrite localSearch while user is actively typing in the focused input
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

    // Debounce notifying parent so that mobile virtual keyboards (Gboard/iOS) never suffer re-render interruptions
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
    <header className="sticky top-0 z-40 glass-nav px-4 py-3 sm:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 sm:gap-4">
        
        {/* Brand Logo - Changes based on Stealth Mode */}
        <div 
          onClick={() => { setActiveCategory('trending'); setSearchQuery(''); }}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          {isStealthMode ? (
            /* Stealth Neutral Brand */
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600/50 flex items-center justify-center text-cyan-400 font-black text-lg shadow">
              <Film className="w-5 h-5 text-cyan-400" />
            </div>
          ) : (
            /* Furina Anime Brand */
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_15px_rgba(77,197,249,0.5)] group-hover:scale-105 transition">
              <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
            </div>
          )}
          
          <div>
            <div className="flex items-center gap-1.5">
              <span className={`font-extrabold text-lg sm:text-xl tracking-tight ${
                isStealthMode
                  ? 'text-white'
                  : 'bg-gradient-to-r from-cyan-300 via-sky-400 to-blue-500 bg-clip-text text-transparent'
              }`}>
                {isStealthMode ? 'Stream' : 'Furina'}
              </span>
              <span className="font-bold text-lg sm:text-xl text-white">
                {isStealthMode ? 'Cinema' : 'MovieBox'}
              </span>
            </div>
            <div className="text-[10px] text-cyan-300/80 font-medium tracking-wider uppercase hidden sm:block">
              {isStealthMode ? 'HD Stream Player' : '4K Movies & Web Series'}
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-cyan-400/70 pointer-events-none" />
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
              placeholder="Search movies, Hindi dubbed, series worldwide..."
              className="w-full bg-[#0b1633]/90 border border-cyan-500/25 rounded-full pl-10 pr-9 py-2 text-sm text-white placeholder-cyan-200/40 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition shadow-inner"
            />
            {localSearch && (
              <button 
                onClick={handleClear}
                className="absolute right-3 text-cyan-400/60 hover:text-white"
                type="button"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Category Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-[#0a1329]/80 p-1 rounded-full border border-cyan-500/20">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'studio' && onOpenStudio) onOpenStudio();
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                  cat.isVault
                    ? isActive
                      ? 'bg-amber-500 text-gray-950 font-bold shadow'
                      : 'text-amber-400 hover:bg-amber-500/10'
                    : isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_12px_rgba(77,197,249,0.4)]'
                    : 'text-cyan-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Movie Studio, iPhone App, Settings & Secret Master Vault */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenStudio}
            data-testid="studio-btn"
            title="Furina Movie Studio & Content Platform"
            className="px-3 py-1.5 rounded-full border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/35 hover:to-blue-600/35 text-cyan-300 hover:text-white transition flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm"
          >
            <Film className="w-3.5 h-3.5 text-cyan-400" />
            <span>🎬 Studio</span>
          </button>

          <button
            onClick={onOpenAndroidModal}
            title="Install App on Android (1-Tap Standalone PWA & Native)"
            className="px-2.5 sm:px-3 py-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:text-white hover:bg-emerald-500/25 transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Android App</span>
            <span className="sm:hidden">App</span>
          </button>

          <button
            onClick={onOpenIPhoneModal}
            title="Install App on iPhone / iPad (Zero Ads)"
            className="hidden sm:flex px-3 py-1.5 rounded-full border border-cyan-500/30 bg-[#0b1633] text-cyan-300 hover:text-white hover:bg-white/10 transition items-center gap-1.5 text-xs font-semibold"
          >
            <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
            <span>iPhone</span>
          </button>

          <button
            onClick={() => {
              const unmuted = soundFx.toggleMute();
              setIsSoundOn(unmuted);
            }}
            data-testid="cozy-sound-btn"
            title={isSoundOn ? 'Cozy Sound FX: Active (Click to Mute)' : 'Cozy Sound FX: Muted (Click to Enable)'}
            className={`p-2 rounded-full border transition flex items-center gap-1.5 ${
              isSoundOn
                ? 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30 shadow-[0_0_10px_rgba(251,146,60,0.3)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-slate-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {isSoundOn ? <Volume2 className="w-4 h-4 text-amber-300" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            <span className="hidden md:inline text-xs font-semibold">
              {isSoundOn ? 'Cozy Audio' : 'Muted'}
            </span>
          </button>

          <button
            onClick={onOpenSettings}
            data-testid="settings-btn"
            title="Settings & Master Vault"
            className={`p-2 rounded-full border transition flex items-center gap-1.5 ${
              isMasterMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                : 'bg-[#0b1633] border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {isMasterMode ? <Shield className="w-4 h-4 text-emerald-400" /> : <Settings className="w-4 h-4 text-cyan-400" />}
            <span className="hidden sm:inline text-xs font-semibold">
              {isMasterMode ? 'VIP Active' : 'Settings'}
            </span>
          </button>
        </div>

      </div>

      {/* Mobile Category Scrollable Bar */}
      <div className="flex lg:hidden overflow-x-auto gap-2 pt-2.5 pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id && !searchQuery;
          return (
            <button
              key={cat.id}
              onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition border ${
                cat.isVault
                  ? isActive
                    ? 'bg-amber-500 text-gray-950 border-amber-400 font-bold shadow'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : isActive
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(77,197,249,0.3)] font-semibold'
                  : 'bg-[#0c1836]/60 border-cyan-500/15 text-cyan-200/60'
              }`}
            >
              <Icon className="w-3 h-3" />
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
