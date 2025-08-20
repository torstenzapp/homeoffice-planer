// HomeOffice-Planer Service Worker - Überarbeitete Version
const CACHE_NAME = 'homeoffice-planer-v2.0.0';
const FIREBASE_CACHE = 'firebase-cache-v1';

const urlsToCache = [
    '/',
    '/index.html',
    '/style.css',
    '/app.js',
    '/manifest.json'
];

// Firebase URLs sollten nicht gecacht werden (außer bei Offline-Fallback)
const FIREBASE_HOSTS = [
    'firebasedatabase.app',
    'googleapis.com',
    'firebase.com',
    'gstatic.com'
];

// Installation
self.addEventListener('install', event => {
    console.log('[SW] Installing Service Worker v2.0.0');
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

// Aktivierung
self.addEventListener('activate', event => {
    console.log('[SW] Activating Service Worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== FIREBASE_CACHE) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[SW] Service Worker activated and claiming clients');
            return self.clients.claim();
        })
    );
});

// Fetch Event Handler
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Firebase requests: Network First Strategy
    if (FIREBASE_HOSTS.some(host => url.hostname.includes(host))) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Cache successful Firebase responses
                    if (response.status === 200) {
                        const responseClone = response.clone();
                        caches.open(FIREBASE_CACHE).then(cache => {
                            cache.put(request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback zu gecachter Version oder Offline-Nachricht
                    return caches.match(request).then(cachedResponse => {
                        if (cachedResponse) {
                            return cachedResponse;
                        }
                        return new Response(
                            JSON.stringify({ 
                                error: 'Offline - Firebase nicht verfügbar',
                                offline: true 
                            }),
                            {
                                status: 503,
                                statusText: 'Service Unavailable',
                                headers: { 'Content-Type': 'application/json' }
                            }
                        );
                    });
                })
        );
        return;
    }

    // App Shell: Cache First Strategy
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }

                return fetch(request).then(fetchResponse => {
                    // Nur valide Responses cachen
                    if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
                        return fetchResponse;
                    }

                    const responseToCache = fetchResponse.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(request, responseToCache);
                    });

                    return fetchResponse;
                });
            })
            .catch(() => {
                // Fallback für HTML-Requests
                if (request.destination === 'document') {
                    return caches.match('/index.html');
                }
                return new Response('Offline', { status: 503 });
            })
    );
});

// Background Sync für Offline-Daten
self.addEventListener('sync', event => {
    console.log('[SW] Background sync triggered:', event.tag);
    if (event.tag === 'homeoffice-sync') {
        event.waitUntil(syncOfflineData());
    }
});

// Nachrichten von der Haupt-App
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Sync-Funktion für Offline-Daten
async function syncOfflineData() {
    try {
        console.log('[SW] Syncing offline data...');
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

// Push Notifications (falls später benötigt)
self.addEventListener('push', event => {
    const options = {
        body: event.data ? event.data.text() : 'Neue Nachricht',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100]
    };

    event.waitUntil(
        self.registration.showNotification('HomeOffice-Planer', options)
    );
});