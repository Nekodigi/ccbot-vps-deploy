const CACHE_NAME = 'task-manager-v1';
const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('キャッシュを開きました');
                return cache.addAll(urlsToCache);
            })
            .catch((error) => {
                console.error('キャッシュの追加に失敗しました:', error);
            })
    );
    self.skipWaiting();
});

// Service Workerのアクティベーション
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('古いキャッシュを削除します:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// フェッチイベントの処理
self.addEventListener('fetch', (event) => {
    // Firebase関連のリクエストはキャッシュしない
    if (event.request.url.includes('firebasestorage.googleapis.com') ||
        event.request.url.includes('firestore.googleapis.com') ||
        event.request.url.includes('googleapis.com')) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // キャッシュにあればそれを返す、なければネットワークから取得
                if (response) {
                    return response;
                }

                return fetch(event.request)
                    .then((response) => {
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
                    })
                    .catch(() => {
                        // オフライン時の処理
                        if (event.request.mode === 'navigate') {
                            return caches.match('./index.html');
                        }
                    });
            })
    );
});

// バックグラウンド同期
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-tasks') {
        event.waitUntil(syncTasks());
    }
});

async function syncTasks() {
    console.log('タスクを同期しています...');
    // ここに同期ロジックを追加可能
}
