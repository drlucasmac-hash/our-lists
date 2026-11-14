// GL1.12 offline (Engine Room / Continue family grocery list app, Sat Nov 14 2026 PT).
// Keeps the app page, icons and fonts on the phone so Our Lists opens with no signal.
// The lists themselves are saved by the page (localStorage); this file never sees the family key.
var CACHE = 'our-lists-v12';
var CORE = ['./', 'index.html', 'config.js', 'manifest.webmanifest', 'icon-192-v3.png', 'apple-touch-icon-180-v3.png', 'favicon-48-v3.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(CACHE).then(function(c){ return c.addAll(CORE); }).then(function(){ return self.skipWaiting(); })); });
self.addEventListener('activate', function(e){ e.waitUntil(caches.keys().then(function(ks){ return Promise.all(ks.filter(function(k){ return k !== CACHE; }).map(function(k){ return caches.delete(k); })); }).then(function(){ return self.clients.claim(); })); });
self.addEventListener('fetch', function(e){
  var req = e.request; if (req.method !== 'GET') return;
  var u = new URL(req.url);
  if (u.origin === location.origin) {            // app files: try the network, fall back to the saved copy
    e.respondWith(fetch(req).then(function(r){ if (r.ok) { var cp = r.clone(); caches.open(CACHE).then(function(c){ c.put(req, cp); }); } return r; })
      .catch(function(){ return caches.match(req, {ignoreSearch: true}).then(function(r){ return r || caches.match('index.html'); }); }));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) {   // fonts: saved copy first
    e.respondWith(caches.match(req).then(function(r){ return r || fetch(req).then(function(n){ var cp = n.clone(); caches.open(CACHE).then(function(c){ c.put(req, cp); }); return n; }); }));
  }
});
