const CACHE_NAME = 'ARTSGREEN';
const urlsToCache = [
  '/',
  '/404.html',
  '/favicon.ico',
  '/grupo.html',
  '/grupos.html',
  '/index.html',
  '/listaAlumnos.html',
  '/listaGrupos.html',
  '/listaUsuarios.html',
  '/perfil.html',
  '/prueba.html',
  '/publicacion.html',
  '/Roboto-Regular.ttf',
  '/css/assets.css',
  '/css/blog.css',
  '/css/blog.rtl.css',
  '/css/estilo.css',
  '/css/style.css',
  '/css/assets/brand/bootstrap-logo-white.svg',
  '/css/assets/brand/bootstrap-logo.svg',
  '/css/assets/dist/css/bootstrap.min.css',
  '/css/assets/dist/css/bootstrap.min.css.map',
  '/css/assets/dist/css/bootstrap.rtl.min.css',
  '/css/assets/dist/css/bootstrap.rtl.min.css.map',
  '/css/assets/dist/js/bootstrap.bundle.min.js',
  '/css/assets/dist/js/bootstrap.bundle.min.js.map',
  '/css/assets/js/color-modes.js',
  '/images/alcancia.jpg',
  '/images/banner.jpg',
  '/images/colgante.jpg',
  '/images/comdedor.jpg',
  '/images/flores_plastico.jpg',
  '/images/lampara_papel.jpg',
  '/images/maceta_papel.jpg',
  '/images/monster.jpg',
  '/images/titulo.jpg',
  '/js/controller/firebase.js',
  '/js/iniciador/main.js',
  '/js/modulo/alumnos.js',
  '/js/modulo/grupo.js',
  '/js/modulo/grupos.js',
  '/js/modulo/header.js',
  '/js/modulo/index.js',
  '/js/modulo/list.js',
  '/js/modulo/listaGrupos.js',
  '/js/modulo/login.js',
  '/js/modulo/muro.js',
  '/js/modulo/perfil.js',
  '/js/modulo/profesores.js',
  '/js/modulo/publicaciones.js',
  '/js/modulo/subirPublicacion.js',
  '/js/modulo/subirVideo.js',
  '/js/modulo/varPers.js',
  '/js/modulos/footer.js',
  '/js/operedor/bd.js',
  '/js/operedor/codificador.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
