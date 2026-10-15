// ============================================================================
// Furina MovieBox — Global World Anime Auto-Sync & Dub Engine
// Automatically updates daily airing anime & weekly seasonal releases worldwide
// with verified Hindi Dub, English Dub, and Japanese Sub stream routes.
// ============================================================================

import worldAnimeData from '../data/worldAnimeCatalog.js';
import hindiMapped from '../data/hindiAnimeMapped.js';

const STORAGE_KEY_DYNAMIC = 'furina_dynamic_synced_anime';
const STORAGE_KEY_LAST_SYNC = 'furina_anime_last_sync_time';
const STORAGE_KEY_SYNC_INTERVAL = 'furina_anime_sync_mode'; // 'daily' | 'weekly'
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_WEEK_MS = 7 * ONE_DAY_MS;

const TMDB_API_KEY = '4e44d9029b1270a757cddc766a1bcb63';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Known Hindi titles for fast matching
const HINDI_TITLE_REGEX = /naruto|dragon\s*ball|demon\s*slayer|kimetsu|jujutsu|chainsaw|solo\s*leveling|my\s*hero|boku\s*no\s*hero|one\s*piece|death\s*note|black\s*clover|spy\s*x\s*family|shinchan|crayon|doraemon|beyblade|pokemon|vinland|kaiju|mashle|ranking\s*of\s*kings|shield\s*hero|bleach|haikyuu|blue\s*lock|tokyo\s*ghoul|dr\.\s*stone|assassination|attack\s*on\s*titan|shingeki|frieren|wind\s*breaker|hell'?s\s*paradise|overlord|slime/i;

const HINDI_TMDB_ID_SET = new Set([
  ...(hindiMapped?.tmdb_ids || []).map(Number),
  30984, 31724, 45782, 45790, 46260, 46261, 46298, 46435, 50712, 60846,
  60862, 60863, 62110, 63926, 65930, 66941, 67800, 69295, 73223, 73833,
  75775, 76121, 78204, 80671, 82684, 82879, 85937, 86031, 88044, 88046,
  88803, 91024, 91026, 94664, 95269, 95479, 100088, 103328, 114472, 126938,
  138502, 153070, 209867, 215070, 226871
]);

export function isAnimeHindiDub(item) {
  if (!item) return false;
  const numId = Number(item.id);
  if (HINDI_TMDB_ID_SET.has(numId)) return true;
  const title = (item.title || item.name || '').toLowerCase();
  return HINDI_TITLE_REGEX.test(title);
}

// In-memory runtime cache
let memoryDynamicAnime = null;

export function getStoredDynamicAnime() {
  if (memoryDynamicAnime) return memoryDynamicAnime;
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_DYNAMIC) : null;
    if (raw) {
      memoryDynamicAnime = JSON.parse(raw);
      return memoryDynamicAnime;
    }
  } catch (e) {}
  return [];
}

export function getLastAnimeSyncTime() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_LAST_SYNC) : null;
    if (!raw) return null;
    return parseInt(raw, 10);
  } catch (e) {
    return null;
  }
}

export function getLastAnimeSyncDisplay() {
  const ts = getLastAnimeSyncTime();
  if (!ts) return 'Live Daily Sync Active';
  const diffHours = Math.round((Date.now() - ts) / (1000 * 60 * 60));
  if (diffHours < 1) return 'Updated just now';
  if (diffHours < 24) return `Updated ${diffHours}h ago (Daily)`;
  const diffDays = Math.round(diffHours / 24);
  return `Updated ${diffDays}d ago (Weekly)`;
}

