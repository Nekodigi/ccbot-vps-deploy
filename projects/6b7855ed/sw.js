const CACHE_NAME = 'ar-experience-v1.0.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192x192.png',
    './icon-512x512.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching assets');
                return cache.addAll(ASSETS_TO_CACHE.map(url => new Request(url, { cache: 'reload' })))
                    .catch((error) => {
                        console.error('[Service Worker] Failed to cache some assets:', error);
                    });
            })
            .then(() => self.skipWaiting())
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
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Skip camera/media requests
    if (event.request.url.includes('/media')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Return cached version
                    return cachedResponse;
                }

                // Clone the request
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((response) => {
                    // Check if valid response
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // Clone the response
                    const responseToCache = response.clone();

                    // Cache the fetched response
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });

                    return response;
                }).catch((error) => {
                    console.error('[Service Worker] Fetch failed:', error);

                    // Return offline page if available
                    return caches.match('./index.html');
                });
            })
    );
});

// Message event - handle messages from client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

// Sync event - background sync for offline actions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-analysis') {
        event.waitUntil(syncAnalysisData());
    }
});

async function syncAnalysisData() {
    // Placeholder for syncing offline analysis data
    console.log('[Service Worker] Syncing analysis data...');
}

// Push notification support (optional)
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'AR Experienceからの通知',
        icon: './icon-192x192.png',
        badge: './icon-192x192.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('AR Experience', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
