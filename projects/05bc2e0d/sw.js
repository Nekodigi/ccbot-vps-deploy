const CACHE_NAME = 'simple-pwa-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './icon-192x192.png',
  './icon-512x512.png'
];

// Service Workerのインストール時
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] キャッシュを開きました');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('[Service Worker] キャッシュの追加に失敗しました:', error);
      })
  );
  // 新しいService Workerを即座にアクティブ化
  self.skipWaiting();
});

// Service Workerのアクティベーション時
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] 古いキャッシュを削除しました:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // 新しいService Workerが即座にページを制御
  return self.clients.claim();
});

// フェッチイベント - Stale-While-Revalidate戦略
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // manifest.jsonは常にネットワークから取得（更新検知のため）
  if (url.pathname.endsWith('manifest.json')) {
    event.respondWith(fetch(request));
    return;
  }

  // HTMLファイルはネットワーク優先（常に最新を取得）
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // 成功したらキャッシュを更新
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // オフライン時はキャッシュから返す
          return caches.match(request);
        })
    );
    return;
  }

  // その他のリソース（CSS、JS、画像など）はStale-While-Revalidate戦略
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      // キャッシュがあればそれを返す
      if (cachedResponse) {
        // バックグラウンドでキャッシュを更新
        fetch(request)
          .then((response) => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, response);
              });
            }
          })
          .catch(() => {
            // ネットワークエラーは無視
          });

        return cachedResponse;
      }

      // キャッシュがない場合はネットワークから取得
      return fetch(request)
        .then((response) => {
          // 有効なレスポンスの場合のみキャッシュ
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });

          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] フェッチエラー:', error);
          throw error;
        });
    })
  );
});

// メッセージイベント（更新通知など）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
