const CACHE_NAME = "flashcard-cache-v1";
const urlsToCache = [
  "/flashcards/index.html",
  "/flashcards/style.css",
  "/flashcards/script.js",
  "/flashcards/manifest.json",
  "/flashcards/icon-192.png",
  "/flashcards/icon-512.png"
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
