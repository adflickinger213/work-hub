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

// --- push notifications ---
self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "Work Hub", body: event.data ? event.data.text() : "" };
  }
  const title = payload.title || "Work Hub";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/icon-192.svg",
    badge: "/icon-192.svg",
    tag: payload.tag,
    data: payload.data || {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const taskId = event.notification.data && event.notification.data.taskId;
  const target = taskId ? `/?task=${encodeURIComponent(taskId)}` : "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          client.focus();
          if ("navigate" in client && taskId) client.navigate(target);
          return undefined;
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
      return undefined;
    })
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
