const CACHE_NAME = "treinei-v4.3.L.2";

const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./src/css/css.css",
  "./src/js/script.js",
  "./manifest.json",
  "./biblioteca.txt",
];

// INSTALL → garante offline base
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// ACTIVATE
self.addEventListener("activate", (event) => {
  self.clients.claim();
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => key !== CACHE_NAME && caches.delete(key)))
    )
  );
});


// FETCH (inteligente)
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // 🚫 ignora coisas que não são http/https
  if (!url.protocol.startsWith("http")) return;

  // 🚫 só aceita GET
  if (event.request.method !== "GET") return;

  // 🔒 só cacheia coisas do seu próprio site
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (!response || response.status !== 200) {
          return response;
        }

        const clone = response.clone();

        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });

        return response;
      })
      .catch(() => caches.match(event.request))
  );
});

/*
  OBS: Eu não configurei essa parte do SW.js sozinho, usei bastante IA e pesquisas na internet
*/