/* ═══════════════════════════════════════════
   stat-calc.js — Descriptive Statistics Calculator
   Paste numbers → instant summary stats
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  var panelEl = null;
  var toggleBtn = null;

  // ── Statistics functions ──
  function sort(arr) { return arr.slice().sort(function(a,b){ return a-b; }); }

  function sum(arr) { var s=0; for(var i=0;i<arr.length;i++) s+=arr[i]; return s; }

  function mean(arr) { return sum(arr)/arr.length; }

  function median(sorted) {
    var n = sorted.length, mid = Math.floor(n/2);
    return n%2===1 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
  }

  function mode(arr) {
    var freq={}, maxF=0, modes=[];
    for(var i=0;i<arr.length;i++){
      var v=arr[i]; freq[v]=(freq[v]||0)+1;
      if(freq[v]>maxF) maxF=freq[v];
    }
    for(var k in freq){ if(freq[k]===maxF) modes.push(parseFloat(k)); }
    if(modes.length===arr.length) return null; // no mode
    return modes.length===1 ? modes[0] : modes;
  }

  function variance(arr, m) {
    var s=0; for(var i=0;i<arr.length;i++) s+=Math.pow(arr[i]-m,2);
    return s/(arr.length-1); // sample variance
  }

  function stdDev(v) { return Math.sqrt(v); }

  function quantile(sorted, q) {
    var pos = (sorted.length-1)*q;
    var lo = Math.floor(pos), hi = Math.ceil(pos);
    if(lo===hi) return sorted[lo];
    return sorted[lo]*(hi-pos) + sorted[hi]*(pos-lo);
  }

  function range(sorted) { return sorted[sorted.length-1]-sorted[0]; }

  function iqr(sorted) { return quantile(sorted,0.75)-quantile(sorted,0.25); }

  function skewness(arr, m, sd) {
    if(sd===0) return 0;
    var s=0; for(var i=0;i<arr.length;i++) s+=Math.pow((arr[i]-m)/sd,3);
    return s*arr.length/((arr.length-1)*(arr.length-2));
  }

  function kurtosis(arr, m) {
    var n=arr.length, s2=0, s4=0;
    for(var i=0;i<n;i++){ var d=arr[i]-m; s2+=d*d; s4+=d*d*d*d; }
    var m2=s2/n, m4=s4/n;
    return n>3 ? ((n*(n+1)*m4 - 3*(n-1)*m2*m2*(n-1)) / ((n-1)*(n-2)*(n-3)*m2*m2)) : 0;
  }

  // ── Parse input ──
  function parseNumbers(text) {
    // Split by comma, space, newline, semicolon, tab
    var parts = text.split(/[,\s;，\t\n]+/).filter(function(x){ return x.trim()!==''; });
    var nums = [];
    for(var i=0;i<parts.length;i++){
      var v = parseFloat(parts[i]);
      if(!isNaN(v)) nums.push(v);
    }
    return nums;
  }

  // ── Render results ──
  function calc() {
    var input = document.getElementById('stat-input');
    var result = document.getElementById('stat-result');
    if(!input || !result) return;

    var raw = input.value.trim();
    if(!raw) { result.innerHTML='<div class="stat-placeholder">👆 在上方粘贴数据后自动计算</div>'; return; }

    var data = parseNumbers(raw);
    if(data.length < 2) { result.innerHTML='<div class="stat-error">⚠️ 请至少输入 2 个数字</div>'; return; }

    var sorted = sort(data);
    var n = data.length;
    var m = mean(data);
    var v = variance(data, m);
    var sd = stdDev(v);
    var med = median(sorted);
    var mod = mode(data);
    var q1 = quantile(sorted, 0.25);
    var q3 = quantile(sorted, 0.75);
    var sk = skewness(data, m, sd);
    var ku = kurtosis(data, m);

    var rows = [
      ['样本量 (n)', n],
      ['总和 (Σx)', sum(data).toFixed(4)],
      ['均值 (x̄)', m.toFixed(4)],
      ['中位数', med.toFixed(4)],
      ['众数', mod===null ? '无' : (Array.isArray(mod)?mod.join(', '):mod)],
      ['最小值', sorted[0]],
      ['最大值', sorted[n-1]],
      ['极差 (Range)', range(sorted).toFixed(4)],
      ['Q1 (25%)', q1.toFixed(4)],
      ['Q3 (75%)', q3.toFixed(4)],
      ['IQR', iqr(sorted).toFixed(4)],
      ['样本方差 (s²)', v.toFixed(4)],
      ['标准差 (s)', sd.toFixed(4)],
      ['变异系数 (CV)', m!==0 ? (sd/Math.abs(m)*100).toFixed(2)+'%' : '—'],
      ['偏度 (Skewness)', sk.toFixed(4)],
      ['峰度 (Kurtosis)', ku.toFixed(4)]
    ];

    var html = '<table class="stat-table"><tbody>';
    rows.forEach(function(r){
      html += '<tr><td class="st-label">'+r[0]+'</td><td class="st-value">'+r[1]+'</td></tr>';
    });
    html += '</tbody></table>';

    // Quick interpretation
    var interp = '';
    if(sk > 1) interp += '📐 右偏分布（长尾在右） ';
    else if(sk < -1) interp += '📐 左偏分布（长尾在左） ';
    else interp += '📐 近似对称分布 ';
    if(ku > 1) interp += '· 🔺 尖峰分布';
    else if(ku < -1) interp += '· 🔻 平峰分布';
    else interp += '· 📊 接近正态峰度';

    html += '<div class="stat-interp">'+interp+'</div>';
    result.innerHTML = html;
  }

  // ── Panel ──
  function togglePanel() {
    if(!panelEl) { buildPanel(); }
    var open = panelEl.classList.contains('open');
    if(open) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    if(!panelEl.querySelector('.stat-panel-inner')) buildPanel();
    panelEl.classList.add('open');
    setTimeout(function(){
      var inp = document.getElementById('stat-input');
      if(inp) inp.focus();
    }, 150);
  }

  function closePanel() {
    if(panelEl) panelEl.classList.remove('open');
  }

  function loadExample() {
    var inp = document.getElementById('stat-input');
    if(inp){
      inp.value = '78, 82, 85, 88, 90, 92, 95, 72, 68, 75, 80, 83, 86, 91, 77, 73, 81, 84, 89, 93, 70, 76, 79, 87, 94';
      calc();
    }
  }

  function clearAll() {
    var inp = document.getElementById('stat-input');
    var result = document.getElementById('stat-result');
    if(inp) inp.value = '';
    if(result) result.innerHTML = '<div class="stat-placeholder">👆 在上方粘贴数据后自动计算</div>';
  }

  function buildPanel() {
    panelEl = document.getElementById('app-stat-panel');
    if(!panelEl) return;

    var html = '<div class="stat-panel-inner">';
    html += '<div class="stat-panel-header">';
    html += '<h3>📊 描述统计计算器</h3>';
    html += '<button class="stat-close" onclick="CDTU.StatCalc.closePanel()">✕</button>';
    html += '</div>';

    html += '<textarea id="stat-input" class="stat-input" placeholder="粘贴数据到这里&#10;支持逗号、空格、换行分隔&#10;例如：78, 82, 85, 88, 90, 92, 95" rows="4"></textarea>';

    html += '<div class="stat-actions">';
    html += '<button class="stat-btn stat-btn-example" onclick="CDTU.StatCalc.loadExample()">📋 示例数据</button>';
    html += '<button class="stat-btn stat-btn-clear" onclick="CDTU.StatCalc.clearAll()">🗑 清空</button>';
    html += '</div>';

    html += '<div class="stat-result" id="stat-result">';
    html += '<div class="stat-placeholder">👆 在上方粘贴数据后自动计算</div>';
    html += '</div>';

    html += '</div>';
    panelEl.innerHTML = html;

    // Auto-calculate on input
    var inp = document.getElementById('stat-input');
    if(inp){
      var timer;
      inp.addEventListener('input', function(){
        clearTimeout(timer);
        timer = setTimeout(calc, 300);
      });
    }

    // Close on outside click
    document.addEventListener('click', function(e){
      if(panelEl && !panelEl.contains(e.target) && e.target!==toggleBtn && !toggleBtn.contains(e.target)){
        closePanel();
      }
    });
  }

  // ── Public API ──
  var StatCalc = {
    init: function(){
      toggleBtn = document.querySelector('.stat-toggle');
      panelEl = document.getElementById('app-stat-panel');
      if(toggleBtn){
        toggleBtn.addEventListener('click', function(){
          if(!panelEl.querySelector('.stat-panel-inner')) buildPanel();
          togglePanel();
        });
      }
    },
    togglePanel: togglePanel,
    openPanel: openPanel,
    closePanel: closePanel,
    loadExample: loadExample,
    clearAll: clearAll
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.StatCalc = StatCalc;

  // Auto-init: attach click handler when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function(){ StatCalc.init(); });
  } else {
    StatCalc.init();
  }
})();
