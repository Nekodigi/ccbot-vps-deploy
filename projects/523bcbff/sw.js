// Service Worker - PWA キャッシュ戦略
const CACHE_NAME = 'business-pwa-v1';
const OFFLINE_URL = './offline.html';

// キャッシュするリソース
const CACHE_URLS = [
    './',
    './index.html',
    './offline.html',
    './css/style.css',
    './js/app.js',
    './js/firebase-init.js',
    './manifest.json'
];

// インストールイベント - 初期キャッシュの作成
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Caching app shell');
                return cache.addAll(CACHE_URLS);
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

// アクティベーションイベント - 古いキャッシュの削除
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

// フェッチイベント - ネットワークファーストの戦略 + オフラインフォールバック
self.addEventListener('fetch', (event) => {
    // リクエストがGETでない場合はスキップ
    if (event.request.method !== 'GET') {
        return;
    }

    // Firebase関連のリクエストはキャッシュしない
    if (event.request.url.includes('firebaseio.com') ||
        event.request.url.includes('googleapis.com') ||
        event.request.url.includes('gstatic.com')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 有効なレスポンスの場合、キャッシュを更新
                if (response && response.status === 200 && response.type === 'basic') {
                    const responseToCache = response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                }

                return response;
            })
            .catch(() => {
                // ネットワークエラーの場合、キャッシュから取得
                return caches.match(event.request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }

                        // HTMLリクエストの場合、オフラインページを返す
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match(OFFLINE_URL);
                        }
                    });
            })
    );
});

// バックグラウンド同期イベント（将来の拡張用）
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync:', event.tag);

    if (event.tag === 'sync-data') {
        event.waitUntil(syncData());
    }
});

// データ同期処理（将来の拡張用）
async function syncData() {
    try {
        console.log('[Service Worker] Syncing data...');
        // 同期処理をここに実装
    } catch (error) {
        console.error('[Service Worker] Sync failed:', error);
    }
}

// プッシュ通知イベント（将来の拡張用）
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push notification received');

    const options = {
        body: event.data ? event.data.text() : '新しい通知があります',
        icon: './icons/icon-192.png',
        badge: './icons/icon-192.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        }
    };

    event.waitUntil(
        self.registration.showNotification('ビジネスPWAアプリ', options)
    );
});

// 通知クリックイベント
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked');

    event.notification.close();

    event.waitUntil(
        clients.openWindow('./')
    );
});
