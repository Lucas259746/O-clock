const CACHE_NAME = 'o-clock-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json'
];

// Installation du service worker et mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache ouvert');
      return cache.addAll(urlsToCache).catch((err) => {
        console.log('Erreur lors du cache:', err);
        // Continue même si certains fichiers ne peuvent pas être cachés
      });
    })
  );
  self.skipWaiting();
});

// Activation du service worker et nettoyage des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Suppression de ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Stratégie: Cache first, fallback to network
self.addEventListener('fetch', (event) => {
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Si en cache, retourner du cache
      if (response) {
        return response;
      }

      // Sinon, faire une requête réseau
      return fetch(event.request)
        .then((response) => {
          // Vérifier que c'est une réponse valide
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          // Cloner la réponse
          const responseToCache = response.clone();

          // Mettre en cache la nouvelle réponse
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // En cas d'erreur réseau, servir depuis le cache si disponible
          return caches.match(event.request);
        });
    })
  );
});
