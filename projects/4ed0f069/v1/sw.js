// Service Worker for PWA

const CACHE_NAME = 'quantum-simulator-v1';
const urlsToCache = [
    './index.html',
    './styles.css',
    './app.js',
    './quantum-simulator.js',
    './bloch-sphere.js',
    './circuit-renderer.js',
    './firebase-config.js',
    './manifest.json'
];

// インストール時のキャッシング
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
    );
    self.skipWaiting();
});

// アクティベーション時の古いキャッシュの削除
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチ時のキャッシュ戦略
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }

                // なければネットワークから取得
                return fetch(event.request).then(
                    (response) => {
                        // 有効なレスポンスかチェック
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // レスポンスをクローンしてキャッシュに保存
                        const responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
            .catch(() => {
                // オフライン時のフォールバック
                return caches.match('./index.html');
            })
    );
});
