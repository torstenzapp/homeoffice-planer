// Service Worker for HomeOffice-Planer PWA
const CACHE_NAME = 'homeoffice-planer-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install event
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker v2');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('[SW] All files cached successfully');
        self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Cache failed:', error);
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker v2');
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
      console.log('[SW] Claiming all clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - Network First for Firebase, Cache First for static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Always network first for Firebase Database calls
  if (url.hostname.includes('firebasedatabase.app') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebase.com') ||
      url.hostname.includes('gstatic.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Return offline response for Firebase calls
        return new Response(
          JSON.stringify({ error: 'Offline - Firebase nicht verfügbar' }),
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
          // Don't cache invalid responses
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          
          // Clone response for caching
          const responseToCache = fetchResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return fetchResponse;
        });
      })
      .catch(() => {
        // Fallback for offline document requests
        if (request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Background sync for offline data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'homeoffice-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  try {
    console.log('[SW] Attempting to sync offline data...');
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

// Listen for messages from the app
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});