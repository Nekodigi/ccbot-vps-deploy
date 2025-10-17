// service-worker.js - PWA Service Worker for Offline Support

const CACHE_NAME = 'infohub-v1';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './auth.js',
    './app.js',
    './ai-support.js',
    './share.js',
    './pwa-init.js',
    './manifest.json',
    './icons/icon-72x72.png',
    './icons/icon-96x96.png',
    './icons/icon-128x128.png',
    './icons/icon-144x144.png',
    './icons/icon-152x152.png',
    './icons/icon-192x192.png',
    './icons/icon-384x384.png',
    './icons/icon-512x512.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('[Service Worker] Cache addAll failed:', error);
                // Continue even if some resources fail to cache
                return Promise.resolve();
            })
            .then(() => {
                console.log('[Service Worker] Install complete');
                return self.skipWaiting();
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Activation complete');
                return self.clients.claim();
            })
    );
});

// Fetch event - cache-first strategy with network fallback
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip Firebase and external API requests (they need network)
    if (
        request.url.includes('firebasestorage.googleapis.com') ||
        request.url.includes('firestore.googleapis.com') ||
        request.url.includes('identitytoolkit.googleapis.com') ||
        request.url.includes('securetoken.googleapis.com') ||
        request.url.includes('firebase.googleapis.com') ||
        request.url.includes('googleapis.com') ||
        request.url.includes('gstatic.com')
    ) {
        // Network-only for Firebase APIs
        event.respondWith(fetch(request));
        return;
    }

    // Cache-first strategy for app resources
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', request.url);
                    return cachedResponse;
                }

                console.log('[Service Worker] Fetching from network:', request.url);

                return fetch(request)
                    .then((response) => {
                        // Don't cache if not a valid response
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache the fetched resource
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // Return a custom offline page if available
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

// Handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        const urls = event.data.urls || [];
        event.waitUntil(
            caches.open(CACHE_NAME)
                .then((cache) => {
                    return cache.addAll(urls);
                })
        );
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys()
                .then((cacheNames) => {
                    return Promise.all(
                        cacheNames.map((cacheName) => {
                            return caches.delete(cacheName);
                        })
                    );
                })
                .then(() => {
                    return caches.open(CACHE_NAME);
                })
                .then((cache) => {
                    return cache.addAll(urlsToCache);
                })
        );
    }
});

// Background sync for offline data (future enhancement)
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-data') {
        console.log('[Service Worker] Background sync triggered');
        event.waitUntil(syncData());
    }
});

async function syncData() {
    // Placeholder for future background sync implementation
    console.log('[Service Worker] Syncing data...');
    return Promise.resolve();
}

// Push notification support (future enhancement)
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('InfoHub', options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
