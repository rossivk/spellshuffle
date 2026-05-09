const CACHE_NAME = "flashcard-cache-v1";
const urlsToCache = [
  "/spellshuffle/index.html",
  "/spellshuffle/style.css",
  "/spellshuffle/script.js",
  "/spellshuffle/manifest.json",
  "/spellshuffle/icon-192.png",
  "/spellshuffle/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
