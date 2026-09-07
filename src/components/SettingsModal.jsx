import React, { useState } from 'react';
import { 
  X, Settings, Lock, Unlock, Eye, EyeOff, Flame, ShieldCheck, 
  Server, Sliders, Trash2, CheckCircle2, AlertTriangle, KeyRound, Shield,
  Sparkles, RefreshCw, Play
} from 'lucide-react';
import { SERVERS } from '../services/streaming';
import { isAdBlockEnabled, setShieldEnabled } from '../services/adblocker';
import { isAiUpdaterEnabled, setAiUpdaterEnabled, triggerAiSync, getLastSyncTime } from '../services/aiUpdater';
import { SECRET_ECCHI_ANIME, IMG_BASE } from '../services/tmdb';

export default function SettingsModal({
  isOpen,
  onClose,
  isMasterMode,
  setIsMasterMode,
  isStealthMode,
  setIsStealthMode,
  includeMature,
  setIncludeMature,
  preferredServer,
  setPreferredServer,
  onClearWatchlist,
  onPlayMedia,
  onSelectCategory
}) {
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'vault'
  const [adBlockOn, setAdBlockOn] = useState(() => isAdBlockEnabled());
  const [aiUpdaterOn, setAiUpdaterOn] = useState(() => isAiUpdaterEnabled());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === '2030') {
      setIsMasterMode(true);
      setPinError(false);
      setPin('');
    } else {
      setPinError(true);
    }
  };

  const handleLockVault = () => {
    setIsMasterMode(false);
    setIncludeMature(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#091126] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(77,197,249,0.3)] flex flex-col my-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-[#060b1b]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">App Settings & Secret Controls</h2>
              <p className="text-[11px] text-cyan-200/50">Furina MovieBox 4K Edition</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-cyan-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-cyan-500/15 bg-[#070e22] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'general'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-cyan-200/60 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            General & Playback
          </button>

          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-t-lg transition border-b-2 ${
              activeTab === 'vault'
                ? isMasterMode
                  ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                  : 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-cyan-200/60 hover:text-white'
            }`}
          >
            {isMasterMode ? <Unlock className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
            Secret Vault {isMasterMode && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded font-mono">UNLOCKED</span>}
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {activeTab === 'general' ? (
            /* GENERAL SETTINGS */
            <div className="space-y-4">
              
              {/* Default Server Preference */}
              <div className="bg-[#0b1633] border border-cyan-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-white">
                  <Server className="w-4 h-4 text-cyan-400" />
                  Default Streaming Server
                </div>
                <p className="text-xs text-cyan-200/60 mb-3">
                  Choose which high-speed server loads by default when you click Play.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVERS.map((srv) => {
                    const isSelected = preferredServer === srv.id;
                    return (
                      <button
                        key={srv.id}
                        onClick={() => setPreferredServer(srv.id)}
                        className={`p-2.5 rounded-lg text-left transition border flex items-center justify-between ${
                          isSelected
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 font-bold shadow'
                            : 'bg-[#080f24] border-cyan-500/10 text-cyan-300/70 hover:bg-white/5'
                        }`}
                      >
                        <div className="text-xs font-semibold">{srv.name}</div>
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 ml-2" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Built-in AdBlock Shield Toggle */}
              <div className="bg-[#0b1633] border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Built-in AdBlock Shield
                  </div>
                  <p className="text-xs text-cyan-200/60 mt-1 max-w-xs">
                    Automatically intercepts and neutralizes unwanted server popups, pop-unders, and clickjack redirects.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !adBlockOn;
                    setAdBlockOn(next);
                    setShieldEnabled(next);
                  }}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ml-3 ${
                    adBlockOn ? 'bg-emerald-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    adBlockOn ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* uBlock Origin Lite Recommendation Card */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-[#0a1b2a] to-[#081226] border border-emerald-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Recommended: uBlock Origin Lite
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">100% Ad-Free</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  To eliminate all popups, banners, and redirects across every external streaming server, install the official free uBlock Origin Lite browser extension:
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://chromewebstore.google.com/detail/ublock-origin-lite/ddkjiahejlhfcafbddmgiahcphecmpfh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Install for Chrome / Edge / Opera ↗</span>
                  </a>
                  <a
                    href="https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <span>Install for Firefox ↗</span>
                  </a>
                </div>
              </div>

              {/* AI Movie Auto-Updater & 4K Stream Sync */}
              <div className="bg-gradient-to-r from-blue-950/40 via-[#07132a] to-[#041d24] border border-cyan-500/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>AI Movie Auto-Updater</span>
                        <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-bold border border-cyan-500/40">4K UHD Sync</span>
                      </div>
                      <p className="text-xs text-cyan-200/60 mt-0.5">
                        Automatically scans for latest releases & verifies 4K high-bitrate streams.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const next = !aiUpdaterOn;
                      setAiUpdaterOn(next);
                      setAiUpdaterEnabled(next);
                    }}
                    className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ml-3 ${
                      aiUpdaterOn ? 'bg-cyan-500' : 'bg-white/10'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      aiUpdaterOn ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-cyan-500/15 flex items-center justify-between text-xs flex-wrap gap-2">
                  <div className="text-cyan-200/70 text-[11px] flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Status: {aiUpdaterOn ? 'Active • 4K Streams Auto-Optimized' : 'Paused'} (Synced: {lastSync})</span>
                  </div>
                  <button
                    onClick={async () => {
                      setIsSyncing(true);
                      const res = await triggerAiSync();
                      setIsSyncing(false);
                      setLastSync(res.time);
                    }}
                    disabled={isSyncing}
                    className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
                    <span>{isSyncing ? 'AI Syncing...' : 'Sync 4K Now'}</span>
                  </button>
                </div>
              </div>

              {/* Stealth Disguise Mode (Public quick toggle) */}
              <div className="bg-[#0b1633] border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    {isStealthMode ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                    Stealth Disguise Mode
                  </div>
                  <p className="text-xs text-cyan-200/60 mt-1 max-w-xs">
                    Disguises app as neutral "Stream Cinema", hiding Furina anime artwork and branding when around others.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsStealthMode(!isStealthMode)}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ml-3 ${
                    isStealthMode ? 'bg-cyan-500' : 'bg-white/10'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isStealthMode ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Clear Watchlist / Cache */}
              <div className="bg-[#0b1633] border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    Clear Saved Watchlist
                  </div>
                  <p className="text-xs text-cyan-200/60 mt-0.5">
                    Reset your locally saved bookmarks and saved movies.
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (confirm('Clear all saved movies from your watchlist?')) {
                      onClearWatchlist();
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition"
                >
                  Clear
                </button>
              </div>

            </div>
          ) : (
            /* SECRET VAULT / MASTER MODE TAB */
            <div className="space-y-4">
              {!isMasterMode ? (
                /* LOCKED STATE: Enter PIN 2030 */
                <form onSubmit={handlePinSubmit} className="space-y-4">
                  <div className="bg-[#0b1633] border border-cyan-500/20 rounded-2xl p-6 text-center">
                    <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-center mx-auto mb-3 text-cyan-400">
                      <KeyRound className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Enter Secret Master Passcode</h3>
                    <p className="text-xs text-cyan-200/60 max-w-sm mx-auto mb-4">
                      Enter your secret 4-digit code to unlock the Master Vault and system controls.
                    </p>

                    <div className="max-w-xs mx-auto">
                      <input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => { setPin(e.target.value); setPinError(false); }}
                        placeholder="••••"
                        className="w-full bg-[#070e24] border border-cyan-500/40 rounded-xl px-4 py-3 text-center text-3xl tracking-[0.6em] font-mono text-cyan-300 focus:outline-none focus:border-cyan-400 shadow-inner"
                        autoFocus
                      />
                      {pinError && (
                        <p className="text-rose-400 text-xs mt-2 font-semibold flex items-center justify-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Incorrect passcode. Try again.
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-extrabold text-sm transition shadow-[0_0_20px_rgba(77,197,249,0.4)] transform hover:scale-[1.01] active:scale-[0.99]"
                  >
                    Unlock Secret Vault
                  </button>
                </form>
              ) : (
                /* UNLOCKED STATE: Master Controls & 18+ Cinema */
                <div className="space-y-4">
                  
                  {/* Status Banner */}
                  <div className="bg-emerald-500/15 border border-emerald-500/40 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <div>
                        <div>VIP Mode Unlocked</div>
                        <div className="text-[10px] text-emerald-300/70 font-normal">VIP Access Activated</div>
                      </div>
                    </div>
                    <button
                      onClick={handleLockVault}
                      className="text-xs bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Lock Vault
                    </button>
                  </div>

                  {/* Mature & Uncut Cinema Feature */}
                  <div className="bg-gradient-to-r from-amber-950/40 to-[#0b1633] border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm text-amber-300">
                        <Flame className="w-4 h-4 text-amber-400" />
                        Uncut & Mature Cinema Vault
                      </div>
                      <p className="text-xs text-amber-200/60 mt-1 max-w-xs">
                        Enables R-rated, NC-17, and uncut films in search and adds the Uncut Cinema navigation category.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIncludeMature(!includeMature)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ml-3 ${
                        includeMature ? 'bg-amber-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        includeMature ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* 🔞 Secret Anime Vault (Overflow, ComicFesta & Ecchi Uncut) */}
                  <div className="bg-[#0b1633] border border-amber-500/30 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">🔞</span>
                        <div>
                          <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                            <span>Secret Anime Vault</span>
                            <span className="text-[9px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30 font-mono font-bold">OVERFLOW & COMICFESTA</span>
                          </h4>
                          <p className="text-[11px] text-cyan-200/60 mt-0.5">
                            Uncensored ComicFesta & Ecchi series available in full HD streaming.
                          </p>
                        </div>
                      </div>
                      {onSelectCategory && (
                        <button
                          type="button"
                          onClick={() => {
                            onSelectCategory('ecchi_anime');
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs transition shadow-[0_0_15px_rgba(245,158,11,0.4)] whitespace-nowrap cursor-pointer"
                        >
                          View All on Home ➔
                        </button>
                      )}
                    </div>

                    {/* Quick Play Mini Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 max-h-60 overflow-y-auto pr-1">
                      {SECRET_ECCHI_ANIME.map((anime) => (
                        <div
                          key={anime.id}
                          className="group relative rounded-xl overflow-hidden border border-white/10 bg-[#070e22] hover:border-amber-400/60 transition flex flex-col"
                        >
                          <div className="aspect-[3/4] w-full relative overflow-hidden bg-black/40">
                            <img
                              src={anime.poster_path ? `${IMG_BASE}${anime.poster_path}` : './icon-512.png'}
                              alt={anime.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <button
                              type="button"
                              onClick={() => {
                                if (onPlayMedia) {
                                  onPlayMedia(anime);
                                  onClose();
                                }
                              }}
                              className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-amber-500 text-gray-950 flex items-center justify-center opacity-0 group-hover:opacity-100 transition transform scale-75 group-hover:scale-100 shadow-[0_0_20px_rgba(245,158,11,0.8)] cursor-pointer"
                              title={`Play ${anime.name}`}
                            >
                              <Play className="w-4 h-4 fill-gray-950 ml-0.5" />
                            </button>
                            <span className="absolute top-1.5 left-1.5 text-[8px] font-black bg-amber-500/90 text-gray-950 px-1.5 py-0.5 rounded shadow">
                              UNCUT
                            </span>
                          </div>
                          <div className="p-2 flex flex-col justify-between flex-1">
                            <div className="text-[11px] font-bold text-white line-clamp-1 group-hover:text-amber-300 transition">
                              {anime.name}
                            </div>
                            <div className="flex items-center justify-between mt-1 text-[9px] text-cyan-200/50 font-medium">
                              <span>{String(anime.first_air_date || '').substring(0, 4)}</span>
                              <span className="text-amber-400 font-bold">★ {anime.vote_average}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stealth Disguise in Master Mode */}
                  <div className="bg-[#0b1633] border border-cyan-500/20 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm text-white">
                        {isStealthMode ? <EyeOff className="w-4 h-4 text-cyan-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
                        Stealth Screen Disguise
                      </div>
                      <p className="text-xs text-cyan-200/60 mt-1 max-w-xs">
                        Instantly hide Furina wallpaper and app branding for privacy.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsStealthMode(!isStealthMode)}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 shrink-0 ml-3 ${
                        isStealthMode ? 'bg-cyan-500' : 'bg-white/10'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                        isStealthMode ? 'translate-x-6' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Security Note */}
                  <p className="text-[11px] text-cyan-200/40 text-center italic">
                    When finished, tap "Lock Vault" or close the app to re-engage the passcode protection.
                  </p>

                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#060b1b] border-t border-cyan-500/20 flex items-center justify-between">
          <span className="text-[11px] text-cyan-300/50">
            {isMasterMode ? 'VIP Access Granted' : 'PIN Protected'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition"
          >
            Save & Close
          </button>
        </div>

      </div>
    </div>
  );
}
