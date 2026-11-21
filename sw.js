// Treino em Dupla — deixa o app abrir mesmo sem internet na academia.
const CACHE = 'treino-v1';
const BASE = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).catch(() => {})); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
// rede primeiro (pega atualizações); sem internet, usa a cópia guardada
self.addEventListener('fetch', e => {
  if(e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const guardar = url.origin === location.origin || /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  e.respondWith(fetch(e.request).then(r => {
    if(r.ok && guardar){ const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined))));
});
