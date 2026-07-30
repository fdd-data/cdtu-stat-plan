/* ═══════════════════════════════════════════
   utils.js — DOM helpers & shared utilities
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  const U = {};

  U.$ = (sel, ctx) => (ctx || document).querySelector(sel);
  U.$$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  U.debounce = function(fn, ms) {
    let t;
    return function(...args) { clearTimeout(t); t = setTimeout(() => fn.apply(this, args), ms); };
  };

  U.throttle = function(fn, ms) {
    let last = 0;
    return function(...args) {
      const now = Date.now();
      if (now - last >= ms) { last = now; fn.apply(this, args); }
    };
  };

  U.getPage = function() {
    const p = document.body.dataset.page || 'home';
    return p;
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.Utils = U;
})();
