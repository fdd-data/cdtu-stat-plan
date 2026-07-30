/* ═══════════════════════════════════════════
   theme.js — Dark/Light theme with persistence
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  const KEY = 'cdtu-theme';

  const Theme = {
    get: function() {
      return localStorage.getItem(KEY) ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    },
    set: function(t) {
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem(KEY, t);
    },
    toggle: function() {
      const cur = document.documentElement.getAttribute('data-theme') || 'light';
      this.set(cur === 'dark' ? 'light' : 'dark');
    },
    init: function() {
      // Apply saved theme (called from inline script in <head> already, but re-check)
      const saved = this.get();
      if (document.documentElement.getAttribute('data-theme') !== saved) {
        this.set(saved);
      }
    }
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.Theme = Theme;
})();
