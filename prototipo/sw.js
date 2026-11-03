// Service worker del prototipo instalable de clima.entresijo.org/prototipo/.
// Guarda solo la página y sus íconos, para abrirla sin barra del navegador y sin red. Los datos del clima
// (Open-Meteo, APRHi) no se guardan nunca: se piden siempre, y sin red la página lo dice.
// Primero la red: así una versión nueva de la página llega sola, sin quedar pegada a la vieja.
var CAJA = "clima-prototipo-1";
var PROPIOS = ["./", "manifest.webmanifest", "icono.svg", "icono-180.png", "icono-192.png", "icono-512.png"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CAJA).then(function (c) { return c.addAll(PROPIOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== CAJA; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener("fetch", function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== self.location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    if (r.ok) { var copia = r.clone(); caches.open(CAJA).then(function (c) { c.put(e.request, copia); }); }
    return r;
  }).catch(function () {
    return caches.match(e.request).then(function (r) { return r || caches.match("./"); });
  }));
});
