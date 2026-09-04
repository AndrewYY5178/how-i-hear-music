const cachePrefix = "how-i-hear-music-shell-";
const cacheName = "how-i-hear-music-shell-0.9.12";
const shell = [
  "", "index.html", "base.js", "styles.css", "app.js", "favicon.png", "og-image.svg",
  "data/music-profile.json", "data/artists.json", "data/songs.json", "data/library.json", "data/catalog.json",
  "modules/home.js", "modules/archive/pages.js", "modules/import/pages.js", "modules/journal/pages.js", "modules/search/pages.js", "modules/taste/pages.js",
  "modules/layout/i18n.js", "modules/layout/icons.js", "modules/layout/paths.js", "modules/layout/shell.js",
  "modules/music/account.js", "modules/music/album-import.js", "modules/music/album-narrative.js", "modules/music/analysis.js", "modules/music/api.js", "modules/music/cloud-sync.js", "modules/music/data.js", "modules/music/entropy.js", "modules/music/geometry.js", "modules/music/groups.js", "modules/music/insights.js", "modules/music/journal.js", "modules/music/lifecycle.js", "modules/music/matching.js", "modules/music/memory.js", "modules/music/metadata.js", "modules/music/notes.js", "modules/music/portrait.js", "modules/music/resilience.js", "modules/music/sonic.js", "modules/music/sync.js", "modules/music/taste-dna.js", "modules/music/versions.js",
  "modules/rating/interactions.js", "modules/rating/pages.js", "modules/rating/visuals.js",
].map((path) => new URL(path, self.registration.scope).href);

self.addEventListener("install", (event) => { event.waitUntil(caches.open(cacheName).then((cache) => Promise.all(shell.map((url) => cache.add(new Request(url, { cache: "reload" })))))); });
self.addEventListener("activate", (event) => { event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith(cachePrefix) && key !== cacheName).map((key) => caches.delete(key))))); });
self.addEventListener("message", (event) => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("fetch", (event) => {
  const request = event.request; const url = new URL(request.url); if (request.method !== "GET" || url.pathname.includes("/api/") || url.pathname.endsWith("/healthz")) return;
  if (request.mode === "navigate") { event.respondWith(fetch(request).catch(() => caches.match(new URL("index.html", self.registration.scope).href))); return; }
  if (url.origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => cached || fetch(request)));
});
