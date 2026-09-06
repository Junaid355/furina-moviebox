import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, Share2, PlusSquare, Check, Copy, ExternalLink } from 'lucide-react';

export default function IPhoneAppModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-[#070e24] border border-cyan-500/30 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(56,189,248,0.3)] animate-fade-in flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-cyan-500/20 bg-[#050b1d] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-gray-950 font-black shadow-[0_0_15px_rgba(56,189,248,0.5)]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <span>Install on iPhone / iPad</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">100% Ad-Free</span>
              </h3>
              <p className="text-[11px] text-cyan-200/60">Standalone Fullscreen iOS Web App</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-cyan-300 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 text-xs text-slate-300 max-h-[75vh] overflow-y-auto">
          
          {/* Step-by-Step PWA Install */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[11px]">1</span>
              <span>Install to iPhone Home Screen (PWA)</span>
            </h4>
            
            <div className="space-y-2.5 bg-[#0a1433]/70 p-3.5 rounded-2xl border border-cyan-500/20">
              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Share2 className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Step 1: Tap the Share Button</strong>
                  <span className="text-[11px] text-slate-300">Open this website in <strong>Safari</strong> on your iPhone and tap the <strong>Share icon (⬆️)</strong> at the bottom.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <PlusSquare className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Step 2: Add to Home Screen</strong>
                  <span className="text-[11px] text-slate-300">Scroll down the menu and select <strong>"Add to Home Screen" (➕)</strong>, then tap <strong>"Add"</strong>.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <strong className="text-white text-xs block">Step 3: Launch Native Fullscreen App</strong>
                  <span className="text-[11px] text-slate-300">The <strong>Furina MovieBox</strong> icon will now appear on your home screen! Tap it to launch without Safari address bars.</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ad-Free Protection on iOS */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">2</span>
              <span>100% Zero-Ad Playback on iPhone</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Brave Browser iOS */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/30 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-orange-300 flex items-center justify-between mb-1">
                    <span>Option A: Brave iOS</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Install <strong>Brave Browser</strong> from the App Store. It has a 100% built-in ad shield that blocks every pop-up and iframe ad automatically with zero setup.
                  </p>
                </div>
                <a
                  href="https://apps.apple.com/app/brave-private-web-browser/id1052879175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] font-bold text-orange-300 bg-orange-500/20 py-1.5 px-2 rounded-xl text-center hover:bg-orange-500/30 transition flex items-center justify-center gap-1"
                >
                  <span>Brave App Store ↗</span>
                </a>
              </div>

              {/* Option B: Safari + AdGuard iOS */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-b from-emerald-500/10 to-transparent border border-emerald-500/30 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-300 flex items-center justify-between mb-1">
                    <span>Option B: Safari + AdGuard</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed">
                    Install <strong>AdGuard for Safari</strong> from the App Store. Go to <em>Settings ➔ Safari ➔ Extensions</em> and turn on AdGuard for zero pop-ups in Safari & PWA.
                  </p>
                </div>
                <a
                  href="https://apps.apple.com/app/adguard-adblock-privacy/id1047223162"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 text-[10px] font-bold text-emerald-300 bg-emerald-500/20 py-1.5 px-2 rounded-xl text-center hover:bg-emerald-500/30 transition flex items-center justify-center gap-1"
                >
                  <span>AdGuard App Store ↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Share Link */}
          <div className="pt-2 flex items-center justify-between gap-3 bg-[#0a1433]/50 p-3 rounded-2xl border border-white/5">
            <span className="text-[11px] text-slate-300 truncate">
              {currentUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs transition flex items-center gap-1.5 shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
