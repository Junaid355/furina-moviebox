import React, { useState, useEffect, useRef } from "react";
import { Sparkles, MessageCircle, X, Volume2, VolumeX, Heart, PartyPopper } from "lucide-react";
import soundFx from "../../services/soundFx";

const FURINA_QUOTES = [
  "Welcome to Fontaine Cinema! All movies and series are 100% free in crisp 4K!",
  "Shall we watch in 4K? Tap me anytime for Fontaine's finest premieres!",
  "Looking for Hindi Dubbed blockbusters? Check out Server 1 & Server 14!",
  "Press 'Ctrl+K' or '/' anytime to launch the 3D Spotlight Search!",
  "Hydro power powers every stream with zero buffering!",
  "Court of Fontaine decrees: Streaming in OLED mode is mandatory for maximum eye candy!",
  "Joke of the day: Why do programmers prefer dark mode? Because light attracts bugs! 😂",
  "Aniwave and AnimeHeaven direct engines are live! Instant 1080p anime at your fingertips!",
  "Remember to try the AI Video Booster — tap 'B' or choose OLED for ultra-deep contrast!"
];

export const FurinaMascot = ({ onOpenSearch }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [hearts, setHearts] = useState([]);
  const [tapCount, setTapCount] = useState(0);
  const [showEasterEgg, setShowEasterEgg] = useState(false);
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
        <div className="pointer-events-auto relative mb-2.5 max-w-[240px] sm:max-w-[290px] p-2.5 sm:p-3 rounded-2xl bg-[#040d28]/95 border-2 border-cyan-400/50 shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.35)] backdrop-blur-xl text-cyan-100 text-[11px] sm:text-[11.5px] leading-relaxed animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between gap-1.5 pb-1 border-b border-cyan-400/20 mb-1.5">
            <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-black text-cyan-300 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
              <span>Lady Furina</span>
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

          <p className="font-medium text-cyan-50/90 drop-shadow-sm">{FURINA_QUOTES[quoteIndex]}</p>

          <div className="mt-2.5 flex items-center gap-1.5">
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
        <div className="relative w-11 h-11 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.7)] group-hover:scale-110 group-active:scale-95 transition-all duration-200 bg-[#040d28]">
          <img
            src="./furina_chibi.gif"
            alt="Cute Furina Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-950 font-black text-[7px] sm:text-[8.5px] tracking-wider uppercase border border-white/60 shadow">
          HYDRO 👑
        </div>
      </div>
    </aside>
  );
};
export default FurinaMascot;
