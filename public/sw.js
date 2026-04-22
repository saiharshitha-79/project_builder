const CACHE_NAME = 'academic-project-builder-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 1. Return cached asset if found
      if (response) {
        return response;
      }
      
      // 2. Fetch from network
      return fetch(event.request).then((fetchResponse) => {
        // Optionally cache the new request here depending on strategy
        return fetchResponse;
      }).catch(() => {
        // 3. Fallback for offline mode when asset isn't cached
        // (For a real SPA, returning root index.html covers navigation)
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
