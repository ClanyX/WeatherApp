const CACHE_NAME = 'cache';
const cacheAssets = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/icon-192.png',
  '/icon-512.png'
];
 
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5/weather";
 
self.addEventListener('install', event => {
  console.log("Service Worker installed");
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Precaching static assets");
      return cache.addAll(cacheAssets); // Předcacheování souborů
    })
  );
});
 
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
 
self.addEventListener('fetch', function(evt) {
  const url = new URL(evt.request.url);
 
  if(url.origin === 'https://api.openweather.org') {
    evt.respondWith(
      fetch(evt.request)
      .then(networkResponse => {
        if (networkResponse.status ===200) {
          return caches.open(DATA_CHANCE_NAME).then(cache => {
            cache.put(evt.request, networkResponse.clone());
            return networkResponse;
          });
        }
        return caches.match(evt.request);
      })
      .catch(() => {
        return caches.match(evt.request);
      })
    );
    return;
  }
  evt.respondWith(
    caches.match(evt.request).then(response => {
      return response || fetch(evt.request);
    })
  );
});