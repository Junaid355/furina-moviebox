import React, { useState, useEffect } from 'react';
import { 
  X, Play, Star, Bookmark, Check, Sparkles, Film, Tv, 
  Layers, FolderHeart, Plus, Search
} from 'lucide-react';
import { resolveBackdropUrl, extractGenres } from '../services/contentModel';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable } from '../services/tmdb';
import { getCustomPlaylists, toggleItemInPlaylist } from '../services/playlistService';
import { resolveMovieBoxToTmdb } from '../services/movieboxService';
import soundFx from '../services/soundFx';

export default function MediaDetailsModal({ 
  item, 
  onClose, 
  onPlay, 
  isWatchlisted, 
  onToggleWatchlist
}) {
  if (!item) return null;

  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(item.seasons || item.number_of_seasons || 1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [episodeFilter, setEpisodeFilter] = useState('');
  const [playlists, setPlaylists] = useState(() => getCustomPlaylists());
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);
  const [resolvedItem, setResolvedItem] = useState(item);

  // Resolve MovieBox string IDs if needed
  useEffect(() => {
    let cancelled = false;
    setResolvedItem(item);
    if (String(item.id).startsWith('mb_') && !item.tmdb_id) {
      resolveMovieBoxToTmdb(item).then((res) => {
        if (!cancelled && res) setResolvedItem(res);
      });
    }
    return () => { cancelled = true; };
  }, [item]);

  const title = resolvedItem.title || resolvedItem.name || 'Untitled';
  const year = resolvedItem.year || String(resolvedItem.release_date || resolvedItem.first_air_date || '').substring(0, 4) || '2025';
  const rating = typeof resolvedItem.vote_average === 'number' 
    ? resolvedItem.vote_average.toFixed(1) 
    : (resolvedItem.rating || '8.4');

  const isSeries = Boolean(
    resolvedItem.type === 'tv' || 
    resolvedItem.media_type === 'tv' || 
    Boolean(resolvedItem.first_air_date) || 
    resolvedItem.category === 'series' || 
    resolvedItem.category === 'kdrama'
  );

  const isAnime = Boolean(
    resolvedItem.category === 'anime' ||
    resolvedItem.category === 'ecchi_anime' ||
    resolvedItem.isAnime === true ||
    resolvedItem.original_language === 'ja'
  );

  const isHindi = Boolean(
    resolvedItem.isHindiDubbed ||
    resolvedItem.hasHindiDub ||
    resolvedItem.languages?.hi ||
    isHindiAvailable(resolvedItem)
  );

  const genres = extractGenres(resolvedItem);
  const saved = isWatchlisted ? isWatchlisted(resolvedItem.id) : false;

  useEffect(() => {
    const syncPlaylists = () => setPlaylists(getCustomPlaylists());
    window.addEventListener('furina:playlists-updated', syncPlaylists);
    return () => window.removeEventListener('furina:playlists-updated', syncPlaylists);
  }, []);

  const effectiveTmdbId = resolvedItem.tmdb_id || (typeof resolvedItem.id === 'number' ? resolvedItem.id : null);

  useEffect(() => {
    if (!isSeries || !effectiveTmdbId) return;
    fetchTvDetails(effectiveTmdbId).then((details) => {
      if (details?.number_of_seasons) {
        setTotalSeasons(Math.max(1, details.number_of_seasons));
      }
    }).catch(() => {});
  }, [isSeries, effectiveTmdbId]);

  useEffect(() => {
    if (!isSeries || !effectiveTmdbId) return;
    let isCancelled = false;
    setLoadingEpisodes(true);

    const loadEpisodes = async () => {
      try {
        const eps = await fetchSeasonEpisodes(effectiveTmdbId, selectedSeason);
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
  }, [effectiveTmdbId, isSeries, selectedSeason]);

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleToggleCollection = (playlistId) => {
    soundFx.playClick?.();
    const updated = toggleItemInPlaylist(playlistId, resolvedItem);
    setPlaylists(updated);
  };

  const displayEpisodes = (episodes.length > 0
    ? episodes
    : Array.from({ length: 12 }, (_, i) => ({ episode_number: i + 1, name: `Episode ${i + 1}` }))
  ).filter((ep) => {
    if (!episodeFilter.trim()) return true;
    const q = episodeFilter.trim().toLowerCase();
    return (
      String(ep.episode_number).includes(q) ||
      (ep.name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xl animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl rounded-2xl sm:rounded-3xl overflow-hidden bg-[#060d21] border border-cyan-500/25 shadow-[0_25px_70px_rgba(0,0,0,0.9)] my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop Banner Header */}
        <div className="relative h-44 sm:h-64 w-full bg-[#030712] shrink-0 overflow-hidden">
          <img
            src={resolveBackdropUrl(resolvedItem.backdrop_path || resolvedItem.poster_path)}
            alt={title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = './icon-512.png';
            }}
            className="w-full h-full object-cover object-center brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#060d21] via-[#060d21]/55 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060d21] via-[#060d21]/35 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            aria-label="Close details modal"
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md border border-white/15 transition z-20 cursor-pointer shadow-lg"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Clean Unboxed Metadata Line at Bottom of Banner */}
          <div className="absolute bottom-3 left-4 sm:left-6 right-6 flex items-center gap-2 text-xs font-bold text-slate-200 flex-wrap z-10">
            <span className="text-cyan-400 font-black uppercase tracking-wider">4K UHD</span>
            <span className="text-slate-600">•</span>
            <span className="flex items-center gap-1 text-amber-400 font-black">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              {rating}
            </span>
            <span className="text-slate-600">•</span>
            <span className="font-mono text-slate-300">{year}</span>
            {isHindi && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-amber-300 font-bold">🇮🇳 Hindi Dub</span>
              </>
            )}
            {isAnime && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-purple-300 font-bold">🇯🇵 Sub & Dub</span>
              </>
            )}
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {title}
              </h2>
              {genres.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap text-xs text-cyan-300/80 font-medium">
                  {genres.join(' · ')}
                </div>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <button
                onClick={() => {
                  onClose();
                  onPlay(resolvedItem);
                }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-gray-950 text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(56,189,248,0.45)] transition transform hover:scale-[1.02] active:scale-95 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-gray-950" />
                <span>Play Now (4K)</span>
              </button>

              <button
                onClick={() => onToggleWatchlist && onToggleWatchlist(resolvedItem)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition border cursor-pointer ${
                  saved
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-[#0b1532] border-cyan-500/25 text-white hover:bg-white/10'
                }`}
              >
                {saved ? <Check className="w-4 h-4 text-cyan-400" /> : <Bookmark className="w-4 h-4" />}
                <span>{saved ? 'Saved' : 'Watchlist'}</span>
              </button>

              {/* Add to Custom Playlist / Collection Button */}
              <div className="relative">
                <button
                  onClick={() => setShowPlaylistMenu((v) => !v)}
                  className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#0b1532] border border-cyan-500/25 text-cyan-300 hover:text-white hover:border-cyan-400 transition cursor-pointer"
                  title="Add to Custom Collection"
                >
                  <FolderHeart className="w-4 h-4" />
                  <span>Collections</span>
                </button>

                {showPlaylistMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#071028] border border-cyan-500/35 shadow-2xl p-2 z-30 space-y-1">
                    <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-cyan-400 border-b border-white/10">
                      Save to Collection
                    </div>
                    {playlists.map((pl) => {
                      const inList = (pl.items || []).some((x) => String(x.id) === String(resolvedItem.id));
                      return (
                        <button
                          key={pl.id}
                          onClick={() => handleToggleCollection(pl.id)}
                          className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            inList
                              ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/30'
                              : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          <span className="truncate">{pl.icon} {pl.name}</span>
                          {inList ? <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0" /> : <Plus className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Synopsis */}
          <div className="space-y-1 text-xs sm:text-sm text-slate-300 leading-relaxed bg-[#09132e]/80 p-3.5 rounded-xl border border-white/5">
            <h3 className="text-[11px] font-black uppercase tracking-wider text-cyan-400">Synopsis</h3>
            <p>{resolvedItem.overview || 'Experience this cinematic title in 4K Ultra HD with multi-audio streaming support.'}</p>
          </div>

          {/* Episode Browser if Series */}
          {isSeries && (
            <div className="space-y-3 pt-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Episodes & Seasons</span>
                </h3>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={episodeFilter}
                      onChange={(e) => setEpisodeFilter(e.target.value)}
                      placeholder="Find episode..."
                      className="w-32 sm:w-40 pl-7 pr-2.5 py-1 rounded-lg bg-[#09132e] border border-cyan-500/25 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-[#09132e] border border-cyan-500/30 text-cyan-200 text-xs font-bold rounded-lg px-2.5 py-1 focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((s) => (
                      <option key={s} value={s}>Season {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {loadingEpisodes ? (
                <div className="p-6 text-center text-xs text-cyan-300/80 animate-pulse">
                  Loading Season {selectedSeason} episodes...
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-52 overflow-y-auto pr-1">
                  {displayEpisodes.map((ep) => (
                    <button
                      key={ep.episode_number}
                      onClick={() => {
                        onClose();
                        onPlay({ ...resolvedItem, season: selectedSeason, episode: ep.episode_number });
                      }}
                      className="p-2.5 rounded-xl bg-[#09132e] hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-400/50 text-left transition flex items-center justify-between group cursor-pointer"
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
