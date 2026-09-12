import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  X, Settings, Lock, Unlock, Eye, EyeOff, Flame, ShieldCheck, 
  Server, Sliders, Trash2, CheckCircle2, AlertTriangle, KeyRound, Shield,
  Sparkles, RefreshCw, Play, Volume2, Globe, Subtitles, Palette,
  Monitor, Smartphone, Activity, HardDrive, RotateCcw, Check,
  ChevronRight, Radio, Info
} from 'lucide-react';
import { SERVERS } from '../services/streaming';
import { isAdBlockEnabled, setShieldEnabled } from '../services/adblocker';
import { isAiUpdaterEnabled, setAiUpdaterEnabled, triggerAiSync, getLastSyncTime } from '../services/aiUpdater';
import { SECRET_ECCHI_ANIME, IMG_BASE } from '../services/tmdb';
import hindiProviderManager from '../services/HindiProviderManager';

export const DEFAULT_SETTINGS = {
  // Playback
  defaultAudioLang: 'hi', // 'hi' | 'en' | 'ja' | 'auto'
  defaultSubtitleLang: 'en', // 'en' | 'hi' | 'ja' | 'off'
  autoplay: true,
  autoNextEpisode: true,
  rememberProgress: true,
  playbackQuality: '4k', // '4k' | '1080p' | '720p' | 'auto'

  // Language
  appLanguage: 'en', // 'en' | 'hi' | 'ja'
  preferredAudioLanguage: 'hi',
  preferredSubtitleLanguage: 'en',
  autoSelectAvailable: true,

  // Audio
  audioLanguage: 'hindi', // 'hindi' | 'english' | 'japanese' | 'auto'
  rememberAudioPerTitle: true,
  audioTrackDetection: true,
  volumeNormalization: true,

  // Subtitles
  subtitlesEnabled: true,
  subtitleSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
  subtitleOpacity: 100, // 100 | 80 | 60
  subtitleBackground: 'transparent', // 'transparent' | 'box' | 'shadow'
  subtitleStyle: 'cyan', // 'cyan' | 'white' | 'amber' | 'yellow'

  // Appearance
  theme: 'furina_hydro', // 'furina_hydro' | 'midnight' | 'amethyst' | 'emerald'
  accentColor: 'cyan',
  playerStyle: 'cinematic', // 'cinematic' | 'minimal' | 'studio'
  animations: true,
  compactUi: false,

  // Player
  skipForwardSecs: 10,
  skipBackwardSecs: 10,
  autoHideControls: 3,
  keyboardShortcuts: true,
  fullscreenBehavior: 'cinema',

  // Mobile
  mobileControls: 'touch_optimized',
  gestureControls: true,
  preventTypingBackNav: true,
  mobileSettingsLayout: 'comfortable'
};

export function applyThemeAndAppSettings(settings) {
  if (typeof document === 'undefined') return;
  try {
    const root = document.documentElement;
    const body = document.body;

    const theme = settings?.theme || 'furina_hydro';
    root.setAttribute('data-theme', theme);

    if (theme === 'midnight') {
      body.style.backgroundColor = '#000000';
    } else if (theme === 'amethyst') {
      body.style.backgroundColor = '#0b0416';
    } else if (theme === 'emerald') {
      body.style.backgroundColor = '#03120d';
    } else {
      body.style.backgroundColor = '#030712';
    }

    const accents = {
      cyan: '#06b6d4',
      amber: '#f59e0b',
      purple: '#a855f7',
      emerald: '#10b981'
    };
    const accent = accents[settings?.accentColor] || '#06b6d4';
    root.style.setProperty('--accent-color', accent);

    if (settings?.animations === false) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (settings?.compactUi) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    window.dispatchEvent(new CustomEvent('furina:settings-changed', { detail: settings }));
  } catch (e) {}
}

