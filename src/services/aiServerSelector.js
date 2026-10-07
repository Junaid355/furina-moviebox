// src/services/aiServerSelector.js
// Furina smart server selector.
// Ranking comes from real browser tests (Oct 2026) plus a live reachability probe
// run in the user's own browser. No invented latency numbers.

// tier: lower = better. Based on a real-browser render test of Avengers: Endgame (299534):
//  1 = player rendered with poster + play button
//  2 = player shell rendered (source picker / loading UI) but slower or ad-heavier
//  3 = blank frame or embed-side error in testing
export const SERVER_PROFILES = {
  nxsha:             { tier: 1, badge: 'Multi-Dub • Clean Ads', adLevel: 'Clean', hindi: true },
  vidstuck:          { tier: 1, badge: 'Hindi Dub • Subtitles', adLevel: 'Clean', hindi: true },
  vidfast:           { tier: 1, badge: '4K Ultra • AutoPlay', adLevel: 'Clean', hindi: false },
  bingr:             { tier: 1, badge: 'Fast Stream • Lightweight', adLevel: 'Clean', hindi: false },
  twoembed_vip:      { tier: 1, badge: 'VIP Cinema Stream', adLevel: 'Low', hindi: false },
  vidsrc_to:         { tier: 1, badge: 'Cinema Master', adLevel: 'Low', hindi: false },
  tgvid:             { tier: 1, badge: 'Multi-Dub Cinema', adLevel: 'Clean', hindi: true },
  animeworld_india:  { tier: 1, badge: 'High-Speed CDN', adLevel: 'Low', hindi: true },
  vidlink:           { tier: 1, badge: 'Multi-Audio Pro', adLevel: 'Medium', hindi: false },
  one23embed:        { tier: 2, badge: 'Multi-Source 1080p', adLevel: 'Medium', hindi: true },
  smashy:            { tier: 2, badge: 'Auto Source Hunt', adLevel: 'Medium', hindi: true },
  autoembed:         { tier: 3, badge: 'Fallback Mirror', adLevel: 'Medium', hindi: true }
};

const DEFAULT_PROFILE = { tier: 2, badge: 'HD Mirror', adLevel: 'Unknown', hindi: false };
const HEALTH_KEY = 'furina_server_health_v2';
const HEALTH_TTL = 10 * 60 * 1000;
const FAIL_KEY = 'furina_server_fails_v1';

export function isAutoAiServerEnabled() {
  try {
    const saved = localStorage.getItem('furina_auto_ai_server');
    return saved === null ? true : saved === 'true';
  } catch (e) {
    return true;
  }
}

export function setAutoAiServerEnabled(enabled) {
  try {
    localStorage.setItem('furina_auto_ai_server', enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('furina-auto-server-changed', { detail: { enabled } }));
  } catch (e) {}
}

function readJson(storage, key) {
  try { return JSON.parse(storage.getItem(key) || '{}') || {}; } catch (e) { return {}; }
}

function writeJson(storage, key, value) {
  try { storage.setItem(key, JSON.stringify(value)); } catch (e) {}
}

// Health cache: { [serverId]: { ok: boolean, ms: number, at: number } }
export function getServerHealth() {
  const all = readJson(sessionStorage, HEALTH_KEY);
  const now = Date.now();
  const fresh = {};
  Object.keys(all).forEach((id) => {
    if (all[id] && now - all[id].at < HEALTH_TTL) fresh[id] = all[id];
  });
  return fresh;
}

// Record a user-reported failure ("not playing" / switched away quickly) so the
// selector stops picking that server for this title.
export function reportServerFailure(serverId, tmdbId) {
  const fails = readJson(localStorage, FAIL_KEY);
  const key = `${tmdbId || 'any'}:${serverId}`;
  fails[key] = Date.now();
  // keep the map small
  const entries = Object.entries(fails).sort((a, b) => b[1] - a[1]).slice(0, 300);
  writeJson(localStorage, FAIL_KEY, Object.fromEntries(entries));
}

function recentlyFailed(serverId, tmdbId) {
  const fails = readJson(localStorage, FAIL_KEY);
  const at = fails[`${tmdbId || 'any'}:${serverId}`];
  return Boolean(at && Date.now() - at < 24 * 60 * 60 * 1000);
}

