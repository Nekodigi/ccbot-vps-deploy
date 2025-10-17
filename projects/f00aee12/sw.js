// Service Worker for TaskFlow PWA
// Version: 1.0.0

const CACHE_NAME = 'taskflow-v1.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Install Event - Cache assets
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Caching app shell');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                console.log('[ServiceWorker] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[ServiceWorker] Installation failed:', error);
            })
    );
});

// Activate Event - Clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            return cacheName !== CACHE_NAME;
                        })
                        .map((cacheName) => {
                            console.log('[ServiceWorker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[ServiceWorker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch Event - Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[ServiceWorker] Serving from cache:', event.request.url);
                    return cachedResponse;
                }

                console.log('[ServiceWorker] Fetching from network:', event.request.url);
                return fetch(event.request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[ServiceWorker] Fetch failed:', error);

                        // Return offline page for navigation requests
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

// Background Sync (for future enhancement)
self.addEventListener('sync', (event) => {
    console.log('[ServiceWorker] Background sync:', event.tag);

    if (event.tag === 'sync-tasks') {
        event.waitUntil(
            // Future: sync tasks with server
            Promise.resolve()
        );
    }
});

// Push Notification (for future enhancement)
self.addEventListener('push', (event) => {
    console.log('[ServiceWorker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'TaskFlow notification',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200],
        tag: 'taskflow-notification',
        requireInteraction: false
    };

    event.waitUntil(
        self.registration.showNotification('TaskFlow', options)
    );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
    console.log('[ServiceWorker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
