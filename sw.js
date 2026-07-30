/* ═══════════════════════════════════════════
   sw.js — Service Worker (offline support)
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
var CACHE_NAME = 'cdtu-stat-v3';
var PRECACHE_URLS = [
  './',
  'index.html', 'plan.html', 'skills.html', 'career.html', 'tools.html',
  'css/base.css', 'css/components.css', 'css/animations.css',
  'js/utils.js', 'js/theme.js', 'js/navigation.js', 'js/components.js',
  'js/animations.js', 'js/tabs.js', 'js/faq.js', 'js/progress-tracker.js',
  'js/gpa-calculator.js', 'js/skill-checklist.js', 'js/search-index.js',
  'js/news.js', 'js/stat-calc.js', 'js/backup.js', 'js/app.js',
  'manifest.json', 'sitemap.xml'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // addAll fails if any single URL 404s, so use individual adds
      return Promise.allSettled(
        PRECACHE_URLS.map(function(url) {
          return cache.add(url).catch(function(err) {
            console.warn('SW: failed to precache ' + url, err);
          });
        })
      );
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  // Skip RSS JSON files — always try network for freshness
  if (event.request.url.includes('/data/')) return;

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetched = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var respClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, respClone);
          }).catch(function() { /* quota exceeded, ignore */ });
        }
        return response;
      }).catch(function() {
        if (cached) return cached;
        // Offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('index.html');
        }
        return new Response('Offline', { status: 503 });
      });
      return cached || fetched;
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
