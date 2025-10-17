const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `ai-business-app-${CACHE_VERSION}`;

const STATIC_ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './styles/main.css',
    './scripts/app.js',
    './scripts/firebase-config.js',
    './scripts/auth.js',
    './scripts/database.js',
    './scripts/ai.js',
    './assets/icon-192.png',
    './assets/icon-512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(STATIC_ASSETS).catch((error) => {
                    console.warn('Failed to cache some assets:', error);
                });
            })
            .then(() => self.skipWaiting())
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('ai-business-app-') && name !== CACHE_NAME)
                        .map((name) => caches.delete(name))
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip chrome-extension and other non-http(s) requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Skip Firebase requests - always use network
    if (url.hostname.includes('firebase') || url.hostname.includes('google')) {
        event.respondWith(fetch(request));
        return;
    }

    // For same-origin requests, use network-first strategy
    if (url.origin === location.origin) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    // Clone the response before caching
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request)
                        .then((cachedResponse) => {
                            return cachedResponse || caches.match('./index.html');
                        });
                })
        );
    } else {
        // For cross-origin requests, use cache-first strategy
        event.respondWith(
            caches.match(request)
                .then((cachedResponse) => {
                    return cachedResponse || fetch(request);
                })
        );
    }
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
