/* ═══════════════════════════════════════════
   navigation.js — Nav data structure
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  window.CDTU = window.CDTU || {};

  window.CDTU.NAV_ITEMS = [
    { id: 'home',   href: 'index.html',   label: '🏠 首页',     page: 'home' },
    { id: 'plan',   href: 'plan.html',    label: '📅 四年规划',  page: 'plan' },
    { id: 'skills', href: 'skills.html',  label: '🧰 技能竞赛',  page: 'skills' },
    { id: 'career', href: 'career.html',  label: '💼 就业书单',  page: 'career' },
    { id: 'tools',  href: 'tools.html',   label: '🛠️ 工具FAQ',   page: 'tools' },
  ];

  window.CDTU.BREADCRUMB_MAP = {
    home:   [{ label: '首页', href: 'index.html' }],
    plan:   [{ label: '首页', href: 'index.html' }, { label: '四年规划' }],
    skills: [{ label: '首页', href: 'index.html' }, { label: '技能与竞赛' }],
    career: [{ label: '首页', href: 'index.html' }, { label: '就业与书单' }],
    tools:  [{ label: '首页', href: 'index.html' }, { label: '工具与FAQ' }],
  };
})();
