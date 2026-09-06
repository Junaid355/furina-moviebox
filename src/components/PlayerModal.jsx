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
  const [showUBlockGuide, setShowUBlockGuide] = useState(false);
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
            {/* uBlock Origin Lite - 100% Zero-Ad Protection Button */}
            <button
              onClick={() => setShowUBlockGuide(!showUBlockGuide)}
              title="uBlock Origin Lite - Zero Ad Playback Guide"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                showUBlockGuide
                  ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)] scale-105'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span>🛡️ uBlock Origin Lite</span>
            </button>

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

        {/* Expandable uBlock Origin Lite Protection Drawer */}
        {showUBlockGuide && (
          <div className="p-4 bg-gradient-to-r from-[#061e19] via-[#081b29] to-[#04121d] border-b border-emerald-500/30 text-xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>🛡️ How to Block 100% of Ads Across Every Streaming Server:</span>
              </div>
              <button 
                onClick={() => setShowUBlockGuide(false)} 
                className="text-emerald-200/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              Free streaming embed providers inject popups and anti-sandbox blockers into cross-origin iframes. Webpages cannot block external iframe scripts directly due to browser security. <strong>Installing the official free uBlock Origin Lite extension</strong> blocks 100% of ads at the browser level with zero configuration:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Chrome / Edge / Opera / Brave */}
              <a
                href="https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh"
                target="_blank"
                rel="noopener noreferrer"
                onClick={permitPopupOnce}
                className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 hover:bg-emerald-500/25 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="font-bold text-emerald-300 text-xs flex items-center justify-between">
                    <span>Chrome / Edge / Opera</span>
                    <ExternalLink className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition" />
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Official Chrome Web Store. 1-Click Install, 0 configuration needed.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-emerald-400 bg-emerald-500/20 py-1 text-center rounded">
                  Install uBlock Origin Lite ↗
                </div>
              </a>

              {/* Firefox */}
              <a
                href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
                target="_blank"
                rel="noopener noreferrer"
                onClick={permitPopupOnce}
                className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/40 hover:bg-cyan-500/25 transition flex flex-col justify-between group"
              >
                <div>
                  <div className="font-bold text-cyan-300 text-xs flex items-center justify-between">
                    <span>Firefox Browser</span>
                    <ExternalLink className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition" />
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Official Mozilla Add-ons. Maximum protection against all popups.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-bold text-cyan-400 bg-cyan-500/20 py-1 text-center rounded">
                  Install uBlock Origin ↗
                </div>
              </a>

              {/* Mobile / iOS */}
              <div className="p-3 rounded-xl bg-purple-500/15 border border-purple-500/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-purple-300 text-xs">
                    <span>iPhone / Android / Mac</span>
                  </div>
                  <p className="text-[10px] text-slate-300 mt-1">
                    Use <strong>Brave Browser</strong> (has built-in uBlock shield) or Safari with <strong>AdGuard iOS</strong> for zero ads.
                  </p>
                </div>
                <div className="mt-2 text-[10px] font-semibold text-purple-300 bg-purple-500/20 py-1 text-center rounded">
                  Built-in Mobile Shield
                </div>
              </div>
            </div>
          </div>
        )}

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

              {/* Option 2: Hollywood Titles & NetMirror/Dooflix */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-cyan-500/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-cyan-300 mb-1.5 flex items-center justify-between">
                    <span>🎬 2. Hollywood Blockbusters (Hindi Dubbed)</span>
                    <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-bold">Dual-Audio OTT</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Apps like <strong>Dooflix</strong> and <strong>NetMirror</strong> stream Hollywood movies (e.g. <em>Avengers: Endgame</em>) in Hindi by directly tapping Disney+ Hotstar & Netflix India encrypted streams. Use our 1-Click NetMirror gateway below to access full Hindi dubbing!
                  </p>
                </div>
                <div className="mt-2.5 text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-1 rounded">
                  ✓ Web Player plays 4K/1080p original track. Tap NetMirror below for Hindi!
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

        {/* 4K UHD & 1080p Quality Booster Bar */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-[#0a1636] via-[#0e214d] to-[#0a1636] border-b border-cyan-500/25 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-cyan-200">
            <span className="px-2 py-0.5 rounded bg-cyan-500/25 text-cyan-300 font-black text-[10px] border border-cyan-400/50 shadow-[0_0_10px_rgba(56,189,248,0.3)]">
              4K / 1080p TIP
            </span>
            <span className="text-[11px] text-slate-200 leading-tight">
              Looks blurry? Tap <strong className="text-amber-300">⚙️ Settings</strong> inside player ➔ switch Quality from <strong>Auto</strong> to <strong className="text-cyan-300">1080p or 4K</strong>!
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-semibold shrink-0 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
            <span>✨ Highest Bitrate: Server 1 (VidSrc 4K) & Server 3 (VidLink 4K)</span>
          </div>
        </div>

        {/* Video Player IFrame Container (Clean un-sandboxed to prevent anti-sandbox blocking) */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            key={`${selectedServer.id}-${season}-${episode}-${reloadKey}`}
            src={streamUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          />
        </div>

        {/* Dedicated Hindi Dubbed Dual-Audio Stream Gateway */}
        <div className="p-3.5 bg-gradient-to-r from-[#1f1505] via-[#120e06] to-[#081329] border-t border-b border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-gray-950 flex items-center justify-center font-black text-lg shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              🇮🇳
            </div>
            <div>
              <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>Want to Watch in Hindi Dubbed (हिन्दी)?</span>
                <span className="text-[10px] bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/40 animate-pulse">Dual-Audio Stream</span>
              </div>
              <p className="text-[11px] text-amber-200/80 mt-0.5 leading-relaxed">
                For verified <strong>Hindi Dubbed audio</strong> for <em>{title}</em>, launch NetMirror (Disney+/Hotstar streams) or our dual-audio mirrors:
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto">
            <a
              href={`https://netmirror.global/search/${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-gray-950 font-black text-xs transition shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center gap-1.5 hover:scale-105 border border-amber-300"
            >
              <span>🌐 NetMirror (Hotstar Hindi) ↗</span>
            </a>
            <a
              href={`https://desicinemas.tv/?s=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>DesiCinemas ↗</span>
            </a>
            <a
              href={`https://moviesmod.vip/?s=${encodeURIComponent(title + ' Hindi Dubbed')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>MoviesMod Hindi ↗</span>
            </a>
            <a
              href={`https://hdhub4u.tv/?s=${encodeURIComponent(title + ' Hindi')}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>HDHub4u Hindi ↗</span>
            </a>
            <a
              href={`https://www.hotstar.com/in/explore?search_query=${encodeURIComponent(title)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              className="px-3 py-1.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/50 text-blue-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5"
            >
              <span>Hotstar Hindi ↗</span>
            </a>
          </div>
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
