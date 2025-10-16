/**
 * Service Worker for AR Experience App
 * PWA対応のためのキャッシュ制御
 */

const CACHE_NAME = 'ar-app-v1.0.0';
const RUNTIME_CACHE = 'ar-app-runtime';

// キャッシュするリソース
const PRECACHE_URLS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

/**
 * Install Event - リソースのプリキャッシュ
 */
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Install event');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Pre-caching resources');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
    );
});

/**
 * Activate Event - 古いキャッシュの削除
 */
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activate event');

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
                            console.log('[Service Worker] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('[Service Worker] Claiming clients');
                return self.clients.claim();
            })
    );
});

/**
 * Fetch Event - ネットワークリクエストの処理
 * Strategy: Cache First with Network Fallback
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 同一オリジンのリクエストのみ処理
    if (url.origin !== location.origin) {
        return;
    }

    // GLBモデルファイルの処理
    if (url.pathname.endsWith('.glb')) {
        event.respondWith(
            caches.open(RUNTIME_CACHE)
                .then((cache) => {
                    return cache.match(request)
                        .then((cachedResponse) => {
                            if (cachedResponse) {
                                console.log('[Service Worker] Serving GLB from cache:', url.pathname);
                                return cachedResponse;
                            }

                            return fetch(request)
                                .then((networkResponse) => {
                                    if (networkResponse && networkResponse.status === 200) {
                                        console.log('[Service Worker] Caching GLB file:', url.pathname);
                                        cache.put(request, networkResponse.clone());
                                    }
                                    return networkResponse;
                                })
                                .catch((error) => {
                                    console.error('[Service Worker] GLB fetch failed:', error);
                                    throw error;
                                });
                        });
                })
        );
        return;
    }

    // その他のリソース - Cache First
    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    console.log('[Service Worker] Serving from cache:', url.pathname);
                    return cachedResponse;
                }

                return fetch(request)
                    .then((networkResponse) => {
                        // 成功したレスポンスをキャッシュ
                        if (networkResponse && networkResponse.status === 200) {
                            // 画像やスタイルをランタイムキャッシュに保存
                            if (url.pathname.match(/\.(png|jpg|jpeg|svg|css|js)$/)) {
                                caches.open(RUNTIME_CACHE)
                                    .then((cache) => {
                                        console.log('[Service Worker] Caching resource:', url.pathname);
                                        cache.put(request, networkResponse.clone());
                                    });
                            }
                        }
                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('[Service Worker] Fetch failed:', error);

                        // オフライン時の代替レスポンス
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }

                        throw error;
                    });
            })
    );
});

/**
 * Message Event - クライアントからのメッセージ処理
 */
self.addEventListener('message', (event) => {
    console.log('[Service Worker] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CACHE_URLS') {
        event.waitUntil(
            caches.open(RUNTIME_CACHE)
                .then((cache) => {
                    return cache.addAll(event.data.urls);
                })
        );
    }
});

/**
 * Sync Event - バックグラウンド同期
 */
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Sync event:', event.tag);

    if (event.tag === 'sync-models') {
        event.waitUntil(
            // モデルの同期処理
            Promise.resolve()
        );
    }
});

/**
 * Push Event - プッシュ通知
 */
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push event');

    const options = {
        body: event.data ? event.data.text() : 'New update available',
        icon: './icon-192.png',
        badge: './icon-192.png',
        vibrate: [200, 100, 200]
    };

    event.waitUntil(
        self.registration.showNotification('AR体験アプリ', options)
    );
});

/**
 * Notification Click Event - 通知クリック時の処理
 */
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
