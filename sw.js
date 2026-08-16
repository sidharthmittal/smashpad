/*
 * sw.js — tiny offline service worker. Cache-first for the app shell so
 * SmashPad works with no network once opened. Bump CACHE to force an update.
 */
var CACHE = "smashpad-v5";
var ASSETS = [
  ".",
  "index.html",
  "styles.css",
  "legal.css",
  "contact.html",
  "terms.html",
  "privacy.html",
  "refund.html",
  "manifest.webmanifest",
  "js/content.js",
  "js/audio.js",
  "js/sprites.js",
  "js/device.js",
  "js/modes.js",
  "js/app.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png"
];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(function (c) {
    // addAll fails if any file 404s; add individually and ignore misses.
    return Promise.all(ASSETS.map(function (url) {
      return c.add(url).catch(function () {});
    }));
  }));
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k !== CACHE) return caches.delete(k);
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(function (hit) {
      if (hit) return hit;
      return fetch(e.request).then(function (res) {
        // Cache same-origin successful responses for next time.
        try {
          if (res && res.status === 200 && res.type === "basic") {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
        } catch (_) {}
        return res;
      }).catch(function () {
        // Offline navigation fallback -> app shell.
        if (e.request.mode === "navigate") return caches.match("index.html");
      });
    })
  );
});
