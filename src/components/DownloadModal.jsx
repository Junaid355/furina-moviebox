import React, { useState } from 'react';
import { Download, X, Copy, Check, ExternalLink, Smartphone, Sparkles, Shield, AlertCircle, Film, Tv, CheckCircle2, Loader2 } from 'lucide-react';
import { getDownloadMirrors } from '../services/streaming';
import { POSTER_THUMB_BASE } from '../services/tmdb';

export default function DownloadModal({
  isOpen,
  onClose,
  item,
  season = 1,
  episode = 1,
  audioMode = 'english',
  isSeries = false,
  activeCustomVideoUrl = null
}) {
  if (!isOpen || !item) return null;

  const title = item.title || item.name || 'Title';
  const isCustom = Boolean(item.isCustom);
  const mirrors = getDownloadMirrors(item.id, isSeries ? 'tv' : 'movie', season, episode, audioMode);
  
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [copied, setCopied] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState('android');
  
  // Custom video blob download state
  const [customDownloadState, setCustomDownloadState] = useState({
    status: 'idle', // 'idle' | 'downloading' | 'completed' | 'error'
    progress: 0,
    errorMsg: ''
  });

  const posterSrc = item.poster_path 
    ? (item.poster_path.startsWith('http') ? item.poster_path : `${POSTER_THUMB_BASE}${item.poster_path}`)
    : './icon-512.png';

  const currentStreamUrl = mirrors[0]?.url || '';

  const handleCopyLink = () => {
    const urlToCopy = activeCustomVideoUrl || currentStreamUrl;
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(urlToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  const handleCustomBlobDownload = () => {
    if (!activeCustomVideoUrl) return;
    const cleanTitle = (title || 'movie').replace(/[^a-zA-Z0-9_-]/g, '_');
    const filename = `${cleanTitle}_${selectedQuality}_${audioMode}.mp4`;
    setCustomDownloadState({ status: 'downloading', progress: 25, errorMsg: '' });

    try {
      // 1. Trigger direct browser download via anchor element
      const a = document.createElement('a');
      a.href = activeCustomVideoUrl;
      a.download = filename;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 1000);

      setCustomDownloadState({ status: 'completed', progress: 100, errorMsg: '' });
      setTimeout(() => {
        setCustomDownloadState({ status: 'idle', progress: 0, errorMsg: '' });
      }, 3500);
    } catch (e) {
      // Fallback: open URL directly
      window.open(activeCustomVideoUrl, '_blank');
      setCustomDownloadState({ status: 'completed', progress: 100, errorMsg: '' });
      setTimeout(() => {
        setCustomDownloadState({ status: 'idle', progress: 0, errorMsg: '' });
      }, 3500);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100000] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-[#070e24] border border-cyan-500/35 rounded-2xl shadow-[0_0_60px_rgba(6,182,212,0.3)] overflow-hidden text-white my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-[#091538] via-[#0d1d4d] to-[#091538] border-b border-cyan-500/25 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-16 rounded-lg overflow-hidden shrink-0 border border-cyan-500/40 bg-black">
              <img src={posterSrc} alt={title} className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-cyan-500/40">
                  {isSeries ? `S${season}:E${episode}` : 'Movie'}
                </span>
                {audioMode === 'hindi' && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-500/40">
                    🇮🇳 Hindi Audio
                  </span>
                )}
                {audioMode === 'english' && (
                  <span className="bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-blue-500/40">
                    🎙️ English Dub
                  </span>
                )}
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-white truncate mt-1">
                {title}
              </h3>
              <p className="text-[11px] text-cyan-200/60">
                High-Speed Cloud Download Hub & Mobile Stream Saver
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition shrink-0"
            title="Close Download Hub"
          >
            <X className="w-4 h-4 font-black" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          
          {/* Quality Selector */}
          <div>
            <label className="block text-xs font-bold text-cyan-200/80 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Select Download Quality:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { id: '4k', label: '💎 4K UHD', sub: '2160p Master' },
                { id: '1080p', label: '🎬 1080p FHD', sub: 'Recommended' },
                { id: '720p', label: '📱 720p HD', sub: 'Mobile Fast' },
                { id: '480p', label: '⚡ 480p Saver', sub: 'Data Friendly' },
              ].map((q) => (
                <button
                  key={q.id}
                  onClick={() => setSelectedQuality(q.id)}
                  className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                    selectedQuality === q.id
                      ? 'bg-gradient-to-r from-cyan-500/30 to-blue-600/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                      : 'bg-[#0a1433] border-cyan-500/20 text-slate-300 hover:border-cyan-500/40'
                  }`}
                >
                  <span className="font-extrabold text-xs text-white">{q.label}</span>
                  <span className="text-[10px] text-cyan-300/70 mt-0.5">{q.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Video Direct Download (if Studio Content) */}
          {isCustom && activeCustomVideoUrl && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3.5 flex items-center justify-between gap-3">
              <div>
                <span className="font-bold text-emerald-300 text-xs flex items-center gap-1.5">
                  <Film className="w-3.5 h-3.5" />
                  Studio Master Direct File
                </span>
                <p className="text-[11px] text-emerald-200/70 mt-0.5">
                  Direct high-speed MP4 download saved straight to your device storage.
                </p>
              </div>
              <button
                onClick={handleCustomBlobDownload}
                disabled={customDownloadState.status === 'downloading'}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-gray-950 font-black text-xs transition shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {customDownloadState.status === 'downloading' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{customDownloadState.progress}%</span>
                  </>
                ) : customDownloadState.status === 'completed' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Save MP4</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Catalog Stream Notice */}
          {!isCustom && (
            <div className="bg-cyan-500/10 border border-cyan-500/25 rounded-xl p-3 text-xs text-cyan-200/80 leading-relaxed flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-cyan-300">Catalog Media Cloud Protection:</span>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Direct raw MP4 downloads are provided for Studio Master & Owned titles. For this catalog title, use the verified backup mirrors below or copy the direct stream link into mobile downloaders (1DM / ADM / VLC) to save offline.
                </p>
              </div>
            </div>
          )}

          {/* Fast Working Stream & Download Mirrors */}
          <div>
            <label className="block text-xs font-bold text-cyan-200/80 mb-2 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-cyan-400" />
              <span>Verified Fast Streaming & Video Mirrors:</span>
            </label>
            <div className="space-y-2">
              {mirrors.map((mirror) => (
                <div 
                  key={mirror.id}
                  className="bg-[#0b1638] border border-cyan-500/20 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-cyan-400/40 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white truncate">{mirror.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.2 rounded border ${mirror.color}`}>
                        {mirror.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-cyan-300/60 block mt-0.5">
                      Quality: {selectedQuality} • High Speed CDN Mirror
                    </span>
                  </div>

                  <a
                    href={mirror.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-gray-950 font-black text-xs transition shadow flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <span>Open Mirror</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Dedicated Mobile Download Center */}
          <div className="bg-[#091538] border border-cyan-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <h4 className="font-bold text-xs text-white">
                  📱 Mobile Quick Download Center
                </h4>
              </div>
              <span className="text-[10px] font-bold text-cyan-300/80 bg-cyan-500/15 px-2 py-0.5 rounded-full border border-cyan-500/30">
                iPhone & Android
              </span>
            </div>

            {/* 1-Tap Copy Direct Stream URL for Mobile Downloader Apps */}
            <div className="bg-[#050b1d] border border-cyan-500/25 rounded-xl p-2.5 flex items-center justify-between gap-2 mb-3">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-cyan-300/80 font-bold block mb-0.5">
                  Stream URL (For 1DM, ADM, or VLC):
                </span>
                <p className="text-[11px] text-slate-300 font-mono truncate">
                  {activeCustomVideoUrl || currentStreamUrl}
                </p>
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 hover:text-white border border-cyan-400/40 text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Mobile Instructions Tabs (Android vs iOS) */}
            <div>
              <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-1.5 mb-2.5">
                <button
                  onClick={() => setActiveMobileTab('android')}
                  className={`text-xs font-bold pb-1 transition cursor-pointer ${
                    activeMobileTab === 'android'
                      ? 'text-cyan-300 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Android (Chrome / 1DM)
                </button>
                <button
                  onClick={() => setActiveMobileTab('ios')}
                  className={`text-xs font-bold pb-1 transition cursor-pointer ${
                    activeMobileTab === 'ios'
                      ? 'text-cyan-300 border-b-2 border-cyan-400'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  iPhone / iPad (Safari)
                </button>
              </div>

              {activeMobileTab === 'android' ? (
                <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed bg-[#050c20] p-2.5 rounded-lg border border-cyan-500/15">
                  <p>1. Tap any <strong>Download Mirror</strong> above to open the video.</p>
                  <p>2. Tap the <strong>3 vertical dots (⋮)</strong> on the video player and choose <strong>Download</strong>.</p>
                  <p>3. Or tap <strong>Copy Link</strong> above and paste into <strong>1DM</strong> or <strong>ADM</strong> for 5x faster downloads directly into your gallery!</p>
                </div>
              ) : (
                <div className="text-[11px] text-slate-300 space-y-1 leading-relaxed bg-[#050c20] p-2.5 rounded-lg border border-cyan-500/15">
                  <p>1. Tap any <strong>Download Mirror</strong> above in Safari.</p>
                  <p>2. Long-press on the video player or tap the <strong>Safari Share</strong> icon.</p>
                  <p>3. Tap <strong>Save to Files</strong> or <strong>Download Linked File</strong> to save offline!</p>
                  <p>4. Or paste the copied link into the free <strong>Documents by Readdle</strong> or <strong>VLC</strong> app.</p>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#050b1d] border-t border-cyan-500/20 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-cyan-300/80">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            Ad-Safe & Direct CDN Link
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}