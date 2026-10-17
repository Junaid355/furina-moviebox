import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Info, Plus, Check, Star, Film, Tv, Volume2, VolumeX, 
  Sparkles, RefreshCw, Server, Globe, Search, Zap 
} from 'lucide-react';
import { 
  CURATED_MOVIEBOX_TITLES, 
  fetchMovieBoxTrending, 
  resolveMovieBoxTmdbId 
} from '../services/movieboxService';
import { SERVERS } from '../services/streaming';
import { resolveBackdropUrl } from '../services/contentModel';
import MediaCard from './MediaCard';
import soundFx from '../services/soundFx';

export default function MovieBoxHub({
  onPlay,
  onOpenDetails,
  isWatchlisted,
  onToggleWatchlist,
  preferredServer,
  setPreferredServer
}) {
  const [catalog, setCatalog] = useState(CURATED_MOVIEBOX_TITLES);
  const [loading, setLoading] = useState(false);
  const [dubFilter, setDubFilter] = useState('all'); // 'all' | 'hindi' | 'multiaudio' | 'movies' | 'series' | 'anime'
  const [hubSearch, setHubSearch] = useState('');
  const [spotlightIndex, setSpotlightIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [trailerMuted, setTrailerMuted] = useState(true);
  const [resolvingId, setResolvingId] = useState(null);

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const live = await fetchMovieBoxTrending();
      if (Array.isArray(live) && live.length > 0) {
        setCatalog(live);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const filteredCatalog = useMemo(() => {
    return catalog.filter((item) => {
      if (!item) return false;
      if (hubSearch.trim()) {
        const q = hubSearch.trim().toLowerCase();
        const matchTitle = (item.title || item.name || '').toLowerCase().includes(q);
        const matchGenre = Array.isArray(item.genres) && item.genres.some((g) => String(g).toLowerCase().includes(q));
        if (!matchTitle && !matchGenre) return false;
      }
      if (dubFilter === 'hindi') return Boolean(item.hasHindiDub || item.isHindiDubbed);
      if (dubFilter === 'multiaudio') return Array.isArray(item.availableAudios) && item.availableAudios.length >= 2;
      if (dubFilter === 'movies') return item.type === 'movie' || item.media_type === 'movie';
      if (dubFilter === 'series') return item.type === 'tv' || item.media_type === 'tv';
      if (dubFilter === 'anime') return Boolean(item.isAnime || item.category === 'anime');
      return true;
    });
  }, [catalog, dubFilter, hubSearch]);

  const spotlightItem = filteredCatalog[spotlightIndex] || catalog[0] || CURATED_MOVIEBOX_TITLES[0];
  const saved = isWatchlisted && spotlightItem?.id ? isWatchlisted(spotlightItem.id) : false;

  const handleLaunchMovieBoxPlay = async (item, serverOverrideId = null) => {
    if (!item) return;
    soundFx.playStartChime?.();
    setResolvingId(item.id);
    try {
      const resolvedTmdb = await resolveMovieBoxTmdbId(item);
      const enriched = {
        ...item,
        id: resolvedTmdb || item.tmdbId || item.id,
        tmdbId: resolvedTmdb || item.tmdbId,
        tmdb_id: resolvedTmdb || item.tmdbId,
        preferredServerId: serverOverrideId || preferredServer || 'vidstuck'
      };
      onPlay(enriched);
    } catch {
      onPlay({
        ...item,
        preferredServerId: serverOverrideId || preferredServer || 'vidstuck'
      });
    } finally {
      setResolvingId(null);
    }
  };

  const featuredServers = useMemo(() => {
    return SERVERS.filter((s) =>
      ['moviebox_cloud', 'vidstuck', 'vidfast', 'nxsha', 'vidsrc_pm', 'vidlink'].includes(s.id)
    );
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Unified MovieBox Spotlight Banner with Trailer Preview & Direct Server Launch */}
      {spotlightItem && (
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-cyan-500/30 bg-[#040a1c] shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
          <div className="relative min-h-[210px] sm:min-h-[260px] flex flex-col justify-end p-4 sm:p-6">
            {/* Background Backdrop or Video Trailer */}
            <div className="absolute inset-0 bg-[#030712]">
              {showTrailer && spotlightItem.trailerUrl ? (
                <video
                  key={spotlightItem.trailerUrl}
                  src={spotlightItem.trailerUrl}
                  autoPlay
                  loop
                  muted={trailerMuted}
                  playsInline
                  className="w-full h-full object-cover opacity-85"
                  onError={() => setShowTrailer(false)}
                />
              ) : (
                <img
                  src={resolveBackdropUrl(spotlightItem.backdrop_path || spotlightItem.poster_path)}
                  alt={spotlightItem.title}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = './icon-512.png';
                  }}
                  className="w-full h-full object-cover object-center opacity-75 transition-transform duration-700"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/70 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030712] via-[#030712]/75 to-transparent max-w-3xl" />
            </div>

            {/* Top Bar Inside Spotlight */}
            <div className="relative z-10 flex items-center justify-between gap-2 mb-auto pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
                <span>MovieBox Official 4K Multi-Dub Hub</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-300 font-mono tabular-nums">{catalog.length} Verified Releases</span>
              </div>

              <div className="flex items-center gap-2">
                {spotlightItem.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      setShowTrailer((prev) => !prev);
                    }}
                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 border border-cyan-500/30 text-cyan-200 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <Film className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{showTrailer ? 'Hide Trailer' : 'Preview Trailer'}</span>
                  </button>
                )}
                {showTrailer && spotlightItem.trailerUrl && (
                  <button
                    type="button"
                    onClick={() => setTrailerMuted((m) => !m)}
                    className="min-h-[38px] min-w-[38px] rounded-xl bg-black/70 hover:bg-black/90 border border-white/15 text-white flex items-center justify-center transition cursor-pointer"
                    title={trailerMuted ? 'Unmute Trailer' : 'Mute Trailer'}
                  >
                    {trailerMuted ? <VolumeX className="w-4 h-4 text-slate-300" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
                  </button>
                )}
                <button
                  type="button"
                  onClick={loadCatalog}
                  disabled={loading}
                  className="min-h-[38px] px-3 py-1.5 rounded-xl bg-black/70 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">{loading ? 'Syncing...' : 'Refresh Feed'}</span>
                </button>
              </div>
            </div>

            {/* Spotlight Metadata & Actions */}
            <div className="relative z-10 max-w-2xl space-y-3">
              {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-300 flex-wrap">
                <span className="text-amber-400 flex items-center gap-1 font-mono tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {Number(spotlightItem.vote_average || 8.1).toFixed(1)}
                </span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="font-mono tabular-nums text-slate-200">{spotlightItem.year || '2024'}</span>
                <span aria-hidden="true" className="text-slate-500">·</span>
                <span className="text-cyan-300">{spotlightItem.qualityBadge || '4K UHD'}</span>
                {spotlightItem.hasHindiDub && (
                  <>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-amber-300">🇮🇳 Hindi Dub Available</span>
                  </>
                )}
                {Array.isArray(spotlightItem.availableAudios) && spotlightItem.availableAudios.length > 0 && (
                  <>
                    <span aria-hidden="true" className="text-slate-500">·</span>
                    <span className="text-slate-300">
                      Audio: {spotlightItem.availableAudios.join(' / ')}
                    </span>
                  </>
                )}
              </div>

              <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {spotlightItem.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
                {spotlightItem.overview}
              </p>

              {/* Primary CTA & Action Row */}
              <div className="flex items-center gap-2.5 pt-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleLaunchMovieBoxPlay(spotlightItem)}
                  disabled={resolvingId === spotlightItem.id}
                  className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-black text-xs sm:text-sm flex items-center gap-2 shadow-[0_0_24px_rgba(56,189,248,0.45)] transition cursor-pointer whitespace-nowrap"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>
                    {resolvingId === spotlightItem.id ? 'Connecting 4K Stream...' : 'Stream in 4K Multi-Dub'}
                  </span>
                </button>

                {onOpenDetails && (
                  <button
                    type="button"
                    onClick={() => onOpenDetails(spotlightItem)}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl bg-slate-900/85 hover:bg-slate-800 border border-cyan-500/30 text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                  >
                    <Info className="w-4 h-4 text-cyan-400" />
                    <span>Details & Episodes</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onToggleWatchlist && onToggleWatchlist(spotlightItem)}
                  className={`min-h-[44px] px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition border cursor-pointer whitespace-nowrap ${
                    saved
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                      : 'bg-slate-900/85 border-white/15 text-slate-200 hover:text-white hover:border-cyan-400/50'
                  }`}
                >
                  {saved ? <Check className="w-4 h-4 text-cyan-400" /> : <Plus className="w-4 h-4 text-cyan-300" />}
                  <span>{saved ? 'In Watchlist' : 'Add to Watchlist'}</span>
                </button>
              </div>

              {/* Spotlight Quick Switcher Thumbnails */}
              <div className="pt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
                {filteredCatalog.slice(0, 8).map((item, idx) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSpotlightIndex(idx);
                      setShowTrailer(false);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border whitespace-nowrap shrink-0 cursor-pointer ${
                      spotlightIndex === idx
                        ? 'bg-cyan-500/25 border-cyan-400 text-white'
                        : 'bg-black/50 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Control Toolbar: Search + Multi-Dub Filter Tabs + Direct CDN Server Picker */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-[#060f28]/90 border border-cyan-500/20">
        {/* Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
          {[
            { id: 'all', label: 'All MovieBox' },
            { id: 'hindi', label: '🇮🇳 Hindi Dubbed' },
            { id: 'multiaudio', label: '🎧 Dual / Multi-Audio' },
            { id: 'movies', label: '🎬 4K Movies' },
            { id: 'series', label: '📺 Web Series' },
            { id: 'anime', label: '🌸 Anime Dubs' }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                setDubFilter(tab.id);
                setSpotlightIndex(0);
              }}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap shrink-0 cursor-pointer ${
                dubFilter === tab.id
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-[#0a1636] text-slate-300 hover:text-white border border-cyan-500/15'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Server Selector */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-4 h-4 text-cyan-400/70 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={hubSearch}
              onChange={(e) => setHubSearch(e.target.value)}
              placeholder="Filter MovieBox titles..."
              className="w-full min-h-[40px] bg-[#040a1c] border border-cyan-500/25 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-[#040a1c] px-3 py-1.5 rounded-xl border border-cyan-500/25 min-h-[40px]">
            <Server className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="text-[11px] text-slate-400 whitespace-nowrap">Default Server:</span>
            <select
              value={preferredServer || 'vidstuck'}
              onChange={(e) => setPreferredServer && setPreferredServer(e.target.value)}
              className="bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer"
            >
              {featuredServers.map((srv) => (
                <option key={srv.id} value={srv.id} className="bg-[#050b1d] text-white">
                  {srv.shortName.replace(/[\[\]]/g, '').trim()}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Compact 6-7 Column MovieBox Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
        {filteredCatalog.map((item) => (
          <MediaCard
            key={`mb-card-${item.id}`}
            item={item}
            onPlay={(m) => handleLaunchMovieBoxPlay(m)}
            onOpenDetails={onOpenDetails}
            isWatchlisted={isWatchlisted ? isWatchlisted(item.id) : false}
            onToggleWatchlist={onToggleWatchlist}
          />
        ))}
      </div>
    </div>
  );
}
