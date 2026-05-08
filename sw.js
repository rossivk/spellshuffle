const CACHE_NAME = "flashcard-cache-v5";
const urlsToCache = [
  "/flashcards-app/index.html",
  "/flashcards-app/style.css",
  "/flashcards-app/script.js",
  "/flashcards-app/manifest.json",
  "/flashcards-app/icon-192.png",
  "/flashcards-app/icon-512.png"
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


