const CACHE_NAME = 'ar-object-placer-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// インストール時にキャッシュを作成
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'no-cache' })))
          .catch(err => {
            console.warn('Cache addAll error:', err);
            // 一部のファイルがキャッシュできなくても続行
            return Promise.resolve();
          });
      })
  );
  self.skipWaiting();
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// ネットワーク優先、フォールバックでキャッシュを使用
self.addEventListener('fetch', event => {
  // Three.jsなどの外部CDNリソースはキャッシュしない
  if (event.request.url.includes('cdn.jsdelivr.net') ||
      event.request.url.includes('chrome-extension')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // 有効なレスポンスの場合はキャッシュを更新
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // ネットワークが利用できない場合はキャッシュから返す
        return caches.match(event.request).then(response => {
          if (response) {
            return response;
          }
          // キャッシュにもない場合はオフラインページを返すなどの処理
          return new Response('オフラインです', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});
