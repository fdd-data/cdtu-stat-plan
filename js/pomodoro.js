/* ═══════════════════════════════════════════
   pomodoro.js — Pomodoro Timer (Tomato Clock)
   25min focus + 5min break, Web Audio beep
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  // ── Config ──
  const FOCUS_TIME = 25 * 60;      // 25 min
  const SHORT_BREAK = 5 * 60;      // 5 min
  const LONG_BREAK = 15 * 60;      // 15 min
  const SESSIONS_BEFORE_LONG = 4;

  // ── State ──
  let mode = 'focus';              // 'focus' | 'shortBreak' | 'longBreak'
  let remaining = FOCUS_TIME;
  let totalSeconds = FOCUS_TIME;
  let timerId = null;
  let isRunning = false;
  let sessionCount = 0;
  let panelEl = null;
  let toggleBtn = null;

  // ── Audio beep (Web Audio API — no external deps) ──
  let audioCtx = null;
  function beep(freq, duration, type) {
    type = type || 'sine';
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch(e) { /* silent fail */ }
  }

  function playEndSound() {
    beep(880, 0.15); setTimeout(function() { beep(1100, 0.2); }, 200); setTimeout(function() { beep(1320, 0.3); }, 400);
  }

  function playTick() {
    beep(600, 0.05, 'square');
  }

  // ── Format ──
  function fmtTime(s) {
    var m = Math.floor(s / 60);
    var sec = s % 60;
    return String(m).padStart(2, '0') + ':' + String(sec).padStart(2, '0');
  }

  function pct() {
    return totalSeconds > 0 ? Math.round((remaining / totalSeconds) * 100) : 0;
  }

  // ── Timer logic ──
  function tick() {
    if (remaining <= 0) {
      switchMode();
      return;
    }
    remaining--;
    updateDisplay();
    timerId = setTimeout(tick, 1000);
  }

  function switchMode() {
    clearTimeout(timerId);
    timerId = null;
    isRunning = false;
    playEndSound();

    if (mode === 'focus') {
      sessionCount++;
      document.title = '🍅 × ' + sessionCount + ' | 休息一下!';
      if (sessionCount % SESSIONS_BEFORE_LONG === 0) {
        mode = 'longBreak';
        remaining = LONG_BREAK;
      } else {
        mode = 'shortBreak';
        remaining = SHORT_BREAK;
      }
    } else {
      mode = 'focus';
      remaining = FOCUS_TIME;
    }
    totalSeconds = remaining;
    updateDisplay();
    updatePanelState();
    notifyIfSupported();
  }

  function notifyIfSupported() {
    if (Notification && Notification.permission === 'granted') {
      var msg = mode === 'focus'
        ? '🍅 该专注了！' + sessionCount + ' 个番茄完成'
        : '☕ 休息时间到！回来继续加油';
      new Notification('番茄钟', { body: msg, icon: '📊' });
    }
  }

  function startPause() {
    // Request notification permission on first interaction
    if (Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (isRunning) {
      clearTimeout(timerId);
      timerId = null;
      isRunning = false;
    } else {
      if (remaining <= 0) {
        if (mode === 'focus') {
          remaining = FOCUS_TIME;
        } else if (mode === 'shortBreak') {
          remaining = SHORT_BREAK;
        } else {
          remaining = LONG_BREAK;
        }
        totalSeconds = remaining;
      }
      isRunning = true;
      timerId = setTimeout(tick, 1000);
    }
    updateDisplay();
    updatePanelState();
  }

  function reset() {
    clearTimeout(timerId);
    timerId = null;
    isRunning = false;
    mode = 'focus';
    remaining = FOCUS_TIME;
    totalSeconds = FOCUS_TIME;
    sessionCount = 0;
    document.title = '成都工业学院 · 应用统计学四年规划';
    updateDisplay();
    updatePanelState();
  }

  function skip() {
    clearTimeout(timerId);
    timerId = null;
    isRunning = false;
    switchMode();
  }

  // ── Display ──
  function updateDisplay() {
    var timeEl = document.getElementById('pomodoro-time');
    var labelEl = document.getElementById('pomodoro-label');
    var ringEl = document.getElementById('pomodoro-ring');
    var sessEl = document.getElementById('pomodoro-sessions');

    if (timeEl) timeEl.textContent = fmtTime(remaining);
    if (labelEl) {
      if (mode === 'focus') labelEl.textContent = '🔴 专注';
      else if (mode === 'shortBreak') labelEl.textContent = '🟢 短休息';
      else labelEl.textContent = '🔵 长休息';
    }
    if (ringEl) ringEl.style.setProperty('--progress', pct() + '%');
    if (sessEl) sessEl.textContent = '🍅 × ' + sessionCount;

    // Update nav button
    if (toggleBtn) {
      if (isRunning) {
        toggleBtn.classList.add('pomodoro-running');
        toggleBtn.querySelector('.nav-btn-icon').textContent = '🍅';
      } else {
        toggleBtn.classList.remove('pomodoro-running');
        toggleBtn.querySelector('.nav-btn-icon').textContent = '🍅';
      }
    }

    // Update document title
    if (isRunning) {
      var prefix = mode === 'focus' ? '🔴' : '☕';
      document.title = prefix + ' ' + fmtTime(remaining) + ' | 番茄钟';
    }
  }

  function updatePanelState() {
    var btn = document.getElementById('pomodoro-main-btn');
    if (btn) {
      btn.textContent = isRunning ? '⏸ 暂停' : '▶ 开始';
      btn.className = 'pomodoro-main-btn' + (isRunning ? ' running' : '');
    }
  }

  // ── Panel ──
  function togglePanel() {
    if (!panelEl) { buildPanel(); }
    var open = panelEl.classList.contains('open');
    if (open) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    if (!panelEl.querySelector('.pomodoro-panel-inner')) { buildPanel(); }
    panelEl.classList.add('open');
    updateDisplay();
    updatePanelState();
  }

  function closePanel() {
    if (panelEl) { panelEl.classList.remove('open'); }
  }

  function buildPanel() {
    panelEl = document.getElementById('app-pomodoro-panel');
    if (!panelEl) return;

    var html = '<div class="pomodoro-panel-inner">';
    html += '<div class="pomodoro-panel-header">';
    html += '<h3>🍅 番茄钟</h3>';
    html += '<button class="pomodoro-close" onclick="CDTU.Pomodoro.closePanel()">✕</button>';
    html += '</div>';

    // Timer ring
    html += '<div class="pomodoro-ring-wrap">';
    html += '<svg viewBox="0 0 200 200" class="pomodoro-ring-svg">';
    html += '<circle cx="100" cy="100" r="85" class="pomodoro-ring-bg"/>';
    html += '<circle cx="100" cy="100" r="85" class="pomodoro-ring-fill" id="pomodoro-ring" style="--progress:100%"/>';
    html += '</svg>';
    html += '<div class="pomodoro-time" id="pomodoro-time">' + fmtTime(remaining) + '</div>';
    html += '<div class="pomodoro-label" id="pomodoro-label">🔴 专注</div>';
    html += '</div>';

    // Mode selector
    html += '<div class="pomodoro-modes">';
    html += '<button class="pomodoro-mode-btn active" data-mode="focus" onclick="CDTU.Pomodoro.setMode(\'focus\')">🍅 专注 25</button>';
    html += '<button class="pomodoro-mode-btn" data-mode="shortBreak" onclick="CDTU.Pomodoro.setMode(\'shortBreak\')">☕ 休息 5</button>';
    html += '<button class="pomodoro-mode-btn" data-mode="longBreak" onclick="CDTU.Pomodoro.setMode(\'longBreak\')">🌿 长休 15</button>';
    html += '</div>';

    // Controls
    html += '<div class="pomodoro-controls">';
    html += '<button class="pomodoro-main-btn" id="pomodoro-main-btn" onclick="CDTU.Pomodoro.startPause()">▶ 开始</button>';
    html += '<button class="pomodoro-skip-btn" onclick="CDTU.Pomodoro.skip()" title="跳过当前阶段">⏭</button>';
    html += '<button class="pomodoro-reset-btn" onclick="CDTU.Pomodoro.reset()" title="重置">↺</button>';
    html += '</div>';

    // Session counter
    html += '<div class="pomodoro-sessions" id="pomodoro-sessions">🍅 × 0</div>';
    html += '<div class="pomodoro-hint">4 个番茄后 → 长休息 15 分钟</div>';

    html += '</div>';
    panelEl.innerHTML = html;

    // Close on outside click
    document.addEventListener('click', function(e) {
      if (panelEl && !panelEl.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        closePanel();
      }
    });
  }

  function setMode(newMode) {
    if (isRunning) {
      clearTimeout(timerId);
      timerId = null;
      isRunning = false;
    }
    mode = newMode;
    if (mode === 'focus') { remaining = FOCUS_TIME; }
    else if (mode === 'shortBreak') { remaining = SHORT_BREAK; }
    else { remaining = LONG_BREAK; }
    totalSeconds = remaining;

    // Update mode buttons
    var btns = document.querySelectorAll('.pomodoro-mode-btn');
    btns.forEach(function(b) { b.classList.remove('active'); });
    var activeBtn = document.querySelector('.pomodoro-mode-btn[data-mode="' + mode + '"]');
    if (activeBtn) activeBtn.classList.add('active');

    updateDisplay();
    updatePanelState();
  }

  // ── Public API ──
  var Pomodoro = {
    init: function() {
      toggleBtn = document.querySelector('.pomodoro-toggle');
      panelEl = document.getElementById('app-pomodoro-panel');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
          if (!panelEl.querySelector('.pomodoro-panel-inner')) { buildPanel(); }
          togglePanel();
        });
      }
      updateDisplay();
    },
    togglePanel: togglePanel,
    openPanel: openPanel,
    closePanel: closePanel,
    startPause: function() { startPause(); updatePanelState(); },
    setMode: setMode,
    reset: function() { reset(); updatePanelState(); },
    skip: function() { skip(); updatePanelState(); }
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.Pomodoro = Pomodoro;
})();
