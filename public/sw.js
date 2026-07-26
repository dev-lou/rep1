/**
 * Snap IT PhotoBooth — Service Worker
 * Caches the app shell for offline use.
 * The photobooth UI (HTML, JS, CSS, fonts, icons) works offline,
 * but Cloudinary upload naturally requires internet.
 */

const CACHE_NAME = "snapit-photobooth-v1";

// App shell — resources needed for the UI to work offline
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.svg",
  "/icons/icon-512.svg",
  "/favicon.ico",
  "/preview-layout.png",
  // Next.js generates these with content hashes — they're handled by the install event
];

// Install — cache app shell immediately
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    }).then(() => {
      // Activate immediately without waiting for reload
      return self.skipWaiting();
    })
  );
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      // Take control of all open pages immediately
      return self.clients.claim();
    })
  );
});

// Fetch — serve from cache, fall back to network
self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  // Skip non-HTTP(S) requests (like chrome-extension://)
  if (!event.request.url.startsWith("http")) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) return cachedResponse;

      // Otherwise fetch from network
      return fetch(event.request).then((networkResponse) => {
        // Don't cache non-OK responses or API calls
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Cache successful responses for future offline use
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache static assets (JS, CSS, images, fonts)
          const url = new URL(event.request.url);
          const ext = url.pathname.split(".").pop()?.toLowerCase();
          if (["js", "css", "png", "jpg", "jpeg", "gif", "svg", "ico", "woff", "woff2", "ttf", "webp"].includes(ext || "")) {
            cache.put(event.request, responseToCache);
          }
        });

        return networkResponse;
      }).catch(() => {
        // Network failed — return a basic offline page for navigations
        if (event.request.mode === "navigate") {
          return caches.match("/");
        }
        // For other requests, just fail gracefully
        return new Response("Offline", { status: 503 });
      });
    })
  );
});
