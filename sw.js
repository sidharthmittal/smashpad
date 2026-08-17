/*
 * sw.js — offline service worker.
 *
 * Strategy: NETWORK-FIRST for the app's own code (HTML/CSS/JS/manifest) so a
 * normal reload always shows the latest deploy when online, with a cache
 * fallback so it still works offline. CACHE-FIRST only for big static binaries
 * (icons) that rarely change. This fixes "pull-to-refresh doesn't update the
 * site" — the old cache-first worker served stale files forever.
 *
 * Bump CACHE on every asset change (also clears old caches on activate).
 */
var CACHE = "smashpad-v13";
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
  "js/themes.js",
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

// Let the page tell a waiting worker to activate immediately (used by app.js
// when it detects an update, so refresh = fresh with no second reload needed).
self.addEventListener("message", function (e) {
  if (e.data === "SKIP_WAITING") self.skipWaiting();
});

// Cache-first is only safe for rarely-changing binaries.
function isStatic(url) {
  return /\.(png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf)$/i.test(url.pathname);
}

self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET") return;

  var url = new URL(e.request.url);
  var sameOrigin = url.origin === self.location.origin;

  // Cross-origin (e.g. Razorpay script) — just pass through to the network.
  if (!sameOrigin) return;

  // Static binaries: cache-first (fast, they don't change without a cache bump).
  if (isStatic(url)) {
    e.respondWith(
      caches.match(e.request).then(function (hit) {
        return hit || fetch(e.request).then(function (res) {
          if (res && res.status === 200) {
            var copy = res.clone();
            caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
          }
          return res;
        });
      })
    );
    return;
  }

  // App code + navigations: NETWORK-FIRST so reloads show the newest deploy.
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && res.status === 200 && res.type === "basic") {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      // Offline: serve the cached copy; fall back to the app shell for navigations.
      return caches.match(e.request).then(function (hit) {
        return hit || (e.request.mode === "navigate" ? caches.match("index.html") : undefined);
      });
    })
  );
});