export function getStoredSettings() {
  try {
    const raw = localStorage.getItem('furina_settings');
    if (raw) {
      const parsed = { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
      applyThemeAndAppSettings(parsed);
      return parsed;
    }
  } catch (e) {}
  applyThemeAndAppSettings(DEFAULT_SETTINGS);
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(newSettings) {
  try {
    localStorage.setItem('furina_settings', JSON.stringify(newSettings));
    applyThemeAndAppSettings(newSettings);
  } catch (e) {}
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

  // Keyboard Escape Handler (Requirement 24)
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

  // Provider health monitor state
  const [providerReport, setProviderReport] = useState(() => hindiProviderManager.getProviderHealthReport());
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // AdBlock & AI Updater legacy states
  const [adBlockOn, setAdBlockOn] = useState(() => isAdBlockEnabled());
  const [aiUpdaterOn, setAiUpdaterOn] = useState(() => isAiUpdaterEnabled());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(() => getLastSyncTime());

  // Save settings on change
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => {
      const updated = { ...prev, [key]: value };
      saveStoredSettings(updated);
      return updated;
    });
    showToast('Saved');
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  if (!isOpen) return null;

  const handlePinSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === '2030') {
      setIsMasterMode(true);
      setPinError(false);
      setPin('');
      showToast('Master Vault Unlocked');
    } else {
      setPinError(true);
    }
  };

  const handleLockVault = () => {
    setIsMasterMode(false);
    setIncludeMature(false);
    showToast('Master Vault Locked');
  };

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    const report = await hindiProviderManager.runAllHealthChecks();
    setProviderReport(report);
    setIsCheckingHealth(false);
    showToast('Provider Diagnostics Complete');
  };

  const handleClearCache = () => {
    hindiProviderManager.clearCache();
    try {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('furina_cache_') || key.startsWith('tmdb_cache_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch (e) {}
    showToast('Media & Resolution Cache Cleared');
  };

  const handleResetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    saveStoredSettings(DEFAULT_SETTINGS);
    showToast('Settings Reset to Defaults');
  };

  const navSections = [
    { id: 'playback', label: 'Playback', icon: Play, emoji: '🎬' },
    { id: 'language', label: 'Language', icon: Globe, emoji: '🌐' },
    { id: 'audio', label: 'Audio', icon: Volume2, emoji: '🎧' },
    { id: 'subtitles', label: 'Subtitles', icon: Subtitles, emoji: '💬' },
    { id: 'appearance', label: 'Appearance', icon: Palette, emoji: '🎨' },
    { id: 'player', label: 'Keyboard & Player', icon: Monitor, emoji: '⌨️' },
    { id: 'mobile', label: 'Mobile', icon: Smartphone, emoji: '📱' },
    { id: 'advanced', label: 'Provider Health & Engine', icon: Activity, emoji: '⚙️' },
    { id: 'vault', label: 'Secret Vault', icon: isMasterMode ? Unlock : Lock, emoji: '🔒' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-2xl p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#060c1e]/95 border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(6,182,212,0.25)] flex flex-col md:flex-row my-auto max-h-[92vh]">
        
        {/* Toast Notification */}
        {toast && (
          <div className="absolute top-4 right-14 z-50 px-3.5 py-1.5 rounded-xl bg-cyan-950/90 border border-cyan-400 text-cyan-200 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-in fade-in slide-in-from-top-2 duration-150">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>{toast}</span>
          </div>
        )}

        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close Settings"
          className="absolute top-4 right-4 z-40 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-cyan-300 hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 bg-[#040815] border-b md:border-b-0 md:border-r border-cyan-500/20 p-3 sm:p-4 flex flex-col shrink-0">
          <div className="flex items-center gap-2.5 px-2 py-3 mb-2 border-b border-cyan-500/15">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-gray-950 shadow-md">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-white tracking-wide">Settings Hub</h2>
              <p className="text-[10px] text-cyan-300/60 uppercase tracking-wider font-mono">Streaming Preferences</p>
            </div>
          </div>

          <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
            {navSections.map((sec) => {
              const Icon = sec.icon;
              const isActive = activeSection === sec.id;
              const isVault = sec.id === 'vault';
              return (
                <button
                  key={sec.id}
                  onClick={() => setActiveSection(sec.id)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
                    isActive
                      ? isVault && isMasterMode
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow'
                        : 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm">{sec.emoji}</span>
                    <span>{sec.label}</span>
                  </div>
                  {isVault && isMasterMode && (
                    <span className="hidden md:inline-block text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                      OPEN
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* CONTENT PANEL */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-200">

          {/* 1. PLAYBACK SETTINGS */}
          {activeSection === 'playback' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>🎬</span> Playback Controls & Defaults
                </h3>
                <p className="text-slate-400 text-xs">Configure how streaming begins, auto-play behaviors, and stream quality defaults.</p>
              </div>

              {/* Default Audio Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Default Audio Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hi', label: '🇮🇳 Hindi' },
                    { id: 'en', label: '🇺🇸 English' },
                    { id: 'ja', label: '🇯🇵 Japanese' },
                    { id: 'auto', label: '⚡ Original' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('defaultAudioLang', opt.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.defaultAudioLang === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Subtitle Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Default Subtitle Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'en', label: '🇬🇧 English' },
                    { id: 'hi', label: '🇮🇳 Hindi' },
                    { id: 'ja', label: '🇯🇵 Japanese' },
                    { id: 'off', label: '🚫 Disabled / Off' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('defaultSubtitleLang', opt.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.defaultSubtitleLang === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Playback Quality */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Default Streaming Quality</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: '4k', label: '💎 4K UHD' },
                    { id: '1080p', label: '🌟 1080p Full HD' },
                    { id: '720p', label: '⚡ 720p Fast' },
                    { id: 'auto', label: '🔄 Adaptive Auto' }
                  ].map((q) => (
                    <button
                      key={q.id}
                      onClick={() => updateSetting('playbackQuality', q.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.playbackQuality === q.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 divide-y divide-white/10 space-y-3">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-bold text-white">Autoplay Video on Open</span>
                    <p className="text-[11px] text-slate-400">Instantly start media playback upon opening title modal.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoplay}
                    onChange={(e) => updateSetting('autoplay', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Auto-Next Episode</span>
                    <p className="text-[11px] text-slate-400">Automatically advance to subsequent episode in TV / Anime series.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoNextEpisode}
                    onChange={(e) => updateSetting('autoNextEpisode', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Remember Playback Progress</span>
                    <p className="text-[11px] text-slate-400">Save exact timestamp and episode position across sessions.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.rememberProgress}
                    onChange={(e) => updateSetting('rememberProgress', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 2. LANGUAGE SETTINGS */}
          {activeSection === 'language' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>🌐</span> Language & Audio Localization Preferences
                </h3>
                <p className="text-slate-400 text-xs">Set preferred languages with intelligent fallback and honesty policy.</p>
              </div>

              {/* App Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">App Interface Language</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'en', label: '🇺🇸 English' },
                    { id: 'hi', label: '🇮🇳 हिंदी (Hindi)' },
                    { id: 'ja', label: '🇯🇵 日本語 (Japanese)' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('appLanguage', opt.id)}
                      className={`p-2.5 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.appLanguage === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Audio Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-3">
                <label className="font-extrabold text-white text-xs block">Preferred Audio Language (Strictly Enforced)</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'hindi', label: '🇮🇳 Hindi (Hindi Dubbed / Native)', desc: 'Prioritize Hindi audio when authentic dub exists' },
                    { id: 'english', label: '🇺🇸 English Dub / Master', desc: 'Prioritize English master dialogue' },
                    { id: 'japanese', label: '🇯🇵 Japanese Subbed', desc: 'Original Japanese voice acting' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('audioLanguage', opt.id)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between ${
                        settings.audioLanguage === opt.id
                          ? 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400 text-white shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="font-black text-xs text-cyan-200">{opt.label}</span>
                      <span className="text-[10px] text-slate-400 mt-1">{opt.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Subtitle Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Preferred Subtitle Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'en', label: '🇬🇧 English' },
                    { id: 'hi', label: '🇮🇳 Hindi CC' },
                    { id: 'ja', label: '🇯🇵 Japanese Sub' },
                    { id: 'off', label: '🚫 Off' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('preferredSubtitleLanguage', opt.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.preferredSubtitleLanguage === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-select Policy */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-white">Honest Intelligent Fallback</span>
                    <p className="text-[11px] text-slate-400">If preferred Hindi audio is unavailable for a title, automatically select English without faking.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.autoSelectAvailable}
                    onChange={(e) => updateSetting('autoSelectAvailable', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. AUDIO SETTINGS */}
          {activeSection === 'audio' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>🎧</span> Audio & Track Detection
                </h3>
                <p className="text-slate-400 text-xs">Manage track detection, hardware decoding, and channel normalization.</p>
              </div>

              {/* Preferred Audio Mode */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Preferred Audio Mode</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'hindi', label: '🇮🇳 Hindi' },
                    { id: 'english', label: '🇺🇸 English' },
                    { id: 'japanese', label: '🇯🇵 Japanese' },
                    { id: 'auto', label: '🔄 Auto' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('audioLanguage', opt.id)}
                      className={`p-2.5 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.audioLanguage === opt.id
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 divide-y divide-white/10 space-y-3">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-bold text-white">HTML5 Audio Track Detection API</span>
                    <p className="text-[11px] text-slate-400">Inspect physical audio tracks directly from media element via browser API.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.audioTrackDetection}
                    onChange={(e) => updateSetting('audioTrackDetection', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Remember Audio Track Choice Per Title</span>
                    <p className="text-[11px] text-slate-400">Save individual audio language selection for each specific movie or series.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.rememberAudioPerTitle}
                    onChange={(e) => updateSetting('rememberAudioPerTitle', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Volume Normalization & Dialogue Clarity</span>
                    <p className="text-[11px] text-slate-400">Balance dynamic range between quiet dialogue and loud action scenes.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.volumeNormalization}
                    onChange={(e) => updateSetting('volumeNormalization', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. SUBTITLES SETTINGS */}
          {activeSection === 'subtitles' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>💬</span> Subtitles & Captions Styling
                </h3>
                <p className="text-slate-400 text-xs">Customize font size, opacity, glow, and background styling for CC captions.</p>
              </div>

              {/* Subtitles Master Toggle */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Enable Subtitles by Default</span>
                  <p className="text-[11px] text-slate-400">Automatically show subtitles when available on media playback.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.subtitlesEnabled}
                  onChange={(e) => updateSetting('subtitlesEnabled', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Default Subtitle Language */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Default Subtitle Language</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'en', label: '🇬🇧 English' },
                    { id: 'hi', label: '🇮🇳 Hindi' },
                    { id: 'ja', label: '🇯🇵 Japanese' },
                    { id: 'off', label: '🚫 Off' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => updateSetting('defaultSubtitleLang', opt.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.defaultSubtitleLang === opt.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Size */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Subtitle Size</label>
                <div className="grid grid-cols-4 gap-2">
                  {['small', 'medium', 'large', 'xlarge'].map((sz) => (
                    <button
                      key={sz}
                      onClick={() => updateSetting('subtitleSize', sz)}
                      className={`p-2 rounded-xl text-center font-bold capitalize border transition cursor-pointer ${
                        settings.subtitleSize === sz
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Opacity */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Subtitle Opacity</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 100, label: '100% Solid' },
                    { val: 80, label: '80% Balanced' },
                    { val: 60, label: '60% Subtle' }
                  ].map((op) => (
                    <button
                      key={op.val}
                      onClick={() => updateSetting('subtitleOpacity', op.val)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.subtitleOpacity === op.val
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Background Style */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Subtitle Background</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'transparent', label: 'Transparent' },
                    { id: 'box', label: 'Semi-Black Box' },
                    { id: 'shadow', label: 'Drop Shadow Glow' }
                  ].map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => updateSetting('subtitleBackground', bg.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.subtitleBackground === bg.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {bg.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subtitle Style */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Subtitle Color & Glow Style</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'cyan', label: 'Hydro Cyan' },
                    { id: 'white', label: 'Classic White' },
                    { id: 'amber', label: 'Warm Amber' },
                    { id: 'yellow', label: 'Vibrant Yellow' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateSetting('subtitleStyle', st.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.subtitleStyle === st.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 5. APPEARANCE SETTINGS */}
          {activeSection === 'appearance' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>🎨</span> Appearance & Theme Engine
                </h3>
                <p className="text-slate-400 text-xs">Personalize the cinematic interface with vibrant accents and glassmorphism styling.</p>
              </div>

              {/* Theme selection */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Cinematic Theme</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'furina_hydro', label: '💧 Furina Hydro Cyan' },
                    { id: 'midnight', label: '🌌 Midnight OLED' },
                    { id: 'amethyst', label: '🔮 Royal Amethyst' },
                    { id: 'emerald', label: '🌿 Neon Emerald' }
                  ].map((thm) => (
                    <button
                      key={thm.id}
                      onClick={() => updateSetting('theme', thm.id)}
                      className={`p-3 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.theme === thm.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {thm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Accent Glow Color</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'cyan', label: 'Cyan Accent', color: 'bg-cyan-500' },
                    { id: 'amber', label: 'Amber Accent', color: 'bg-amber-500' },
                    { id: 'purple', label: 'Purple Accent', color: 'bg-purple-500' },
                    { id: 'emerald', label: 'Emerald Accent', color: 'bg-emerald-500' }
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => updateSetting('accentColor', acc.id)}
                      className={`p-2.5 rounded-xl text-center font-bold border transition cursor-pointer flex items-center justify-center gap-2 ${
                        settings.accentColor === acc.id
                          ? 'bg-white/15 border-white text-white shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${acc.color}`} />
                      <span>{acc.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Player Style */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Player Visual Style</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'cinematic', label: '🎬 Cinematic Frameless' },
                    { id: 'studio', label: '🎛️ Studio Pro Glass' },
                    { id: 'minimal', label: '⚡ Minimal Clean' }
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateSetting('playerStyle', st.id)}
                      className={`p-2.5 rounded-xl text-center font-bold border transition cursor-pointer ${
                        settings.playerStyle === st.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Animation Toggle & Compact UI */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 divide-y divide-white/10 space-y-3">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-bold text-white">Smooth Micro-Interactions & Transitions</span>
                    <p className="text-[11px] text-slate-400">Enable GPU-accelerated ambient glows and spring animations.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.animations}
                    onChange={(e) => updateSetting('animations', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Compact UI Layout</span>
                    <p className="text-[11px] text-slate-400">Reduce card margins and header padding for higher media density.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.compactUi}
                    onChange={(e) => updateSetting('compactUi', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 6. PLAYER CONTROLS SETTINGS */}
          {activeSection === 'player' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>▶️</span> Player Behavior & Hotkeys
                </h3>
                <p className="text-slate-400 text-xs">Configure skip intervals, shortcuts, and fullscreen playback modes.</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-1.5">
                  <label className="font-extrabold text-white text-xs block">Skip Forward</label>
                  <select
                    value={settings.skipForwardSecs}
                    onChange={(e) => updateSetting('skipForwardSecs', Number(e.target.value))}
                    className="w-full bg-[#050b1d] border border-cyan-500/30 rounded-xl p-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-1.5">
                  <label className="font-extrabold text-white text-xs block">Skip Backward</label>
                  <select
                    value={settings.skipBackwardSecs}
                    onChange={(e) => updateSetting('skipBackwardSecs', Number(e.target.value))}
                    className="w-full bg-[#050b1d] border border-cyan-500/30 rounded-xl p-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={5}>5 seconds</option>
                    <option value={10}>10 seconds</option>
                    <option value={15}>15 seconds</option>
                    <option value={30}>30 seconds</option>
                  </select>
                </div>
              </div>

              {/* Auto-Hide & Fullscreen Behavior */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-1.5">
                  <label className="font-extrabold text-white text-xs block">Auto-Hide Controls (Sec)</label>
                  <select
                    value={settings.autoHideControls}
                    onChange={(e) => updateSetting('autoHideControls', Number(e.target.value))}
                    className="w-full bg-[#050b1d] border border-cyan-500/30 rounded-xl p-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value={2}>2 seconds</option>
                    <option value={3}>3 seconds</option>
                    <option value={5}>5 seconds</option>
                    <option value={0}>Never Auto-Hide</option>
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-1.5">
                  <label className="font-extrabold text-white text-xs block">Fullscreen Behavior</label>
                  <select
                    value={settings.fullscreenBehavior}
                    onChange={(e) => updateSetting('fullscreenBehavior', e.target.value)}
                    className="w-full bg-[#050b1d] border border-cyan-500/30 rounded-xl p-2 text-white font-mono text-xs focus:outline-none"
                  >
                    <option value="cinema">Cinema Container</option>
                    <option value="native">Browser Native Fullscreen</option>
                  </select>
                </div>
              </div>

              {/* Keyboard Shortcuts Toggle */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">Enable Keyboard Shortcuts</span>
                  <p className="text-[11px] text-slate-400">Allow Space, Arrows, F, M, C, B keys to control playback.</p>
                </div>
                <input
                  type="checkbox"
                  checked={settings.keyboardShortcuts}
                  onChange={(e) => updateSetting('keyboardShortcuts', e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Keyboard Shortcuts Table */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <span className="font-extrabold text-white text-xs block">Keyboard Shortcuts Reference</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">Space</strong>: Play/Pause</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">← / →</strong>: Seek {settings.skipForwardSecs || 10}s</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">↑ / ↓</strong>: Volume</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">F</strong>: Fullscreen</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">M</strong>: Mute Audio</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">C</strong>: Cycle Captions</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">B</strong>: Cycle AI Boost</div>
                  <div className="p-2 rounded bg-black/40 border border-white/5"><strong className="text-cyan-300">Esc</strong>: Close Player</div>
                </div>
              </div>
            </div>
          )}

          {/* 7. MOBILE SETTINGS */}
          {activeSection === 'mobile' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>📱</span> Mobile Gestures & Input Protection
                </h3>
                <p className="text-slate-400 text-xs">Mobile-specific layout optimizations and accidental back-navigation prevention.</p>
              </div>

              {/* Mobile Player Controls Mode */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Mobile Player Controls Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'touch_optimized', label: 'Touch Optimized' },
                    { id: 'standard', label: 'Standard' },
                    { id: 'minimal', label: 'Minimal Hidden' }
                  ].map((m) => (
                    <button
                      key={m.id}
                      onClick={() => updateSetting('mobileControls', m.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer text-[11px] ${
                        settings.mobileControls === m.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Settings Layout */}
              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-2">
                <label className="font-extrabold text-white text-xs block">Mobile Settings Layout Density</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'comfortable', label: 'Comfortable Spacing' },
                    { id: 'compact', label: 'Compact Tight' }
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => updateSetting('mobileSettingsLayout', l.id)}
                      className={`p-2 rounded-xl text-center font-bold border transition cursor-pointer text-[11px] ${
                        settings.mobileSettingsLayout === l.id
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow'
                          : 'bg-[#050b1d] border-white/10 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#09142e] border border-cyan-500/20 divide-y divide-white/10 space-y-3">
                <div className="flex items-center justify-between pt-2">
                  <div>
                    <span className="font-bold text-white">Prevent Accidental Back-Navigation While Typing</span>
                    <p className="text-[11px] text-slate-400">Lock browser back gesture when typing in search inputs or filters.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.preventTypingBackNav}
                    onChange={(e) => updateSetting('preventTypingBackNav', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <span className="font-bold text-white">Mobile Touch Gestures</span>
                    <p className="text-[11px] text-slate-400">Double-tap left/right edge to seek backward or forward 10 seconds.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.gestureControls}
                    onChange={(e) => updateSetting('gestureControls', e.target.checked)}
                    className="w-4 h-4 accent-cyan-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 8. ADVANCED & PROVIDER HEALTH */}
          {activeSection === 'advanced' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>⚙️</span> Provider Health System & Diagnostics
                </h3>
                <p className="text-slate-400 text-xs">Live operational status of localized audio providers, CDN latencies, and cache management.</p>
              </div>

              {/* Action Bar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isCheckingHealth}
                  className="px-3.5 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/50 text-cyan-200 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} />
                  <span>{isCheckingHealth ? 'Pinging Providers...' : 'Run Diagnostics'}</span>
                </button>
                <button
                  onClick={handleClearCache}
                  className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-200 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <HardDrive className="w-3.5 h-3.5" />
                  <span>Clear Cache</span>
                </button>
                <button
                  onClick={handleResetSettings}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-200 font-bold flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Defaults</span>
                </button>
              </div>

              {/* Provider Health Cards */}
              <div className="space-y-2.5">
                <span className="font-extrabold text-white text-xs block uppercase tracking-wider text-cyan-300">
                  Active Audio Providers Status
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {providerReport.map((p) => {
                    const isOnline = p.status === 'online';
                    return (
                      <div key={p.id} className="p-3.5 rounded-2xl bg-[#09142e] border border-cyan-500/20 flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-xs">{p.name}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1 ${
                            isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            <span>{isOnline ? '🟢' : '🔴'}</span>
                            <span className="uppercase">{p.status}</span>
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span>Latency: <strong className="text-cyan-300">{p.latency}ms</strong></span>
                          <span>Working: <strong className="text-emerald-400">{p.workingSources}</strong></span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center justify-between border-t border-white/5 pt-1.5">
                          <span>Supported: {p.supportedLanguages.join(', ').toUpperCase()}</span>
                          <span>Checked: {p.lastChecked}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Debug Media Info */}
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-1.5 font-mono text-[11px] text-slate-300">
                <span className="font-extrabold text-cyan-300 block">Debug Media Information</span>
                <div>Codec Support: <strong className="text-emerald-400">AAC 5.1 / MP3 / WAV 48kHz / Opus</strong></div>
                <div>HTMLMediaElement.audioTracks API: <strong className="text-cyan-300">Supported in Chromium/Edge Core</strong></div>
                <div>App Version: <strong className="text-white">Furina MovieBox v2.5.0 Premium Multi-Dub</strong></div>
              </div>
            </div>
          )}

          {/* 9. SECRET VAULT (MASTER MODE) */}
          {activeSection === 'vault' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2 mb-1">
                  <span>🔒</span> Master Security Vault
                </h3>
                <p className="text-slate-400 text-xs">Unlock collector content and restricted mature streams with master authentication PIN.</p>
              </div>

              {isMasterMode ? (
                <div className="p-5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 text-emerald-200">
                  <div className="flex items-center gap-2 text-sm font-black text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Master Mode is Active</span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-200/80">
                    You have unlocked all uncut master anime collections, ecchi archives, and raw cinema mirrors.
                  </p>
                  <button
                    onClick={handleLockVault}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition cursor-pointer"
                  >
                    Lock Vault Now
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePinSubmit} className="p-5 rounded-2xl bg-[#09142e] border border-cyan-500/20 space-y-3">
                  <label className="block text-xs font-bold text-white">Enter 4-Digit Master PIN</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      maxLength={4}
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••"
                      className="bg-black/60 border border-cyan-500/40 rounded-xl px-3 py-2 text-white tracking-widest text-center font-mono text-sm w-32 focus:outline-none focus:border-cyan-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition cursor-pointer"
                    >
                      Unlock
                    </button>
                  </div>
                  {pinError && (
                    <p className="text-rose-400 text-[11px] font-bold">Incorrect PIN. Please try again.</p>
                  )}
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
