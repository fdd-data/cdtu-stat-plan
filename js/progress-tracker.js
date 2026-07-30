/* ═══════════════════════════════════════════
   progress-tracker.js — Interactive habit tracker
   localStorage persistence
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  var KEY = 'cdtu-progress';
  var U = window.CDTU.Utils;

  var defaultItems = [
    { id: 'h1', text: '每天1小时编程/数据分析练习', detail: '可以是刷题、看文档、复现一个图，但要坚持。四年累计1400+小时' },
    { id: 'h2', text: '每完成一个项目，写一篇总结文章', detail: '发布在知乎/CSDN/个人博客。这是你的被动简历' },
    { id: 'h3', text: '保持一个"分析日志"笔记本', detail: '每天遇到的数据分析问题、学到的技巧、踩过的坑，随手记录' },
    { id: 'h4', text: '每周至少读1篇行业分析报告', detail: '艾瑞、易观、QuestMobile的报告免费可读' },
    { id: 'h5', text: '关注3-5个数据分析优质博主/公众号', detail: '持续吸收行业动态、面试经验、工具更新' },
    { id: 'h6', text: '积极参加学科竞赛（每年至少1次）', detail: '数学建模、挑战杯、正大杯、统计建模大赛' },
    { id: 'h7', text: '维护GitHub绿墙，保持代码提交活跃度', detail: 'HR和技术面试官都会看你的GitHub' },
    { id: 'h8', text: '大二开始每学期至少1次模拟面试', detail: '找学长/老师/NLP工具练手，越早开始秋招越从容' },
    { id: 'h9', text: '完成第1段实习（大三寒假）', detail: '不挑公司和薪资，先积累经验' },
    { id: 'h10', text: 'GitHub数据分析项目 ≥ 8个', detail: '每个项目一个仓库+一篇分析文章' },
    { id: 'h11', text: 'LeetCode刷题 250+ 道', detail: '重点：数组、哈希表、字符串、SQL' },
    { id: 'h12', text: '通过CET-6（500+）', detail: '大二完成，关乎后续考研和工作' },
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e) { return {}; }
  }

  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function render() {
    var el = document.getElementById('progress-tracker');
    if (!el) return;
    var data = load();
    var total = defaultItems.length;
    var done = defaultItems.filter(function(item) { return data[item.id]; }).length;
    var pct = total > 0 ? Math.round(done / total * 100) : 0;

    var html = '<div class="tracker-summary">';
    html += '<div class="progress-wrap"><div class="progress-fill" style="width:' + pct + '%;background:var(--success)"></div></div>';
    html += '<span class="tracker-stats"><strong>' + done + '</strong> / ' + total + ' 项完成（' + pct + '%）</span>';
    html += '</div>';
    html += '<ul class="tracker-list" id="tracker-list">';
    defaultItems.forEach(function(item) {
      var checked = data[item.id] ? ' done' : '';
      html += '<li class="tracker-item' + checked + '" data-id="' + item.id + '">';
      html += '<span class="tracker-check">✓</span>';
      html += '<span class="tracker-text">' + item.text + '<small>' + item.detail + '</small></span>';
      html += '</li>';
    });
    html += '</ul>';
    html += '<div class="tracker-add">';
    html += '<input type="text" id="tracker-add-input" placeholder="添加自定义习惯...">';
    html += '<button id="tracker-add-btn">+ 添加</button>';
    html += '</div>';
    el.innerHTML = html;

    // Bind clicks
    el.querySelectorAll('.tracker-item').forEach(function(li) {
      li.addEventListener('click', function() {
        var id = this.dataset.id;
        var d = load();
        if (d[id]) { delete d[id]; } else { d[id] = Date.now(); }
        save(d);
        render();
      });
    });

    var addBtn = document.getElementById('tracker-add-btn');
    var addInput = document.getElementById('tracker-add-input');
    if (addBtn && addInput) {
      addBtn.addEventListener('click', function() {
        var txt = addInput.value.trim();
        if (!txt) return;
        var newId = 'custom_' + Date.now();
        var d = load();
        d[newId] = Date.now();
        defaultItems.push({ id: newId, text: txt, detail: '自定义习惯' });
        save(d);
        render();
      });
      addInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') { addBtn.click(); }
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.ProgressTracker = { render: render };
})();
