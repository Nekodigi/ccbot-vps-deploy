// ========================================
// Service Worker - PWA オフライン対応
// ========================================

const CACHE_NAME = 'ai-photo-description-v1';
const RUNTIME_CACHE = 'runtime-cache-v1';

// キャッシュするリソース
const PRECACHE_URLS = [
    './',
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// インストールイベント - リソースをプリキャッシュ
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installing...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] Precaching resources');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => {
                console.log('[Service Worker] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[Service Worker] Precaching failed:', error);
            })
    );
});

// アクティベートイベント - 古いキャッシュを削除
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activating...');

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

// フェッチイベント - ネットワークファーストストラテジー
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Firebase関連のリクエストはキャッシュしない
    if (url.hostname.includes('firebase') ||
        url.hostname.includes('googleapis.com') ||
        url.hostname.includes('gstatic.com')) {
        event.respondWith(fetch(request));
        return;
    }

    // 同一オリジンのリクエストのみキャッシュ対象
    if (url.origin !== location.origin) {
        event.respondWith(fetch(request));
        return;
    }

    // ネットワークファースト、フォールバックでキャッシュ使用
    event.respondWith(
        fetch(request)
            .then((response) => {
                // レスポンスが有効な場合、ランタイムキャッシュに保存
                if (response && response.status === 200) {
                    const responseClone = response.clone();
                    caches.open(RUNTIME_CACHE).then((cache) => {
                        cache.put(request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // ネットワークエラー時はキャッシュから取得
                return caches.match(request)
                    .then((cachedResponse) => {
                        if (cachedResponse) {
                            console.log('[Service Worker] Serving from cache:', request.url);
                            return cachedResponse;
                        }

                        // キャッシュにもない場合はオフラインページを返す
                        if (request.destination === 'document') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// メッセージイベント - キャッシュのクリア等
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});
