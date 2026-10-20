// src/services/playlistService.js
// Manages Custom User Playlists / Collections, Full Watch History, and 1-Click JSON Backup Export/Import.

const PLAYLISTS_KEY = 'furina_custom_playlists_v1';
const HISTORY_KEY = 'furina_watch_history_v1';
const WATCHLIST_KEY = 'furina_moviebox_watchlist';

const DEFAULT_PLAYLISTS = [
  {
    id: 'pl_weekend_4k',
    name: 'Weekend 4K Blockbusters',
    description: 'High-octane IMAX & multi-audio hits for theater night',
    createdAt: 1729000000000,
    items: [
      {
        id: 533535,
        title: 'Deadpool & Wolverine',
        poster_path: '/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg',
        backdrop_path: '/9l1eZiJHmhr5jIlthMdJN5WYoff.jpg',
        media_type: 'movie',
        vote_average: 7.8,
        release_date: '2024-07-24',
        isHindiDubbed: true
      },
      {
        id: 693134,
        title: 'Dune: Part Two',
        poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
        backdrop_path: '/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg',
        media_type: 'movie',
        vote_average: 8.3,
        release_date: '2024-02-27',
        isHindiDubbed: true
      }
    ]
  },
  {
    id: 'pl_hindi_anime',
    name: 'Top Hindi Dubbed Anime',
    description: 'Official studio Hindi dubs & simulcast favorites',
    createdAt: 1729000100000,
    items: [
      {
        id: 127532,
        title: 'Solo Leveling',
        poster_path: '/geCRueV3ElhRTr0xtJuEWJt6dJ1.jpg',
        backdrop_path: '/dfX2UaHVE5c7kLBFbgmEZJuy4Ev.jpg',
        media_type: 'tv',
        category: 'anime',
        isAnime: true,
        vote_average: 8.7,
        first_air_date: '2024-01-07',
        isHindiDubbed: true
      },
      {
        id: 85937,
        title: 'Demon Slayer: Kimetsu no Yaiba',
        poster_path: '/xUfRZu2mi8jH6SzQEJGP6tjBuYj.jpg',
        backdrop_path: '/nTvM4mhqNlHIvUkI1gVnW6XP7GG.jpg',
        media_type: 'tv',
        category: 'anime',
        isAnime: true,
        vote_average: 8.7,
        first_air_date: '2019-04-06',
        isHindiDubbed: true
      }
    ]
  }
];

export function getCustomPlaylists() {
  try {
    const raw = localStorage.getItem(PLAYLISTS_KEY);
    if (!raw) {
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(DEFAULT_PLAYLISTS));
      return DEFAULT_PLAYLISTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_PLAYLISTS;
  } catch {
    return DEFAULT_PLAYLISTS;
  }
}

export function saveCustomPlaylists(lists) {
  try {
    localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(lists));
    window.dispatchEvent(new CustomEvent('furina:playlists-updated', { detail: lists }));
  } catch {}
}

export function createPlaylist(name, description = '') {
  const cleanName = String(name || '').trim();
  if (!cleanName) return getCustomPlaylists();
  const lists = getCustomPlaylists();
  const newList = {
    id: `pl_${Date.now()}`,
    name: cleanName,
    description: String(description || '').trim() || 'Custom collection',
    createdAt: Date.now(),
    items: []
  };
  const updated = [newList, ...lists];
  saveCustomPlaylists(updated);
  return updated;
}

export function deletePlaylist(playlistId) {
  const lists = getCustomPlaylists().filter((p) => p.id !== playlistId);
  saveCustomPlaylists(lists);
  return lists;
}

export function toggleItemInPlaylist(playlistId, item) {
  if (!playlistId || !item || !item.id) return getCustomPlaylists();
  const lists = getCustomPlaylists().map((pl) => {
    if (pl.id !== playlistId) return pl;
    const exists = pl.items.some((x) => String(x.id) === String(item.id));
    const nextItems = exists
      ? pl.items.filter((x) => String(x.id) !== String(item.id))
      : [item, ...pl.items];
    return { ...pl, items: nextItems };
  });
  saveCustomPlaylists(lists);
  return lists;
}

