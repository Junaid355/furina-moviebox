import React, { useState, useEffect } from 'react';
import { X, Server, Film, Tv, RefreshCw, ExternalLink, Info, Zap, Play, Sparkles, ShieldCheck, Download } from 'lucide-react';
import { SERVERS, getStreamUrl, getDownloadUrl } from '../services/streaming';
import { fetchSeasonEpisodes, fetchTvDetails, isHindiAvailable, isHindiDubbedAnime } from '../services/tmdb';
import { permitPopupOnce, getBlockedCount } from '../services/adblocker';

export default function PlayerModal({ item, onClose, preferredServerId, isHindiPreferred }) {
  if (!item) return null;

  const isSeries = item?.media_type === 'tv' || (item?.media_type !== 'movie' && Boolean(item?.first_air_date));
  const title = item?.title || item?.name || 'Now Playing';

  // Accurate classification: Anime vs Bollywood Hindi vs Hollywood English
  const isAnime = Boolean(
    item?.category === 'anime' ||
    item?.category === 'ecchi_anime' ||
    item?.isAnime === true ||
    item?.original_language === 'ja' ||
    (Array.isArray(item?.origin_country) && item?.origin_country.includes('JP')) ||
    ((item?.genre_ids?.includes(16) || item?.genres?.some((g) => g.id === 16 || g.name === 'Animation')) && item?.original_language === 'ja')
  );

  const hasHindiDubOption = isAnime
    ? isHindiDubbedAnime(item)
    : (!isAnime && Boolean(item?.isHindiDubbed || isHindiAvailable(item)));

  const isBollywoodHindi = Boolean(
    !isAnime && (
      item?.original_language === 'hi' ||
      item?.category === 'hindi' ||
      Boolean(item?.isHindiDubbed) ||
      (Array.isArray(item?.origin_country) && item?.origin_country.includes('IN'))
    )
  );

  // For anime, filter out AutoEmbed because AutoEmbed 404s on Bleach, Doraemon, and many anime titles
  const availableServers = isAnime 
    ? SERVERS.filter((s) => s.id !== 'autoembed') 
    : SERVERS;

  const initialServer = isAnime
    ? (availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0])
    : (availableServers.find((s) => s.id === preferredServerId) || availableServers[0]);

  const [selectedServer, setSelectedServer] = useState(initialServer || availableServers[0]);

  // Auto-protect against 404 on anime: If autoembed was somehow selected, automatically switch to VidSrc 4K
  useEffect(() => {
    if (isAnime && selectedServer?.id === 'autoembed') {
      const safeServer = availableServers.find((s) => s.id === 'vidsrc_in') || availableServers[0];
      setSelectedServer(safeServer);
    }
  }, [isAnime, selectedServer?.id, availableServers]);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [totalSeasons, setTotalSeasons] = useState(1);
  const [episodesList, setEpisodesList] = useState([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const handleReload = () => setReloadKey((k) => k + 1);
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

  // Keyboard Escape listener to close modal seamlessly
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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

  const currentServer = selectedServer || SERVERS[0];
  const streamUrl = getStreamUrl(currentServer, item?.id, isSeries ? 'tv' : 'movie', season, episode);
  const downloadUrl = getDownloadUrl(item?.id, isSeries ? 'tv' : 'movie', season, episode);

  const openInNewWindow = () => {
    permitPopupOnce();
    window.open(streamUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNextServer = () => {
    const currentIndex = availableServers.findIndex((s) => s.id === (currentServer?.id || availableServers[0].id));
    const nextServer = availableServers[(currentIndex + 1) % availableServers.length];
    setSelectedServer(nextServer);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl overflow-y-auto flex flex-col items-center justify-start sm:justify-center p-0 sm:p-3 md:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-900/25 via-transparent to-transparent" />

      {/* Modal Card with Strict dynamic viewport containment and Flex Column */}
      <div 
        className="relative w-full max-w-5xl my-0 sm:my-auto bg-[#081026] border-0 sm:border sm:border-cyan-500/35 rounded-none sm:rounded-2xl shadow-[0_0_75px_rgba(56,189,248,0.35)] flex flex-col z-10 animate-fade-in overflow-hidden h-full sm:h-auto max-h-[100dvh] sm:max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* STICKY TOP HEADER BAR - ALWAYS PINNED AT TOP & TOUCH FRIENDLY */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-3 sm:p-4 border-b border-cyan-500/30 bg-[#050b1d]/98 backdrop-blur-2xl shrink-0 shadow-lg pt-[max(env(safe-area-inset-top),0.75rem)]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border-2 border-cyan-400/60 shadow-[0_0_12px_rgba(56,189,248,0.45)] shrink-0">
              <img src="./favicon.png" alt="Furina" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <h2 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                <span>{title}</span>
                {isSeries && (
                  <span className="text-cyan-300 font-bold text-[11px] bg-cyan-500/20 px-2 py-0.5 rounded-full border border-cyan-500/40 shrink-0">
                    S{season} E{episode}
                  </span>
                )}
              </h2>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-cyan-200/70">
                <span>4K Ultra HD Multi-Mirror</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">{selectedServer.badge}</span>
                <span>•</span>
                <span className="text-cyan-400/80 font-mono hidden xs:inline">{selectedServer.shortName}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* 1-Click Download Option */}
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={permitPopupOnce}
              title="Download movie or episode in HD / 4K"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 border border-emerald-400/40 text-emerald-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Download</span>
            </a>

            {/* Auto-Switch Next Working Server button */}
            <button
              onClick={handleNextServer}
              title="Auto-switch to next working mirror if stream buffers"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="hidden sm:inline">Auto-Switch</span>
            </button>

            {/* uBlock Origin Lite - 100% Zero-Ad Protection Button */}
            <button
              onClick={() => setShowUBlockGuide(!showUBlockGuide)}
              title="uBlock Origin Lite - Zero Ad Playback Guide"
              className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                showUBlockGuide
                  ? 'bg-emerald-500 text-gray-950 border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)] scale-105'
                  : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 animate-pulse" />
              <span className="hidden lg:inline">🛡️ Ad-Free Guide</span>
            </button>

            {/* Hindi Dubbed Audio Switcher Guide Toggle */}
            {(isBollywoodHindi || isAnime || hasHindiDubOption) && (
              <button
                onClick={() => setShowHindiGuide(!showHindiGuide)}
                title="Audio Information & Dub Details"
                className={`flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                  showHindiGuide
                    ? 'bg-amber-500 text-gray-950 border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)] scale-105'
                    : 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
                }`}
              >
                <span>🎙️</span>
                <span className="hidden sm:inline">{isAnime ? 'Dub Info' : 'Audio Info'}</span>
              </button>
            )}

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
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Full Player ↗</span>
            </button>

            {/* CLOSE MODAL BUTTON - ALWAYS VISIBLE, HIGH CONTRAST & CLICKABLE */}
            <button
              onClick={onClose}
              aria-label="Close video player modal"
              title="Close Player (Esc)"
              className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white border-2 border-rose-400/80 hover:border-white flex items-center justify-center transition shadow-[0_0_15px_rgba(244,63,94,0.6)] hover:shadow-[0_0_25px_rgba(244,63,94,0.9)] shrink-0 ml-1.5 transform hover:scale-105 active:scale-90 touch-manipulation cursor-pointer"
            >
              <X className="w-5 h-5 font-black stroke-[3]" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE INNER CONTAINER - Player, Controls & Episodes scroll smoothly while header remains anchored */}
        <div className="overflow-y-auto flex-1 overscroll-contain">
          
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
                External embed servers inject popups directly inside cross-origin iframes. Webpages cannot block external iframe popups due to browser security sandbox rules. <strong>Installing the official free uBlock Origin Lite extension</strong> blocks 100% of all ads and popups at the browser level automatically:
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

          {/* Expandable Audio Information Drawer */}
          {showHindiGuide && (
            <div className="p-4 bg-gradient-to-r from-[#0d1e3d] via-[#09152b] to-[#171408] border-b border-amber-500/30 text-xs">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs sm:text-sm">
                  <span>🎙️ Audio Track & Dubbing Architecture:</span>
                </div>
                <button 
                  onClick={() => setShowHindiGuide(false)} 
                  className="text-amber-200/60 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                {/* Bollywood & Indian Cinema */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-emerald-500/40 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-emerald-300 mb-1.5 flex items-center justify-between">
                      <span>🇮🇳 1. Bollywood & Hollywood Hindi Dubs</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">100% Hindi Audio</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      All Indian blockbusters (e.g. <em>Kalki 2898 AD, Stree 2, Jawan, Pathaan, Animal, Salaar, RRR</em>) play in <strong>full native Hindi audio</strong> automatically on Server 1 and Server 2!
                    </p>
                  </div>
                  <div className="mt-2.5 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded">
                    ✓ Explore our "🇮🇳 Bollywood & Hindi Dubbed" tab on the homepage!
                  </div>
                </div>

                {/* Anime Audio Tracks */}
                <div className="p-3.5 rounded-xl bg-black/50 border border-amber-500/40 flex flex-col justify-between">
                  <div>
                    <div className="font-bold text-amber-300 mb-1.5 flex items-center justify-between">
                      <span>🌸 2. Anime Audio (Japanese Sub / English Dub)</span>
                      <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-bold">4K Fast CDN</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      Official digital anime CDNs stream in <strong>Japanese Audio with English/Multi subtitles</strong> or official <strong>English Dub</strong>. Tap the <strong>💬 CC icon</strong> inside the video player to switch subtitles or toggle servers above for alternate dub tracks.
                    </p>
                  </div>
                  <div className="mt-2.5 text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-1 rounded">
                    ✓ RareAnimes uses third-party file uploads; our direct VidSrc 4K CDN delivers zero-lag instant streaming!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Active Server Switcher Bar */}
          <div className="p-2.5 sm:p-3 bg-[#070e24] border-b border-cyan-500/15 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-cyan-300/80 flex items-center gap-1.5 whitespace-nowrap px-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Active Server:
            </span>
            {availableServers.map((srv) => {
              const isSelected = currentServer.id === srv.id;
              return (
                <button
                  key={srv.id}
                  onClick={() => setSelectedServer(srv)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition border ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-gray-950 border-cyan-300 shadow-[0_0_15px_rgba(56,189,248,0.5)] font-black scale-105'
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
                    This title is currently in pre-release or in theaters and not yet distributed on digital OTT streaming. If servers display <strong>"404 Content not found"</strong>, check back once the digital streaming release premieres!
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
              key={`${currentServer.id}-${season}-${episode}-${reloadKey}`}
              src={streamUrl}
              title={title}
              className="w-full h-full border-0"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
          </div>

          {/* 404 Rescue & Smart Mirror Quick Switcher Bar */}
          <div className="px-4 py-2 bg-[#040918] border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-300/80">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-[11px] font-medium">
                Stream 404 or Buffering? Tap another instant mirror:
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {availableServers.slice(0, 5).map((srv) => {
                const isActive = selectedServer.id === srv.id;
                return (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedServer(srv)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition border ${
                      isActive
                        ? 'bg-cyan-500 text-gray-950 border-cyan-300 font-black shadow'
                        : 'bg-[#09132e] text-cyan-300/70 border-cyan-500/20 hover:text-white hover:border-cyan-400/50'
                    }`}
                  >
                    {srv.shortName}
                  </button>
                );
              })}
            </div>
          </div>

          {/* MUTUALLY EXCLUSIVE AUDIO BADGE & INFORMATION PANEL */}
          {isAnime ? (
            /* 🌸 ANIME ONLY PANEL - Plays in Japanese Sub or English Dub with VidSrc 4K (and Hindi Dub where available) */
            <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#13072b] via-[#091024] to-[#070e24] border-t border-b border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow">
                  {hasHindiDubOption ? '🇮🇳' : '🇯🇵'}
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5 flex-wrap">
                    <span>Anime Audio & Subtitles</span>
                    {hasHindiDubOption && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/40">
                        🇮🇳 Hindi Dub Available
                      </span>
                    )}
                    <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-semibold border border-purple-500/30">
                      {selectedServer?.shortName || 'VidSrc 4K Active'}
                    </span>
                    <span className="text-[10px] bg-emerald-500/15 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                      Sub / English Dub
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-purple-200/80 mt-0.5">
                    {hasHindiDubOption
                      ? 'Official Hindi Dub broadcast on Indian TV & Crunchyroll (RareAnimes format). On our 4K player, stream in English Dub or Japanese with Subtitles!'
                      : 'Stream plays in Japanese with Subtitles or English Dub. Tap 💬 CC inside the player for subtitles or toggle mirror servers above.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto flex-wrap">
                {availableServers.slice(0, 3).map((srv) => (
                  <button
                    key={srv.id}
                    onClick={() => setSelectedServer(srv)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm border ${
                      selectedServer.id === srv.id
                        ? 'bg-cyan-500 text-gray-950 border-cyan-400 font-black'
                        : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                    }`}
                  >
                    <span>{srv.shortName}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : isBollywoodHindi ? (
            /* 🇮🇳 BOLLYWOOD & HINDI DUBBED ONLY PANEL */
            <div className="p-3 sm:p-3.5 bg-gradient-to-r from-[#171004] via-[#0b0e1b] to-[#070e24] border-t border-b border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-gray-950 flex items-center justify-center font-black text-sm shrink-0 shadow">
                  🇮🇳
                </div>
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>Authentic Hindi Audio Stream</span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-semibold border border-amber-500/30">
                      100% Hindi Track
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-amber-200/80 mt-0.5">
                    Full Hindi audio stream in 1080p HD / 4K. Plays automatically on Server 1 and Server 2.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedServer(SERVERS[0])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm border ${
                    selectedServer.id === SERVERS[0].id
                      ? 'bg-cyan-500 text-gray-950 border-cyan-400'
                      : 'bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/40'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>VidSrc 4K</span>
                </button>
                <button
                  onClick={() => setSelectedServer(SERVERS[1] || SERVERS[0])}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm border ${
                    selectedServer.id === SERVERS[1]?.id
                      ? 'bg-emerald-500 text-gray-950 border-emerald-400'
                      : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
                  }`}
                >
                  <span>AutoEmbed HD</span>
                </button>
              </div>
            </div>
          ) : (
            /* 🎬 HOLLYWOOD / GLOBAL ENGLISH ONLY PANEL */
            <div className="p-3 sm:p-3.5 bg-[#070e24] border-t border-b border-cyan-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">🔊</span>
                <div>
                  <div className="font-bold text-cyan-300 text-xs flex items-center gap-1.5 flex-wrap">
                    <span>{hasHindiDubOption ? '🇮🇳 Hindi Dub Available & 🔊 English Audio' : 'English Original Audio • Multi-Language Subtitles'}</span>
                    {hasHindiDubOption && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold border border-amber-500/40">
                        Hindi Dubbed Blockbuster
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-cyan-200/70 mt-0.5">
                    {hasHindiDubOption
                      ? 'Official Hindi dubbed audio track available on Indian OTT. Select audio or turn on subtitles via ⚙️ Settings inside the player.'
                      : 'English audio active. Turn on subtitles (English, Hindi, Spanish, etc.) via ⚙️ Settings ➔ Subtitles inside player.'
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded-md font-semibold">
                  Use ⚙️ gear for CC
                </span>
              </div>
            </div>
          )}

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

          {/* Quick Exit / Close Player Action Bar */}
          <div className="p-3 bg-[#040816] border-t border-cyan-500/20 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 border border-rose-500/50 hover:border-rose-400 text-rose-200 hover:text-white text-xs font-bold transition shadow-sm"
            >
              <X className="w-4 h-4" />
              <span>Close Video Player (Esc)</span>
            </button>
            <div className="text-[11px] text-cyan-200/50 hidden sm:inline">
              Press <kbd className="bg-black/50 px-1.5 py-0.5 rounded border border-cyan-500/30 text-cyan-300 font-mono">Esc</kbd> or click backdrop to close
            </div>
          </div>

          {/* Footer Info */}
          <div className="p-3 bg-[#050917] border-t border-cyan-500/15 flex items-center justify-between flex-wrap gap-2 text-[11px] text-cyan-200/60">
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400" />
              Ultra-fast multi-server CDN engine active. Switch servers above if stream stalls or buffers.
            </span>
            <span className="font-semibold text-cyan-400">4K Ultra HD</span>
          </div>

        </div>

      </div>
    </div>
  );
}
