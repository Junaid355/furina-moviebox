import React, { useState, useEffect, useRef, memo } from 'react';
import {
  Search, Film, Tv, Flame, Sparkles, X, Shield, Settings,
  Smartphone, Skull, Volume2, VolumeX, FolderHeart, Compass, ChevronDown, Users, Radio
} from 'lucide-react';
import soundFx from '../services/soundFx';

export function HanimeIcon({ className = 'w-4 h-4' }) {
  return (
    <img
      src="./hanime_icon.png"
      alt="Hanime"
      className={`${className} rounded-sm object-cover inline-block shrink-0`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}

const Navbar = memo(function Navbar({
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
  const [soundMuted, setSoundMuted] = useState(() => soundFx.isMuted());
  const [canInstallPwa, setCanInstallPwa] = useState(() => Boolean(window.__deferredPwaPrompt));
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef(null);

  useEffect(() => {
    const onPromptReady = () => setCanInstallPwa(true);
    window.addEventListener('furina:pwa-prompt-ready', onPromptReady);
    return () => window.removeEventListener('furina:pwa-prompt-ready', onPromptReady);
  }, []);

  useEffect(() => {
    const handleOutside = (e) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleInstallClick = async () => {
    if (window.__deferredPwaPrompt) {
      try {
        window.__deferredPwaPrompt.prompt();
        const { outcome } = await window.__deferredPwaPrompt.userChoice;
        if (outcome === 'accepted') {
          window.__deferredPwaPrompt = null;
          setCanInstallPwa(false);
          return;
        }
      } catch (e) {}
    }
    const ua = navigator.userAgent || '';
    if (/android/i.test(ua) && onOpenAndroidModal) {
      onOpenAndroidModal();
    } else if (onOpenIPhoneModal) {
      onOpenIPhoneModal();
    }
  };

  const primaryTabs = [
    { id: 'trending', label: 'Trending', icon: Flame },
    { id: 'moviebox', label: 'MovieBox', icon: Film, badge: '4K' },
    { id: 'hollywood', label: 'Movies', icon: Film },
    { id: 'hindi', label: 'Hindi Dub', icon: Sparkles },
    { id: 'series', label: 'Series', icon: Tv },
    { id: 'anime', label: 'Anime', icon: Sparkles },
    { id: 'livetv', label: 'Live TV', icon: Radio, badge: 'LIVE' }
  ];

  const secondaryHubs = [
    { id: 'new_movies', label: 'New Releases (2026)', icon: Sparkles },
    { id: 'kdrama', label: 'K-Dramas (Sub & Hindi)', icon: Tv },
    { id: 'horror', label: 'Horror & Supernatural', icon: Skull },
    { id: 'watchlist', label: 'My Library & Collections', icon: FolderHeart },
    ...(includeMature && !isStealthMode
      ? [
          { id: 'ecchi_anime', label: 'Hanime Vault (18+)', icon: HanimeIcon },
          { id: 'mature', label: 'Uncut Cinema Vault', icon: Shield }
        ]
      : [])
  ];

  const isSecondaryActive = secondaryHubs.some((h) => h.id === activeCategory && h.id !== 'watchlist');

  const mobileQuickCategories = [
    { id: 'trending', label: '🔥 Trending' },
    { id: 'hindi', label: '🇮🇳 Hindi Dub' },
    { id: 'anime', label: '🎌 Anime' },
    { id: 'moviebox', label: '📦 MovieBox 4K' },
    { id: 'livetv', label: '📡 Live TV' },
    { id: 'hollywood', label: '🎬 Movies' },
    { id: 'series', label: '📺 Series' },
    { id: 'kdrama', label: '🇰🇷 K-Drama' },
    { id: 'watchlist', label: '❤️ Saved' }
  ];

  return (
    <header className="sticky top-0 z-40 glass-nav safe-top">
      <div className="max-w-[1400px] mx-auto px-2.5 sm:px-5 h-13 sm:h-14 flex items-center justify-between gap-2 sm:gap-4">
        {/* ZONE 1: Compact 3D Fontaine Emblem */}
        <div
          onClick={() => {
            soundFx.playClick?.();
            setActiveCategory('trending');
            setSearchQuery('');
            if (onSearch) onSearch('');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2 cursor-pointer group shrink-0 select-none"
        >
          {isStealthMode ? (
            <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center border border-slate-600">
              <Film className="w-4 h-4 text-cyan-400" />
            </div>
          ) : (
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-600 to-indigo-900 p-[1.5px] shadow-md">
              <div className="w-full h-full rounded-[10px] bg-[#040b1e] flex items-center justify-center overflow-hidden relative">
                <img
                  src="./furina-avatar.png"
                  alt="Furina"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <span className="absolute -bottom-1 -right-1 px-1 py-[1px] rounded bg-cyan-400 text-[7px] font-black text-slate-950 uppercase leading-none">
                4K
              </span>
            </div>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-black text-xs sm:text-sm tracking-tight text-white group-hover:text-cyan-300 transition whitespace-nowrap">
                {isStealthMode ? 'StreamBox' : 'Furina'}
                <span className="hidden xs:inline">{isStealthMode ? '' : ' MovieBox'}</span>
              </span>
              {isMasterMode && (
                <span className="px-1 py-0.5 text-[8px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded">
                  PRO
                </span>
              )}
            </div>
            <span className="text-[8px] uppercase tracking-widest text-cyan-400/75 font-bold hidden sm:block">
              4K Multi-Audio Cinema
            </span>
          </div>
        </div>

        {/* ZONE 2: Compact Single-Line Navigation Pills (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#050d22] p-1 rounded-xl border border-cyan-500/20">
          {primaryTabs.map((tab) => {
            const isActive = !searchQuery.trim() && activeCategory === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  soundFx.playClick?.();
                  setActiveCategory(tab.id);
                  setSearchQuery('');
                  if (onSearch) onSearch('');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : tab.id === 'livetv' ? 'text-rose-400' : 'text-cyan-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`px-1 py-0.2 rounded text-[8px] font-black uppercase tracking-wider ${
                      isActive
                        ? 'bg-slate-950/20 text-slate-950'
                        : tab.badge === 'LIVE'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/35'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* More Hub Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                setIsMoreOpen((v) => !v);
              }}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                isSecondaryActive
                  ? 'bg-cyan-400 text-slate-950 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>More</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isMoreOpen ? 'rotate-180' : ''}`} />
            </button>

            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#050d24] border border-cyan-500/30 shadow-2xl p-1.5 z-50 space-y-0.5">
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
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                        active
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/35'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{hub.label}</span>
                    </button>
                  );
                })}
                <div className="border-t border-white/10 my-1 pt-1 space-y-0.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      onOpenStudio?.();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-emerald-300 hover:bg-emerald-500/10 transition cursor-pointer"
                  >
                    <Film className="w-3.5 h-3.5" />
                    <span>Movie Studio Creator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen(false);
                      handleInstallClick();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-bold text-cyan-300 hover:bg-cyan-500/10 transition cursor-pointer"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{canInstallPwa ? 'Install Web App' : 'Mobile App Guide'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* ZONE 3: Compact Search Bar + Watch Together + Library + Settings */}
        <div className="flex items-center gap-1.5 flex-1 lg:flex-initial justify-end max-w-[230px] xs:max-w-xs sm:max-w-sm">
          <div className="relative flex-1 min-w-[96px] sm:w-48">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearch) onSearch(e.target.value);
              }}
              placeholder="Search movies..."
              className="w-full bg-[#061026] text-base sm:text-xs text-white placeholder-slate-400 pl-7 pr-7 py-1 sm:py-1.5 rounded-lg border border-cyan-500/25 focus:outline-none focus:border-cyan-400 transition"
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              onOpenSearchOverlay && (
                <button
                  type="button"
                  onClick={onOpenSearchOverlay}
                  title="Quick Search (Ctrl+K)"
                  className="hidden sm:inline-flex absolute right-1.5 top-1/2 -translate-y-1/2 px-1 py-0.5 rounded bg-cyan-500/15 hover:bg-cyan-500/30 text-[9px] font-mono font-bold text-cyan-300 border border-cyan-500/25 cursor-pointer"
                >
                  ⌘K
                </button>
              )
            )}
          </div>

          {/* Watch Together Party Room Button (Visible on Mobile & Desktop) */}
          {onOpenWatchTogether && (
            <button
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                onOpenWatchTogether();
              }}
              title="Watch Together with Friends"
              className="flex h-8 px-2 sm:px-2.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/40 text-emerald-300 items-center gap-1 text-[11px] font-extrabold cursor-pointer shrink-0"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden xl:inline">Party</span>
            </button>
          )}

          {/* Saved / Collections Quick Button (Desktop) */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick?.();
              setActiveCategory('watchlist');
              setSearchQuery('');
            }}
            title="My Library & Collections"
            className={`hidden sm:flex w-8 h-8 rounded-lg items-center justify-center border cursor-pointer shrink-0 ${
              activeCategory === 'watchlist'
                ? 'bg-pink-500/20 border-pink-400 text-pink-300'
                : 'bg-[#061026] border-cyan-500/25 text-slate-300 hover:text-pink-300'
            }`}
          >
            <FolderHeart className="w-3.5 h-3.5" />
          </button>

          {/* Sound FX Toggle (Desktop) */}
          <button
            type="button"
            onClick={() => {
              const muted = soundFx.toggleMute();
              setSoundMuted(muted);
              if (!muted) soundFx.playClick?.();
            }}
            title={soundMuted ? 'Unmute UI Sound FX' : 'Mute UI Sound FX'}
            className="hidden md:flex w-8 h-8 rounded-lg bg-[#061026] hover:bg-cyan-500/15 border border-cyan-500/25 items-center justify-center text-cyan-300 cursor-pointer shrink-0"
          >
            {soundMuted ? <VolumeX className="w-3.5 h-3.5 text-slate-500" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

          {/* Settings Trigger Button */}
          <button
            type="button"
            onClick={() => {
              soundFx.playClick?.();
              onOpenSettings?.();
            }}
            aria-label="Open settings"
            title="Settings & Preferences"
            className={`w-8 h-8 rounded-lg flex items-center justify-center border cursor-pointer shrink-0 ${
              isMasterMode
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                : 'bg-[#061026] hover:bg-cyan-500/20 border-cyan-500/30 text-cyan-300'
            }`}
          >
            {isMasterMode ? <Shield className="w-3.5 h-3.5" /> : <Settings className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ZONE 4: Swipeable Mobile & Tablet Top Category Pill Strip */}
      <div className="lg:hidden border-t border-cyan-500/15 bg-[#040a1c]/95 px-2.5 py-1.5 overflow-x-auto no-scrollbar flex items-center gap-1.5 snap-x">
        {mobileQuickCategories.map((cat) => {
          const isActive = !searchQuery.trim() && activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                setActiveCategory(cat.id);
                setSearchQuery('');
                if (onSearch) onSearch('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`snap-start shrink-0 px-3 py-1 rounded-full text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap border ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black border-cyan-300 shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                  : 'bg-[#081229] text-slate-300 border-cyan-500/20 active:scale-95'
              }`}
            >
              {cat.label}
            </button>
          );
        })}
      </div>
    </header>
  );
});

export default Navbar;
