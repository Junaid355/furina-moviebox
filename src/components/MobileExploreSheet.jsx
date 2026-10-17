import React from 'react';
import { 
  X, Flame, Film, Tv, Sparkles, Skull, Heart, Radio, Milestone, 
  Users, Smartphone, Settings, Shield, Volume2, VolumeX, FolderHeart 
} from 'lucide-react';
import { HanimeIcon } from './Navbar';
import soundFx from '../services/soundFx';

export default function MobileExploreSheet({
  isOpen,
  onClose,
  activeCategory,
  onSelectCategory,
  isMasterMode,
  isMuted,
  onToggleMute,
  onOpenSettings,
  onOpenStudio,
  onOpenTimeline,
  onOpenWatchTogether,
  onOpenAndroidModal,
  onOpenIPhoneModal
}) {
  if (!isOpen) return null;

  const categories = [
    { id: 'trending', label: 'Trending Worldwide', desc: 'Top 4K movies & series', icon: Flame },
    { id: 'moviebox', label: 'MovieBox Hub', desc: 'Multi-dub & 4K remastered', icon: Film },
    { id: 'livetv', label: '24/7 Live TV', desc: '6 live broadcast channels', icon: Radio },
    { id: 'new_movies', label: 'New Releases', desc: 'Latest theatrical drops', icon: Sparkles },
    { id: 'hollywood', label: 'Hollywood Cinema', desc: 'English & Hindi blockbusters', icon: Film },
    { id: 'hindi', label: 'Bollywood & Hindi', desc: 'Native Hindi & South dubs', icon: Sparkles },
    { id: 'anime', label: 'Anime Vault', desc: 'Simulcast Sub, EN & Hindi Dub', icon: Sparkles },
    { id: 'kdrama', label: 'K-Drama Wave', desc: 'Korean series in Hindi/EN', icon: Tv },
    { id: 'series', label: 'Web Series', desc: 'Global binge-worthy shows', icon: Tv },
    { id: 'horror', label: 'Horror & Thriller', desc: 'Supernatural & suspense', icon: Skull },
    { id: 'watchlist', label: 'Library & Playlists', desc: 'Saved, collections & backup', icon: FolderHeart },
    ...(isMasterMode
      ? [
          { id: 'mature', label: 'Uncut Vault', desc: 'Master cinema collection', icon: Flame, isVault: true },
          { id: 'ecchi_anime', label: 'Hanime Vault', desc: 'Uncut anime collection', icon: HanimeIcon, isVault: true }
        ]
      : [])
  ];

  const handlePickCategory = (catId) => {
    soundFx.playClick?.();
    onSelectCategory(catId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 md:hidden bg-black/75 backdrop-blur-sm flex flex-col justify-end animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-h-[84vh] bg-[#050c20] border-t border-cyan-500/30 rounded-t-3xl flex flex-col overflow-hidden shadow-[0_-15px_50px_rgba(0,0,0,0.9)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle & Sheet Header */}
        <div className="pt-3 pb-2 px-5 border-b border-white/10 shrink-0">
          <div className="w-10 h-1.5 bg-slate-600 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-white">Explore Categories & Tools</h3>
              <p className="text-[11px] text-slate-400">Jump to any genre, live channel, or cinema feature</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close explore menu"
              className="min-h-[44px] min-w-[44px] rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Sheet Body */}
        <div className="p-4 overflow-y-auto space-y-5 pb-8">
          {/* Categories Grid */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-2.5 px-1">
              Cinema Categories
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handlePickCategory(cat.id)}
                    className={`min-h-[56px] p-3 rounded-2xl border text-left flex items-center gap-2.5 transition ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400 text-white'
                        : cat.isVault
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-[#081330] border-cyan-500/15 text-slate-200 active:scale-[0.98]'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-[#040a1c] text-cyan-400 border border-cyan-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">{cat.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{cat.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive Cinema Features */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-2.5 px-1">
              Interactive Cinema Features
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenTimeline && onOpenTimeline();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-[#081330] border border-purple-500/25 text-left flex items-center gap-2.5 text-slate-200"
              >
                <Milestone className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Franchise Timelines</div>
                  <div className="text-[10px] text-slate-400 truncate">MCU, Anime, Star Wars</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenWatchTogether && onOpenWatchTogether();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-[#081330] border border-cyan-500/25 text-left flex items-center gap-2.5 text-slate-200"
              >
                <Users className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Watch Together</div>
                  <div className="text-[10px] text-slate-400 truncate">Sync room with friends</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenStudio && onOpenStudio();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-[#081330] border border-emerald-500/25 text-left flex items-center gap-2.5 text-slate-200"
              >
                <Film className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">Movie Studio</div>
                  <div className="text-[10px] text-slate-400 truncate">Custom streams & audio</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenSettings && onOpenSettings();
                }}
                className="min-h-[52px] p-3 rounded-2xl bg-[#081330] border border-cyan-500/25 text-left flex items-center gap-2.5 text-slate-200"
              >
                {isMasterMode ? (
                  <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <Settings className="w-4 h-4 text-cyan-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {isMasterMode ? 'VIP Settings Active' : 'App Settings'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Audio, subtitles & vault</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAndroidModal && onOpenAndroidModal();
                }}
                className="min-h-[48px] p-3 rounded-2xl bg-[#081330] border border-white/10 text-left flex items-center gap-2.5 text-slate-200"
              >
                <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-semibold truncate">Android App Guide</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenIPhoneModal && onOpenIPhoneModal();
                }}
                className="min-h-[48px] p-3 rounded-2xl bg-[#081330] border border-white/10 text-left flex items-center gap-2.5 text-slate-200"
              >
                <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-xs font-semibold truncate">iPhone / iOS Guide</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
