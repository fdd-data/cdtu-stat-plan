/* ═══════════════════════════════════════════
   backup.js — Auto-sync data to GitHub Gist
   One-time setup → silent background sync
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  var GIST_ID_KEY = 'cdtu-gist-id';
  var TOKEN_KEY = 'cdtu-gh-token';
  var LAST_SYNC_KEY = 'cdtu-last-sync';
  var DIRTY_KEY = 'cdtu-dirty';
  var SYNC_DEBOUNCE = 5000; // 5s after last change
  var PREFIXES = ['cdtu-'];

  var syncTimer = null;
  var toastTimer = null;

  // ── Collect all cdtu-* data ──
  function collectData() {
    var data = {};
    for (var i = 0; i < localStorage.length; i++) {
      var key = localStorage.key(i);
      for (var p = 0; p < PREFIXES.length; p++) {
        if (key.indexOf(PREFIXES[p]) === 0 && key !== TOKEN_KEY && key !== GIST_ID_KEY && key !== DIRTY_KEY) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  }

  // ── GitHub Gist API ──
  function getToken() { return localStorage.getItem(TOKEN_KEY); }
  function getGistId() { return localStorage.getItem(GIST_ID_KEY); }

  function api(method, path, body, token) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open(method, 'https://api.github.com' + path, true);
      xhr.setRequestHeader('Authorization', 'token ' + token);
      xhr.setRequestHeader('Accept', 'application/vnd.github+json');
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error('API ' + xhr.status + ': ' + xhr.responseText.slice(0, 100)));
        }
      };
      xhr.onerror = function() { reject(new Error('Network error')); };
      xhr.send(body ? JSON.stringify(body) : null);
    });
  }

  function syncToGist() {
    var token = getToken();
    if (!token) return Promise.reject(new Error('No token'));

    var data = collectData();
    var gistId = getGistId();
    var content = {};
    content['cdtu-backup.json'] = { content: JSON.stringify({
      version: 2,
      syncedAt: new Date().toISOString(),
      data: data
    }, null, 2) };

    if (gistId) {
      // Update existing gist
      return api('PATCH', '/gists/' + gistId, { files: content }, token);
    } else {
      // Create new gist
      return api('POST', '/gists', {
        description: 'CDTU 应用统计学 · 个人数据备份（自动同步）',
        public: false,
        files: content
      }, token).then(function(gist) {
        localStorage.setItem(GIST_ID_KEY, gist.id);
        return gist;
      });
    }
  }

  function restoreFromGist(token) {
    var gistId = getGistId();
    if (!gistId) return Promise.reject(new Error('No gist ID'));
    return api('GET', '/gists/' + gistId, null, token).then(function(gist) {
      var file = gist.files && gist.files['cdtu-backup.json'];
      if (!file || !file.content) throw new Error('No backup file in gist');
      var payload = JSON.parse(file.content);
      if (!payload.data) throw new Error('Invalid backup format');
      var count = 0;
      for (var key in payload.data) {
        localStorage.setItem(key, payload.data[key]);
        count++;
      }
      return count;
    });
  }

  // ── Auto-sync scheduler ──
  function markDirty() {
    localStorage.setItem(DIRTY_KEY, '1');
    scheduleSync();
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(doSync, SYNC_DEBOUNCE);
  }

  function doSync() {
    if (!getToken()) return;
    syncToGist().then(function() {
      localStorage.setItem(LAST_SYNC_KEY, Date.now());
      localStorage.removeItem(DIRTY_KEY);
      updateStatus();
    }).catch(function() { /* silent fail */ });
  }

  // ── UI ──
  function showToast(msg, duration) {
    duration = duration || 2000;
    clearTimeout(toastTimer);
    var el = document.getElementById('sync-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sync-toast';
      el.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;' +
        'background:#27ae60;color:#fff;padding:8px 16px;border-radius:8px;' +
        'font-size:.8rem;box-shadow:0 4px 12px rgba(0,0,0,.2);' +
        'transition:opacity .3s;pointer-events:none;opacity:0;';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    toastTimer = setTimeout(function() { el.style.opacity = '0'; }, duration);
  }

  function updateStatus() {
    var el = document.getElementById('backup-status');
    if (!el) return;
    var ts = localStorage.getItem(LAST_SYNC_KEY) || localStorage.getItem('cdtu-last-backup');
    if (ts) {
      var d = new Date(parseInt(ts));
      el.innerHTML = '🟢 上次同步：' + d.toLocaleTimeString('zh-CN', {hour:'2-digit',minute:'2-digit'});
      el.style.color = 'var(--success)';
    }
  }

  // ── Public API ──
  var Backup = {
    // One-time setup
    setup: function(token) {
      localStorage.setItem(TOKEN_KEY, token);
      showToast('🔗 正在连接云端...');
      syncToGist().then(function() {
        localStorage.setItem(LAST_SYNC_KEY, Date.now());
        updateStatus();
        showToast('✅ 自动同步已开启！', 3000);
      }).catch(function(err) {
        showToast('❌ 连接失败，请检查Token: ' + err.message, 4000);
      });
    },

    // Manual restore from another device
    restore: function(token) {
      if (!token) token = getToken();
      if (!token) { showToast('⚠️ 请先设置Token'); return; }
      showToast('📥 正在拉取云端数据...');
      restoreFromGist(token).then(function(count) {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(LAST_SYNC_KEY, Date.now());
        updateStatus();
        showToast('✅ 已恢复 ' + count + ' 条数据！刷新中...', 3000);
        setTimeout(function() { location.reload(); }, 1500);
      }).catch(function(err) {
        showToast('❌ 恢复失败: ' + err.message, 4000);
      });
    },

    // Manual download backup
    exportFile: function() {
      var payload = { version: 2, exportedAt: new Date().toISOString(), data: collectData() };
      var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'cdtu-backup-' + new Date().toISOString().slice(0,10) + '.json';
      a.click();
      URL.revokeObjectURL(url);
      showToast('✅ 备份文件已下载');
    },

    importFile: function(file) {
      var reader = new FileReader();
      reader.onload = function(e) {
        try {
          var payload = JSON.parse(e.target.result);
          if (!payload.data) throw new Error('Invalid');
          var count = 0;
          for (var key in payload.data) { localStorage.setItem(key, payload.data[key]); count++; }
          showToast('✅ 已恢复 ' + count + ' 条！刷新中...', 3000);
          setTimeout(function() { location.reload(); }, 1500);
        } catch(err) { showToast('❌ 无效的备份文件'); }
      };
      reader.readAsText(file);
    },

    getStatus: function() { return getToken() ? 'connected' : 'unset'; },
    markDirty: markDirty,
    updateStatus: updateStatus
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.Backup = Backup;

  // ── Auto-init ──
  function render() {
    var el = document.getElementById('backup-section');
    if (!el) return;

    var hasToken = !!getToken();
    var html = '<div class="backup-box">';
    html += '<h4>☁️ 自动云同步</h4>';

    if (hasToken) {
      html += '<p class="backup-desc">✅ 已开启 · 数据自动同步到你的 GitHub Gist（私密）</p>';
      html += '<div class="backup-status" id="backup-status"></div>';
      html += '<div class="backup-btns" style="margin-top:12px">';
      html += '<button class="backup-btn backup-btn-save" onclick="CDTU.Backup.exportFile()">📥 手动备份下载</button>';
      html += '<label class="backup-btn backup-btn-load">📤 手动恢复上传<input type="file" accept=".json" style="display:none" onchange="CDTU.Backup.importFile(this.files[0])"></label>';
      html += '</div>';
    } else {
      html += '<p class="backup-desc">设置一次 GitHub Token，之后所有数据自动静默同步到云端。换设备时自动恢复。</p>';
      html += '<div class="backup-setup">';
      html += '<input type="password" id="backup-token-input" class="backup-token-input" placeholder="粘贴 GitHub Token (ghp_...)">';
      html += '<button class="backup-btn backup-btn-save" onclick="CDTU.Backup.setup(document.getElementById(\'backup-token-input\').value)">🔗 开启自动同步</button>';
      html += '</div>';
      html += '<p class="backup-hint">Token 存储在浏览器本地，只用于创建私有 Gist。不懂？打开 <a href="https://github.com/settings/tokens/new?scopes=gist&description=CDTU-AutoBackup" target="_blank" rel="noopener">这个链接</a> 点一下生成就行。</p>';
      html += '<div class="backup-btns" style="margin-top:12px">';
      html += '<button class="backup-btn backup-btn-save" onclick="CDTU.Backup.exportFile()">📥 手动备份下载</button>';
      html += '<label class="backup-btn backup-btn-load">📤 手动恢复上传<input type="file" accept=".json" style="display:none" onchange="CDTU.Backup.importFile(this.files[0])"></label>';
      html += '</div>';
      html += '<p class="backup-desc" style="margin-top:10px">已有备份？<button class="backup-link" onclick="var t=prompt(\'粘贴你的GitHub Token:\');if(t)CDTU.Backup.restore(t)" style="background:none;border:none;color:var(--primary-light);cursor:pointer;text-decoration:underline;font:inherit">点此从云端恢复</button></p>';
    }
    html += '</div>';
    el.innerHTML = html;
    updateStatus();
  }

  // Hook into existing tools: mark dirty on localStorage changes
  var originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    originalSetItem.call(localStorage, key, value);
    for (var p = 0; p < PREFIXES.length; p++) {
      if (key.indexOf(PREFIXES[p]) === 0) { markDirty(); break; }
    }
  };

  // Periodic sync check (every 10 min, just in case)
  setInterval(function() {
    if (getToken() && localStorage.getItem(DIRTY_KEY) === '1') {
      doSync();
    }
  }, 600000);

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
  } else {
    render();
  }
})();
