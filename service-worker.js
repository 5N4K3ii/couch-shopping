var CACHE_NAME = 'couch-shopping-list-v1';

var resourcesToCache = [
    'https://5n4k3ii.github.io/couch-shopping/',
    'https://5n4k3ii.github.io/couch-shopping/favicon.ico',
    'https://5n4k3ii.github.io/couch-shopping/configure.html',
    'https://5n4k3ii.github.io/couch-shopping/edit-store.html',
    'https://5n4k3ii.github.io/couch-shopping/shop.html',
    'https://5n4k3ii.github.io/couch-shopping/css/style.css',
    'https://5n4k3ii.github.io/couch-shopping/images/appicon.png',
    'https://5n4k3ii.github.io/couch-shopping/images/apple-touch-icon.png',
    'https://5n4k3ii.github.io/couch-shopping/images/basket-cart.png',
    'https://5n4k3ii.github.io/couch-shopping/images/clear-list.png',
    'https://5n4k3ii.github.io/couch-shopping/images/delete.png',
    'https://5n4k3ii.github.io/couch-shopping/images/home1600.png',
    'https://5n4k3ii.github.io/couch-shopping/images/pencil-png-200_200.png',
    'https://5n4k3ii.github.io/couch-shopping/images/plus-sign.png',
    'https://5n4k3ii.github.io/couch-shopping/js/ext/babel.min.js',
    'https://5n4k3ii.github.io/couch-shopping/js/ext/pouchdb.min.js',
    'https://5n4k3ii.github.io/couch-shopping/js/aisle-app.js',
    'https://5n4k3ii.github.io/couch-shopping/js/register-service-worker.js',
    'https://5n4k3ii.github.io/couch-shopping/js/screenOrientation.js',
    'https://5n4k3ii.github.io/couch-shopping/js/shop-app.js',
    'https://5n4k3ii.github.io/couch-shopping/js/store.js'
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
