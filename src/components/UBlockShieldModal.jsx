import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, ShieldAlert, Shield, Power, X, Zap, 
  CheckCircle2, AlertTriangle, RefreshCw, Sparkles, 
  Lock, Activity, Sliders, ChevronRight, Play, Eye
} from 'lucide-react';
import { 
  getBlockedCount, resetBlockedCount, isAdBlockEnabled, 
  setShieldEnabled, getShieldMode, setShieldMode, 
  simulateBlockedAd, getRecentBlockedLogs 
} from '../services/adblocker';
import { isAutoAiServerEnabled, setAutoAiServerEnabled } from '../services/aiServerSelector';
import soundFx from '../services/soundFx';

export default function UBlockShieldModal({ isOpen, onClose, onRunAiServerBenchmark, currentServer }) {
  if (!isOpen) return null;

  const [shieldActive, setShieldActive] = useState(() => isAdBlockEnabled());
  const [currentMode, setCurrentMode] = useState(() => getShieldMode());
  const [blockedCount, setBlockedCount] = useState(() => getBlockedCount());
  const [autoAiServer, setAutoAiServer] = useState(() => isAutoAiServerEnabled());
  const [recentLogs, setRecentLogs] = useState(() => getRecentBlockedLogs());
  const [simFeedback, setSimFeedback] = useState('');

  useEffect(() => {
    const handleBlocked = (e) => {
      setBlockedCount(e.detail?.count || getBlockedCount());
      setRecentLogs(getRecentBlockedLogs());
    };
    const handleShieldMode = (e) => {
      setCurrentMode(e.detail?.mode || getShieldMode());
    };
    window.addEventListener('furina-ad-blocked', handleBlocked);
    window.addEventListener('furina-shield-mode-changed', handleShieldMode);
    return () => {
      window.removeEventListener('furina-ad-blocked', handleBlocked);
      window.removeEventListener('furina-shield-mode-changed', handleShieldMode);
    };
  }, []);

  const handleToggleShield = () => {
    const nextVal = !shieldActive;
    setShieldActive(nextVal);
    setShieldEnabled(nextVal);
    soundFx.playClick();
  };

  const handleChangeMode = (mode) => {
    setCurrentMode(mode);
    setShieldMode(mode);
    soundFx.playClick();
  };

  const handleToggleAutoAiServer = () => {
    const nextVal = !autoAiServer;
    setAutoAiServer(nextVal);
    setAutoAiServerEnabled(nextVal);
    soundFx.playClick();
  };

  const handleTestTrap = () => {
    soundFx.playSearchBeam();
    simulateBlockedAd('popup');
    setSimFeedback('🛡️ Ad Trap Triggered! 1 rogue popup intercepted.');
    setTimeout(() => setSimFeedback(''), 3000);
  };

  const handleResetCount = () => {
    resetBlockedCount();
    setBlockedCount(0);
    soundFx.playClick();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#070e24] border border-cyan-500/40 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.35)] overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-cyan-500/25 bg-gradient-to-r from-[#081330] via-[#091b42] to-[#081330]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white tracking-wide">FURINA AD-SHIELD PRO</h3>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 font-bold uppercase">
                  uBlock Engine
                </span>
              </div>
              <p className="text-[10px] text-cyan-200/70">Built-in anti-popunder, anti-redirect & clickjack shield</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Close Ad-Shield HUD"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* 1. Large uBlock-Style Power Button & Status */}
          <div className="flex flex-col items-center justify-center py-4 px-3 bg-gradient-to-b from-[#0a1838] to-[#070e24] rounded-2xl border border-cyan-500/20 relative overflow-hidden">
            {/* Background Glow */}
            <div 
              className={`absolute inset-0 transition-opacity duration-500 pointer-events-none ${
                shieldActive 
                  ? 'bg-radial-gradient from-cyan-500/15 via-transparent to-transparent opacity-100' 
                  : 'opacity-0'
              }`} 
            />

            <button
              onClick={handleToggleShield}
              aria-label={shieldActive ? "Deactivate Furina Ad-Shield" : "Activate Furina Ad-Shield"}
              className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 cursor-pointer border-4 ${
                shieldActive
                  ? 'bg-gradient-to-tr from-cyan-600 to-blue-500 border-cyan-300 text-gray-950 shadow-[0_0_35px_rgba(6,182,212,0.7)] hover:scale-105'
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500 hover:text-slate-300'
              }`}
            >
              <Power className={`w-10 h-10 stroke-[2.5] ${shieldActive ? 'text-gray-950 animate-pulse' : 'text-slate-500'}`} />
            </button>

            <span className={`mt-3 text-xs font-black tracking-wider uppercase ${
              shieldActive ? 'text-cyan-300' : 'text-slate-500'
            }`}>
              {shieldActive ? '🛡️ Protection Active' : '⚠️ Protection Paused'}
            </span>
            <span className="text-[11px] text-slate-400 text-center max-w-xs mt-0.5">
              {shieldActive 
                ? 'Zero popup ads, scam redirects or clickjacking overlays reach your browser' 
                : 'Ad-Shield is turned off. Third-party embeds may trigger unsolicited popups.'}
            </span>
          </div>

          {/* 2. Blocked Counter HUD */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#091530] border border-cyan-500/25 flex flex-col">
              <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-wider">Intercepted Threats</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-cyan-300 font-mono tracking-tight">{blockedCount}</span>
                <span className="text-[10px] text-slate-400">popups blocked</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium mt-1">✓ 100% neutralized</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#091530] border border-cyan-500/25 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-cyan-300/80 uppercase tracking-wider">Active Mirror</span>
                <div className="text-xs font-bold text-white truncate mt-1">
                  {currentServer?.shortName || '[ Server 1 ] AutoEmbed'}
                </div>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">
                {currentServer?.badge || '1080p Ultra Fast'}
              </span>
            </div>
          </div>

          {/* 3. Shield Mode Selector: Smart vs Strict */}
          <div className="p-4 rounded-2xl bg-[#091636] border border-cyan-500/25 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Protection Engine Mode</span>
              </span>
              <span className="text-[10px] text-cyan-300 font-mono uppercase bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/30">
                {currentMode === 'smart' ? 'Smart Mode (Recommended)' : 'Strict Sandbox Mode'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Smart Shield Mode (Default & Safe) */}
              <button
                type="button"
                onClick={() => handleChangeMode('smart')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  currentMode === 'smart'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-cyan-300">✨ Smart Shield Mode</span>
                  {currentMode === 'smart' && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Traps 100% popups & redirects in parent. <strong>Fixes 'Playback blocked'</strong> error on AutoEmbed and other servers!
                </p>
              </button>

              {/* Strict Sandbox Mode */}
              <button
                type="button"
                onClick={() => handleChangeMode('strict')}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  currentMode === 'strict'
                    ? 'bg-amber-500/15 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                    : 'bg-black/30 border-white/5 text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black text-amber-300">🔒 Strict Sandbox</span>
                  {currentMode === 'strict' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                </div>
                <p className="text-[10px] text-slate-300 leading-tight">
                  Enforces HTML5 sandbox tag. <em>Warning: Some embeds (AutoEmbed) reject sandbox and show red error.</em>
                </p>
              </button>
            </div>
          </div>

          {/* 4. AI Auto-Select Best Server Option */}
          <div className="p-4 rounded-2xl bg-[#091636] border border-cyan-500/25 flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Auto-Select Best Server</span>
              </span>
              <p className="text-[10px] text-slate-300">
                Automatically benchmarks latency & ad reputation to join the cleanest mirror.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoAiServer}
                onChange={handleToggleAutoAiServer}
                className="w-4 h-4 accent-cyan-400 cursor-pointer"
                aria-label="Toggle AI Auto-Select Server"
              />
              {onRunAiServerBenchmark && (
                <button
                  type="button"
                  onClick={() => {
                    onRunAiServerBenchmark();
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[10px] font-bold transition cursor-pointer shrink-0"
                >
                  ⚡ Run AI Test
                </button>
              )}
            </div>
          </div>

          {/* 5. Live Protection Rules Matrix */}
          <div className="p-4 rounded-2xl bg-[#08122c] border border-cyan-500/20 space-y-2">
            <span className="text-[11px] font-extrabold text-cyan-300/80 uppercase tracking-wider block">
              Active uBlock Protection Rules
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 text-slate-300 bg-black/40 p-2 rounded-xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Anti-Popunder Trap</div>
                  <div className="text-[9px] text-slate-400">Blocks window.open() scam tabs</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 bg-black/40 p-2 rounded-xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Scam Top-Redirect Guard</div>
                  <div className="text-[9px] text-slate-400">Protects top.location navigation</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 bg-black/40 p-2 rounded-xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">Clickjack Neutralizer</div>
                  <div className="text-[9px] text-slate-400">Suppresses invisible overlays</div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-300 bg-black/40 p-2 rounded-xl border border-white/5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-white text-[11px]">AI Clean Routing</div>
                  <div className="text-[9px] text-slate-400">Filters 4K streams via fast CDNs</div>
                </div>
              </div>
            </div>
          </div>

          {/* 6. Test & Reset Controls */}
          {simFeedback && (
            <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{simFeedback}</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1">
            <button
              type="button"
              onClick={handleTestTrap}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Test Ad-Shield Trap</span>
            </button>

            <button
              type="button"
              onClick={handleResetCount}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white font-medium text-xs transition cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Counter</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-cyan-500/20 bg-[#060c20] text-center text-[10px] text-slate-400">
          <span>Protected by Furina MovieBox • No external browser extensions needed ✨</span>
        </div>
      </div>
    </div>
  );
}
