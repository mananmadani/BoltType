/* =====================================================
   BoltType — service-worker.js
   Cache-first strategy for full offline support.
   ===================================================== */

const CACHE_NAME    = 'bolttype-v1';
const CACHE_URLS    = [
  'index.html',
  'style.css',
  'app.js',
  'BoltType.png',
  'manifest.json'
];

// ─── Install: pre-cache all core assets ───────────────
self.addEventListener('install', event => {
  console.log('[SW] Installing and caching assets...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] All assets cached successfully.');
        // Force the waiting SW to become the active SW immediately
        return self.skipWaiting();
      })
      .catch(err => console.error('[SW] Cache install failed:', err))
  );
});

// ─── Activate: remove old caches ──────────────────────
self.addEventListener('activate', event => {
  console.log('[SW] Activating and cleaning old caches...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name !== CACHE_NAME)
            .map(name => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Claim all clients so the updated SW takes effect immediately
        return self.clients.claim();
      })
  );
});

// ─── Fetch: Cache-First, fallback to network ──────────
self.addEventListener('fetch', event => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          // Return cached asset immediately
          return cachedResponse;
        }

        // Not in cache — try the network
        return fetch(event.request)
          .then(networkResponse => {
            // Cache a copy of valid responses for future use
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseClone));
            }
            return networkResponse;
          })
          .catch(() => {
            // Offline and not cached — return offline fallback if applicable
            if (event.request.destination === 'document') {
              return caches.match('index.html');
            }
          });
      })
  );
});
