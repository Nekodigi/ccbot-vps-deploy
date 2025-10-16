const CACHE_NAME = 'ai-chat-v1';
const urlsToCache = [
  '/ccbot/projects/790f6ce8/',
  '/ccbot/projects/790f6ce8/index.html',
  '/ccbot/projects/790f6ce8/styles.css',
  '/ccbot/projects/790f6ce8/app.js',
  '/ccbot/projects/790f6ce8/manifest.json',
  '/ccbot/projects/790f6ce8/icon-192.png',
  '/ccbot/projects/790f6ce8/icon-512.png'
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
  self.skipWaiting();
});

// アクティベート時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // キャッシュがあればそれを返す
        if (response) {
          return response;
        }

        // キャッシュがない場合はネットワークから取得
        return fetch(event.request).then((response) => {
          // 有効なレスポンスでない場合はそのまま返す
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // レスポンスをキャッシュに保存
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // ネットワークエラー時はオフラインページを返す
          return caches.match('/ccbot/projects/790f6ce8/index.html');
        });
      })
  );
});
