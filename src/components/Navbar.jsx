import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, Film, Tv, Flame, Heart, Sparkles, X, Shield, Settings, 
  Smartphone, Skull, Volume2, VolumeX, Radio, FolderHeart, Compass, ChevronDown, Users
} from 'lucide-react';
import soundFx from '../services/soundFx';

export const HanimeIcon = ({ className = 'w-4 h-4' }) => (
  <img
    src="./hanime_favicon.png"
    alt=""
    aria-hidden="true"
    onError={(e) => { e.currentTarget.style.display = 'none'; }}
    className={`${className} rounded-sm object-contain inline-block shrink-0`}
  />
);

// Custom Multi-Tone Neon 3D SVG Icons for Top Navigation
const NeonFlameIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 shrink-0 transition-transform duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.9)]' : ''}`}>
    <path d="M12 2C12 2 6 8 6 13.5C6 17.09 8.69 20 12 20C15.31 20 18 17.09 18 13.5C18 11 16.5 8.5 15 7C15 9 13.5 10 12.5 10C13.5 7.5 12 2 12 2Z" fill={active ? '#06152d' : 'url(#flameGrad)'} stroke={active ? '#020617' : '#38bdf8'} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    <defs>
      <linearGradient id="flameGrad" x1="6" y1="2" x2="18" y2="20" gradientUnits="userSpaceOnUse">
        <stop stopColor="#22d3ee" />
        <stop offset="1" stopColor="#3b82f6" />
      </linearGradient>
    </defs>
  </svg>
);

const NeonCubeIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`w-4 h-4 shrink-0 transition-transform duration-300 ${active ? 'scale-110' : ''}`}>
    <path d="M21 16V8A2 2 0 0 0 20 6.27L13 2.27A2 2 0 0 0 11 2.27L4 6.27A2 2 0 0 0 3 8V16A2 2 0 0 0 4 17.73L11 21.73A2 2 0 0 0 13 21.73L20 17.73A2 2 0 0 0 21 16Z" stroke={active ? '#020617' : '#22d3ee'} strokeWidth="1.8" fill={active ? 'rgba(2,6,23,0.18)' : 'rgba(6,182,212,0.15)'}/>
    <path d="M3.27 6.96L12 12.01L20.73 6.96M12 22.08V12" stroke={active ? '#020617' : '#60a5fa'} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const NeonLiveTvIcon = ({ active }) => (
  <span className="relative flex items-center justify-center w-4 h-4 shrink-0">
    <Radio className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-rose-400'}`} />
    {!active && <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />}
  </span>
);

const NeonHindiCrownIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
    <path d="M3 18H21M5 14L3 6L9 10L12 4L15 10L21 6L19 14H5Z" stroke={active ? '#020617' : '#fbbf24'} strokeWidth="1.8" fill={active ? 'rgba(2,6,23,0.2)' : 'rgba(245,158,11,0.2)'} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const NeonAnimeStarIcon = ({ active }) => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 shrink-0">
    <path d="M12 2L14.8 8.5L22 9.3L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.3L9.2 8.5L12 2Z" stroke={active ? '#020617' : '#c084fc'} strokeWidth="1.8" fill={active ? 'rgba(2,6,23,0.2)' : 'rgba(192,132,252,0.2)'} strokeLinejoin="round"/>
  </svg>
);

