if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('https://5n4k3ii.github.io/couch-shopping/service-worker.js', {
        scope: 'https://5n4k3ii.github.io/couch-shopping/'
    }).then(function() {
        console.info('service worker registered');
    }).catch(function(e) {
        console.error(e, 'service worker registration failed');
    });
}
