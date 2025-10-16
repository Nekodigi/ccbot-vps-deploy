const CACHE_NAME = 'chat-app-v1';
const urlsToCache = [
  '/ccbot/projects/75a7cc05/',
  '/ccbot/projects/75a7cc05/index.html',
  '/ccbot/projects/75a7cc05/styles.css',
  '/ccbot/projects/75a7cc05/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
