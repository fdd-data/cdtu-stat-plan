/* ═══════════════════════════════════════════
   sw.js — Service Worker (offline support)
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
var CACHE_NAME = 'cdtu-stat-v2';
var PRECACHE_URLS = [
  './',
  'index.html',
  'plan.html',
  'skills.html',
  'career.html',
  'tools.html',
  'css/base.css',
  'css/components.css',
  'css/animations.css',
  'js/utils.js',
  'js/theme.js',
  'js/navigation.js',
  'js/components.js',
  'js/animations.js',
  'js/tabs.js',
  'js/faq.js',
  'js/progress-tracker.js',
  'js/gpa-calculator.js',
  'js/skill-checklist.js',
  'js/search-index.js',
  'js/stat-calc.js',
  'js/app.js',
  'manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('fetch', function(event) {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var fetched = fetch(event.request).then(function(response) {
        if (response && response.status === 200) {
          var respClone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, respClone);
          });
        }
        return response;
      }).catch(function() {
        return cached;
      });
      return cached || fetched;
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; }).map(function(k) { return caches.delete(k); })
      );
    })
  );
});
