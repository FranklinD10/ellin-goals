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
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // Try to get the response from cache first
      const cachedResponse = await caches.match(event.request);
      if (cachedResponse) {
        // If we have a cached response, return it but also update cache in background
        event.waitUntil(
          fetch(event.request).then(response => {
            if (response.ok) {
              cache.put(event.request, response.clone());
            }
          }).catch(() => {/* ignore */})
        );
        return cachedResponse;
      }

      // If not in cache, fetch from network
      try {
        const networkResponse = await fetch(event.request);
        if (networkResponse.ok) {
          // Cache successful responses
          event.waitUntil(cache.put(event.request, networkResponse.clone()));
        }
        return networkResponse;
      } catch (error) {
        // If both cache and network fail, return a basic error response
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});

// Add message handling for updates
serviceWorkerScope.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    serviceWorkerScope.skipWaiting();
  }
});
