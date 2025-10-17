// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Service Worker - PWA Offline Support
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CACHE_NAME = 'infocollector-v1';
const OFFLINE_URL = './offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './offline.html'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Cache failed:', error);
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
                    cacheNames
                        .filter((cacheName) => cacheName !== CACHE_NAME)
                        .map((cacheName) => {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - cache-first strategy for static assets, network-first for API calls
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        // For Firebase API calls, use network-first strategy
        if (url.hostname.includes('firebase') || url.hostname.includes('google')) {
            event.respondWith(networkFirst(request));
        }
        return;
    }

    // For static assets, use cache-first strategy
    if (isStaticAsset(request)) {
        event.respondWith(cacheFirst(request));
    } else {
        // For other requests, use network-first strategy
        event.respondWith(networkFirst(request));
    }
});

// Check if request is for a static asset
function isStaticAsset(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    return (
        pathname.endsWith('.html') ||
        pathname.endsWith('.css') ||
        pathname.endsWith('.js') ||
        pathname.endsWith('.png') ||
        pathname.endsWith('.jpg') ||
        pathname.endsWith('.jpeg') ||
        pathname.endsWith('.svg') ||
        pathname.endsWith('.json') ||
        pathname === './'
    );
}

// Cache-first strategy
async function cacheFirst(request) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cachedResponse;
        }

        console.log('[Service Worker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);

        // Cache the response for future use
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.error('[Service Worker] Cache-first fetch failed:', error);

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match(OFFLINE_URL);
            if (offlineResponse) {
                return offlineResponse;
            }
        }

        throw error;
    }
}

// Network-first strategy
async function networkFirst(request) {
    try {
        console.log('[Service Worker] Fetching from network:', request.url);
        const networkResponse = await fetch(request);

        // Cache the response for future use
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[Service Worker] Network fetch failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            console.log('[Service Worker] Serving from cache:', request.url);
            return cachedResponse;
        }

        // Return offline page for navigation requests
        if (request.mode === 'navigate') {
            const offlineResponse = await caches.match(OFFLINE_URL);
            if (offlineResponse) {
                return offlineResponse;
            }
        }

        throw error;
    }
}

// Listen for messages from the client
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});
