const CACHE_NAME = 'object-vision-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, {cache: 'reload'})))
          .catch(error => {
            console.warn('Cache addAll failed for some resources:', error);
          });
      })
  );
  self.skipWaiting();
});

// アクティベーション時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// フェッチ時（Network First戦略）
self.addEventListener('fetch', (event) => {
  // POSTリクエストやFirebaseリクエストはキャッシュしない
  if (event.request.method !== 'GET' ||
      event.request.url.includes('firebasestorage.googleapis.com') ||
      event.request.url.includes('firestore.googleapis.com') ||
      event.request.url.includes('firebase.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // 正常なレスポンスの場合はキャッシュに保存
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // ネットワークエラー時はキャッシュから取得
        return caches.match(event.request)
          .then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // キャッシュにもない場合はオフラインページを表示
            if (event.request.destination === 'document') {
              return caches.match('./index.html');
            }
          });
      })
  );
});
