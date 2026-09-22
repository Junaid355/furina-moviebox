import React, { useState, useEffect } from 'react';
import { 
  X, Play, Star, Bookmark, Check, Sparkles, Film, Tv, Clock, 
  Calendar, Globe, ShieldCheck, Download, ChevronRight, Layers 
} from 'lucide-react';
import { resolveBackdropUrl, resolvePosterUrl, extractGenres } from '../services/contentModel';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable } from '../services/tmdb';

export default function MediaDetailsModal({ 
  item, 
  onClose, 
  onPlay, 
  isWatchlisted, 
  onToggleWatchlist,
  onOpenDownload 
}) {
  if (!item) return null;

  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(item.seasons || 1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  const title = item.title || item.name || 'Untitled';
  const year = item.year || String(item.release_date || item.first_air_date || '').substring(0, 4) || '2024';
  const rating = typeof item.vote_average === 'number' 
    ? item.vote_average.toFixed(1) 
    : (item.rating || '8.2');

  const isSeries = Boolean(
    item.type === 'tv' || 
    item.media_type === 'tv' || 
    Boolean(item.first_air_date) || 
    item.category === 'series' || 
    item.category === 'kdrama'
  );

  const isAnime = Boolean(
    item.category === 'anime' ||
    item.category === 'ecchi_anime' ||
    item.isAnime === true ||
    item.original_language === 'ja'
  );

  const isHindi = Boolean(
    item.isHindiDubbed ||
    item.languages?.hi ||
    isHindiAvailable(item)
  );

  const genres = extractGenres(item);
  const saved = isWatchlisted ? isWatchlisted(item.id) : false;

  useEffect(() => {
    if (!isSeries || !item.id) return;
    let isCancelled = false;
    setLoadingEpisodes(true);

    const loadEpisodes = async () => {
      try {
        const eps = await fetchSeasonEpisodes(item.id, selectedSeason);
        if (!isCancelled) {
          setEpisodes(Array.isArray(eps) ? eps : []);
        }
      } catch (e) {
        if (!isCancelled) setEpisodes([]);
      } finally {
        if (!isCancelled) setLoadingEpisodes(false);
      }
    };

    loadEpisodes();
    return () => { isCancelled = true; };
  }, [item.id, isSeries, selectedSeason]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xl animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl overflow-hidden glass-panel border border-cyan-500/20 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Banner Header */}
        <div className="relative h-48 sm:h-64 w-full bg-[#030712] shrink-0 overflow-hidden">
          <img
            src={resolveBackdropUrl(item.backdrop_path || item.poster_path)}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = './icon-512.png';
            }}
            className="w-full h-full object-cover filter brightness-75 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1024] via-[#0c1024]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1024] via-[#0c1024]/40 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close details modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition z-20 cursor-pointer shadow-lg"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Floating Badges */}
          <div className="absolute bottom-3 left-4 sm:left-6 flex items-center gap-2 flex-wrap z-10">
            <span className="badge-4k-uhd text-[10px] px-2.5 py-0.5 rounded-full shadow-sm tracking-wider uppercase border border-cyan-300/30">
              4K Ultra HD
            </span>
            {isHindi && (
              <span className="badge-hindi-gold text-[10px] px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-amber-300/30">
                <span>🇮🇳</span>
                <span>Hindi Audio</span>
              </span>
            )}
            {isAnime && (
              <span className="badge-fhd text-[10px] px-2.5 py-0.5 rounded-full shadow flex items-center gap-1 border border-purple-300/30">
                <span>🇯🇵</span>
                <span>Sub & Dub</span>
              </span>
            )}
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-amber-500/30 text-amber-400 text-[11px] font-extrabold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {rating}
            </span>
            <span className="text-[11px] text-slate-300 font-bold bg-white/10 backdrop-blur-md px-2.5 py-0.5 rounded-full">
              {year}
            </span>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
                {title}
              </h2>
              {genres.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {genres.map((g) => (
                    <span 
                      key={g}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/60 border border-cyan-800/40 text-cyan-300"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onPlay(item);
                }}
                className="btn-cinema-4k btn-shine animate-pulse-play flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
                <span>Play Now (4K)</span>
              </button>

              <button
                onClick={() => onToggleWatchlist && onToggleWatchlist(item)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border ${
                  saved
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-[#08122c] border-cyan-500/30 text-white hover:bg-white/10'
                }`}
              >
                {saved ? <Check className="w-4 h-4 text-cyan-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Watchlist'}</span>
              </button>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1.5 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#081128]/70 p-3.5 rounded-xl border border-white/5">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400">Story Overview</h3>
            <p>{item.overview || 'Experience this cinematic masterpiece in 4K Ultra HD with multi-audio streaming support.'}</p>
          </div>

          {/* Episode Browser if Series */}
          {isSeries && (
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Episodes & Seasons</span>
                </h3>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4].slice(0, totalSeasons).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSelectedSeason(s)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition border ${
                        selectedSeason === s
                          ? 'bg-cyan-500 text-gray-950 border-cyan-300 shadow-sm'
                          : 'bg-[#08122c] text-cyan-200/70 border-cyan-500/30 hover:bg-white/10'
                      }`}
                    >
                      S{s}
                    </button>
                  ))}
                </div>
              </div>

              {loadingEpisodes ? (
                <div className="p-6 text-center text-xs text-cyan-300/80 animate-pulse">
                  Loading Season {selectedSeason} episodes...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                  {(episodes.length > 0 ? episodes : Array.from({ length: 12 }, (_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}` }))).map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => {
                        onClose();
                        onPlay({ ...item, season: selectedSeason, episode: ep.episode_number });
                      }}
                      className="p-2 rounded-xl bg-[#070e24] hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/50 text-left transition flex items-center justify-between group"
                    >
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] font-bold text-cyan-400 block">
                          S{selectedSeason} E{ep.episode_number}
                        </span>
                        <span className="text-[11px] font-medium text-white truncate block">
                          {ep.name || `Episode ${ep.episode_number}`}
                        </span>
                      </div>
                      <Play className="w-3 h-3 text-cyan-400 group-hover:scale-125 transition shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
