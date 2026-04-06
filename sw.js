self.addEventListener('install', e => {
  e.waitUntil(
    caches.open('mood-journal-v1').then(cache => {
      return cache.addAll([
        './',
        './index.html',
        './styles.css',
        './script.js',
        './icon.svg',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request);
    })
  );
});
