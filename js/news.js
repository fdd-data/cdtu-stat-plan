/* ═══════════════════════════════════════════
   news.js — Generic dynamic feed loader
   Renders data/*.json into any container
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  var CACHE_TTL = 60 * 60 * 1000; // 1 hour

  var catTagMap = {
    '竞赛': 'tag-competition', '实习': 'tag-internship',
    '讲座': 'tag-lecture',     '考研': 'tag-academic',
    '技术': 'tag-lecture',     '学术': 'tag-academic',
    '书单': 'tag-internship',  '资源': 'tag-academic'
  };

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function render(el, items, showFooter) {
    if (!el || !items || !items.length) return;
    var html = '';
    items.forEach(function(item) {
      var tc = catTagMap[item.cat] || 'tag-lecture';
      html += '<div class="notice-item">';
      html += '<span class="notice-date">' + escapeHtml(item.date) + '</span>';
      html += '<span class="notice-tag ' + tc + '">' + escapeHtml(item.cat) + '</span>';
      html += '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a>';
      if (item.lang === 'en') html += '<span class="notice-lang" title="英文来源">🌐</span>';
      html += '</div>';
    });
    if (showFooter) {
      html += '<div class="notice-footer">' +
        '<span class="notice-auto-badge">🤖 RSS 自动聚合 · 每6小时更新</span>' +
        '<span class="notice-rss-links">' +
          '<a href="https://cosx.org/feed" target="_blank" rel="noopener">COS</a> · ' +
          '<a href="https://www.kdnuggets.com/feed" target="_blank" rel="noopener">KDn</a> · ' +
          '<a href="http://export.arxiv.org/rss/stat" target="_blank" rel="noopener">arXiv</a>' +
        '</span></div>';
    }
    el.innerHTML = html;
  }

  function loadFeed(url, containerId, showFooter) {
    var el = document.getElementById(containerId);
    if (!el) return;

    // Try cache
    var cacheKey = 'cdtu-feed-' + containerId;
    try {
      var cached = JSON.parse(localStorage.getItem(cacheKey));
      if (cached && cached.ts && (Date.now() - cached.ts < CACHE_TTL) && cached.data && cached.data.length) {
        render(el, cached.data, showFooter);
      }
    } catch(e) {}

    // Fetch latest
    fetch(url)
      .then(function(r) { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); })
      .then(function(data) {
        if (data && data.length) {
          render(el, data, showFooter);
          try { localStorage.setItem(cacheKey, JSON.stringify({ts:Date.now(),data:data})); }
          catch(e) {}
        }
      })
      .catch(function() { /* keep cached/static fallback */ });
  }

  // Auto-discover feeds from DOM: data-feed="url" data-container="id"
  function autoDiscover() {
    var feedEls = document.querySelectorAll('[data-feed]');
    feedEls.forEach(function(el) {
      var url = el.getAttribute('data-feed');
      var container = el.getAttribute('data-container') || el.id;
      var showFooter = el.hasAttribute('data-show-footer');
      if (url && container) {
        loadFeed(url, container, showFooter);
      }
    });
  }

  // Manual API
  window.CDTU = window.CDTU || {};
  window.CDTU.FeedLoader = { load: loadFeed, autoDiscover: autoDiscover };

  // Auto-discover on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoDiscover);
  } else {
    autoDiscover();
  }
})();
