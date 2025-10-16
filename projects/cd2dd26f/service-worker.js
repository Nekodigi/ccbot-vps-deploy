const CACHE_NAME = 'task-manager-v1';
const OFFLINE_URL = 'index.html';

// キャッシュするリソースのリスト
const STATIC_CACHE_URLS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json'
];

// Service Workerのインストール
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
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

// Service Workerのアクティベーション
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        // 古いキャッシュを削除
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
        console.log('[Service Worker] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch イベント - キャッシュ戦略
self.addEventListener('fetch', (event) => {
  // POSTリクエストなどはキャッシュしない
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Cache First戦略: キャッシュがあればそれを返す
        if (cachedResponse) {
          console.log('[Service Worker] Serving from cache:', event.request.url);

          // バックグラウンドで更新をチェック (Stale-While-Revalidate)
          fetch(event.request)
            .then((response) => {
              if (response && response.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, response);
                });
              }
            })
            .catch(() => {
              // ネットワークエラーは無視
            });

          return cachedResponse;
        }

        // キャッシュになければネットワークから取得
        console.log('[Service Worker] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then((response) => {
            // レスポンスが正常な場合はキャッシュに追加
            if (!response || response.status !== 200 || response.type === 'error') {
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
          .catch((error) => {
            console.error('[Service Worker] Fetch failed:', error);

            // HTMLリクエストの場合はオフラインページを返す
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }

            // その他のリクエストは失敗を返す
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' },
            });
          });
      })
  );
});

// メッセージイベント - クライアントからの通信
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(event.data.urls);
        })
    );
  }
});

// プッシュ通知のイベント（将来の拡張用）
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');

  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: './icons/icon-192x192.png',
    badge: './icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'task-notification',
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification('タスクマネージャー', options)
  );
});

// 通知クリックのイベント
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('./')
  );
});

// バックグラウンド同期のイベント（将来の拡張用）
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync triggered');

  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      // ここで同期処理を実装
      Promise.resolve()
    );
  }
});
