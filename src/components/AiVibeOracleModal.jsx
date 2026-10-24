import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Search, Play, Info, Flame, Moon, Compass, Wand2, Star } from 'lucide-react';
import { queryVibeOracle, QUICK_VIBES } from '../services/aiVibeOracle';
import soundFx from '../services/soundFx';
import { POSTER_THUMB_BASE } from '../services/tmdb';

export default function AiVibeOracleModal({ isOpen, onClose, onSelectMedia }) {
  const [prompt, setPrompt] = useState('');
  const [currentResult, setCurrentResult] = useState(() => queryVibeOracle(''));
  const [isThinking, setIsThinking] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSearch = (customText) => {
    const textToSearch = typeof customText === 'string' ? customText : prompt;
    if (!textToSearch.trim()) return;

    soundFx.playSearchBeam?.();
    setIsThinking(true);

    setTimeout(() => {
      const res = queryVibeOracle(textToSearch);
      setCurrentResult(res);
      setIsThinking(false);
      soundFx.playFurinaFanfare?.();
    }, 450);
  };

  const handleChipClick = (chipQuery) => {
    setPrompt(chipQuery);
    handleSearch(chipQuery);
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#070e24] border border-cyan-400/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden text-white my-auto flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-[#091538] via-[#0e1f52] to-[#091538] border-b border-cyan-500/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.6)]">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-gray-950 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  Hydro Oracle 2.0
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 hidden sm:inline">
                  AI Semantic Brain
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black text-white mt-0.5">
                Lady Furina's Cinema & Anime Vibe Oracle
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
            title="Close Oracle"
          >
            <X className="w-4 h-4 font-black" />
          </button>
        </div>

        {/* Search Input & Mood Chips */}
        <div className="p-4 sm:p-6 pb-2 space-y-3 bg-[#050b1d]/80">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Describe your mood, e.g. 'rainy cozy anime with mindblowing plot twist' or 'cyberpunk fights'..."
              className="w-full bg-[#0a1433] border-2 border-cyan-500/40 focus:border-cyan-400 rounded-2xl py-3 pl-11 pr-28 text-xs sm:text-sm text-white placeholder-cyan-200/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 shadow-inner transition"
            />
            <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400" />
            
            <button
              onClick={() => handleSearch()}
              disabled={isThinking}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            >
              <span>{isThinking ? 'Consulting...' : 'Ask Oracle'}</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick 1-Tap Vibe Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            <span className="text-[10px] font-black uppercase text-cyan-400/80 shrink-0 mr-1 flex items-center gap-1">
              <Compass className="w-3 h-3" />
              <span>Vibes:</span>
            </span>
            {QUICK_VIBES.map((v) => (
              <button
                key={v.id}
                onClick={() => handleChipClick(v.query)}
                className="px-2.5 py-1 rounded-full bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-200 hover:text-white text-[11px] font-bold whitespace-nowrap transition cursor-pointer shrink-0 shadow-sm active:scale-95"
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Oracle Recommendation Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0b1842] via-[#0d2057] to-[#0b1842] border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 text-[10px] font-black uppercase tracking-wider">
                  {currentResult.vibeBadge}
                </span>
                <span className="text-xs text-cyan-200/70">Verified Curated Shelf</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                {currentResult.vibeName}
              </h3>
              <p className="text-xs text-cyan-200/80 mt-1 max-w-2xl leading-relaxed">
                {currentResult.reason}
              </p>
            </div>
          </div>

          {/* Media Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {currentResult.matches.map((item) => {
              const poster = item.poster_path 
                ? (item.poster_path.startsWith('http') ? item.poster_path : `${POSTER_THUMB_BASE}${item.poster_path}`)
                : './icon-512.png';

              return (
                <div 
                  key={item.id}
                  className="group relative bg-[#091330] border border-cyan-500/25 rounded-2xl overflow-hidden hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[2/3] w-full overflow-hidden bg-black">
                    <img 
                      src={poster} 
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/75 border border-amber-400/50 text-amber-300 text-[10px] font-black flex items-center gap-0.5 backdrop-blur-md">
                      <Star className="w-2.5 h-2.5 fill-amber-300 text-amber-300" />
                      <span>{item.vote_average?.toFixed(1) || '8.2'}</span>
                    </div>

                    {/* Quick 1-Tap Play Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-2 backdrop-blur-xs">
                      <button
                        onClick={() => {
                          soundFx.playClick?.();
                          onSelectMedia?.(item);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 font-black text-xs shadow-lg transform hover:scale-105 active:scale-95 transition cursor-pointer flex items-center gap-1"
                      >
                        <Play className="w-3.5 h-3.5 fill-gray-950" />
                        <span>Play</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-extrabold text-xs text-white truncate group-hover:text-cyan-300 transition-colors">
                        {item.title || item.name}
                      </h4>
                      <p className="text-[10px] text-cyan-200/60 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.overview}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        soundFx.playClick?.();
                        onSelectMedia?.(item);
                        onClose();
                      }}
                      className="mt-2 w-full py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/30 text-cyan-300 font-bold text-[10px] transition cursor-pointer flex items-center justify-center gap-1 border border-cyan-500/30"
                    >
                      <span>Stream in 4K</span>
                      <Play className="w-2.5 h-2.5 fill-cyan-300" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#050b1d] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300/80 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            AI Semantic Engine powered by Lady Furina
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
