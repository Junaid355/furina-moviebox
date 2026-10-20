import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, FolderPlus, Trash2, Download, Upload, History, Play, 
  CheckCircle2, AlertCircle, Film, Clock, Plus, FolderHeart, X 
} from 'lucide-react';
import {
  getCustomPlaylists,
  createPlaylist,
  deletePlaylist,
  toggleItemInPlaylist,
  getWatchHistory,
  clearWatchHistory,
  exportLibraryBackup,
  importLibraryBackup
} from '../services/playlistService';
import MediaCard from './MediaCard';
import soundFx from '../services/soundFx';

export default function LibraryHub({
  watchlist = [],
  continueWatching = [],
  onPlay,
  onOpenDetails,
  isWatchlisted,
  onToggleWatchlist,
  onClearWatchlist,
  onRemoveContinueWatching,
  onRestoreBackupSuccess
}) {
  const [activeTab, setActiveTab] = useState('watchlist'); // 'watchlist' | 'playlists' | 'history' | 'backup'
  const [playlists, setPlaylists] = useState(getCustomPlaylists);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState(() => getCustomPlaylists()[0]?.id || null);
  const [watchHistory, setWatchHistory] = useState(getWatchHistory);
  const [newListName, setNewListName] = useState('');
  const [newListDesc, setNewListDesc] = useState('');
  const [statusNotice, setStatusNotice] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const syncPlaylists = () => setPlaylists(getCustomPlaylists());
    const syncHistory = () => setWatchHistory(getWatchHistory());
    window.addEventListener('furina:playlists-updated', syncPlaylists);
    window.addEventListener('furina:history-updated', syncHistory);
    return () => {
      window.removeEventListener('furina:playlists-updated', syncPlaylists);
      window.removeEventListener('furina:history-updated', syncHistory);
    };
  }, []);

  const showNotice = (type, text) => {
    setStatusNotice({ type, text });
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleCreatePlaylist = (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    soundFx.playClick?.();
    const updated = createPlaylist(newListName, newListDesc);
    setPlaylists(updated);
    setSelectedPlaylistId(updated[0]?.id || null);
    setNewListName('');
    setNewListDesc('');
    showNotice('success', `Created collection "${newListName.trim()}"`);
  };

  const handleDeletePlaylist = (id, name) => {
    soundFx.playClick?.();
    const updated = deletePlaylist(id);
    setPlaylists(updated);
    if (selectedPlaylistId === id) {
      setSelectedPlaylistId(updated[0]?.id || null);
    }
    showNotice('success', `Deleted collection "${name}"`);
  };

  const handleExportBackup = () => {
    soundFx.playClick?.();
    exportLibraryBackup();
    showNotice('success', 'Exported Watchlist, Collections & Watch History to JSON file.');
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const result = importLibraryBackup(ev.target.result);
        setPlaylists(getCustomPlaylists());
        setWatchHistory(getWatchHistory());
        if (onRestoreBackupSuccess) onRestoreBackupSuccess();
        showNotice(
          'success',
          `Restored ${result.watchlistCount} saved titles, ${result.playlistsCount} collections, and ${result.historyCount} history items.`
        );
      } catch (err) {
        showNotice('error', 'Could not import file. Please select a valid Furina MovieBox backup JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const activePlaylist = playlists.find((p) => p.id === selectedPlaylistId) || playlists[0] || null;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Portability Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-[#060f28]/90 border border-cyan-500/25">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            My Cinema Library & Custom Collections
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Organize your Watchlist, build custom playlists, review watch history, or backup your library JSON
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportBackup}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export Backup JSON</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-[#0a183d] hover:bg-white/10 border border-cyan-500/30 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
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

      {/* Status Notification Banner */}
      {statusNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            statusNotice.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
              : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{statusNotice.text}</span>
          </div>
          <button onClick={() => setStatusNotice(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-cyan-500/15 pb-3">
        {[
          { id: 'watchlist', label: `Saved Watchlist (${watchlist.length})`, icon: Heart },
          { id: 'playlists', label: `Custom Collections (${playlists.length})`, icon: FolderHeart },
          { id: 'history', label: `Watch History (${watchHistory.length})`, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                soundFx.playClick?.();
                setActiveTab(tab.id);
              }}
              className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-[#07112b] text-slate-300 hover:text-white border border-cyan-500/20'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SAVED WATCHLIST */}
      {activeTab === 'watchlist' && (
        <div className="space-y-6">
          { watchlist.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  {watchlist.length} saved titles
                </span>
                {onClearWatchlist && (
                  <button
                    type="button"
                    onClick={onClearWatchlist}
                    className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Watchlist</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                {watchlist.map((item) => (
                  <MediaCard
                    key={`wl-${item.id}`}
                    item={item}
                    onPlay={onPlay}
                    onOpenDetails={onOpenDetails}
                    isWatchlisted={isWatchlisted ? isWatchlisted(item.id) : true}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-[#050c20] border border-cyan-500/15 p-6">
              <Heart className="w-10 h-10 text-cyan-400/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">Your Watchlist is Empty</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Tap the bookmark icon on any movie, anime, or web series card to save it here for instant access.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOM COLLECTIONS / PLAYLISTS */}
      {activeTab === 'playlists' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 4 Columns: Create & Select Playlists */}
          <div className="lg:col-span-4 space-y-4">
            <form
              onSubmit={handleCreatePlaylist}
              className="p-4 rounded-2xl bg-[#060f28] border border-cyan-500/25 space-y-3"
            >
              <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4" />
                <span>Create New Collection</span>
              </h3>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Collection name (e.g. Marvel 4K Marathon)"
                className="w-full min-h-[42px] bg-[#04091a] border border-cyan-500/25 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="text"
                value={newListDesc}
                onChange={(e) => setNewListDesc(e.target.value)}
                placeholder="Optional note or mood description..."
                className="w-full min-h-[40px] bg-[#04091a] border border-cyan-500/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                type="submit"
                className="w-full min-h-[42px] rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Create Collection</span>
              </button>
            </form>

            {/* Playlists List */}
            <div className="space-y-2">
              {playlists.map((pl) => {
                const isSelected = activePlaylist?.id === pl.id;
                return (
                  <div
                    key={pl.id}
                    onClick={() => setSelectedPlaylistId(pl.id)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-[#0a1b42] border-cyan-400 text-white'
                        : 'bg-[#050c20] border-cyan-500/15 text-slate-300 hover:border-cyan-500/40'
                    }`}
                  >
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-white truncate">{pl.name}</h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {pl.items?.length || 0} titles · {pl.description}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePlaylist(pl.id, pl.name);
                      }}
                      title="Delete collection"
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right 8 Columns: Active Playlist Contents */}
          <div className="lg:col-span-8 space-y-4">
            {activePlaylist ? (
              <div className="p-5 rounded-2xl bg-[#050c20] border border-cyan-500/20 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div>
                    <h3 className="text-lg font-black text-white">{activePlaylist.name}</h3>
                    <p className="text-xs text-slate-400">{activePlaylist.description}</p>
                  </div>
                  <span className="text-xs font-mono tabular-nums text-cyan-300">
                    {activePlaylist.items?.length || 0} Titles
                  </span>
                </div>

                {/* Quick Add from Watchlist if Watchlist has items */}
                {watchlist.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Quick-Add from Your Watchlist:
                    </span>
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
                      {watchlist.slice(0, 10).map((wItem) => {
                        const inList = activePlaylist.items?.some((x) => String(x.id) === String(wItem.id));
                        return (
                          <button
                            key={wItem.id}
                            type="button"
                            onClick={() => {
                              const updated = toggleItemInPlaylist(activePlaylist.id, wItem);
                              setPlaylists(updated);
                            }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border whitespace-nowrap shrink-0 transition cursor-pointer ${
                              inList
                                ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
                                : 'bg-[#081534] border-cyan-500/25 text-slate-200 hover:border-cyan-400'
                            }`}
                          >
                            {inList ? '✓ ' : '+ '}
                            {wItem.title || wItem.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activePlaylist.items?.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                    {activePlaylist.items.map((item) => (
                      <MediaCard
                        key={`pl-item-${item.id}`}
                        item={item}
                        onPlay={onPlay}
                        onOpenDetails={onOpenDetails}
                        isWatchlisted={isWatchlisted ? isWatchlisted(item.id) : false}
                        onToggleWatchlist={onToggleWatchlist}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-slate-400">
                    This collection has no titles yet. Use the quick-add buttons above or add titles from the details modal.
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* TAB 3: WATCH HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {watchHistory.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono tabular-nums">
                  Showing {watchHistory.length} recently played streams
                </span>
                <button
                  type="button"
                  onClick={() => {
                    soundFx.playClick?.();
                    clearWatchHistory();
                  }}
                  className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-2.5 sm:gap-3.5">
                {watchHistory.map((item, idx) => (
                  <MediaCard
                    key={`hist-${item.id}-${idx}`}
                    item={item}
                    onPlay={onPlay}
                    onOpenDetails={onOpenDetails}
                    isWatchlisted={isWatchlisted ? isWatchlisted(item.id) : false}
                    onToggleWatchlist={onToggleWatchlist}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center rounded-2xl bg-[#050c20] border border-cyan-500/15 p-6">
              <Clock className="w-10 h-10 text-cyan-400/60 mx-auto mb-3" />
              <h3 className="text-base font-bold text-white mb-1">No Watch History Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Movies, anime, and episodes you stream will automatically appear here so you can pick up right where you left off.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
