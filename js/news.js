/* ═══════════════════════════════════════════
   news.js — Dynamic announcement loader
   Reads data/announcements.json, renders notice list
   Auto-refreshes via GitHub Actions every 6 hours
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  var DATA_URL = 'data/announcements.json';
  var CACHE_KEY = 'cdtu-news-cache';
  var CACHE_TTL = 60 * 60 * 1000; // 1 hour client cache

  var catTagMap = {
    '竞赛': 'tag-competition',
    '实习': 'tag-internship',
    '讲座': 'tag-lecture',
    '考研': 'tag-academic',
    '技术': 'tag-lecture',
    '学术': 'tag-academic'
  };

  function renderAnnouncements(items, isFresh) {
    var el = document.getElementById('notice-list');
    if (!el) return;

    if (!items || items.length === 0) return; // Keep static HTML fallback

    var html = '';
    items.forEach(function(item) {
      var tagClass = catTagMap[item.cat] || 'tag-lecture';
      html += '<div class="notice-item">';
      html += '<span class="notice-date">' + escapeHtml(item.date) + '</span>';
      html += '<span class="notice-tag ' + tagClass + '">' + escapeHtml(item.cat) + '</span>';
      html += '<a href="' + escapeHtml(item.url) + '" target="_blank" rel="noopener">' + escapeHtml(item.title) + '</a>';
      if (item.lang === 'en') {
        html += '<span class="notice-lang" title="英文来源">🌐</span>';
      }
      html += '</div>';
    });

    // Add auto-update indicator
    if (isFresh) {
      html += '<div class="notice-footer">' +
        '<span class="notice-auto-badge">🤖 自动聚合 · RSS 源每 6 小时更新</span>' +
        '<span class="notice-rss-links">' +
          '<a href="https://cosx.org/feed" target="_blank" rel="noopener" title="统计之都">COS</a> · ' +
          '<a href="https://www.kdnuggets.com/feed" target="_blank" rel="noopener" title="KDnuggets">KDn</a> · ' +
          '<a href="http://export.arxiv.org/rss/stat" target="_blank" rel="noopener" title="arXiv Stat">arXiv</a>' +
        '</span>' +
      '</div>';
    }

    el.innerHTML = html;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function load() {
    // Try cache first
    try {
      var cached = JSON.parse(localStorage.getItem(CACHE_KEY));
      if (cached && cached.ts && (Date.now() - cached.ts < CACHE_TTL) && cached.data && cached.data.length > 0) {
        renderAnnouncements(cached.data, true);
      }
    } catch(e) { /* ignore */ }

    // Fetch latest
    fetch(DATA_URL)
      .then(function(r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function(data) {
        if (data && data.length > 0) {
          renderAnnouncements(data, true);
          // Update cache
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
          } catch(e) { /* quota exceeded, ignore */ }
        }
      })
      .catch(function() {
        // Fetch failed — keep whatever is showing (cached or static HTML)
        console.log('📡 News fetch failed, using cached/static content');
      });
  }

  // Auto-load when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', load);
  } else {
    load();
  }
})();
