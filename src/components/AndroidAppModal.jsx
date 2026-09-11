import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react';

export default function AndroidAppModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [canDirectInstall, setCanDirectInstall] = useState(Boolean(window.deferredInstallPrompt));
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    const handleCanInstall = () => setCanDirectInstall(true);
    window.addEventListener('furina:can-install', handleCanInstall);
    return () => window.removeEventListener('furina:can-install', handleCanInstall);
  }, []);

  const handleInstallClick = async () => {
    if (window.deferredInstallPrompt) {
      try {
        window.deferredInstallPrompt.prompt();
        const choice = await window.deferredInstallPrompt.userChoice;
        if (choice && choice.outcome === 'accepted') {
          setInstalled(true);
        }
        window.deferredInstallPrompt = null;
        setCanDirectInstall(false);
      } catch (e) {}
    } else {
      alert("To install on Android: Tap the 3 vertical dots in your browser and choose 'Install app' or 'Add to Home screen'.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in select-none"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-[#070e24] border border-cyan-500/35 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.35)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091538] via-[#0d1d4d] to-[#091538] border-b border-cyan-500/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-cyan-500/40">
                  Android & Mobile App
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-500/40">
                  Standalone PWA
                </span>
              </div>
              <h3 className="font-extrabold text-base text-white mt-0.5">
                Furina MovieBox for Android
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4 font-black" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Main 1-Tap Install Box */}
          <div className="bg-gradient-to-br from-cyan-950/60 to-blue-950/40 border border-cyan-500/40 rounded-xl p-4 shadow-lg">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="font-black text-sm text-cyan-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  1-Tap Instant Install on Android
                </h4>
                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  Installs directly to your home screen with a dedicated app icon, ultra-fast 60 FPS scrolling, fullscreen cinema player, and zero browser address bar!
                </p>
              </div>
            </div>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-400 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs sm:text-sm transition shadow-[0_0_20px_rgba(56,189,248,0.5)] transform hover:scale-[1.02] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              {installed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Installed to Home Screen!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>{canDirectInstall ? 'Install Native Android App Now' : 'Add to Android Home Screen'}</span>
                </>
              )}
            </button>
          </div>

          {/* Android Manual Install Steps if prompt not auto-triggered */}
          <div className="bg-[#050b1d] border border-cyan-500/20 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-cyan-300 text-[11px] block">
              📱 Manual Install in Chrome / Samsung Internet:
            </span>
            <ol className="space-y-1 text-slate-300 text-[11px] list-decimal list-inside leading-relaxed">
              <li>Open <strong>Furina MovieBox</strong> in Chrome or Samsung Internet.</li>
              <li>Tap the <strong>three vertical dots (⋮)</strong> in the top-right corner.</li>
              <li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li>
              <li>The standalone app icon will appear directly in your app drawer!</li>
            </ol>
          </div>

          {/* Native Android APK Wrapper Source Info */}
          <div className="bg-[#050b1d] border border-cyan-500/20 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-emerald-300 text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Full Android Studio Wrapper Source Included
            </span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              The complete native Android Studio Gradle project is packaged inside the repository under <code className="bg-black/50 text-cyan-300 px-1 py-0.5 rounded">/android</code> with hardware-accelerated WebView, Android DownloadManager, and smart back navigation.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#050b1d] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300/80 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Zero Permissions • Safe & Clean
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
