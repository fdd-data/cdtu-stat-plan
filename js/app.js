/* ═══════════════════════════════════════════
   app.js — Entry point: init modules per page
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  var page = window.CDTU.Utils.getPage();

  if (window.CDTU.Theme) { window.CDTU.Theme.init(); }

  // Register Service Worker (PWA)
  if ('serviceWorker' in navigator && window.location.protocol === 'https:') {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('sw.js').catch(function() {});
    });
  }

  window.CDTU.App = { page: page };
})();
