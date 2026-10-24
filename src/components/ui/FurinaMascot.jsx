import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MessageCircle, X, Volume2, VolumeX, Heart, PartyPopper, Disc, Shuffle, RefreshCw } from "lucide-react";
import soundFx from "../../services/soundFx";

const FURINA_QUOTES = [
  "Welcome to Fontaine Cinema! All movies and series are 100% free in crisp 4K!",
  "Shall we watch in 4K? Tap me anytime for Fontaine's finest premieres!",
  "Try the new AI Vibe Oracle! Type any mood like 'dark anime thriller' to get instant picks!",
  "The Vinyl Jukebox is spinning! Turn on Demon Slayer or Interstellar while browsing!",
  "Looking for Hindi Dubbed blockbusters? Check out Server 1 & Server 14!",
  "Press 'Ctrl+K' or '/' anytime to launch the 3D Spotlight Search!",
  "Hydro power powers every stream with zero buffering!",
  "Court of Fontaine decrees: Streaming in OLED mode is mandatory for maximum eye candy!",
  "Tip: Tap 'Clean Cache' below if your browser ever shows old screens after an update!",
  "Aniwave and AnimeHeaven direct engines are live! Instant 1080p anime at your fingertips!",
  "Remember to try the AI Video Booster — tap 'B' or choose OLED for ultra-deep contrast!"
];

