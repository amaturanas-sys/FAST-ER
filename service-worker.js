/*
 * Service Worker de FAST-E.R.
 * Estrategia: precache de todos los recursos en la instalación + "cache-first"
 * en las peticiones. Esto permite que la app funcione 100% offline una vez
 * cargada por primera vez.
 *
 * IMPORTANTE: al publicar cambios, sube el número de versión (CACHE_VERSION)
 * para que los dispositivos descarguen la versión nueva.
 */
const CACHE_VERSION = 'faster-v0.12.1';

// Rutas relativas para que funcione tanto en la raíz del dominio como en un
// subdirectorio (p. ej. GitHub Pages: usuario.github.io/fast-er/).
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './vendor/docx.umd.js',
  './vendor/FileSaver.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './assets/logo.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Sólo gestionamos peticiones GET del mismo origen.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request)
        .then(response => {
          // Guardamos en caché las respuestas válidas para usos posteriores.
          if (response && response.ok && response.type === 'basic') {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then(cache => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          // Si se pide una página y no hay red, devolvemos la app principal.
          if (request.mode === 'navigate') return caches.match('./index.html');
        });
    })
  );
});
