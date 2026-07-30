/* ═══════════════════════════════════════════
   components.js — Shared chrome injection
   Nav, Footer, Breadcrumbs, Back-to-top,
   Reading progress bar, Search overlay
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  var U = window.CDTU.Utils;
  var NAV = window.CDTU.NAV_ITEMS;
  var BREAD = window.CDTU.BREADCRUMB_MAP;
  var currentPage = U.getPage();

  function renderNav() {
    var el = document.getElementById('app-nav');
    if (!el) return;

    var html = '<button class="hamburger-btn" id="hamburger-btn" aria-label="菜单">☰</button>';
    html += '<div class="nav-inner" id="nav-inner">';
    NAV.forEach(function(item) {
      var active = (item.page === currentPage) ? ' active' : '';
      html += '<a href="' + item.href + '" class="nav-link' + active + '">' + item.label + '</a>';
    });
    html += '</div>';
    html += '<div class="nav-actions">';
    html += '<button class="stat-toggle nav-btn" title="描述统计计算器" onclick="CDTU.StatCalc.togglePanel()"><span class="nav-btn-icon">📊</span></button>';
    html += '<button class="nav-btn" id="search-trigger" title="搜索 (Ctrl+K)">🔍</button>';
    html += '<button class="theme-toggle nav-btn" id="theme-toggle-btn" title="切换暗色/亮色模式">🌓</button>';
    html += '</div>';
    el.innerHTML = html;

    // Hamburger toggle
    var hamburger = document.getElementById('hamburger-btn');
    var navInner = document.getElementById('nav-inner');
    if (hamburger && navInner) {
      hamburger.addEventListener('click', function() {
        var isOpen = navInner.classList.toggle('open');
        hamburger.textContent = isOpen ? '✕' : '☰';
      });

      // Close nav when clicking a link (mobile)
      navInner.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { navInner.classList.remove('open'); hamburger.textContent = '☰'; });
      });
    }

    // Theme toggle
    var themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', function() { window.CDTU.Theme.toggle(); });
    }
  }

  function renderBreadcrumb() {
    var el = document.getElementById('app-breadcrumb');
    if (!el) return;
    var crumbs = BREAD[currentPage];
    if (!crumbs || crumbs.length <= 1) { el.style.display = 'none'; return; }

    var html = '';
    crumbs.forEach(function(c, i) {
      if (i < crumbs.length - 1) {
        html += '<a href="' + c.href + '">' + c.label + '</a><span class="sep">›</span>';
      } else {
        html += '<span>' + c.label + '</span>';
      }
    });
    el.innerHTML = '<nav class="breadcrumb" aria-label="面包屑导航">' + html + '</nav>';
  }

  function renderFooter() {
    var el = document.getElementById('app-footer');
    if (!el) return;
    el.innerHTML = '<footer>' +
      '<div class="footer-brand">📊 应用统计学 · 四年学业规划 &nbsp;|&nbsp; 成都工业学院 · 大数据与人工智能学院</div>' +
      '<div class="footer-motto">保持好奇心，保持学习习惯。统计学不是一门课，是一种看世界的方式。</div>' +
      '<div class="footer-creator">👨‍💻 创作者：<strong>FDD</strong> &nbsp;|&nbsp; <a href="https://github.com/fdd-data/cdtu-stat-plan" target="_blank" rel="noopener" class="footer-gh-link">💻 查看源代码</a></div>' +
      '<div class="footer-tech">🛠️ 纯静态 · GitHub Pages · 零框架 · RSS 自动更新 · PWA 离线可用</div>' +
      '<div class="footer-copy">© 2026 · 最后更新：2026 年 7 月 &nbsp;|&nbsp; <span id="visit-count" class="visit-count"></span></div>' +
      '</footer>';
  }

  function renderBackToTop() {
    var el = document.getElementById('app-back-top');
    if (!el) return;
    el.innerHTML = '<button class="back-to-top" id="back-to-top-btn" title="回到顶部" aria-label="回到顶部">⬆</button>';

    var btn = document.getElementById('back-to-top-btn');
    if (!btn) return;

    var onScroll = U.throttle(function() {
      if (window.scrollY > 400) { btn.classList.add('visible'); }
      else { btn.classList.remove('visible'); }
    }, 150);

    btn.addEventListener('click', function() { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    window.addEventListener('scroll', onScroll);
  }

  function renderReadingBar() {
    var el = document.getElementById('app-reading-bar');
    if (!el) return;
    el.innerHTML = '<div class="reading-bar" id="reading-bar" style="width:0%"></div>';

    var bar = document.getElementById('reading-bar');
    if (!bar) return;

    var onScroll = U.throttle(function() {
      var h = document.documentElement;
      var total = h.scrollHeight - h.clientHeight;
      var pct = total > 0 ? (window.scrollY / total) * 100 : 0;
      bar.style.width = Math.min(100, pct) + '%';
    }, 50);

    window.addEventListener('scroll', onScroll);
  }

  function renderSearch() {
    var el = document.getElementById('app-search-overlay');
    if (!el) return;

    var html = '<div class="search-overlay" id="search-overlay">';
    html += '<div class="search-box">';
    html += '<div class="search-input-wrap">';
    html += '<span class="search-icon">🔍</span>';
    html += '<input type="text" id="search-input" placeholder="搜索课程、技能、竞赛…" autocomplete="off">';
    html += '<span class="search-hint">Esc</span>';
    html += '</div>';
    html += '<div class="search-results" id="search-results"></div>';
    html += '</div>';
    html += '</div>';
    el.innerHTML = html;

    // Event bindings
    var overlay = document.getElementById('search-overlay');
    var input = document.getElementById('search-input');
    var results = document.getElementById('search-results');
    var trigger = document.getElementById('search-trigger');

    if (!overlay || !input || !results) return;

    function openSearch() {
      overlay.classList.add('open');
      setTimeout(function() { input.focus(); }, 100);
    }
    function closeSearch() { overlay.classList.remove('open'); input.value = ''; results.innerHTML = ''; }

    if (trigger) { trigger.addEventListener('click', openSearch); }
    overlay.addEventListener('click', function(e) { if (e.target === overlay) closeSearch(); });

    document.addEventListener('keydown', function(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
      if (e.key === 'Escape' && overlay.classList.contains('open')) { e.preventDefault(); closeSearch(); }
    });

    // Search logic
    var doSearch = U.debounce(function(query) {
      if (!query || query.length < 1) { results.innerHTML = ''; return; }
      var idx = window.CDTU.SearchIndex || [];
      var q = query.toLowerCase();
      var matched = idx.filter(function(item) {
        return item.title.toLowerCase().indexOf(q) >= 0 ||
               (item.keywords || '').toLowerCase().indexOf(q) >= 0 ||
               (item.snippet || '').toLowerCase().indexOf(q) >= 0 ||
               (item.page || '').toLowerCase().indexOf(q) >= 0;
      }).slice(0, 15);

      if (matched.length === 0) {
        results.innerHTML = '<div class="search-empty">未找到相关内容，试试其他关键词</div>';
      } else {
        results.innerHTML = matched.map(function(item) {
          return '<a href="' + item.url + '" class="search-result">' +
            '<div class="sr-title">' + item.title + '</div>' +
            '<div class="sr-snippet">' + (item.snippet || '') + '</div>' +
            '<div class="sr-page">📄 ' + (item.page || '') + '</div>' +
            '</a>';
        }).join('');
      }
    }, 200);

    input.addEventListener('input', function() { doSearch(this.value); });
  }

  // ── Init ──
  function init() {
    renderNav();
    renderBreadcrumb();
    renderBackToTop();
    renderReadingBar();
    renderSearch();
    renderFooter();

    // Visit counter
    var visits = parseInt(localStorage.getItem('cdtu-visits') || '0') + 1;
    localStorage.setItem('cdtu-visits', visits);
    var vcEl = document.getElementById('visit-count');
    if (vcEl) vcEl.textContent = '👀 你已访问 ' + visits + ' 次';

    // Stat calculator init (if module loaded)
    if (window.CDTU.StatCalc) {
      window.CDTU.StatCalc.init();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.CDTU.Components = { init: init };
})();
