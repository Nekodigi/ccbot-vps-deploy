// Service Worker for PWA - Version 1.0.0
// キャッシュバージョン管理
const CACHE_VERSION = 'v1';
const CACHE_NAME = `business-app-${CACHE_VERSION}`;

// キャッシュするリソース
const STATIC_RESOURCES = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Firebase SDKのURL（オンライン時のみ）
const FIREBASE_URLS = [
    'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js',
    'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js'
];

// ============================
// Install Event
// ============================
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching static resources');
                return cache.addAll(STATIC_RESOURCES);
            })
            .then(() => {
                console.log('[Service Worker] Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Installation failed:', error);
            })
    );
});

// ============================
// Activate Event
// ============================
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

// ============================
// Fetch Event - キャッシング戦略
// ============================
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Firestore APIリクエストは常にネットワークから取得
    if (url.hostname.includes('firestore.googleapis.com') ||
        url.hostname.includes('firebase.googleapis.com')) {
        event.respondWith(
            fetch(request).catch(() => {
                // オフライン時のフォールバック
                return new Response(
                    JSON.stringify({ error: 'オフラインのため、データを取得できません' }),
                    {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    }
                );
            })
        );
        return;
    }

    // Firebase SDKはネットワーク優先、フォールバックでキャッシュ
    if (FIREBASE_URLS.some(firebaseUrl => request.url.startsWith(firebaseUrl))) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
        return;
    }

    // 静的リソースはキャッシュ優先、フォールバックでネットワーク
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // キャッシュがある場合は返す
                    return cachedResponse;
                }

                // キャッシュにない場合はネットワークから取得
                return fetch(request)
                    .then((response) => {
                        // レスポンスが有効でない場合はそのまま返す
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // 同じオリジンのリクエストのみキャッシュ
                        if (url.origin === location.origin) {
                            const responseClone = response.clone();
                            caches.open(CACHE_NAME).then((cache) => {
                                cache.put(request, responseClone);
                            });
                        }

                        return response;
                    })
                    .catch(() => {
                        // ネットワークエラー時のフォールバック
                        // HTMLリクエストの場合はオフラインページを返す
                        if (request.headers.get('accept').includes('text/html')) {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// ============================
// Background Sync (将来の拡張用)
// ============================
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(
            // バックグラウンド同期処理を実装可能
            Promise.resolve()
        );
    }
});

// ============================
// Push Notifications (将来の拡張用)
// ============================
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'New notification',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('ビジネスアプリ', options)
    );
});

// ============================
// Notification Click
// ============================
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});

// ============================
// Message Event (アプリとの通信)
// ============================
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => {
                return cache.addAll(event.data.urls);
            })
        );
    }
});
