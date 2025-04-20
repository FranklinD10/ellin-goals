/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />

const serviceWorkerScope = self as unknown as ServiceWorkerGlobalScope;
const CACHE_NAME = 'ellin-goals-v1';
const APP_SHELL_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.svg',
  '/pwa-192x192.png',
  '/pwa-512x512.png'
];

// Add version timestamp to help detect updates
const VERSION_TIMESTAMP = new Date().getTime();

serviceWorkerScope.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // Cache app shell files
      await cache.addAll(APP_SHELL_FILES);
      // Cache version timestamp
      await cache.put('/_version', new Response(VERSION_TIMESTAMP.toString()));
      // Activate immediately
      await serviceWorkerScope.skipWaiting();
    })()
  );
});

serviceWorkerScope.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clean up old caches
      const keys = await caches.keys();
      await Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      // Take control of all clients immediately
      await serviceWorkerScope.clients.claim();

      // Notify all clients that the service worker has been updated
      const clients = await serviceWorkerScope.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({ type: 'SERVICE_WORKER_UPDATED' });
      });
    })()
  );
});

serviceWorkerScope.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      
      // For HTML documents, always fetch fresh from network
      if (event.request.mode === 'navigate' || 
          (event.request.method === 'GET' && 
           event.request.headers.get('accept')?.includes('text/html'))) {
        try {
          const networkResponse = await fetch(event.request);
          // Update cache in background
          event.waitUntil(cache.put(event.request, networkResponse.clone()));
          return networkResponse;
        } catch (error) {
          const cachedResponse = await cache.match(event.request);
          return cachedResponse || new Response('Network error', { status: 408 });
        }
      }
      
      // For other resources, try cache first
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        // Update cache in background for non-HTML resources
        event.waitUntil(
          fetch(event.request)
            .then(response => {
              if (response.ok) {
                return cache.put(event.request, response);
              }
            })
            .catch(() => {/* ignore network errors for cache updates */})
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
