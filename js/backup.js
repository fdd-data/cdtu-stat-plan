/* ═══════════════════════════════════════════
   backup.js — Data export/import for all tools
   Survives cache clear, browser switch, device migration
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  var PREFIXES = ['cdtu-'];
  var LAST_BACKUP_KEY = 'cdtu-last-backup';

  function collectAllData() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      for (var p = 0; p < PREFIXES.length; p++) {
        if (key.indexOf(PREFIXES[p]) === 0) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  }

  function exportData() {
    var payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      exportedBy: 'CDTU Stat Plan Backup Tool',
      data: collectAllData()
    };

    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'cdtu-backup-' + today + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Record last backup time
    localStorage.setItem(LAST_BACKUP_KEY, Date.now());
    updateStatus();
    showToast('✅ 数据已备份！文件保存在下载目录');
  }

  function importData(file) {
    var reader = new FileReader();
    reader.onload = function(e) {
      try {
        var payload = JSON.parse(e.target.result);
        if (!payload.data || typeof payload.data !== 'object') {
          showToast('⚠️ 无效的备份文件');
          return;
        }
        var count = 0;
        for (var key in payload.data) {
          localStorage.setItem(key, payload.data[key]);
          count++;
        }
        localStorage.setItem(LAST_BACKUP_KEY, Date.now());
        showToast('✅ 已恢复 ' + count + ' 条数据！页面即将刷新...');
        updateStatus();
        // Refresh tools after 1s
        setTimeout(function() { location.reload(); }, 1200);
      } catch(err) {
        showToast('⚠️ 文件解析失败，请选择正确的备份文件');
      }
    };
    reader.readAsText(file);
  }

  function updateStatus() {
    var el = document.getElementById('backup-status');
    if (!el) return;
    var ts = localStorage.getItem(LAST_BACKUP_KEY);
    if (ts) {
      var d = new Date(parseInt(ts));
      el.textContent = '📅 上次备份：' + d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
      el.style.color = 'var(--success)';
    } else {
      el.textContent = '⚠️ 尚未备份，建议立即备份以防数据丢失';
      el.style.color = '#e67e22';
    }
  }

  function showToast(msg) {
    var existing = document.getElementById('backup-toast');
    if (existing) existing.remove();
    var toast = document.createElement('div');
    toast.id = 'backup-toast';
    toast.textContent = msg;
    toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);' +
      'background:#2c3e50;color:#fff;padding:12px 24px;border-radius:10px;font-size:.88rem;' +
      'z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.3);animation:toastIn .3s ease;pointer-events:none;';
    document.body.appendChild(toast);
    setTimeout(function() { toast.remove(); }, 2500);
  }

  // Add CSS animation
  var style = document.createElement('style');
  style.textContent = '@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}';
  document.head.appendChild(style);

  // Auto-check on load: remind if never backed up
  function autoRemind() {
    var ts = localStorage.getItem(LAST_BACKUP_KEY);
    var hasData = false;
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      for (var p = 0; p < PREFIXES.length; p++) {
        if (key.indexOf(PREFIXES[p]) === 0) { hasData = true; break; }
      }
    }
    if (hasData && !ts) {
      setTimeout(function() {
        showToast('💡 你有打卡数据但尚未备份，建议立即备份以防丢失');
      }, 3000);
    }
  }

  function render() {
    var el = document.getElementById('backup-section');
    if (!el) return;
    el.innerHTML =
      '<div class="backup-box">' +
        '<h4>💾 数据备份与恢复</h4>' +
        '<p class="backup-desc">备份你的习惯打卡、技能清单、GPA 数据。换设备或清缓存后一键恢复。</p>' +
        '<div class="backup-btns">' +
          '<button class="backup-btn backup-btn-save" onclick="CDTU.Backup.exportData()">📥 备份数据</button>' +
          '<label class="backup-btn backup-btn-load">📤 恢复数据<input type="file" accept=".json" style="display:none" onchange="CDTU.Backup.importData(this.files[0])"></label>' +
        '</div>' +
        '<div class="backup-status" id="backup-status"></div>' +
      '</div>';
    updateStatus();
    autoRemind();
  }

  var Backup = {
    exportData: exportData,
    importData: importData,
    updateStatus: updateStatus,
    render: render
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.Backup = Backup;

  // Auto-render
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
