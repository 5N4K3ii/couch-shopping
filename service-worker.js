var CACHE_NAME = 'couch-shopping-list-v1';

var resourcesToCache = [
    '/',
    '/edit-store.html',
    '/shop.html',
    '/css/style.css',
    '/images/basket-cart.png',
    '/images/delete.png',
    '/images/pencil-png-200_200.png',
    '/images/plus-sign.png',
    '/images/clear-list.png',
    '/js/ext/babel.min.js',
    '/js/ext/pouchdb.min.js',
    '/js/register-service-worker.js',
    '/js/store.js',
    '/js/app.js'
];

self.addEventListener('install', function(event) {
    console.info('installing service worker');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.info('cache opened');

                return cache.addAll(resourcesToCache);
            })
    );
});

self.addEventListener('activate', function(event) {
    console.info('service worker activated');
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.match(event.request).then(function (response) {
        var fetchPromise = fetch(event.request).then(function (networkResponse) {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
        return response || fetchPromise;
      });
    }),
  );
});

// self.addEventListener('fetch', function(event) {
//     event.respondWith(
//         caches.match(event.request)
//             .then(function(response) {
//                 console.log('request:', event.request);
//
//                 if (response) {
//                     console.info('cache hit');
//                     return response;
//                 }
//
//                 console.info('fetching');
//                 return fetch(event.request);
//             })
//     );
// });
