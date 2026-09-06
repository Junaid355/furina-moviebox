import React, { useState, useEffect } from 'react';
import { X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { SERVERS, getStreamUrl, getDownloadUrl } from '../services/streaming';
import { fetchSeasonEpisodes, fetchTvDetails } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';

export default function PlayerModal({ item, onClose, preferredServerId, isHindiPreferred }) {
  if (!item) return null;

  const isSeries = item.media_type === 'tv' || !!item.first_air_date;
  const title = item.title || item.name || 'Now Playing';

  const initialServer = (isHindiPreferred || item.original_language === 'hi')
    ? (SERVERS.find((s) => s.id === 'vidlink_hindi') || SERVERS[0])
    : (SERVERS.find((s) => s.id === preferredServerId) || SERVERS[0]);
  const [selectedServer, setSelectedServer] = useState(initialServer);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodesList, setEpisodesList] = useState([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showHindiGuide, setShowHindiGuide] = useState(false);
  const [showUBlockGuide, setShowUBlockGuide] = useState(false);
  const [blockedAds, setBlockedAds] = useState(getBlockedCount());
  const [aiBoostMode, setAiBoostMode] = useState(() => {
    return localStorage.getItem('furina_ai_boost') || '4k';
  });

  const AI_BOOST_STYLES = {
    off: {},
    '4k': {
      filter: 'contrast(1.09) saturate(1.14) brightness(1.02) drop-shadow(0 0 1px rgba(0,0,0,0.5))',
      transition: 'filter 0.3s ease'
    },
    hdr: {
      filter: 'contrast(1.18) saturate(1.28) brightness(1.04)',
      transition: 'filter 0.3s ease'
    },
    night: {
      filter: 'brightness(1.12) contrast(1.08) saturate(1.08)',
      transition: 'filter 0.3s ease'
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const releaseDate = item.release_date || item.first_air_date;
  const isUpcoming = (releaseDate && releaseDate > todayStr) || (item.vote_count === 0 && !isSeries);

  // Listen to blocked ad popup events
  useEffect(() => {
    const handleBlocked = (e) => {
      setBlockedAds(e.detail?.count || getBlockedCount());
    };
    window.addEventListener('furina-ad-blocked', handleBlocked);
    return () => window.removeEventListener('furina-ad-blocked', handleBlocked);
  }, []);

  // Fetch actual TV details to determine real number of seasons
  useEffect(() => {
    if (isSeries) {
      fetchTvDetails(item.id).then((details) => {
        if (details && details.number_of_seasons) {
          setTotalSeasons(Math.max(1, details.number_of_seasons));
        }
      });
    }
  }, [item.id, isSeries]);

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
  const downloadUrl = getDownloadUrl(item.id, isSeries ? 'tv' : 'movie', season, episode);

  const openInNewWindow = () => {
    permitPopupOnce();
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNextServer = () => {
    const currentIndex = SERVERS.findIndex((s) => s.id === selectedServer.id);
    const nextServer = SERVERS[(currentIndex + 1) % SERVERS.length];
    setSelectedServer(nextServer);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto">
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />

      <div className="relative w-full max-w-5xl bg-[#081026] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(56,189,248,0.28)] flex flex-col z-10 animate-fade-in">
        
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
            {/* 1-Click Download Option */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              title="Download movie or episode in HD / 4K"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/40 text-emerald-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </a>

            {/* Auto-Switch Next Working Server button */}
            <button
              onClick={handleNextServer}
              title="Auto-switch to next working mirror if stream stalls"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Auto-Switch</span>
            </button>

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
              <span className="hidden md:inline">🛡️ uBlock Origin Lite</span>
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
              <span className="hidden md:inline">🎙️ Hindi Info</span>
              <span className="md:hidden">🎙️ Hindi</span>
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

              {/* Option 2: Hollywood Blockbusters In-App Hindi Dub */}
              <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/40 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-amber-300 mb-1.5 flex items-center justify-between">
                    <span>🎬 2. Hollywood Titles (In-App Hindi Dub)</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">100% In-App</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Watch Hollywood blockbusters (e.g. <em>Avengers, Deadpool, Spider-Man</em>) in Hindi right here! Switch to <strong>Server 1 (Hindi Dubbed)</strong>, then click <strong>⚙️ Settings (gear icon)</strong> inside the video player ➔ <strong>Audio Track</strong> ➔ Select <strong>Hindi (हिन्दी)</strong>.
                  </p>
                </div>
                <div className="mt-2.5 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded">
                  ✓ Plays directly inside your player with ZERO external websites!
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

        {/* Theatrical / Upcoming Release Notice */}
        {isUpcoming && (
          <div className="p-3 bg-gradient-to-r from-amber-950/90 via-[#221302] to-amber-950/90 border-b border-amber-500/40 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">🎬</span>
              <div>
                <span className="font-extrabold text-amber-300">Theatrical / Upcoming Release Notice:</span>
                <p className="text-[11px] text-amber-200/90 mt-0.5">
                  This title is currently in pre-release or in theaters and not yet distributed on digital OTT streaming. If servers display <strong>"404 Content not found"</strong> or <strong>"Unavailable"</strong>, check back once the digital streaming release premieres!
                </p>
              </div>
            </div>
            {releaseDate && (
              <span className="shrink-0 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2.5 py-1 rounded-lg text-[10px] font-bold">
                Premiere: {releaseDate}
              </span>
            )}
          </div>
        )}

        {/* AI Video Boost & 4K Clarity Control Bar */}
        <div className="px-4 py-2 bg-gradient-to-r from-[#061127] via-[#0a1b3f] to-[#061127] border-b border-cyan-500/25 flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-extrabold text-[11px] shadow-[0_0_12px_rgba(56,189,248,0.35)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>AI Video Boost:</span>
            </span>
            <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-cyan-500/30">
              {[
                { id: 'off', label: 'Off', desc: 'Natural raw stream' },
                { id: '4k', label: '💎 4K Clarity', desc: 'AI edge sharpening & micro-contrast' },
                { id: 'hdr', label: '🌈 HDR Cinema', desc: 'Dolby-grade dynamic range & rich vibrance' },
                { id: 'night', label: '🌙 Dark Scene', desc: 'Deep shadow visibility booster' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => {
                    setAiBoostMode(mode.id);
                    localStorage.setItem('furina_ai_boost', mode.id);
                  }}
                  title={mode.desc}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold transition ${
                    aiBoostMode === mode.id
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 shadow-[0_0_12px_rgba(56,189,248,0.6)] scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-cyan-200/90 font-medium">
            <span className="hidden sm:inline">⚙️ Blurry? Tap <strong>Settings</strong> inside player ➔ select <strong>1080p / 4K</strong></span>
          </div>
        </div>

        {/* Video Player IFrame Container with AI Boost Visual Filter Pipeline */}
        <div 
          className="relative w-full aspect-video bg-black overflow-hidden"
          style={AI_BOOST_STYLES[aiBoostMode] || {}}
        >
          <iframe
            key={`${selectedServer.id}-${season}-${episode}-${reloadKey}`}
            src={streamUrl}
            title={title}
            className="w-full h-full border-0"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          />
        </div>

        {/* Dedicated In-App Hindi Dubbed & Multi-Audio Control Panel */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-[#1f1505] via-[#120e06] to-[#081329] border-t border-b border-amber-500/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-gray-950 flex items-center justify-center font-black text-lg shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.4)]">
              🇮🇳
            </div>
            <div>
              <div className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-2">
                <span>Hindi Dubbed & Dual-Audio (In-App)</span>
                <span className="text-[10px] bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/40">
                  {selectedServer.id === 'vidlink_hindi' ? 'Active: Server 1 (Hindi Dubbed)' : 'Available In-App'}
                </span>
              </div>
              <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
                {item.original_language === 'hi' ? (
                  <>🇮🇳 <strong>Bollywood Original</strong>: Filmed natively in Hindi. Plays in full Hindi audio across all servers automatically!</>
                ) : (
                  <>🎧 <strong>How to listen in Hindi</strong>: Inside video player, tap <strong>⚙️ Settings (bottom right)</strong> ➔ <strong>Audio Track</strong> ➔ Select <strong>Hindi (हिन्दी)</strong>!</>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap shrink-0 w-full md:w-auto">
            <button
              onClick={() => {
                const s = SERVERS.find((x) => x.id === 'vidlink_hindi') || SERVERS[0];
                setSelectedServer(s);
              }}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md ${
                selectedServer.id === 'vidlink_hindi'
                  ? 'bg-amber-400 text-gray-950 shadow-[0_0_15px_rgba(245,158,11,0.6)] font-black scale-105 border border-amber-300'
                  : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40'
              }`}
            >
              <span>🎙️</span>
              <span>{selectedServer.id === 'vidlink_hindi' ? '✓ Hindi Dubbed Active' : 'Switch to Hindi Dub Player'}</span>
            </button>
            <button
              onClick={() => {
                const s = SERVERS.find((x) => x.id === 'smashystream') || SERVERS[3];
                setSelectedServer(s);
              }}
              className={`px-3 py-2 rounded-xl font-semibold text-xs transition flex items-center gap-1.5 border ${
                selectedServer.id === 'smashystream'
                  ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.6)] font-bold border-indigo-400'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border-indigo-500/40'
              }`}
            >
              <span>🌐</span>
              <span>Multi-Audio Mirror</span>
            </button>
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
                {Array.from({ length: totalSeasons }, (_, i) => i + 1).map((sNum) => (
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
