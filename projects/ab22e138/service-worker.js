const CACHE_NAME = 'meetingnote-ai-v1';
const urlsToCache = ['./', './index.html', './styles.css', './app.js', './firebase-config.js', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', (event) => {
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        console.log('Cache opened');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' }))).catch((error) => {
            console.error('Failed to cache:', error);
            return Promise.resolve();
        });
    }));
    self.skipWaiting();
});
self.addEventListener('activate', (event) => {
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
                console.log('Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            }
        }));
    }));
    self.clients.claim();
});
self.addEventListener('fetch', (event) => {
    if (event.request.url.includes('firebase') || event.request.url.includes('googleapis') || event.request.url.includes('gstatic')) {
        return;
    }
    event.respondWith(caches.match(event.request).then((response) => {
        if (response) {
            return response;
        }
        return fetch(event.request).then((response) => {
            if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
            }
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
            return response;
        }).catch((error) => {
            console.error('Fetch failed:', error);
            return caches.match('./index.html');
        });
    }));
});
