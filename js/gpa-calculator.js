/* ═══════════════════════════════════════════
   gpa-calculator.js — Weighted GPA calculator
   Chinese university 4.0 scale + localStorage
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  var KEY = 'cdtu-gpa-courses';

  // Percent → GPA (4.0 scale, Chinese standard)
  function percentToGPA(pct) {
    if (pct >= 95) return 4.0;
    if (pct >= 90) return 3.8;
    if (pct >= 85) return 3.5;
    if (pct >= 80) return 3.0;
    if (pct >= 75) return 2.5;
    if (pct >= 70) return 2.0;
    if (pct >= 65) return 1.5;
    if (pct >= 60) return 1.0;
    return 0;
  }

  function loadCourses() {
    try { return JSON.parse(localStorage.getItem(KEY)) || getDefaultCourses(); }
    catch(e) { return getDefaultCourses(); }
  }

  function saveCourses(courses) { localStorage.setItem(KEY, JSON.stringify(courses)); }

  function getDefaultCourses() {
    return [
      { name: '高等数学', credit: 5, score: '' },
      { name: '线性代数', credit: 3, score: '' },
      { name: '概率论', credit: 3, score: '' },
      { name: '数理统计', credit: 4, score: '' },
      { name: 'Python编程', credit: 3, score: '' },
      { name: '大学英语', credit: 3, score: '' },
    ];
  }

  function calcGPA(courses) {
    var totalCredits = 0;
    var totalPoints = 0;
    var count = 0;
    courses.forEach(function(c) {
      var s = parseFloat(c.score);
      if (!isNaN(s) && s >= 0 && s <= 100) {
        totalCredits += c.credit;
        totalPoints += c.credit * percentToGPA(s);
        count++;
      }
    });
    return { gpa: totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '--', count: count, total: courses.length };
  }

  function render() {
    var el = document.getElementById('gpa-calculator');
    if (!el) return;

    var courses = loadCourses();
    var result = calcGPA(courses);

    var html = '<table class="gpa-table"><thead><tr>' +
      '<th>课程名称</th><th>学分</th><th>百分制成绩</th><th>绩点</th><th></th>' +
      '</tr></thead><tbody id="gpa-rows">';

    courses.forEach(function(c, i) {
      var s = parseFloat(c.score);
      var gpa = (!isNaN(s) && s >= 0 && s <= 100) ? percentToGPA(s).toFixed(1) : '—';
      html += '<tr data-idx="' + i + '">' +
        '<td><input type="text" class="gpa-name" value="' + c.name + '" placeholder="课程名"></td>' +
        '<td><input type="number" class="gpa-credit" value="' + c.credit + '" min="0.5" max="10" step="0.5" style="width:70px"></td>' +
        '<td><input type="number" class="gpa-score" value="' + c.score + '" min="0" max="100" placeholder="0-100" style="width:80px"></td>' +
        '<td><span class="gpa-point">' + gpa + '</span></td>' +
        '<td><button class="gpa-del-btn">✕</button></td>' +
        '</tr>';
    });
    html += '</tbody></table>';

    html += '<button class="gpa-add-btn" id="gpa-add-row">+ 添加课程</button>';
    html += '<button class="gpa-reset-btn" id="gpa-reset">↺ 重置</button>';

    html += '<div class="gpa-result"><div class="gpa-value" id="gpa-value">' + result.gpa + '</div>';
    html += '<div class="gpa-label">加权平均绩点（已录入 ' + result.count + '/' + result.total + ' 门课程）</div></div>';

    // Legend
    html += '<div class="gpa-legend"><strong>百分制→绩点换算</strong><table>';
    [[95,4.0],[90,3.8],[85,3.5],[80,3.0],[75,2.5],[70,2.0],[65,1.5],[60,1.0]].forEach(function(r) {
      html += '<tr><td>' + r[0] + '分以上</td><td><strong>' + r[1].toFixed(1) + '</strong></td></tr>';
    });
    html += '</table></div>';

    html += '<div class="gpa-preload"><button id="gpa-preload-btn">📋 填入示例数据</button></div>';

    el.innerHTML = html;

    // Bind events
    function recalc() {
      var rows = el.querySelectorAll('#gpa-rows tr');
      var newCourses = [];
      rows.forEach(function(row) {
        var nameEl = row.querySelector('.gpa-name');
        var creditEl = row.querySelector('.gpa-credit');
        var scoreEl = row.querySelector('.gpa-score');
        var pointEl = row.querySelector('.gpa-point');
        var name = nameEl ? nameEl.value : '';
        var credit = creditEl ? parseFloat(creditEl.value) || 0 : 0;
        var score = scoreEl ? scoreEl.value : '';
        newCourses.push({ name: name, credit: credit, score: score });
        var s = parseFloat(score);
        if (pointEl) { pointEl.textContent = (!isNaN(s) && s >= 0 && s <= 100) ? percentToGPA(s).toFixed(1) : '—'; }
      });
      saveCourses(newCourses);
      var r = calcGPA(newCourses);
      var gpaVal = document.getElementById('gpa-value');
      if (gpaVal) { gpaVal.textContent = r.gpa; }
      var label = el.querySelector('.gpa-label');
      if (label) { label.textContent = '加权平均绩点（已录入 ' + r.count + '/' + r.total + ' 门课程）'; }
    }

    el.addEventListener('input', function(e) {
      if (e.target.classList.contains('gpa-name') || e.target.classList.contains('gpa-credit') || e.target.classList.contains('gpa-score')) {
        recalc();
      }
    });

    el.addEventListener('click', function(e) {
      if (e.target.classList.contains('gpa-del-btn')) {
        var row = e.target.closest('tr');
        if (row) { row.remove(); recalc(); }
      }
    });

    var addBtn = document.getElementById('gpa-add-row');
    if (addBtn) {
      addBtn.addEventListener('click', function() {
        var tbody = document.getElementById('gpa-rows');
        if (!tbody) return;
        var idx = tbody.querySelectorAll('tr').length;
        var row = document.createElement('tr');
        row.setAttribute('data-idx', idx);
        row.innerHTML = '<td><input type="text" class="gpa-name" placeholder="课程名"></td>' +
          '<td><input type="number" class="gpa-credit" value="3" min="0.5" max="10" step="0.5" style="width:70px"></td>' +
          '<td><input type="number" class="gpa-score" min="0" max="100" placeholder="0-100" style="width:80px"></td>' +
          '<td><span class="gpa-point">—</span></td>' +
          '<td><button class="gpa-del-btn">✕</button></td>';
        tbody.appendChild(row);
        recalc();
      });
    }

    var resetBtn = document.getElementById('gpa-reset');
    if (resetBtn) {
      resetBtn.addEventListener('click', function() {
        if (confirm('确定要重置所有课程数据吗？')) {
          localStorage.removeItem(KEY);
          render();
        }
      });
    }

    var preloadBtn = document.getElementById('gpa-preload-btn');
    if (preloadBtn) {
      preloadBtn.addEventListener('click', function() {
        var sample = [
          { name: '高等数学', credit: 5, score: '88' },
          { name: '线性代数', credit: 3, score: '85' },
          { name: '概率论', credit: 3, score: '90' },
          { name: '数理统计', credit: 4, score: '92' },
          { name: 'Python编程', credit: 3, score: '86' },
          { name: '大学英语', credit: 3, score: '84' },
          { name: '数据库原理', credit: 3, score: '89' },
          { name: '多元统计分析', credit: 3, score: '87' },
        ];
        saveCourses(sample);
        render();
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.GPACalc = { render: render };
})();
