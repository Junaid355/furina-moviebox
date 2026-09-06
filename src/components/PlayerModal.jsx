import React, { useState, useEffect } from 'react';
import { X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, Sparkles, ShieldCheck } from 'lucide-react';
import { SERVERS, getStreamUrl } from '../services/streaming';
import { fetchSeasonEpisodes } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';

export default function PlayerModal({ item, onClose, preferredServerId }) {
  if (!item) return null;

  const isSeries = item.media_type === 'tv' || !!item.first_air_date;
  const title = item.title || item.name || 'Now Playing';

  const initialServer = SERVERS.find((s) => s.id === preferredServerId) || SERVERS[0];
  const [selectedServer, setSelectedServer] = useState(initialServer);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [episodesList, setEpisodesList] = useState([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showHindiGuide, setShowHindiGuide] = useState(false);
  const [blockedAds, setBlockedAds] = useState(getBlockedCount());

  // Listen to blocked ad popup events
  useEffect(() => {
    const handleBlocked = (e) => {
      setBlockedAds(e.detail?.count || getBlockedCount());
    };
    window.addEventListener('furina-ad-blocked', handleBlocked);
    return () => window.removeEventListener('furina-ad-blocked', handleBlocked);
  }, []);

  // Load episodes if TV series
  useEffect(() => {
    if (isSeries) {
      setIsLoadingEpisodes(true);
      fetchSeasonEpisodes(item.id, season).then((eps) => {
        setEpisodesList(eps);
        setIsLoadingEpisodes(false);
      });
    }
  }, [item.id, season, isSeries]);

  const streamUrl = getStreamUrl(selectedServer, item.id, isSeries ? 'tv' : 'movie', season, episode);

  const openInNewWindow = () => {
    permitPopupOnce();
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  const handleReload = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      <div className="relative w-full max-w-5xl bg-[#081026] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.28)] flex flex-col z-10">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-cyan-500/20 bg-[#050b1d]">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-cyan-400/50 shadow-[0_0_12px_rgba(56,189,248,0.4)] shrink-0">
              <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                <span>{title}</span>
                {isSeries && <span className="text-cyan-400 font-normal text-xs bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">S{season} E{episode}</span>}
              </h2>
              <div className="flex items-center gap-2 text-[11px] text-cyan-200/60">
                <span>4K Ultra HD Multi-Mirror</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">{selectedServer.badge}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* AdBlock Shield Live Status with Native Sandbox Pill */}
            <div 
              title="Native Browser Sandbox Shield actively blocks popups, pop-unders, and ad redirects"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span>AdBlock Active (Sandbox Shield)</span>
            </div>

            {/* Hindi Dubbed Audio Switcher Guide Toggle */}
            <button
              onClick={() => setShowHindiGuide(!showHindiGuide)}
              title="Hindi Audio Information"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                showHindiGuide
                  ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)] scale-105'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              }`}
            >
              <span>🎙️ Hindi Audio Info</span>
            </button>

            {/* Reload stream button */}
            <button
              onClick={handleReload}
              title="Reload video player"
              className="p-2 rounded-xl bg-[#0c1836] border border-cyan-500/30 text-cyan-300 hover:text-white hover:bg-white/10 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Open stream in clean external window */}
            <button
              onClick={openInNewWindow}
              title="Open full stream in new clean tab"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Player ↗</span>
            </button>

            {/* Close Modal */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-cyan-300 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Hindi Audio Information Drawer */}
        {showHindiGuide && (
          <div className="p-4 bg-gradient-to-r from-[#0d1e3d] via-[#09152b] to-[#171408] border-b border-amber-500/30 text-xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                <span>🎙️ Audio Track & Hindi Dubbing Details:</span>
              </div>
              <button 
                onClick={() => setShowHindiGuide(false)} 
                className="text-amber-200/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              {/* Option 1: Bollywood & Indian Cinema */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-300 mb-1.5 flex items-center justify-between">
                    <span>🇮🇳 1. Bollywood & Indian Cinema</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">100% Hindi Audio</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    All Indian titles (e.g. <em>Kalki 2898 AD, Stree 2, Jawan, Pathaan, Animal, Salaar, RRR</em>) play in <strong>full native Hindi audio</strong> automatically on Server 1 and Server 2! No settings changes needed.
                  </p>
                </div>
                <div className="mt-2.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                  ✓ Explore our "🇮🇳 Bollywood & Hindi Dubbed" tab on the homepage!
                </div>
              </div>

              {/* Option 2: Hollywood Titles */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-cyan-300 mb-1.5 flex items-center justify-between">
                    <span>🎬 2. Hollywood Blockbusters</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold">Original English Track</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Hollywood movies (e.g. <em>Avengers: Endgame, Deadpool, Oppenheimer</em>) are streamed with high-definition original English audio. Scraped web embeds do not re-encode multi-track Hindi audio streams.
                  </p>
                </div>
                <div className="mt-2.5 text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-1 rounded">
                  ✓ Instant 1080p/4K playback on Server 1 (AutoEmbed) & Server 2 (VidSrc 4K)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Server Switcher Bar */}
        <div className="p-3 bg-[#070e24] border-b border-cyan-500/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-cyan-300/80 flex items-center gap-1.5 whitespace-nowrap px-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Active Server:
          </span>
          {SERVERS.map((srv) => {
            const isSelected = selectedServer.id === srv.id;
            return (
              <button
                key={srv.id}
                onClick={() => setSelectedServer(srv)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] font-bold scale-105'
                    : `${srv.color} hover:bg-white/10`
                }`}
              >
                {srv.shortName || srv.name}
              </button>
            );
          })}
        </div>

        {/* Video Player IFrame Container with Sandbox Ad Blocker */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            key={`${selectedServer.id}-${season}-${episode}-${reloadKey}`}
            src={streamUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            sandbox="allow-forms allow-scripts allow-same-origin allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          />
        </div>

        {/* Playback Guidance & Quick Server Fallback Bar */}
        <div className="px-4 py-3 bg-[#050b1b] border-t border-cyan-500/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-cyan-200/90 text-xs">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <span>
              <strong>Tip:</strong> Tap inside player to start sound/video. If loading persists, switch mirror:
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {SERVERS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedServer(s)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition border ${
                  selectedServer.id === s.id
                    ? 'bg-cyan-500 text-gray-950 border-cyan-400 font-bold shadow'
                    : 'bg-[#0d1c44] border-cyan-500/20 text-cyan-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {s.shortName}
              </button>
            ))}
          </div>
        </div>

        {/* TV Series Episode & Season Navigation */}
        {isSeries && (
          <div className="p-4 bg-[#070d1f] border-t border-cyan-500/20">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">Select Season & Episode</span>
              </div>

              {/* Season Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[1, 2, 3, 4, 5, 6].map((sNum) => (
                  <button
                    key={sNum}
                    onClick={() => { setSeason(sNum); setEpisode(1); }}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                      season === sNum
                        ? 'bg-cyan-500 text-gray-950 font-bold shadow'
                        : 'bg-[#0f1d40] text-cyan-200/60 hover:text-white'
                    }`}
                  >
                    Season {sNum}
                  </button>
                ))}
              </div>
            </div>

            {/* Episode Grid */}
            {isLoadingEpisodes ? (
              <div className="py-8 text-center text-xs text-cyan-300/60 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading episodes...
              </div>
            ) : episodesList.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-48 overflow-y-auto pr-1">
                {episodesList.map((ep) => {
                  const isCurrent = episode === ep.episode_number;
                  return (
                    <button
                      key={ep.episode_number}
                      onClick={() => setEpisode(ep.episode_number)}
                      className={`p-2 rounded-lg text-left transition border ${
                        isCurrent
                          ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold shadow'
                          : 'bg-[#0a132b] border-cyan-500/15 text-cyan-200/70 hover:bg-white/5'
                      }`}
                    >
                      <div className="text-[10px] text-cyan-400/80 font-mono">EP {ep.episode_number}</div>
                      <div className="text-xs font-medium text-white line-clamp-1">{ep.name || `Episode ${ep.episode_number}`}</div>
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Fallback episode numbers */
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((epNum) => (
                  <button
                    key={epNum}
                    onClick={() => setEpisode(epNum)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                      episode === epNum
                        ? 'bg-cyan-500 text-gray-950 font-bold shadow'
                        : 'bg-[#0a132b] text-cyan-200/70 hover:text-white'
                    }`}
                  >
                    Episode {epNum}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Footer Info */}
        <div className="p-3 bg-[#050917] border-t border-cyan-500/15 flex items-center justify-between flex-wrap gap-2 text-[11px] text-cyan-200/60">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            High-speed multi-server engine active. If one stream buffers, tap Server 1-4 above.
          </span>
          <span className="font-semibold text-cyan-400">4K Ultra HD</span>
        </div>

      </div>
    </div>
  );
}
