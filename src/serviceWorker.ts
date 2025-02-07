/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

const serviceWorkerScope = self as unknown as ServiceWorkerGlobalScope;

serviceWorkerScope.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('ellin-goals-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico'
      ]);
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