export const FurinaMascot = ({ onOpenSearch, onOpenOracle, onOpenJukebox, onPickRandom }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [tapCount, setTapCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
  const [isWiping, setIsWiping] = useState(false);
  const lastTapTimeRef = useRef(0);

  useEffect(() => {
    // Show bubble on desktop after a brief delay
    if (typeof window !== 'undefined' && window.innerWidth >= 768) {
      const timer = setTimeout(() => setShowBubble(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % FURINA_QUOTES.length);
    }, 14000);
    return () => clearInterval(timer);
  }, []);

  const speakQuote = (text) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1F6FF}]/gu, ''));
      utterance.pitch = 1.35; // Regal high pitch
      utterance.rate = 1.05;
      utterance.volume = 0.8;
      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };

  const handleTap = () => {
    const now = Date.now();
    soundFx.playWaterDrop();

    // Check rapid tapping for Easter Egg (5 taps within 2.5s)
    if (now - lastTapTimeRef.current < 600) {
      const newCount = tapCount + 1;
      setTapCount(newCount);
      if (newCount >= 4) {
        soundFx.playFurinaFanfare();
        setShowEasterEgg(true);
        setTapCount(0);
        setTimeout(() => setShowEasterEgg(false), 3500);
      }
    } else {
      setTapCount(1);
    }
    lastTapTimeRef.current = now;

    const nextIndex = (quoteIndex + 1) % FURINA_QUOTES.length;
    setQuoteIndex(nextIndex);
    setShowBubble(true);

    if (voiceEnabled) {
      speakQuote(FURINA_QUOTES[nextIndex]);
    }

    // Spawn cute floating hydro hearts
    const newHeart = { id: Date.now() + Math.random(), x: (Math.random() - 0.5) * 50 };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1300);
  };

  const toggleVoice = (e) => {
    e.stopPropagation();
    const nextState = !voiceEnabled;
    setVoiceEnabled(nextState);
    soundFx.playToggle?.(nextState);
    if (nextState) {
      speakQuote("I am Furina, the undisputed star of Fontaine!");
    } else if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  const handleCleanCache = async () => {
    setIsWiping(true);
    soundFx.playClick?.();
    try {
      if (typeof window !== 'undefined') {
        if ('caches' in window) {
          const keys = await caches.keys();
          for (const k of keys) await caches.delete(k);
        }
        if ('serviceWorker' in navigator) {
          const regs = await navigator.serviceWorker.getRegistrations();
          for (const r of regs) await r.unregister();
        }
        localStorage.removeItem('furina_cached_trending');
        localStorage.removeItem('furina_cached_trending_v5');
        localStorage.removeItem('furina_cached_trending_v5_time');
        window.location.href = window.location.pathname + '?refresh=' + Date.now();
      }
    } catch (e) {
      window.location.reload();
    }
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          soundFx.playWaterDrop();
        }}
        className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex p-2 rounded-full bg-[#040d28]/95 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(0,242,254,0.6)] backdrop-blur-md items-center gap-1.5 text-cyan-300 hover:scale-105 transition cursor-pointer"
        title="Open Lady Furina"
      >
        <img
          src="./furina_chibi.gif"
          alt="Furina Chibi"
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.5)]"
        />
        <span className="text-[10px] font-black uppercase tracking-wider pr-1 hidden sm:inline">Furina</span>
      </button>
    );
  }

  return (
    <aside 
      aria-label="Furina Chibi Mascot Companion"
      className="fixed bottom-20 right-3.5 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end pointer-events-none select-none"
    >
      {/* Easter Egg Celebration Banner */}
      {showEasterEgg && (
        <div className="pointer-events-auto mb-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-pink-500 to-cyan-400 text-gray-950 font-black text-xs shadow-2xl flex items-center gap-1.5 animate-bounce">
          <PartyPopper className="w-4 h-4" />
          <span>Fontaine Grand Gala Unlocked! 🎉👑</span>
        </div>
      )}

      {/* Floating Hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute -top-7 text-pink-400 font-bold text-sm animate-bounce"
          style={{ transform: `translateX(${h.x}px)` }}
        >
          💧💙
        </span>
      ))}

      {/* Interactive Speech Bubble */}
      {showBubble && (
        <div className="pointer-events-auto relative mb-2.5 max-w-[260px] sm:max-w-[310px] p-2.5 sm:p-3.5 rounded-2xl bg-[#040d28]/95 border-2 border-cyan-400/50 shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.35)] backdrop-blur-xl text-cyan-100 text-[11px] sm:text-[11.5px] leading-relaxed animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-cyan-400/20 mb-1.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-black text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Lady Furina (Chibi)</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={toggleVoice}
                className={`p-1 rounded-md text-[10px] transition cursor-pointer ${
                  voiceEnabled ? 'bg-cyan-500/30 text-cyan-300' : 'text-slate-400 hover:text-white'
                }`}
                title={voiceEnabled ? "Mute Voice Lines" : "Enable Voice Lines"}
              >
                {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </button>
              <button
                type="button"
                onClick={() => setShowBubble(false)}
                className="p-1 text-slate-400 hover:text-white rounded-md cursor-pointer"
                title="Dismiss bubble"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>

          <p className="font-medium text-cyan-50/90 drop-shadow-sm mb-2">{FURINA_QUOTES[quoteIndex]}</p>

          {/* Quick Interactive Companion Pills */}
          <div className="grid grid-cols-2 gap-1 mb-2">
            {onOpenOracle && (
              <button
                type="button"
                onClick={() => { soundFx.playClick?.(); onOpenOracle(); }}
                className="py-1 px-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[9.5px] font-bold text-cyan-300 flex items-center justify-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>AI Oracle</span>
              </button>
            )}
            {onOpenJukebox && (
              <button
                type="button"
                onClick={() => { soundFx.playClick?.(); onOpenJukebox(); }}
                className="py-1 px-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[9.5px] font-bold text-cyan-300 flex items-center justify-center gap-1 transition"
              >
                <Disc className="w-3 h-3 text-sky-300" />
                <span>Jukebox</span>
              </button>
            )}
            {onPickRandom && (
              <button
                type="button"
                onClick={() => { soundFx.playClick?.(); onPickRandom(); }}
                className="py-1 px-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/30 text-[9.5px] font-bold text-purple-300 flex items-center justify-center gap-1 transition"
              >
                <Shuffle className="w-3 h-3 text-purple-300" />
                <span>Surprise Me</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleCleanCache}
              disabled={isWiping}
              className="py-1 px-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-rose-500/30 text-[9.5px] font-bold text-rose-300 flex items-center justify-center gap-1 transition"
              title="Wipe stale cache and force latest app version"
            >
              <RefreshCw className={`w-3 h-3 ${isWiping ? 'animate-spin' : ''}`} />
              <span>{isWiping ? 'Wiping...' : 'Clean Cache'}</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenSearch && (
              <button
                type="button"
                onClick={() => {
                  soundFx.playSearchBeam();
                  onOpenSearch();
                }}
                className="flex-1 py-1.5 px-2 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-gray-950 font-black text-[10px] flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer transition active:scale-95"
              >
                <span>🔍 Search</span>
                <span className="opacity-75 font-mono text-[8.5px]">(Ctrl+K)</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setIsMinimized(true);
                setShowBubble(false);
              }}
              className="py-1.5 px-2 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 text-[10px] font-bold cursor-pointer transition"
              title="Minimize Mascot"
            >
              Dock ↘
            </button>
          </div>
        </div>
      )}

      {/* Animated Furina Chibi Avatar with 3D Glow Sheen */}
      <div 
        className="pointer-events-auto relative group cursor-pointer" 
        onClick={handleTap}
        title="Tap Lady Furina for cinema wisdom!"
      >
        <div className="absolute -inset-1.5 sm:-inset-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 blur-md group-hover:blur-xl transition-all duration-300 animate-pulse" />
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.7)] group-hover:scale-110 group-active:scale-95 transition-all duration-200 bg-[#040d28]">
          <img
            src="./furina_chibi.gif"
            alt="Cute Furina Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-950 font-black text-[7px] sm:text-[8.5px] tracking-wider uppercase border border-white/60 shadow animate-pulse">
          HYDRO 👑
        </div>
      </div>
    </aside>
  );
};
export default FurinaMascot;
