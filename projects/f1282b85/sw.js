const CACHE_VERSION = 'v1';
const CACHE_NAME = `ticket-app-${CACHE_VERSION}`;

const urlsToCache = [
  './',
  './index.html',
  './login.html',
  './search.html',
  './detail.html',
  './mytickets.html',
  './css/style.css',
  './js/config.js',
  './js/auth.js',
  './js/search.js',
  './js/purchase.js',
  './js/tickets.js',
  './js/recommendations.js',
  './manifest.json'
];

// Service Worker のインストール
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Service Worker のアクティベーション
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

// フェッチイベントの処理 (ネットワーク優先、フォールバックでキャッシュ)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // レスポンスをクローンしてキャッシュに保存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

// プッシュ通知の受信
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'チケットアプリ';
  const options = {
    body: data.body || '新しい通知があります',
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" fill="%231a73e8"/%3E%3Cpath fill="%23fff" d="M128 96h256v80H128zm0 120h256v80H128zm0 120h256v80H128z"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"%3E%3Crect width="512" height="512" fill="%231a73e8"/%3E%3C/svg%3E',
    data: data.url || './'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// 通知のクリックイベント
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
