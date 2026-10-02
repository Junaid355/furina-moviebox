import React, { useState, useEffect } from "react";
import { Sparkles, MessageCircle, X, Volume2, Heart } from "lucide-react";
import soundFx from "../../services/soundFx";

const FURINA_QUOTES = [
  "Welcome to Fontaine's grandest cinema! All movies are 100% free and in 4K!",
  "Looking for Hindi Dubbed blockbusters? Check out Server 1 & Server 6!",
  "Press 'Ctrl+K' or '/' anytime to launch the 3D Spotlight Search!",
  "Justice and cinema belong to everyone! Grab some popcorn!",
  "Hydro power powers every stream with zero buffering!"
];

export const FurinaMascot = ({ onOpenSearch }) => {
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showBubble, setShowBubble] = useState(true);
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
        className="fixed bottom-4 right-4 z-40 p-2 rounded-full bg-cyan-950/80 border border-cyan-400/50 shadow-[0_0_20px_rgba(56,189,248,0.5)] backdrop-blur-md flex items-center gap-1.5 text-cyan-300 hover:scale-105 transition cursor-pointer"
        title="Open Furina Mascot"
      >
        <img
          src="./furina_chibi.gif"
          alt="Furina Chibi"
          className="w-8 h-8 rounded-full object-cover border border-cyan-300"
        />
        <span className="text-[10px] font-black uppercase tracking-wider pr-1">Furina</span>
      </button>
    );
  }

  return (
    <aside 
      aria-label="Furina Chibi Mascot Companion"
      className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 z-40 flex flex-col items-end pointer-events-none select-none"
    >
      {/* Floating Hearts */}
      {hearts.map((h) => (
        <span
          key={h.id}
          className="absolute -top-6 text-pink-400 font-bold text-sm animate-bounce"
          style={{ transform: `translateX(${h.x}px)` }}
        >
          💧💙
        </span>
      ))}

      {/* Interactive Speech Bubble */}
      {showBubble && (
        <div className="pointer-events-auto relative mb-2 max-w-[220px] sm:max-w-[260px] p-2.5 sm:p-3 rounded-2xl bg-[#08122c]/95 border border-cyan-400/50 shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(56,189,248,0.3)] backdrop-blur-xl text-cyan-100 text-[11px] leading-relaxed animate-in fade-in zoom-in-95 duration-200">
          <button
            onClick={() => setShowBubble(false)}
            className="absolute top-1.5 right-1.5 p-0.5 text-slate-400 hover:text-white rounded-full cursor-pointer"
            title="Dismiss bubble"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-1 text-[10px] font-extrabold text-cyan-300 uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
            <span>Furina's Cinema Guide</span>
          </div>
          <p>{FURINA_QUOTES[quoteIndex]}</p>
          {onOpenSearch && (
            <button
              onClick={() => {
                soundFx.playSearchBeam();
                onOpenSearch();
              }}
              className="mt-2 w-full py-1 px-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-[10px] flex items-center justify-center gap-1 shadow cursor-pointer transition"
            >
              <span>🔍 Open 3D Search</span>
              <span className="opacity-75 font-mono text-[9px]">(Ctrl+K)</span>
            </button>
          )}
        </div>
      )}

      {/* Cute Animated Furina Chibi GIF Avatar with 3D Float */}
      <div className="pointer-events-auto relative group cursor-pointer" onClick={handleTap}>
        <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-500/30 via-blue-600/30 to-purple-500/30 blur-md group-hover:blur-lg transition-all duration-300 animate-pulse" />
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-cyan-300/80 shadow-[0_0_25px_rgba(56,189,248,0.7)] group-hover:scale-110 group-active:scale-95 transition-all duration-200 bg-[#060d24]">
          <img
            src="./furina_chibi.gif"
            alt="Cute Furina Mascot"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-cyan-500 text-gray-950 font-black text-[8px] tracking-wider uppercase border border-white/40 shadow">
          HYDRO
        </div>
      </div>
    </aside>
  );
};