// Real reachability probe: a no-cors fetch resolves (opaque) when the host is
// reachable and rejects on DNS/TLS/network failure. Times out after 4s.
async function probeOne(server, tmdbId) {
  let url;
  try {
    url = server.getMovieUrl(tmdbId || 299534, 'english', false);
  } catch (e) {
    return { ok: false, ms: 0 };
  }
  const origin = new URL(url).origin + '/';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  const start = performance.now();
  try {
    await fetch(origin, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal, credentials: 'omit' });
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return { ok: false, ms: Math.round(performance.now() - start) };
  } finally {
    clearTimeout(timer);
  }
}

let probeInFlight = null;

// Probe all servers in parallel (deduped by host), cache for 10 minutes.
export function probeServers(servers, tmdbId) {
  if (probeInFlight) return probeInFlight;
  const cached = getServerHealth();
  const todo = servers.filter((s) => !cached[s.id]);
  if (todo.length === 0) return Promise.resolve(cached);

  const byHost = new Map();
  todo.forEach((s) => {
    let host = s.id;
    try { host = new URL(s.getMovieUrl(tmdbId || 299534, 'english', false)).host; } catch (e) {}
    if (!byHost.has(host)) byHost.set(host, []);
    byHost.get(host).push(s);
  });

  probeInFlight = Promise.all(
    [...byHost.values()].map(async (group) => {
      const res = await probeOne(group[0], tmdbId);
      return group.map((s) => [s.id, { ...res, at: Date.now() }]);
    })
  ).then((results) => {
    const merged = { ...readJson(sessionStorage, HEALTH_KEY) };
    results.flat().forEach(([id, value]) => { merged[id] = value; });
    writeJson(sessionStorage, HEALTH_KEY, merged);
    probeInFlight = null;
    window.dispatchEvent(new CustomEvent('furina-server-health', { detail: merged }));
    return merged;
  }).catch(() => {
    probeInFlight = null;
    return cached;
  });

  return probeInFlight;
}

/**
 * Rank servers. Score = tier (dominant) + live reachability + user failure history
 * + audio fit. Pure function over cached data so it is safe to call during render.
 */
export function evaluateServers({ servers, audioMode = 'english', isAnime = false, isHanime = false, tmdbId, excludeIds = [] }) {
  if (!Array.isArray(servers) || servers.length === 0) {
    return { bestServer: null, rankedServers: [], stats: { total: 0 } };
  }
  const health = getServerHealth();

  const scored = servers.map((srv, index) => {
    const profile = SERVER_PROFILES[srv.id] || DEFAULT_PROFILE;
    const h = health[srv.id];
    let score = 100 - profile.tier * 25; // tier1=75, tier2=50, tier3=25
    const notes = [];

    if (h) {
      if (!h.ok) { score -= 60; notes.push('unreachable'); }
      else { score += Math.max(0, 10 - Math.floor(h.ms / 300)); notes.push(`${h.ms}ms`); }
    }
    if (recentlyFailed(srv.id, tmdbId)) { score -= 40; notes.push('failed here before'); }
    if (excludeIds.includes(srv.id)) score -= 200;
    if (audioMode === 'hindi' && profile.hindi) score += 8;
    if ((isAnime || audioMode === 'sub') && srv.id === 'vidlink') score += 6;
    if (isHanime && (srv.id === 'vidlink' || srv.id === 'autoembed')) score -= 200;
    score -= index * 0.01; // stable tie-break by list order

    return {
      server: srv,
      score: Math.round(score * 100) / 100,
      latency: h?.ok ? h.ms : null,
      reachable: h ? h.ok : null,
      adLevel: profile.adLevel,
      badge: profile.badge,
      rationale: [profile.badge, ...notes].join(' • ')
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const best = scored[0] || null;
  const measured = scored.filter((s) => s.latency !== null);

  return {
    bestServer: best ? best.server : servers[0],
    bestDetails: best,
    rankedServers: scored,
    stats: {
      total: servers.length,
      averageLatency: measured.length ? Math.round(measured.reduce((a, s) => a + s.latency, 0) / measured.length) : null,
      cleanestMirror: best?.server?.shortName
    }
  };
}

// Next best server after the current one (used by the "not playing" rescue).
export function nextBestServer({ servers, current, ...rest }) {
  if (current?.id) reportServerFailure(current.id, rest.tmdbId);
  const evaluation = evaluateServers({ servers, excludeIds: current ? [current.id] : [], ...rest });
  return evaluation.bestServer;
}

export default {
  evaluateServers,
  isAutoAiServerEnabled,
  setAutoAiServerEnabled,
  probeServers,
  getServerHealth,
  reportServerFailure,
  nextBestServer,
  SERVER_PROFILES
};
