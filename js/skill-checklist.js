/* ═══════════════════════════════════════════
   skill-checklist.js — Interactive skill tracker
   Categorized checkboxes + localStorage
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';
  var KEY = 'cdtu-skills';

  var categories = [
    {
      name: '编程语言', icon: '💻',
      skills: ['Python基础语法', 'Python进阶(OOP)', 'Python工程化', 'R语言(dplyr+ggplot2)', 'Shell脚本', 'YAML配置']
    },
    {
      name: '数据处理', icon: '📊',
      skills: ['NumPy', 'Pandas基础', 'Pandas进阶(窗口函数)', '数据清洗脚本化', '大规模数据处理(Spark概念)', 'ETL流程概念']
    },
    {
      name: 'SQL', icon: '🗄️',
      skills: ['SELECT+WHERE+ORDER', 'JOIN+GROUP BY+子查询', '窗口函数', '复杂查询优化', 'CTE+索引概念', 'SQL面试手写']
    },
    {
      name: '可视化', icon: '📈',
      skills: ['Matplotlib', 'Seaborn', 'Tableau仪表板', 'Power BI', 'Plotly/ECharts', '数据产品化呈现']
    },
    {
      name: '机器学习', icon: '🤖',
      skills: ['Scikit-learn入门', 'XGBoost/LightGBM', '特征工程', '模型调参', '模型解释(SHAP/LIME)', '时间序列(ARIMA/Prophet)']
    },
    {
      name: '统计学', icon: '📐',
      skills: ['概率论基础', '数理统计(假设检验)', '回归分析', '实验设计', 'A/B测试', '统计面试题']
    },
    {
      name: '工具链', icon: '🔧',
      skills: ['Git/GitHub', 'Jupyter Notebook', 'VS Code/Terminal', 'Docker入门', 'Linux基础', 'CI/CD概念']
    },
    {
      name: '业务能力', icon: '💼',
      skills: ['行业报告阅读', '指标体系基础', 'A/B测试+归因', '用户画像', 'Case Interview', '分析报告撰写']
    },
    {
      name: '软技能', icon: '🗣️',
      skills: ['社团/团队协作', '技术博客写作', '简历打磨', '模拟面试', '薪资谈判', '职场沟通/PPT汇报']
    }
  ];

  function load() {
    try { return JSON.parse(localStorage.getItem(KEY)) || {}; }
    catch(e) { return {}; }
  }

  function save(data) { localStorage.setItem(KEY, JSON.stringify(data)); }

  function render() {
    var el = document.getElementById('skill-checklist');
    if (!el) return;

    var data = load();
    var html = '';
    var totalChecked = 0;
    var totalSkills = 0;

    categories.forEach(function(cat) {
      var checked = cat.skills.filter(function(s) { return data[cat.name + '|' + s]; }).length;
      var pct = cat.skills.length > 0 ? Math.round(checked / cat.skills.length * 100) : 0;
      totalChecked += checked;
      totalSkills += cat.skills.length;

      html += '<div class="skill-cat">';
      html += '<h4>' + cat.icon + ' ' + cat.name + ' <span class="cat-prog">' + checked + '/' + cat.skills.length + ' (' + pct + '%)</span></h4>';
      html += '<div class="progress-wrap"><div class="progress-fill" style="width:' + pct + '%;background:var(--success)"></div></div>';
      html += '<div class="skill-items">';
      cat.skills.forEach(function(skill) {
        var key = cat.name + '|' + skill;
        var isChecked = data[key] ? ' checked' : '';
        html += '<span class="skill-chk' + isChecked + '" data-key="' + key + '">';
        html += (data[key] ? '✅ ' : '⬜ ') + skill;
        html += '</span>';
      });
      html += '</div></div>';
    });

    // Overall progress
    var overallPct = totalSkills > 0 ? Math.round(totalChecked / totalSkills * 100) : 0;
    html = '<div class="tracker-summary">' +
      '<div class="progress-wrap"><div class="progress-fill" style="width:' + overallPct + '%;background:var(--primary-light)"></div></div>' +
      '<span class="tracker-stats">技能总进度：<strong>' + totalChecked + '</strong> / ' + totalSkills + '（' + overallPct + '%）</span>' +
      '</div>' + html;

    el.innerHTML = html;

    // Bind clicks
    el.querySelectorAll('.skill-chk').forEach(function(chk) {
      chk.addEventListener('click', function() {
        var key = this.dataset.key;
        var d = load();
        if (d[key]) { delete d[key]; } else { d[key] = Date.now(); }
        save(d);
        render();
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }

  window.CDTU = window.CDTU || {};
  window.CDTU.SkillChecklist = { render: render };
})();
