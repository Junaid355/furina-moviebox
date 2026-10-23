// Furina MovieBox Service Worker — PWA & Offline App Shell
const CACHE_NAME = 'furina-moviebox-v5-live';
const STATIC_ASSETS = [
  './manifest.json',
  './favicon.svg',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch(() => {});
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((k) => {
          if (k !== CACHE_NAME) {
            console.log('[SW] Purging outdated cache:', k);
            return caches.delete(k);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = req.url;

  // 1. NEVER intercept or cache HTML document/navigation requests from service worker!
  // ALWAYS fetch fresh HTML directly from the network so users NEVER see stale or old UI.
  let isHtmlRequest = false;
  try {
    const urlObj = new URL(url);
    const acceptHeader = req.headers.get('accept') || '';
    isHtmlRequest =
      req.mode === 'navigate' ||
      req.destination === 'document' ||
      acceptHeader.includes('text/html') ||
      urlObj.pathname.endsWith('.html') ||
      urlObj.pathname.endsWith('/furina-moviebox') ||
      urlObj.pathname.endsWith('/furina-moviebox/');
  } catch (e) {
    isHtmlRequest = req.mode === 'navigate' || req.destination === 'document';
  }

  if (isHtmlRequest) {
    return;
  }

  // 2. Always network-first/pass-through for non-GET, APIs, media, and third-party embeds
  if (
    req.method !== 'GET' ||
    url.includes('api.themoviedb.org') ||
    url.includes('vidsrc') ||
    url.includes('vidlink') ||
    url.includes('autoembed') ||
    url.includes('themoviebox.xyz') ||
    url.includes('123embed') ||
    url.includes('multiembed') ||
    url.includes('.mp4') ||
    url.includes('.wav') ||
    url.includes('.webm') ||
    url.includes('.ogg') ||
    url.includes('.m3u8')
  ) {
    return;
  }

  // 3. For static assets (JS chunks, CSS, fonts, icons):
  // Fetch from network first. ONLY cache if status is 200 AND content is strictly NOT HTML!
  event.respondWith(
    fetch(req)
      .then((response) => {
        if (response && response.status === 200) {
          const contentType = response.headers.get('content-type') || '';
          // Hard guard: NEVER store HTML in CacheStorage
          if (!contentType.includes('text/html')) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
        }
        return response;
      })
      .catch(() => caches.match(req))
  );
});
