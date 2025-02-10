/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

const serviceWorkerScope = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = 'ellin-goals-v1';

serviceWorkerScope.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico'
      ]);
    })
  );
});

serviceWorkerScope.addEventListener('activate', (event) => {
  // Clean up old caches
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
});

serviceWorkerScope.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

// Add message handling for updates
serviceWorkerScope.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    serviceWorkerScope.skipWaiting();
  }
});
