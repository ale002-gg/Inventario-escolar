const cacheName = 'inventario-cache-v1';
const archivos = [
  'index.html',
  'estilos.css',
  'script.js',
  'icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => cache.addAll(archivos))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(respuesta => respuesta || fetch(e.request))
  );
});
