// Furina MovieBox Service Worker — PWA & Offline App Shell
const CACHE_NAME = 'furina-moviebox-v2';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png'
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
  // Always network-first for APIs, media, and third-party embeds
  if (
    event.request.method !== 'GET' ||
    url.includes('api.themoviedb.org') ||
    url.includes('vidsrc') ||
    url.includes('vidlink') ||
    url.includes('autoembed') ||
    url.includes('multiembed') ||
    url.includes('.mp4') ||
    url.includes('.m3u8')
  ) {
    return;
  }

  // Network-first with cache fallback for app shell
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
