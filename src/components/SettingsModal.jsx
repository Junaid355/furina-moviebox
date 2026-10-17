import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  X, Settings, Lock, Unlock, Flame, ShieldCheck, Server, Trash2, 
  CheckCircle2, Shield, Sparkles, RefreshCw, Play, Volume2, VolumeX, 
  Subtitles, Palette, Monitor, Activity, HardDrive, RotateCcw, 
  Download, Upload, EyeOff, Zap, Delete
} from 'lucide-react';
import { SERVERS } from '../services/streaming';
import { isAdBlockEnabled, setShieldEnabled } from '../services/adblocker';
import hindiProviderManager from '../services/HindiProviderManager';
import apiManager from '../services/apiManager';
import soundFx from '../services/soundFx';
import { exportBackupJson, importBackupJson, clearWatchHistory } from '../services/playlistService';

export { 
  DEFAULT_SETTINGS, 
  applyThemeAndAppSettings, 
  getStoredSettings, 
  saveStoredSettings 
} from '../services/settingsService';
import { 
  DEFAULT_SETTINGS, 
  getStoredSettings, 
  saveStoredSettings 
} from '../services/settingsService';

// Custom Animated Neon Hydro Toggle Switch
function NeonToggle({ checked, onChange, label, description, badge }) {
  return (
    <div 
      onClick={() => {
        soundFx.playClick?.();
        onChange(!checked);
      }}
      className="flex items-center justify-between gap-4 py-3 px-1 cursor-pointer group select-none"
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white group-hover:text-cyan-200 transition-colors text-xs sm:text-sm">
            {label}
          </span>
          {badge && (
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[9.5px] font-black uppercase">
              {badge}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={(e) => {
          e.stopPropagation();
          soundFx.playClick?.();
          onChange(!checked);
        }}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none ${
          checked
            ? 'bg-gradient-to-r from-cyan-400 to-blue-500 border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]'
            : 'bg-slate-900 border-slate-700'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-4 w-4 transform rounded-full transition duration-200 ease-in-out mt-0.5 ${
            checked
              ? 'translate-x-5 bg-slate-950 shadow-md'
              : 'translate-x-0.5 bg-slate-400'
          }`}
        />
      </button>
    </div>
  );
}

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
  const [activeSection, setActiveSection] = useState('playback');
  const [settings, setSettings] = useState(getStoredSettings);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);
  const [toast, setToast] = useState(null);
  const [soundMuted, setSoundMuted] = useState(() => soundFx.isMuted());
  const fileInputRef = useRef(null);

  // Provider & API Gateway health monitor state
  const [providerReport, setProviderReport] = useState(() => hindiProviderManager.getProviderHealthReport());
  const [apiHealthReport, setApiHealthReport] = useState(() => apiManager.getHealthReport());
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Keyboard Escape Handler
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }, []);

  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveStoredSettings(updated);
      return updated;
    });
    showToast('Preference Saved ✓');
  }, [showToast]);

  if (!isOpen) return null;

  const verifyPinCode = (candidatePin) => {
    if (String(candidatePin).trim() === '2030') {
      soundFx.playStartChime?.();
      setIsMasterMode(true);
      setPinError(false);
      setPin('');
      showToast('🔓 Master Vault Unlocked (2030)');
      return true;
    } else {
      setPinError(true);
      return false;
    }
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    verifyPinCode(pin);
  };

  const handleKeypadDigit = (digit) => {
    soundFx.playClick?.();
    setPinError(false);
    const nextPin = (pin + digit).slice(0, 4);
    setPin(nextPin);
    if (nextPin.length === 4) {
      setTimeout(() => verifyPinCode(nextPin), 120);
    }
  };

  const handleLockVault = () => {
    soundFx.playClick?.();
    setIsMasterMode(false);
    setIncludeMature(false);
    showToast('🔒 Master Vault Locked');
  };

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    soundFx.playWaterDrop?.();
    try {
      const [report, apiReport] = await Promise.all([
        hindiProviderManager.runAllHealthChecks(),
        apiManager.checkHealth()
      ]);
      setProviderReport(report);
      if (apiReport) setApiHealthReport(apiReport);
    } catch (e) {}
    setIsCheckingHealth(false);
    showToast('⚡ CDN & Provider Diagnostics Complete');
  };

  const handleClearCache = () => {
    soundFx.playClick?.();
    apiManager.clearCache();
    hindiProviderManager.clearCache();
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('furina_cache_') || key.startsWith('tmdb_cache_') || key.startsWith('furina_cached_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    showToast('🧹 Media & CDN Cache Cleared');
  };

  const handleResetSettings = () => {
    soundFx.playClick?.();
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    showToast('↺ Settings Reset to Defaults');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = importBackupJson(String(ev.target?.result || ''));
      if (result.ok) {
        showToast(`✓ Restored ${result.playlistsCount} Collections & ${result.watchlistCount} Saved`);
      } else {
        showToast(`⚠️ ${result.error || 'Invalid Backup File'}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Consolidated 6-Tab Architecture
  const navSections = [
    { id: 'playback', label: 'Playback & 4K Servers', icon: Play, badge: '4K' },
    { id: 'audio_subs', label: 'Audio & Subtitles', icon: Subtitles, badge: 'LIVE CC' },
    { id: 'appearance', label: 'Theme, Stealth & FX', icon: Palette },
    { id: 'controls', label: 'Hotkeys & Mobile', icon: Monitor },
    { id: 'storage', label: 'CDN Health & Backup', icon: Activity },
    { id: 'vault', label: 'Secret Master Vault', icon: isMasterMode ? Unlock : Lock, badge: isMasterMode ? 'OPEN' : 'PIN' }
  ];

  const featuredServers = [
    { id: 'vidstuck', name: 'VidStuck 4K', desc: 'Fastest Low-Latency 4K UHD & Multi-Audio', badge: '⚡ #1 Recommended' },
    { id: 'moviebox', name: 'MovieBox 4K Official', desc: 'Direct MovieBox Multi-Dub & Hindi Stream', badge: '📦 Multi-Dub' },
    { id: 'vidfast', name: 'VidFast Pro', desc: 'Sub-Second Start & High Bitrate 1080p/4K', badge: '🚀 Ultra Fast' },
    { id: 'one23embed', name: '123Embed Hindi', desc: 'Dedicated Bollywood & Hollywood Hindi Dubs', badge: '🇮🇳 Hindi Server' },
    { id: 'multiembed', name: 'MultiEmbed VIP', desc: 'Global Backup Mirror with Multi-Subtitles', badge: '🌐 Global VIP' },
    { id: 'vidlink', name: 'VidLink Pro', desc: 'Anime Sub/Dub & Hollywood Cinema Master', badge: '💎 4K HDR' }
  ];

  // Live Subtitle Preview Styles
  const previewSubColor = {
    cyan: '#67e8f9',
    white: '#ffffff',
    amber: '#fde047',
    yellow: '#facc15'
  }[settings.subtitleStyle || 'cyan'];

  const previewSubSize = {
    small: '12px',
    medium: '15px',
    large: '18px',
    xlarge: '22px'
  }[settings.subtitleSize || 'medium'];

  const previewSubBg = {
    transparent: 'transparent',
    box: 'rgba(2, 6, 23, 0.85)',
    shadow: 'rgba(15, 23, 42, 0.45)'
  }[settings.subtitleBackground || 'transparent'];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-4xl bg-[#050b1d]/98 border border-cyan-500/35 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_25px_90px_rgba(0,0,0,0.95),0_0_45px_rgba(6,182,212,0.22)] flex flex-col md:flex-row my-auto max-h-[92vh]"
      >
        {/* Top Neon Laser Line */}
        <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-90 z-30" />

        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 right-14 z-50 px-3.5 py-1.5 rounded-xl bg-cyan-950/95 border border-cyan-400 text-cyan-200 text-xs font-black shadow-[0_0_20px_rgba(34,211,238,0.5)] backdrop-blur-md flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{toast}</span>
          </div>
        )}

        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          aria-label="Close Settings"
          title="Close Settings (Esc)"
          data-testid="close-settings-btn"
          className="absolute top-3.5 right-3.5 z-40 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-900/90 hover:bg-rose-600 border border-cyan-500/30 hover:border-rose-400 flex items-center justify-center text-cyan-300 hover:text-white transition cursor-pointer shadow-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-[#030816] border-b md:border-b-0 md:border-r border-cyan-500/20 p-3 sm:p-4 flex flex-col justify-between shrink-0">
          <div>
            {/* Brand Header inside Settings */}
            <div className="flex items-center gap-3 px-2 py-2.5 mb-3 border-b border-cyan-500/15">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 p-[1.5px] shadow-[0_0_20px_rgba(34,211,238,0.5)] shrink-0">
                <div className="w-full h-full rounded-[10px] bg-[#040a1c] flex items-center justify-center text-cyan-300">
                  <Settings className="w-5 h-5 animate-[spin_12s_linear_infinite]" />
                </div>
              </div>
              <div>
                <h2 className="font-black text-sm text-white tracking-tight">Settings Hub</h2>
                <p className="text-[10px] text-cyan-300/75 uppercase tracking-wider font-mono">Furina 4K Engine</p>
              </div>
            </div>

            <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-1 md:pb-0 no-scrollbar">
              {navSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                const isVault = sec.id === 'vault';
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => {
                      soundFx.playClick?.();
                      setActiveSection(sec.id);
                    }}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-extrabold transition shrink-0 cursor-pointer border ${
                      isActive
                        ? isVault && isMasterMode
                          ? 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60 shadow-[0_0_18px_rgba(16,185,129,0.3)]'
                          : 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black border-cyan-300 shadow-[0_0_18px_rgba(34,211,238,0.45)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : isVault && isMasterMode ? 'text-emerald-400' : 'text-cyan-400'}`} />
                      <span className="whitespace-nowrap">{sec.label}</span>
                    </div>
                    {sec.badge && (
                      <span className={`hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded-full font-black font-mono ${
                        isActive
                          ? 'bg-slate-950/25 text-slate-950'
                          : isVault && isMasterMode
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {sec.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Reset Footer in Sidebar (Desktop) */}
          <div className="hidden md:block pt-3 border-t border-cyan-500/15">
            <button
              type="button"
              onClick={handleResetSettings}
              className="w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-rose-500/15 border border-white/10 hover:border-rose-500/40 text-slate-400 hover:text-rose-200 text-[11px] font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All to Defaults</span>
            </button>
          </div>
        </div>

        {/* CONTENT PANEL */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5 text-xs text-slate-200">

          {/* ===================================================================== */}
          {/* TAB 1: PLAYBACK & 4K SERVERS                                          */}
          {/* ===================================================================== */}
          {activeSection === 'playback' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <span>Default 4K Server & Playback Engine</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Choose your primary 4K streaming mirror and configure automatic playback behaviors.
                </p>
              </div>

              {/* Default 4K Server Selector */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-extrabold text-white text-xs uppercase tracking-wider text-cyan-300">
                    Preferred Primary 4K Server
                  </label>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    ⚡ 3.5s Auto-Rescue Active
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {featuredServers.map((srv) => {
                    const isSelected = (preferredServer || 'vidstuck') === srv.id;
                    return (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          soundFx.playClick?.();
                          if (setPreferredServer) setPreferredServer(srv.id);
                          showToast(`Primary Server: ${srv.name}`);
                        }}
                        className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between gap-1 ${
                          isSelected
                            ? 'bg-gradient-to-br from-cyan-500/25 to-blue-600/25 border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.25)]'
                            : 'bg-[#040a1a] border-white/10 hover:border-cyan-500/40 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-black text-xs text-white">{srv.name}</span>
                          <span className={`text-[9.5px] px-2 py-0.5 rounded-full font-bold ${
                            isSelected ? 'bg-cyan-400 text-slate-950 font-black' : 'bg-white/10 text-cyan-300'
                          }`}>
                            {isSelected ? '✓ ACTIVE' : srv.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">{srv.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Default Streaming Quality */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2.5">
                <label className="font-extrabold text-cyan-300 text-xs uppercase tracking-wider block">
                  Default Streaming Resolution
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '4k', label: '💎 4K UHD', sub: '2160p HDR' },
                    { id: '1080p', label: '🌟 1080p FHD', sub: 'High Bitrate' },
                    { id: '720p', label: '⚡ 720p Fast', sub: 'Data Saver' },
                    { id: 'auto', label: '🔄 Adaptive', sub: 'Auto Bitrate' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => updateSetting('playbackQuality', q.id)}
                      className={`p-2.5 rounded-xl text-center border transition cursor-pointer ${
                        settings.playbackQuality === q.id
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-300 font-black shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                          : 'bg-[#040a1a] border-white/10 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{q.label}</div>
                      <div className={`text-[10px] mt-0.5 ${settings.playbackQuality === q.id ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                        {q.sub}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Animated Neon Toggles */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 divide-y divide-cyan-500/15">
                <NeonToggle
                  checked={settings.autoplay !== false}
                  onChange={(val) => updateSetting('autoplay', val)}
                  label="Autoplay Video on Open"
                  description="Immediately begin streaming when opening any movie, episode, or Live TV channel."
                />
                <NeonToggle
                  checked={settings.autoNextEpisode !== false}
                  onChange={(val) => updateSetting('autoNextEpisode', val)}
                  label="Auto-Next Episode (Binge Mode)"
                  badge="SERIES"
                  description="Automatically start a 5-second countdown to the next episode when the current episode finishes."
                />
                <NeonToggle
                  checked={settings.rememberProgress !== false}
                  onChange={(val) => updateSetting('rememberProgress', val)}
                  label="Remember Playback Progress & History"
                  description="Save your exact season, episode, and Continue Watching progress across sessions."
                />
                <NeonToggle
                  checked={settings.adShieldMode !== false}
                  onChange={(val) => {
                    updateSetting('adShieldMode', val);
                    setShieldEnabled(val);
                  }}
                  label="Furina Ad-Shield Pro (uBlock Engine)"
                  badge="ZERO-ADS"
                  description="Intercepts popup tabs, scam redirects, and clickjacking overlays without breaking video embeds."
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 2: AUDIO & SUBTITLES (WITH LIVE INTERACTIVE PREVIEW)              */}
          {/* ===================================================================== */}
          {activeSection === 'audio_subs' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Subtitles className="w-5 h-5 text-cyan-400" />
                  <span>Multi-Audio & Live Subtitle Studio</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Set your preferred spoken audio track and preview caption styling in real time.
                </p>
              </div>

              {/* Unified Default Audio Language */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2.5">
                <label className="font-extrabold text-cyan-300 text-xs uppercase tracking-wider block">
                  Default Audio Track Preference
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hindi', code: 'hi', label: '🇮🇳 Hindi Dub', sub: 'Prioritize Hindi' },
                    { id: 'english', code: 'en', label: '🇺🇸 English', sub: 'Original Master' },
                    { id: 'japanese', code: 'ja', label: '🇯🇵 Japanese', sub: 'Anime Original' },
                    { id: 'auto', code: 'auto', label: '⚡ Smart Auto', sub: 'Category Memory' }
                  ].map((opt) => {
                    const isSelected = settings.audioLanguage === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          updateSetting('audioLanguage', opt.id);
                          updateSetting('defaultAudioLang', opt.code);
                        }}
                        className={`p-3 rounded-xl text-center border transition cursor-pointer ${
                          isSelected
                            ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 border-amber-300 font-black shadow-[0_0_15px_rgba(251,191,36,0.45)]'
                            : 'bg-[#040a1a] border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        <div className="text-xs font-extrabold">{opt.label}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                          {opt.sub}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* LIVE INTERACTIVE SUBTITLE PREVIEW CARD */}
              <div className="rounded-2xl overflow-hidden border border-cyan-400/40 bg-[#030712] shadow-xl">
                <div className="px-4 py-2 bg-[#071128] border-b border-cyan-500/20 flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Subtitle Appearance Preview</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {settings.subtitleSize?.toUpperCase()} · {settings.subtitleOpacity}% · {settings.subtitleStyle?.toUpperCase()}
                  </span>
                </div>
                <div className="relative h-32 sm:h-36 w-full flex items-end justify-center p-4 overflow-hidden bg-gradient-to-t from-black via-[#061531] to-[#0a224e]">
                  <img
                    src="https://image.tmdb.org/t/p/w780/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg"
                    alt="Subtitle Preview Scene"
                    className="absolute inset-0 w-full h-full object-cover opacity-45"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

                  <div
                    style={{
                      color: previewSubColor,
                      fontSize: previewSubSize,
                      opacity: (settings.subtitleOpacity || 100) / 100,
                      backgroundColor: previewSubBg,
                      textShadow: settings.subtitleBackground === 'shadow'
                        ? '0 2px 10px rgba(0,0,0,0.95), 0 0 12px rgba(6,182,212,0.7)'
                        : '0 2px 4px rgba(0,0,0,0.9)'
                    }}
                    className="relative z-10 px-4 py-1.5 rounded-lg font-extrabold tracking-wide text-center transition-all duration-200"
                  >
                    {settings.defaultSubtitleLang === 'off'
                      ? '🚫 Subtitles Currently Off'
                      : '“Welcome to the Fontaine 4K Grand Opera Premiere!”'}
                  </div>
                </div>
              </div>

              {/* Subtitle Size, Color, Background Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2">
                  <label className="font-extrabold text-white text-xs block">Subtitle Font Size</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['small', 'medium', 'large', 'xlarge'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => updateSetting('subtitleSize', sz)}
                        className={`py-2 rounded-xl text-center font-bold uppercase text-[10px] border transition cursor-pointer ${
                          settings.subtitleSize === sz
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                            : 'bg-[#040a1a] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2">
                  <label className="font-extrabold text-white text-xs block">Caption Color & Glow</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { id: 'cyan', label: 'Cyan' },
                      { id: 'white', label: 'White' },
                      { id: 'amber', label: 'Amber' },
                      { id: 'yellow', label: 'Yellow' }
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => updateSetting('subtitleStyle', st.id)}
                        className={`py-2 rounded-xl text-center font-bold text-[11px] border transition cursor-pointer ${
                          settings.subtitleStyle === st.id
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                            : 'bg-[#040a1a] border-white/10 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 divide-y divide-cyan-500/15">
                <NeonToggle
                  checked={settings.rememberAudioPerTitle !== false}
                  onChange={(val) => updateSetting('rememberAudioPerTitle', val)}
                  label="Remember Audio Language Per Title"
                  description="Automatically restore your chosen language track (Hindi, English, or Japanese) for each movie or series."
                />
                <NeonToggle
                  checked={settings.volumeNormalization !== false}
                  onChange={(val) => updateSetting('volumeNormalization', val)}
                  label="Cinema Dialogue Clarity & Volume Boost"
                  description="Balance dynamic range between quiet spoken dialogue and loud action sequences."
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 3: THEME, STEALTH & SOUND FX                                      */}
          {/* ===================================================================== */}
          {activeSection === 'appearance' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-cyan-400" />
                  <span>Cinematic Theme, Stealth & Sound FX</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Customize the atmospheric color palette, Neon 3D effects, and UI sound synthesizer.
                </p>
              </div>

              {/* Visual Theme Cards */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-3">
                <label className="font-extrabold text-cyan-300 text-xs uppercase tracking-wider block">
                  Cinema Color Atmosphere
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'furina_hydro', label: '💧 Furina Hydro', preview: 'from-[#030712] via-[#092047] to-cyan-500/40' },
                    { id: 'midnight', label: '🌌 Pure OLED Black', preview: 'from-black via-slate-950 to-cyan-900/30' },
                    { id: 'amethyst', label: '🔮 Royal Amethyst', preview: 'from-[#0b0416] via-purple-950 to-fuchsia-500/30' },
                    { id: 'emerald', label: '🌿 Neon Emerald', preview: 'from-[#03120d] via-emerald-950 to-teal-500/30' }
                  ].map((thm) => {
                    const active = settings.theme === thm.id;
                    return (
                      <button
                        key={thm.id}
                        type="button"
                        onClick={() => updateSetting('theme', thm.id)}
                        className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col gap-2 ${
                          active
                            ? 'border-cyan-400 bg-cyan-500/15 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                            : 'border-white/10 bg-[#040a1a] hover:border-cyan-500/40'
                        }`}
                      >
                        <div className={`h-10 w-full rounded-lg bg-gradient-to-br ${thm.preview} border border-white/15`} />
                        <div className="font-extrabold text-xs text-white flex items-center justify-between">
                          <span>{thm.label}</span>
                          {active && <span className="text-cyan-400">✓</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stealth Mode, Sound FX & 3D Animations Toggles */}
              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 divide-y divide-cyan-500/15">
                <NeonToggle
                  checked={Boolean(isStealthMode)}
                  onChange={(val) => {
                    if (setIsStealthMode) setIsStealthMode(val);
                    showToast(val ? '🛡️ Stealth Mode Enabled' : '✨ Furina Theme Restored');
                  }}
                  label="Stealth Disguise Mode"
                  badge="PRIVACY"
                  description="Disguise Furina branding and switch to a neutral StreamBox dark interface."
                />
                <NeonToggle
                  checked={!soundMuted}
                  onChange={() => {
                    const nowMuted = soundFx.toggleMute();
                    setSoundMuted(nowMuted);
                    if (!nowMuted) soundFx.playStartChime?.();
                    showToast(nowMuted ? '🔇 UI Sound FX Muted' : '🔊 Hydro UI Sound FX Active');
                  }}
                  label="Fontaine Hydro UI Sound Effects"
                  badge="WEB AUDIO"
                  description="Zero-latency acoustic water chimes and tactile clicks when navigating cards and menus."
                />
                <NeonToggle
                  checked={settings.animations !== false}
                  onChange={(val) => updateSetting('animations', val)}
                  label="Neon 3D Hover & Ambient Light Beams"
                  description="Enable GPU-accelerated card elevation, border glows, and smooth transitions."
                />
                <NeonToggle
                  checked={Boolean(settings.compactUi)}
                  onChange={(val) => updateSetting('compactUi', val)}
                  label="High-Density Compact Grid"
                  description="Reduce spacing between poster shelves to fit more titles on screen."
                />
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 4: HOTKEYS & MOBILE TOUCH                                         */}
          {/* ===================================================================== */}
          {activeSection === 'controls' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-cyan-400" />
                  <span>Keyboard Hotkeys & Mobile Touch Gestures</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Configure seek intervals, fullscreen behavior, and mobile double-tap gestures.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2">
                  <label className="font-extrabold text-white text-xs block">Skip Forward / Backward Interval</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 10, 15, 30].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        onClick={() => {
                          updateSetting('skipForwardSecs', sec);
                          updateSetting('skipBackwardSecs', sec);
                        }}
                        className={`py-2 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          settings.skipForwardSecs === sec
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                            : 'bg-[#040a1a] border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 space-y-2">
                  <label className="font-extrabold text-white text-xs block">Auto-Hide Fullscreen HUD</label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { val: 2, label: '2s' },
                      { val: 3, label: '3s' },
                      { val: 5, label: '5s' },
                      { val: 0, label: 'Never' }
                    ].map((opt) => (
                      <button
                        key={opt.val}
                        type="button"
                        onClick={() => updateSetting('autoHideControls', opt.val)}
                        className={`py-2 rounded-xl font-mono font-bold text-xs border transition cursor-pointer ${
                          settings.autoHideControls === opt.val
                            ? 'bg-cyan-400 text-slate-950 border-cyan-300 font-black'
                            : 'bg-[#040a1a] border-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25 divide-y divide-cyan-500/15">
                <NeonToggle
                  checked={settings.keyboardShortcuts !== false}
                  onChange={(val) => updateSetting('keyboardShortcuts', val)}
                  label="Desktop Keyboard Shortcuts"
                  description="Control playback with Space/K (Play/Pause), F (Fullscreen), T (Theater), M (Mute), and C (Subtitles)."
                />
                <NeonToggle
                  checked={settings.gestureControls !== false}
                  onChange={(val) => updateSetting('gestureControls', val)}
                  label="Mobile Double-Tap & Swipe Gestures"
                  description="Double-tap left/right video edges to seek 10s; vertical drag in fullscreen for brightness & volume."
                />
              </div>

              {/* Keyboard Shortcut Matrix */}
              <div className="p-4 rounded-2xl bg-[#040a1a] border border-cyan-500/20 space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400 block">
                  Quick Keyboard Reference
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  {[
                    { k: 'Space / K', d: 'Play / Pause' },
                    { k: 'F', d: 'Fullscreen' },
                    { k: 'T', d: 'Theater Mode' },
                    { k: '← / →', d: `Seek ±${settings.skipForwardSecs || 10}s` },
                    { k: 'C', d: 'Cycle Subtitles' },
                    { k: 'B', d: 'AI 4K Boost' },
                    { k: 'M', d: 'Mute / Unmute' },
                    { k: 'Ctrl + K', d: '3D Spotlight Search' },
                    { k: 'Esc', d: 'Exit / Close' }
                  ].map((item) => (
                    <div key={item.k} className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#08132c] border border-white/5">
                      <span className="text-slate-300">{item.d}</span>
                      <kbd className="px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30 font-mono font-bold text-[10px]">
                        {item.k}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 5: CDN HEALTH, STORAGE & BACKUP                                   */}
          {/* ===================================================================== */}
          {activeSection === 'storage' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  <span>CDN Diagnostics, Cache & Library Backup</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Benchmark global 4K mirrors, clear cached data, or export/restore your Watchlist & Collections.
                </p>
              </div>

              {/* Portable Library Backup Export / Import Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-[#081534] to-[#061028] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs sm:text-sm font-black text-white">
                      Watchlist, Collections & History Backup (JSON)
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Download a portable backup file or restore your saved library on any device.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        exportBackupJson();
                        showToast('📦 Backup JSON Downloaded');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1.5 transition cursor-pointer shadow"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export Backup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-[#0b1c42] hover:bg-white/10 border border-cyan-500/35 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import JSON</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json,application/json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Storage & Diagnostic Quick Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={handleRunHealthCheck}
                  disabled={isCheckingHealth}
                  className="p-3 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                  <span>{isCheckingHealth ? 'Pinging CDNs...' : 'Ping 4K Mirrors'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/35 text-amber-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Clear Media Cache</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    clearWatchHistory();
                    if (onClearWatchlist) onClearWatchlist();
                    showToast('🗑️ Watch History & Watchlist Cleared');
                  }}
                  className="p-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-200 font-bold flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear History</span>
                </button>
              </div>

              {/* Provider Status Cards */}
              <div className="space-y-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-cyan-300 block">
                  Multi-Dub & CDN Provider Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {providerReport.map((p) => {
                    const isOnline = p.status === 'online';
                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-[#08132c] border border-cyan-500/20 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-white text-xs">{p.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Ping: <strong className="text-cyan-300">{p.latency}ms</strong> · Tracks: {p.supportedLanguages.join(', ').toUpperCase()}
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300'
                        }`}>
                          ● {p.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================== */}
          {/* TAB 6: SECRET MASTER VAULT (INTERACTIVE PIN KEYPAD 2030)              */}
          {/* ===================================================================== */}
          {activeSection === 'vault' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                  {isMasterMode ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
                  <span>Secret Master Vault (Passcode Protected)</span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Enter the 4-digit Master PIN to unlock restricted uncut archives and the Hanime Vault.
                </p>
              </div>

              {isMasterMode ? (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/60 via-[#071f24] to-[#050d21] border border-emerald-400/50 space-y-3 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm font-black text-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>Master Security Vault Unlocked</span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono text-[10px] font-black">
                        PIN 2030 ACTIVE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All uncut cinema mirrors, mature filters, and the Hanime Vault are now accessible in the navigation bar and Explore menu.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory('ecchi_anime');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
                      >
                        <Flame className="w-4 h-4" />
                        <span>Open Hanime Uncut Vault</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectCategory) onSelectCategory('mature');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg cursor-pointer transition"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Open Uncut Cinema Vault</span>
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#08132c] border border-cyan-500/25">
                    <NeonToggle
                      checked={Boolean(includeMature)}
                      onChange={(val) => {
                        if (setIncludeMature) setIncludeMature(val);
                        showToast(val ? 'Uncut Search Filter Enabled' : 'Standard Search Filter Active');
                      }}
                      label="Include Uncut Titles in Global Search"
                      description="Allow global search results to include restricted adult/uncut anime and movies."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleLockVault}
                    className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/50 text-rose-200 hover:text-white font-black text-xs transition cursor-pointer"
                  >
                    🔒 Lock Master Vault & Hide Restricted Tabs
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center bg-[#08132c] border border-cyan-500/25 rounded-2xl p-5">
                  {/* Left PIN Display & Form */}
                  <form onSubmit={handlePinSubmit} className="sm:col-span-6 space-y-4 text-center sm:text-left">
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
                        Security Authentication
                      </span>
                      <h4 className="text-sm font-black text-white mt-0.5">
                        Enter 4-Digit Master PIN
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Use your keyboard or tap the tactile keypad on the right.
                      </p>
                    </div>

                    {/* 4-Dot Visual PIN Display */}
                    <div className="flex items-center justify-center sm:justify-start gap-2.5">
                      {[0, 1, 2, 3].map((idx) => {
                        const filled = pin.length > idx;
                        return (
                          <div
                            key={idx}
                            className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center font-mono text-lg font-black transition-all ${
                              pinError
                                ? 'border-rose-500 bg-rose-950/40 text-rose-300'
                                : filled
                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.4)]'
                                : 'border-cyan-500/25 bg-[#040a1a] text-slate-600'
                            }`}
                          >
                            {filled ? '●' : '◦'}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                          setPinError(false);
                          const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                          setPin(val);
                          if (val.length === 4) verifyPinCode(val);
                        }}
                        placeholder="Type PIN..."
                        className="w-32 bg-[#040a1a] border border-cyan-500/35 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs cursor-pointer shadow"
                      >
                        Unlock
                      </button>
                    </div>

                    {pinError && (
                      <p className="text-rose-400 text-xs font-bold animate-bounce">
                        ⚠️ Incorrect PIN code. Try again.
                      </p>
                    )}
                  </form>

                  {/* Right Interactive Tactile PIN Keypad */}
                  <div className="sm:col-span-6 grid grid-cols-3 gap-2 max-w-[240px] mx-auto w-full">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                      <button
                        key={digit}
                        type="button"
                        onClick={() => handleKeypadDigit(digit)}
                        className="h-11 rounded-xl bg-[#040a1a] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400 text-white font-mono font-black text-sm transition active:scale-95 cursor-pointer shadow-sm"
                      >
                        {digit}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        soundFx.playClick?.();
                        setPin('');
                        setPinError(false);
                      }}
                      className="h-11 rounded-xl bg-rose-950/50 hover:bg-rose-600/30 border border-rose-500/30 text-rose-300 font-black text-[11px] transition active:scale-95 cursor-pointer"
                    >
                      CLR
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeypadDigit('0')}
                      className="h-11 rounded-xl bg-[#040a1a] hover:bg-cyan-500/20 border border-cyan-500/25 hover:border-cyan-400 text-white font-mono font-black text-sm transition active:scale-95 cursor-pointer shadow-sm"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => setPin((p) => p.slice(0, -1))}
                      className="h-11 rounded-xl bg-[#040a1a] hover:bg-white/10 border border-cyan-500/25 text-cyan-300 flex items-center justify-center transition active:scale-95 cursor-pointer"
                      title="Backspace"
                    >
                      <Delete className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