export function getWatchHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function recordWatchHistory(item, extras = {}) {
  if (!item || !item.id) return;
  try {
    const history = getWatchHistory();
    const entry = {
      id: item.id,
      tmdbId: item.tmdbId || item.tmdb_id || (typeof item.id === 'number' ? item.id : null),
      title: item.title || item.name || 'Untitled',
      poster_path: item.poster_path || item.poster || '',
      backdrop_path: item.backdrop_path || item.backdrop || '',
      media_type: item.media_type || item.type || (item.first_air_date ? 'tv' : 'movie'),
      vote_average: item.vote_average || 8.0,
      release_date: item.release_date || item.first_air_date || '',
      isHindiDubbed: Boolean(item.isHindiDubbed || item.hasHindiDub),
      season: extras.season || item.season || 1,
      episode: extras.episode || item.episode || 1,
      serverId: extras.serverId || '',
      audioMode: extras.audioMode || 'hindi',
      watchedAt: Date.now()
    };
    const filtered = history.filter((h) => String(h.id) !== String(item.id));
    const updated = [entry, ...filtered].slice(0, 80);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('furina:history-updated', { detail: updated }));
  } catch {}
}

export function clearWatchHistory() {
  try {
    localStorage.removeItem(HISTORY_KEY);
    window.dispatchEvent(new CustomEvent('furina:history-updated', { detail: [] }));
  } catch {}
}

/**
 * Exports all user library data (Watchlist, Custom Playlists, Continue Watching, Watch History, Settings)
 * into a downloadable JSON backup file.
 */
export function exportLibraryBackup() {
  const continueWatching = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('furina_progress_')) {
        continueWatching[k] = JSON.parse(localStorage.getItem(k) || 'null');
      }
    }
  } catch {}

  let watchlist = [];
  try {
    watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {}

  const payload = {
    app: 'Furina MovieBox',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    watchlist,
    customPlaylists: getCustomPlaylists(),
    watchHistory: getWatchHistory(),
    continueWatching
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `furina-moviebox-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  return payload;
}

/**
 * Imports a previously exported JSON backup file and restores playlists, watchlist, and history.
 */
export function importLibraryBackup(jsonString) {
  const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid backup file format');
  }

  if (Array.isArray(data.watchlist)) {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(data.watchlist));
  }
  if (Array.isArray(data.customPlaylists)) {
    saveCustomPlaylists(data.customPlaylists);
  }
  if (Array.isArray(data.watchHistory)) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(data.watchHistory));
    window.dispatchEvent(new CustomEvent('furina:history-updated', { detail: data.watchHistory }));
  }
  if (data.continueWatching && typeof data.continueWatching === 'object') {
    Object.entries(data.continueWatching).forEach(([key, val]) => {
      if (key.startsWith('furina_progress_') && val) {
        localStorage.setItem(key, JSON.stringify(val));
      }
    });
    window.dispatchEvent(new CustomEvent('furina:progress-updated'));
  }

  return {
    watchlistCount: Array.isArray(data.watchlist) ? data.watchlist.length : 0,
    playlistsCount: Array.isArray(data.customPlaylists) ? data.customPlaylists.length : 0,
    historyCount: Array.isArray(data.watchHistory) ? data.watchHistory.length : 0
  };
}

export function exportBackupJson() {
  const continueWatching = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('furina_progress_')) {
        continueWatching[k] = JSON.parse(localStorage.getItem(k) || 'null');
      }
    }
  } catch {}

  let watchlist = [];
  try {
    watchlist = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || '[]');
  } catch {}

  const payload = {
    app: 'Furina MovieBox',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    watchlist,
    customPlaylists: getCustomPlaylists(),
    watchHistory: getWatchHistory(),
    continueWatching
  };
  return JSON.stringify(payload, null, 2);
}

export function importBackupJson(jsonString) {
  try {
    const stats = importLibraryBackup(jsonString);
    return {
      ok: true,
      message: `Restored ${stats.playlistsCount} playlists, ${stats.watchlistCount} watchlist items, and ${stats.historyCount} history entries.`
    };
  } catch (err) {
    return {
      ok: false,
      message: err?.message || 'Invalid backup JSON file.'
    };
  }
}

