// Furina MovieBox Service Worker — PWA & Offline App Shell
const CACHE_NAME = 'furina-moviebox-v3';
const STATIC_ASSETS = [
  './manifest.json',
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
          if (k !== CACHE_NAME) return caches.delete(k);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;

  // NEVER cache or intercept HTML document/navigation requests from service worker cache!
  // Always fetch fresh HTML from the network to avoid stale hashed asset references.
  if (
    event.request.mode === 'navigate' ||
    event.request.destination === 'document' ||
    url.endsWith('.html') ||
    url.endsWith('/furina-moviebox/') ||
    url.endsWith('/furina-moviebox')
  ) {
    return;
  }

  // Always network-first/pass-through for APIs, media, and third-party embeds
  if (
    event.request.method !== 'GET' ||
    url.includes('api.themoviedb.org') ||
    url.includes('vidsrc') ||
    url.includes('vidlink') ||
    url.includes('autoembed') ||
    url.includes('multiembed') ||
    url.includes('.mp4') ||
    url.includes('.wav') ||
    url.includes('.webm') ||
    url.includes('.ogg') ||
    url.includes('.m3u8')
  ) {
    return;
  }

  // Network-first with cache fallback for static app assets
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
