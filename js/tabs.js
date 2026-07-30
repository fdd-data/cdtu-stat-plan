/* ═══════════════════════════════════════════
   tabs.js — Year tab switching with URL hash
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  function switchTab(idx) {
    document.querySelectorAll('.tab-btn').forEach(function(b, i) {
      b.classList.toggle('active', i === idx);
      b.setAttribute('aria-selected', i === idx);
    });
    document.querySelectorAll('.tab-panel').forEach(function(p, i) {
      p.classList.toggle('active', i === idx);
    });
    // Update URL hash
    if (history.replaceState) {
      history.replaceState(null, null, '#year-' + (idx + 1));
    }
  }

  function init() {
    // Bind click to tab buttons
    document.querySelectorAll('.tab-btn').forEach(function(btn, i) {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', i === 0);
      btn.addEventListener('click', function() { switchTab(i); });
    });

    // Keyboard navigation for tabs
    var tabContainer = document.querySelector('.tabs');
    if (tabContainer) {
      tabContainer.addEventListener('keydown', function(e) {
        var tabs = Array.from(tabContainer.querySelectorAll('.tab-btn'));
        var idx = tabs.indexOf(document.activeElement);
        if (e.key === 'ArrowRight' && idx < tabs.length - 1) { e.preventDefault(); tabs[idx + 1].focus(); switchTab(idx + 1); }
        if (e.key === 'ArrowLeft' && idx > 0) { e.preventDefault(); tabs[idx - 1].focus(); switchTab(idx - 1); }
      });
    }

    // Restore from hash
    var hash = window.location.hash;
    if (hash && hash.indexOf('year-') === 0) {
      var yr = parseInt(hash.replace('#year-', ''));
      if (yr >= 1 && yr <= 4) { switchTab(yr - 1); }
    }

    // Mark tab panels with role
    document.querySelectorAll('.tab-panel').forEach(function(p) {
      p.setAttribute('role', 'tabpanel');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.Tabs = { switchTab: switchTab, init: init };
})();