export default function Navbar({
  activeCategory,
  setActiveCategory,
  searchQuery,
  setSearchQuery,
  onSearch,
  isStealthMode,
  isMasterMode,
  includeMature,
  onOpenSettings,
  onOpenIPhoneModal,
  onOpenAndroidModal,
  onOpenStudio,
  onOpenSearchOverlay,
  onOpenWatchTogether
}) {
  const [canInstallPwa, setCanInstallPwa] = useState(() => Boolean(typeof window !== 'undefined' && window.deferredInstallPrompt));
  const [soundMuted, setSoundMuted] = useState(() => soundFx.isMuted());
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef(null);

  useEffect(() => {
    const handleCanInstall = () => setCanInstallPwa(true);
    window.addEventListener('furina:can-install', handleCanInstall);
    return () => window.removeEventListener('furina:can-install', handleCanInstall);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = window.deferredInstallPrompt;
    if (promptEvent) {
      promptEvent.prompt();
      await promptEvent.userChoice;
      window.deferredInstallPrompt = null;
      setCanInstallPwa(false);
    } else if (onOpenAndroidModal) {
      onOpenAndroidModal();
    }
  };

  const primaryDesktopHubs = [
    { id: 'trending', label: 'Trending', renderIcon: (act) => <NeonFlameIcon active={act} /> },
    { id: 'moviebox', label: 'MovieBox 4K', renderIcon: (act) => <NeonCubeIcon active={act} />, badge: '4K' },
    { id: 'livetv', label: 'Live TV', renderIcon: (act) => <NeonLiveTvIcon active={act} />, badge: 'LIVE' },
    { id: 'hindi', label: 'Hindi Dub', renderIcon: (act) => <NeonHindiCrownIcon active={act} /> },
    { id: 'anime', label: 'Anime Vault', renderIcon: (act) => <NeonAnimeStarIcon active={act} /> },
    { id: 'series', label: 'Web Series', renderIcon: (act) => <Tv className={`w-4 h-4 ${act ? 'text-slate-950' : 'text-emerald-400'}`} /> },
    ...(isMasterMode ? [
      { id: 'ecchi_anime', label: 'Hanime', renderIcon: () => <HanimeIcon className="w-4 h-4" /> }
    ] : [])
  ];

  const secondaryHubs = [
    { id: 'hollywood', label: 'Hollywood Blockbusters', icon: Film },
    { id: 'new_movies', label: 'New 2026 Releases', icon: Sparkles },
    { id: 'kdrama', label: 'Korean Dramas (K-Drama)', icon: Tv },
    { id: 'horror', label: 'Horror & Supernatural', icon: Skull },
    { id: 'watchlist', label: 'Collections & Saved Library', icon: FolderHeart },
    ...(isMasterMode || includeMature ? [
      { id: 'mature', label: 'Uncut Master Vault', icon: Flame }
    ] : [])
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030712]/90 backdrop-blur-2xl border-b border-cyan-500/25 shadow-[0_10px_40px_rgba(0,0,0,0.85)]">
      {/* Subtle Top Neon Hydro Laser Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-[70px] flex items-center justify-between gap-2 sm:gap-4">
        
        {/* ZONE 1: Sleek Neon 3D Cinema Emblem & Brand Identity */}
        <button
          type="button"
          onClick={() => {
            soundFx.playClick?.();
            setActiveCategory('trending');
            setSearchQuery('');
            if (onSearch) onSearch('');
          }}
          className="flex items-center gap-3 text-left group cursor-pointer shrink-0 focus:outline-none"
        >
          {isStealthMode ? (
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-600 flex items-center justify-center text-cyan-400 font-black text-base shadow-inner">
              S
            </div>
          ) : (
            /* Multi-Layered Neon 3D Cinema Emblem */
            <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
              {/* Outer Ambient Neon Glow */}
              <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-600 opacity-55 group-hover:opacity-95 blur-md transition-opacity duration-500" />
              
              {/* 3D Beveled Prism Frame */}
              <div className="relative w-full h-full rounded-2xl p-[2px] bg-gradient-to-br from-cyan-300 via-sky-500 to-indigo-600 shadow-[0_0_25px_rgba(34,211,238,0.65)] group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-[14px] bg-[#040b1e] overflow-hidden relative flex items-center justify-center">
                  <img
                    src="./furina-avatar.png"
                    alt="Furina MovieBox"
                    onError={(e) => { e.currentTarget.src = './favicon.png'; }}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Subtle Top Glass Specular Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 via-transparent to-white/25 pointer-events-none" />
                </div>

                {/* Floating 3D Hydro-Gold Cinema Crown Badge */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 p-[1.5px] shadow-[0_0_12px_rgba(251,191,36,0.9)] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-[#050c20] flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-3 h-3 text-amber-300" fill="currentColor">
                      <path d="M12 2L15 8L21 6L19 16H5L3 6L9 8L12 2Z" />
                    </svg>
                  </div>
                </div>

                {/* Bottom 4K Neon Micro-Tag */}
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-1.5 py-[1px] rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 text-[8px] font-black text-slate-950 tracking-wider uppercase shadow-[0_0_10px_rgba(34,211,238,0.9)] border border-white/40">
                  4K
                </div>
              </div>
            </div>
          )}

          {/* Brand Typography with Neon Gradient & Subtitle */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-white via-cyan-200 to-sky-400 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(34,211,238,0.35)]">
                {isStealthMode ? 'StreamBox' : 'Furina'}
              </span>
              {!isStealthMode && (
                <span className="text-base sm:text-lg font-black tracking-tight bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-transparent">
                  MovieBox
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-bold tracking-wider uppercase text-cyan-300/80">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]" />
              <span>IMAX 4K · Multi-Dub Cinema</span>
            </div>
          </div>
        </button>

        {/* ZONE 2: Primary Desktop Navigation Hubs with Neon Active States */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#050d22]/90 p-1.5 rounded-2xl border border-cyan-500/25 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {primaryDesktopHubs.map((cat) => {
            const isActive = activeCategory === cat.id && !searchQuery;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setActiveCategory(cat.id);
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                }}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 text-slate-950 font-black shadow-[0_0_20px_rgba(34,211,238,0.55)] scale-[1.02]'
                    : 'text-slate-300 hover:text-white hover:bg-cyan-500/10'
                }`}
              >
                {cat.renderIcon(isActive)}
                <span>{cat.label}</span>
                {cat.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black tracking-wider ${
                    isActive
                      ? 'bg-slate-950/25 text-slate-950'
                      : cat.badge === 'LIVE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {cat.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More Categories Dropdown on Desktop */}
          <div className="relative" ref={moreDropdownRef}>
            <button
              type="button"
              onClick={() => setIsMoreOpen((v) => !v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center gap-1 cursor-pointer ${
                secondaryHubs.some((h) => h.id === activeCategory)
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                  : 'text-slate-300 hover:text-white hover:bg-cyan-500/10'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>More</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-[#050d24]/98 backdrop-blur-2xl border border-cyan-500/35 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_30px_rgba(6,182,212,0.2)] p-2 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-400/80 border-b border-cyan-500/15 mb-1">
                  More Cinema Hubs
                </div>
                {secondaryHubs.map((hub) => {
                  const Icon = hub.icon;
                  const active = activeCategory === hub.id;
                  return (
                    <button
                      key={hub.id}
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        setActiveCategory(hub.id);
                        setSearchQuery('');
                        if (onSearch) onSearch('');
                        setIsMoreOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-cyan-400" />
                      <span>{hub.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-cyan-500/15 my-1 pt-1 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenStudio?.();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
                  >
                    <Film className="w-4 h-4" />
                    <span>Movie Studio Creator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      handleInstallClick();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>{canInstallPwa ? 'Install Web App' : 'Android & iOS App'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ZONE 3: Neon Search Bar + Quick Saved + Audio + Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-1 lg:flex-initial justify-end max-w-xs sm:max-w-md">
          {/* Search Input Box */}
          <div className="relative flex-1 min-w-[125px] sm:w-56">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search 4K movies, anime..."
              className="w-full bg-[#061026]/95 text-xs text-white placeholder-slate-400 pl-8 pr-12 py-2 rounded-xl border border-cyan-500/30 focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(34,211,238,0.25)] transition"
            />
            <Search className="w-3.5 h-3.5 text-cyan-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

            {searchQuery ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              onOpenSearchOverlay && (
                <button
                  type="button"
                  onClick={onOpenSearchOverlay}
                  title="Open 3D Spotlight Search (Ctrl+K)"
                  className="hidden sm:inline-flex absolute right-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-cyan-500/15 hover:bg-cyan-500/30 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-500/30 cursor-pointer transition"
                >
                  ⌘K
                </button>
              )
            )}
          </div>

          {/* Saved / Collections Quick Button (Desktop) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick?.();
              setActiveCategory('watchlist');
              setSearchQuery('');
            }}
            title="Collections & Saved Library"
            className={`hidden sm:flex w-10 h-10 rounded-xl items-center justify-center border transition cursor-pointer shrink-0 ${
              activeCategory === 'watchlist'
                ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                : 'bg-[#061026] border-cyan-500/25 text-slate-300 hover:text-pink-300 hover:border-pink-400/50'
            }`}
          >
            <FolderHeart className="w-4 h-4" />
          </button>

          {/* Watch Together Party Room Button */}
          {onOpenWatchTogether && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                onOpenWatchTogether();
              }}
              title="Watch Together with Friends (Sync Room)"
              className="hidden sm:flex h-10 px-2.5 rounded-xl bg-purple-500/15 hover:bg-purple-500/30 border border-purple-400/40 text-purple-200 hover:text-white items-center gap-1.5 text-xs font-extrabold transition cursor-pointer shrink-0 shadow-[0_0_14px_rgba(168,85,247,0.25)]"
            >
              <Users className="w-4 h-4 text-purple-300" />
              <span className="hidden xl:inline">Watch Together</span>
            </button>
          )}

          {/* Sound FX Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => {
              const muted = soundFx.toggleMute();
              setSoundMuted(muted);
              if (!muted) soundFx.playClick?.();
            }}
            title={soundMuted ? 'Unmute Hydro UI Sound FX' : 'Mute Hydro UI Sound FX'}
            className="hidden md:flex w-10 h-10 rounded-xl bg-[#061026] hover:bg-cyan-500/15 border border-cyan-500/25 items-center justify-center text-cyan-300 hover:text-white transition cursor-pointer shrink-0"
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* Neon Settings Trigger Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick?.();
              onOpenSettings?.();
            }}
            aria-label="Open settings"
            title={isMasterMode ? 'Master Mode Active (Settings)' : 'Settings & Preferences'}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition cursor-pointer shrink-0 ${
              isMasterMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'bg-gradient-to-br from-[#081738] to-[#050d22] hover:from-cyan-500/25 hover:to-blue-600/25 border-cyan-500/35 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}
          >
            {isMasterMode ? <Shield className="w-4 h-4" /> : <Settings className="w-4 h-4" />}
          </button>
        </div>

      </div>
    </header>
  );
}
