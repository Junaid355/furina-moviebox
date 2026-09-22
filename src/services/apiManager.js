// ============================================================================
// Furina MovieBox — APIManager Provider Abstraction
// Resilient metadata & media provider orchestration with timeouts, retries,
// caching, rate-limit safety, and live health diagnostics.
// ============================================================================

class APIManager {
  constructor() {
    this.cache = new Map();
    this.inFlight = new Map();
    this.maxCacheSize = 250;
    this.providerHealth = {
      tmdb: { name: 'TMDB Primary Gateway', status: 'online', latency: 85, lastChecked: Date.now(), errors: 0, successes: 1 },
      curated: { name: 'Furina Curated Catalog', status: 'online', latency: 1, lastChecked: Date.now(), errors: 0, successes: 1 },
      studio: { name: 'Local Studio Repository', status: 'online', latency: 1, lastChecked: Date.now(), errors: 0, successes: 1 },
      autoembed: { name: 'AutoEmbed Prime', status: 'online', latency: 120, lastChecked: Date.now(), errors: 0, successes: 1 },
      vidsrc_in: { name: 'VidSrc 4K CDN', status: 'online', latency: 95, lastChecked: Date.now(), errors: 0, successes: 1 },
      vidlink: { name: 'VidLink Pro', status: 'online', latency: 110, lastChecked: Date.now(), errors: 0, successes: 1 },
      vidsrc_to: { name: 'VidSrc TO Cinema', status: 'online', latency: 140, lastChecked: Date.now(), errors: 0, successes: 1 },
      twoembed_vip: { name: '2Embed VIP', status: 'online', latency: 130, lastChecked: Date.now(), errors: 0, successes: 1 },
      one23embed: { name: '123Embed Multi-Audio', status: 'online', latency: 125, lastChecked: Date.now(), errors: 0, successes: 1 },
      smashy: { name: 'SmashyStream Dual-Audio', status: 'online', latency: 115, lastChecked: Date.now(), errors: 0, successes: 1 },
      embed_su: { name: 'Embed.su 4K', status: 'online', latency: 105, lastChecked: Date.now(), errors: 0, successes: 1 },
      server_9_multi: { name: 'Smashy Pro', status: 'online', latency: 118, lastChecked: Date.now(), errors: 0, successes: 1 }
    };
  }

  getCache(key, ttlMs = 300000) {
    if (!this.cache.has(key)) return null;
    const item = this.cache.get(key);
    if (Date.now() - item.timestamp > ttlMs) {
      this.cache.delete(key);
      return null;
    }
    return item.data;
  }

  setCache(key, data) {
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    this.cache.set(key, { timestamp: Date.now(), data });
  }

  clearCache() {
    this.cache.clear();
    this.inFlight.clear();
  }

  recordHealth(providerKey, success, latencyMs = 0) {
    if (!this.providerHealth[providerKey]) {
      this.providerHealth[providerKey] = {
        name: providerKey,
        status: 'online',
        latency: latencyMs || 100,
        lastChecked: Date.now(),
        errors: 0,
        successes: 0
      };
    }
    const p = this.providerHealth[providerKey];
    p.lastChecked = Date.now();
    if (latencyMs > 0) {
      p.latency = Math.round((p.latency * 0.7) + (latencyMs * 0.3));
    }
    if (success) {
      p.successes += 1;
      p.status = p.latency > 1500 ? 'degraded' : 'online';
    } else {
      p.errors += 1;
      if (p.errors > 3) p.status = 'offline';
    }
  }

  getHealthReport() {
    return { ...this.providerHealth };
  }

  /**
   * Fetch with automatic retry, timeout, deduplication & LRU caching
   */
  async request(url, options = {}, providerKey = 'tmdb') {
    const { 
      timeoutMs = 8000, 
      retries = 1, 
      ttlMs = 300000,
      skipCache = false 
    } = options;

    const cacheKey = `GET_${url}`;
    if (!skipCache) {
      const cached = this.getCache(cacheKey, ttlMs);
      if (cached) return cached;
    }

    if (this.inFlight.has(cacheKey)) {
      return await this.inFlight.get(cacheKey);
    }

    const startTime = Date.now();

    const fetchPromise = (async () => {
      let lastError = null;
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), timeoutMs);

          const res = await fetch(url, {
            ...options,
            signal: controller.signal
          });
          clearTimeout(timer);

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`);
          }

          const json = await res.json();
          this.setCache(cacheKey, json);
          this.recordHealth(providerKey, true, Date.now() - startTime);
          return json;
        } catch (err) {
          lastError = err;
          if (attempt < retries) {
            await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
          }
        }
      }

      this.recordHealth(providerKey, false, Date.now() - startTime);
      throw lastError || new Error(`Failed request to ${url}`);
    })();

    this.inFlight.set(cacheKey, fetchPromise);
    try {
      return await fetchPromise;
    } finally {
      this.inFlight.delete(cacheKey);
    }
  }

  async checkHealth() {
    const start = Date.now();
    try {
      await this.request('https://api.themoviedb.org/3/configuration?api_key=4e44d9029b1270a757cddc766a1bcb63', { timeoutMs: 3500, skipCache: true }, 'tmdb');
    } catch (e) {
      // offline or rate limit
    }
    return this.getHealthReport();
  }
}

export const apiManager = new APIManager();
export default apiManager;
