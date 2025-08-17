// Service Worker for HomeOffice-Planer PWA
const CACHE_NAME = 'homeoffice-planer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] All files cached');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[SW] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network First strategy for Firebase, Cache First for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Always try network first for Firebase Database calls
  if (url.hostname.includes('firebasedatabase.app') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebase.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        // If Firebase fails, we can't provide fallback data
        // Return a custom offline response
        return new Response(
          JSON.stringify({ error: 'Offline - Firebase unavailable' }),
          {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
    return;
  }
  
  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Return cached version or fetch from network
        return response || fetch(request).then(fetchResponse => {
          // Don't cache if not a valid response
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          
          // Clone the response as it can only be consumed once
          const responseToCache = fetchResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return fetchResponse;
        });
      })
      .catch(() => {
        // If both cache and network fail, return offline page
        if (request.destination === 'document') {
          return caches.match('/');
        }
      })
  );
});

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'homeoffice-data-sync') {
    event.waitUntil(
      // Try to sync offline changes when back online
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    // Post message to main app to trigger sync
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_OFFLINE_DATA'
      });
    });
  } catch (error) {
    console.error('[SW] Sync failed:', error);
  }
}