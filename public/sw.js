// public/sw.js — Work Hub service worker.
//
// Strategy:
//   - Static assets: cache-first (instant loads, offline-friendly).
//   - /api/* : network-first, never cached (auth + AI responses must be fresh).
//   - Navigation requests that fail offline: fall back to offline.html.
//
// Bump CACHE_VERSION to invalidate old caches on the next activation.

const CACHE_VERSION = "work-hub-v1";
const PRECACHE = [
  "/",
  "/index.html",
  "/offline.html",
  "/manifest.json",
  "/icon-192.svg",
  "/icon-512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Network-first for the API — never serve a cached API response.
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(request).catch(() => new Response(JSON.stringify({ ok: false, error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }

  // Cache-first for everything else, with an offline fallback for navigations.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request)
        .then((response) => {
          // Stash same-origin successful GETs for next time.
          if (response && response.ok && url.origin === self.location.origin) {
            const copy = response.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === "navigate") return caches.match("/offline.html");
          return new Response("", { status: 504 });
        });
    })
  );
});
