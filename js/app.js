/* ═══════════════════════════════════════════
   app.js — Entry point: init modules per page
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  try {
    var page = window.CDTU.Utils ? window.CDTU.Utils.getPage() : 'unknown';

    if (window.CDTU.Theme) {
      try { window.CDTU.Theme.init(); } catch(e) { console.warn('Theme init failed:', e); }
    }

    // Register Service Worker (PWA)
    if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
      window.addEventListener('load', function() {
        navigator.serviceWorker.register('sw.js').catch(function() {});
      });
    }

    window.CDTU.App = { page: page };
  } catch(e) {
    // Failsafe: page still works even if app.js fails
    console.warn('App init failed:', e);
  }
})();
