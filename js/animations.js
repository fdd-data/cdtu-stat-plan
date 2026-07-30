/* ═══════════════════════════════════════════
   animations.js — Scroll-based reveal animations
   Intersection Observer
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  function init() {
    var reveals = document.querySelectorAll('.reveal');
    if (!reveals.length) return;

    // Auto-stagger grid children
    document.querySelectorAll('.goal-grid, .career-grid, .comp-grid, .idea-grid, .book-grid, .res-grid, .sem-grid, .page-links').forEach(function(grid) {
      var children = grid.querySelectorAll('.reveal');
      children.forEach(function(child, i) {
        if (!child.dataset.delay) {
          child.style.animationDelay = (i * 0.1) + 's';
        }
      });
    });

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var anim = entry.target.dataset.animate || 'fade-in-up';
          entry.target.classList.add(anim);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    reveals.forEach(function(el) { observer.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.Animations = { init: init };
})();
