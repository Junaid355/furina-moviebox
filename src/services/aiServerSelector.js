// src/services/aiServerSelector.js
// Furina smart Multi-Dub server selector.
// Prioritizes verified live servers for Hindi Audio, English Dub, and Japanese Sub.

export const SERVER_PROFILES = {
  vidstuck:          { tier: 1, badge: 'Multi-Dub • VidLink 4K (High-Speed)', adLevel: 'Clean', hindi: true },
  autoembed:         { tier: 1, badge: 'AutoEmbed Multi-Dub • Instant 1080p', adLevel: 'Clean', hindi: true },
  vidfast:           { tier: 1, badge: 'VidSrc CC • 4K Multi-Audio', adLevel: 'Clean', hindi: true },
  nxsha:             { tier: 1, badge: 'SuperEmbed VIP • Dual Audio Hindi/EN', adLevel: 'Clean', hindi: true },
  vidlink:           { tier: 1, badge: 'VidLink Pro • Verified Sub/Dub', adLevel: 'Clean', hindi: true },
  one23embed:        { tier: 1, badge: 'Embed.su • Multi-Audio 1080p', adLevel: 'Clean', hindi: true },
  bingr:             { tier: 1, badge: 'VidSrc XYZ • Clean CDN', adLevel: 'Clean', hindi: true },
  vidsrc_pm:         { tier: 1, badge: 'VidSrc PM • Zero Ads 4K', adLevel: 'Clean', hindi: true },
  moviebox_cloud:    { tier: 1, badge: 'MovieBox Cloud • Multi-Dub', adLevel: 'Clean', hindi: true },
  twoembed_vip:      { tier: 1, badge: '2Embed VIP • Direct Cinema CDN', adLevel: 'Low', hindi: true },
  vidsrc_su:         { tier: 1, badge: 'VidSrc Cloud • 4K UHD Direct', adLevel: 'Clean', hindi: true },
  multiembed:        { tier: 1, badge: 'MultiEmbed Global • Hindi/EN/JA', adLevel: 'Clean', hindi: true }
};

const DEFAULT_PROFILE = { tier: 2, badge: 'HD Mirror', adLevel: 'Clean', hindi: true };
const HEALTH_KEY = 'furina_server_health_v4';
const HEALTH_TTL = 10 * 60 * 1000;
const FAIL_KEY = 'furina_server_fails_v4';

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

export function getServerHealth() {
  const all = readJson(sessionStorage, HEALTH_KEY);
  const now = Date.now();
  const fresh = {};
  Object.keys(all).forEach((id) => {
    if (all[id] && now - all[id].at < HEALTH_TTL) fresh[id] = all[id];
  });
  return fresh;
}

export function reportServerFailure(serverId, tmdbId) {
  const fails = readJson(localStorage, FAIL_KEY);
  const key = `${tmdbId || 'any'}:${serverId}`;
  fails[key] = Date.now();
  const entries = Object.entries(fails).sort((a, b) => b[1] - a[1]).slice(0, 300);
  writeJson(localStorage, FAIL_KEY, Object.fromEntries(entries));
}

function recentlyFailed(serverId, tmdbId) {
  const fails = readJson(localStorage, FAIL_KEY);
  const at = fails[`${tmdbId || 'any'}:${serverId}`];
  return Boolean(at && Date.now() - at < 2 * 60 * 60 * 1000);
}

async function probeOne(server, tmdbId) {
  let url;
  try {
    url = server.getMovieUrl(tmdbId || 299534, 'english', false);
  } catch (e) {
    return { ok: false, ms: 9999 };
  }
  const origin = new URL(url).origin + '/';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 2500);
  const start = performance.now();
  try {
    await fetch(origin, { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal, credentials: 'omit' });
    return { ok: true, ms: Math.round(performance.now() - start) };
  } catch (e) {
    return { ok: false, ms: 9999 };
  } finally {
    clearTimeout(timer);
  }
}

let probeInFlight = null;

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

export function evaluateServers({ servers, audioMode = 'english', isAnime = false, isHanime = false, tmdbId, excludeIds = [] }) {
  if (!Array.isArray(servers) || servers.length === 0) {
    return { bestServer: null, rankedServers: [], stats: { total: 0 } };
  }
  const health = getServerHealth();

  const scored = servers.map((srv, index) => {
    const profile = SERVER_PROFILES[srv.id] || DEFAULT_PROFILE;
    const h = health[srv.id];
    let score = 100 - profile.tier * 15;
    const notes = [];

    if (h) {
      if (!h.ok) { score -= 50; notes.push('unreachable'); }
      else { score += Math.max(0, 10 - Math.floor(h.ms / 300)); notes.push(`${h.ms}ms`); }
    }
    if (recentlyFailed(srv.id, tmdbId)) { score -= 35; notes.push('switched away'); }
    if (excludeIds.includes(srv.id)) score -= 200;

    // Smart Multi-Dub server affinity:
    if (audioMode === 'hindi') {
      if (srv.id === 'autoembed' || srv.id === 'nxsha' || srv.id === 'vidstuck' || srv.id === 'one23embed') {
        score += 12;
      }
    } else if (audioMode === 'sub' || isAnime) {
      if (srv.id === 'vidlink' || srv.id === 'vidstuck' || srv.id === 'vidfast') {
        score += 12;
      }
    } else if (audioMode === 'english') {
      if (srv.id === 'vidstuck' || srv.id === 'vidlink' || srv.id === 'vidfast' || srv.id === 'autoembed') {
        score += 10;
      }
    }

    if (isHanime && (srv.id === 'vidlink' || srv.id === 'autoembed')) score -= 200;
    score -= index * 0.01;

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
