import React, { useState, useEffect } from "react";
import { Sparkles, MessageCircle, X, Volume2, Heart } from "lucide-react";
import soundFx from "../../services/soundFx";

const FURINA_QUOTES = [
  "Welcome to Fontaine Cinema! All movies and series are 100% free in crisp 4K!",
  "Shall we watch in 4K? Tap me anytime for Fontaine's finest premieres!",
  "Looking for Hindi Dubbed blockbusters? Check out Server 1 & Server 6!",
  "Press 'Ctrl+K' or '/' anytime to launch the 3D Spotlight Search!",
  "Hydro power powers every stream with zero buffering!"
];

export const FurinaMascot = ({ onOpenSearch }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768);
  const [isMinimized, setIsMinimized] = useState(false);
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % FURINA_QUOTES.length);
    }, 12000);
    return () => clearInterval(timer);
  }, []);

  const handleTap = (e) => {
    soundFx.playWaterDrop();
    setQuoteIndex((prev) => (prev + 1) % FURINA_QUOTES.length);
    setShowBubble(true);

    // Spawn cute floating heart
    const newHeart = { id: Date.now() + Math.random(), x: (Math.random() - 0.5) * 40 };
    setHearts((prev) => [...prev, newHeart]);
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => h.id !== newHeart.id));
    }, 1200);
  };

  if (isMinimized) {
    return (
      <button
        onClick={() => {
          setIsMinimized(false);
          soundFx.playWaterDrop();
        }}
        className="fixed bottom-4 right-4 z-40 p-2.5 rounded-full bg-[#040d28]/95 border-2 border-cyan-400/60 shadow-[0_0_25px_rgba(0,242,254,0.6)] backdrop-blur-md flex items-center gap-2 text-cyan-300 hover:scale-105 transition cursor-pointer"
        title="Open Furina Mascot"
      >
        <img
          src="./furina_chibi.gif"
          alt="Furina Chibi"
          className="w-8 h-8 rounded-full object-cover border border-cyan-300 shadow-[0_0_10px_rgba(0,242,254,0.5)]"
        />
        <span className="text-[10px] font-black uppercase tracking-wider pr-1">Furina</span>
      </button>
    );
  }

  return (
    <aside 
      aria-label="Furina Chibi Mascot Companion"
      className="fixed bottom-20 right-3 md:bottom-6 md:right-6 z-40 flex flex-col items-end pointer-events-none select-none"
    >
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
        <div className="pointer-events-auto relative mb-2.5 max-w-[230px] sm:max-w-[280px] p-2.5 sm:p-3 rounded-2xl bg-[#040d28]/95 border-2 border-cyan-400/50 shadow-[0_12px_35px_rgba(0,0,0,0.85),0_0_25px_rgba(0,242,254,0.35)] backdrop-blur-xl text-cyan-100 text-[11px] sm:text-[11.5px] leading-relaxed animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute top-2 right-2 p-0.5 text-slate-400 hover:text-white rounded-full cursor-pointer"
            title="Dismiss bubble"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-black text-cyan-300 uppercase tracking-wider mb-1.5 pb-1 border-b border-cyan-400/20">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            <span>Lady Furina's Cinema Companion</span>
          </div>
          <p className="font-medium text-cyan-50/90 drop-shadow-sm">{FURINA_QUOTES[quoteIndex]}</p>
          {onOpenSearch && (
            <button
              onClick={() => {
                soundFx.playSearchBeam();
                onOpenSearch();
              }}
              className="mt-2.5 w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-gray-950 font-black text-[10.5px] flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(0,242,254,0.4)] cursor-pointer transition"
            >
              <span>🔍 Open 3D Search</span>
              <span className="opacity-75 font-mono text-[9px]">(Ctrl+K)</span>
            </button>
          )}
        </div>
      )}

      {/* Cute Animated Furina Chibi GIF Avatar with 3D Float */}
      <div className="pointer-events-auto relative group cursor-pointer" onClick={handleTap}>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 blur-md group-hover:blur-xl transition-all duration-300 animate-pulse" />
        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-300 shadow-[0_0_20px_rgba(0,242,254,0.7)] group-hover:scale-110 group-active:scale-95 transition-all duration-200 bg-[#040d28]">
          <img
            src="./furina_chibi.gif"
            alt="Cute Furina Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.2 sm:px-2 sm:py-0.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-gray-950 font-black text-[7.5px] sm:text-[8.5px] tracking-wider uppercase border border-white/60 shadow">
          HYDRO 👑
        </div>
      </div>
    </aside>
  );
};