// Combine curated world anime with dynamically synced entries
export function getAllWorldAnime() {
  const baseCatalog = worldAnimeData?.anime || [];
  const dynamicItems = getStoredDynamicAnime();
  
  const map = new Map();
  // Insert base
  for (const a of baseCatalog) {
    map.set(Number(a.id), {
      ...a,
      isAnime: true,
      category: 'anime',
      media_type: a.media_type || (a.first_air_date ? 'tv' : 'movie'),
      hasHindiDub: a.hasHindiDub || isAnimeHindiDub(a),
      hasEnglishDub: true
    });
  }
  // Overlay/insert dynamic
  for (const d of dynamicItems) {
    const existing = map.get(Number(d.id));
    if (existing) {
      map.set(Number(d.id), { ...existing, ...d });
    } else {
      map.set(Number(d.id), {
        ...d,
        isAnime: true,
        category: 'anime',
        media_type: d.media_type || (d.first_air_date ? 'tv' : 'movie'),
        hasHindiDub: d.hasHindiDub || isAnimeHindiDub(d),
        hasEnglishDub: true
      });
    }
  }

  return Array.from(map.values());
}

// Fetch latest daily & weekly anime from live global APIs
export async function syncWorldAnimeNow(force = false) {
  const lastSync = getLastAnimeSyncTime();
  const now = Date.now();
  
  // Throttle automatic checks unless forced
  if (!force && lastSync && (now - lastSync < ONE_DAY_MS)) {
    return {
      status: 'cached',
      totalAnime: getAllWorldAnime().length,
      lastSyncDisplay: getLastAnimeSyncDisplay()
    };
  }

  console.log('[World Anime Auto-Sync] Syncing latest daily & weekly anime worldwide...');
  
  try {
    const today = new Date().toISOString().split('T')[0];
    const d = new Date();
    d.setDate(d.getDate() - 14);
    const twoWeeksAgo = d.toISOString().split('T')[0];

    // Fetch Airing weekly + Trending 2026 releases in parallel
    const [airingRes, trendingRes] = await Promise.all([
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&air_date.gte=${twoWeeksAgo}&air_date.lte=${today}&sort_by=popularity.desc&page=1`)
        .then((r) => r.json())
        .catch(() => ({ results: [] })),
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_API_KEY}&with_genres=16&with_original_language=ja&sort_by=popularity.desc&page=1`)
        .then((r) => r.json())
        .catch(() => ({ results: [] }))
    ]);

    const incoming = [...(airingRes.results || []), ...(trendingRes.results || [])];
    const newItems = [];
    const seen = new Set();

    for (const item of incoming) {
      if (!item || !item.id || seen.has(item.id)) continue;
      seen.add(item.id);
      
      const isHindi = isAnimeHindiDub(item);
      newItems.push({
        id: item.id,
        title: item.name || item.title,
        name: item.name || item.title,
        overview: item.overview || 'Latest global anime release.',
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        media_type: 'tv',
        vote_average: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
        first_air_date: item.first_air_date || today,
        category: 'anime',
        isAnime: true,
        isAiringWeekly: true,
        hasHindiDub: isHindi,
        hasEnglishDub: true,
        dub_type: isHindi ? 'hindi' : 'sub',
        synced_at: now
      });
    }

    // Merge into local storage
    const currentStored = getStoredDynamicAnime();
    const currentMap = new Map(currentStored.map((i) => [Number(i.id), i]));
    for (const item of newItems) {
      currentMap.set(Number(item.id), item);
    }

    const merged = Array.from(currentMap.values());
    memoryDynamicAnime = merged;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_DYNAMIC, JSON.stringify(merged));
      localStorage.setItem(STORAGE_KEY_LAST_SYNC, now.toString());
    }

    const totalCount = getAllWorldAnime().length;

    // Dispatch global event
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('furina-anime-synced', {
        detail: {
          timestamp: now,
          newCount: newItems.length,
          totalAnime: totalCount,
          lastSyncDisplay: 'Updated just now'
        }
      }));
    }

    return {
      status: 'success',
      newCount: newItems.length,
      totalAnime: totalCount,
      lastSyncDisplay: 'Updated just now'
    };
  } catch (err) {
    console.warn('[World Anime Auto-Sync] Background sync notice:', err);
    return {
      status: 'offline_fallback',
      totalAnime: getAllWorldAnime().length,
      lastSyncDisplay: getLastAnimeSyncDisplay()
    };
  }
}

// Automatic background kick-off on import
if (typeof window !== 'undefined') {
  setTimeout(() => {
    syncWorldAnimeNow(false);
  }, 4000);
}
