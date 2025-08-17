// HomeOffice-Planer Service Worker
// Cacht nur die Shell-Dateien, Firebase-Requests gehen immer ins Netz

const CACHE_NAME = 'homeoffice-planer-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json'
];

// Install event - Cache die App Shell
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

// Activate event - Cleanup old caches
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

// Fetch event - Network First für Firebase, Cache First für static assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Immer network first für Firebase Database calls
  if (url.hostname.includes('firebasedatabase.app') || 
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('firebase.com')) {
    event.respondWith(
      fetch(request).catch(() => {
        // Wenn Firebase offline ist, können wir keine Fallback-Daten liefern
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
  
  // Cache first strategy für statische Assets
  event.respondWith(
    caches.match(request)
      .then(response => {
        // Gib gecachte Version zurück oder fetch aus dem Netzwerk
        return response || fetch(request).then(fetchResponse => {
          // Cache nur gültige Responses
          if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
            return fetchResponse;
          }
          
          // Clone die Response da sie nur einmal konsumiert werden kann
          const responseToCache = fetchResponse.clone();
          
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(request, responseToCache);
            });
          
          return fetchResponse;
        });
      })
      .catch(() => {
        // Wenn sowohl Cache als auch Netzwerk fehlschlagen
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

// Background sync für offline data
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'homeoffice-data-sync') {
    event.waitUntil(
      // Versuche offline Änderungen zu synchronisieren wenn wieder online
      syncOfflineData()
    );
  }
});

async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    // Post message an die Haupt-App um sync zu triggern
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