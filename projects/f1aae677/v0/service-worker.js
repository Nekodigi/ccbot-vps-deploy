// ========================================
// Service Worker - PWA対応
// ========================================

const CACHE_NAME = 'ai-image-qa-v1';
const urlsToCache = [
    './index.html',
    './styles.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// ========================================
// インストールイベント
// ========================================
self.addEventListener('install', (event) => {
    console.log('Service Worker: インストール中...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: キャッシュを開きました');
                // 重要なファイルのみキャッシュ（存在しないファイルはスキップ）
                return cache.addAll(urlsToCache.filter(url =>
                    !url.includes('icon-') // アイコンファイルは後で追加
                )).catch(error => {
                    console.warn('一部のファイルのキャッシュに失敗しました:', error);
                    // エラーがあっても続行
                });
            })
    );

    // 新しいService Workerを即座にアクティブ化
    self.skipWaiting();
});

// ========================================
// アクティベーションイベント
// ========================================
self.addEventListener('activate', (event) => {
    console.log('Service Worker: アクティベーション中...');

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: 古いキャッシュを削除:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );

    // 新しいService Workerがすぐに制御を取る
    return self.clients.claim();
});

// ========================================
// フェッチイベント
// ========================================
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Firebase APIリクエストはキャッシュしない
    if (request.url.includes('firebase') ||
        request.url.includes('googleapis') ||
        request.url.includes('gstatic')) {
        event.respondWith(fetch(request));
        return;
    }

    // その他のリクエストはキャッシュファースト戦略
    event.respondWith(
        caches.match(request)
            .then((response) => {
                // キャッシュにあればそれを返す
                if (response) {
                    return response;
                }

                // キャッシュになければネットワークから取得
                return fetch(request).then((response) => {
                    // 有効なレスポンスでない場合はそのまま返す
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }

                    // レスポンスをクローンしてキャッシュに保存
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });

                    return response;
                });
            })
            .catch((error) => {
                console.error('Service Worker: フェッチエラー:', error);
                // オフライン時のフォールバック（オプション）
                return new Response('オフラインです。', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// ========================================
// メッセージイベント（オプション）
// ========================================
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('Service Worker: スクリプト読み込み完了');
