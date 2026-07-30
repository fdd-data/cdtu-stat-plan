/* ═══════════════════════════════════════════
   faq.js — FAQ accordion (replaces inline onclick)
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  function init() {
    document.querySelectorAll('.faq-q').forEach(function(q) {
      q.setAttribute('role', 'button');
      q.setAttribute('tabindex', '0');
      q.setAttribute('aria-expanded', 'false');

      q.addEventListener('click', function() {
        var item = this.parentElement;
        var isOpen = item.classList.toggle('open');
        this.setAttribute('aria-expanded', isOpen);
      });

      // Keyboard: Enter/Space to toggle
      q.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.FAQ = { init: init };
})();
