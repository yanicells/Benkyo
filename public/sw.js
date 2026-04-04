const CACHE_VERSION = "benkyo-v3";
const APP_SHELL_CACHE = `${CACHE_VERSION}-app-shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;
const RUNTIME_CACHE_MAX = 60;

const APP_SHELL_URLS = [
  "/",
  "/decks",
  "/review",
  "/kana",
  "/stats",
  "/path",
  "/manifest.webmanifest",
  "/icon-192.svg",
  "/icon-512.svg",
  "/apple-touch-icon.svg",
  "/_next/static/chunks/framework.js",
];

// Data files that should be cached for offline use
const DATA_URLS = [
  "/_next/static/chunks/app/page.js",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .catch(() => undefined),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(CACHE_VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// Trim runtime cache to RUNTIME_CACHE_MAX entries
async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxEntries) {
    const toDelete = keys.slice(0, keys.length - maxEntries);
    await Promise.all(toDelete.map((key) => cache.delete(key)));
  }
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  const isSameOrigin = requestUrl.origin === self.location.origin;
  if (!isSameOrigin) return;

  const isStaticAsset =
    requestUrl.pathname.startsWith("/_next/static/") ||
    requestUrl.pathname.startsWith("/icons/") ||
    /\.(?:js|css|png|jpg|jpeg|svg|webp|ico|woff2?)$/.test(requestUrl.pathname);

  // Cache-first for static assets
  if (isStaticAsset) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (!response || response.status !== 200) return response;
          const copy = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(event.request, copy);
            trimCache(RUNTIME_CACHE, RUNTIME_CACHE_MAX);
          });
          return response;
        });
      }),
    );
    return;
  }

  // Network-first for navigation/API, fall back to cache, then offline page
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }
        const copy = response.clone();
        caches.open(RUNTIME_CACHE).then((cache) => {
          cache.put(event.request, copy);
          trimCache(RUNTIME_CACHE, RUNTIME_CACHE_MAX);
        });
        return response;
      })
      .catch(() =>
        caches
          .match(event.request)
          .then((cached) => cached || caches.match("/")),
      ),
  );
});

// Notify clients when a new SW version takes over
self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
