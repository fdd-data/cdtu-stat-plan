/* ═══════════════════════════════════════════
   music-player.js — Background music player
   YouTube-embedded Chinese pop ballads
   CDTU 应用统计学四年规划 | FDD
   ═══════════════════════════════════════════ */
(function() {
  'use strict';

  // ── Playlist: Chinese sad/emotional pop songs ──
  // Video IDs can be updated by editing this array
  const PLAYLIST = [
    { title: '十年',          artist: '陈奕迅',      videoId: 'lYgX57RjXfs' },
    { title: '安静',          artist: '周杰伦',      videoId: 'YVqAmB-6Xzk' },
    { title: '她说',          artist: '林俊杰',      videoId: 'wQ7A2Scj9qA' },
    { title: '演员',          artist: '薛之谦',      videoId: 'XKuL5xaKZHM' },
    { title: '消愁',          artist: '毛不易',      videoId: '4FvzN0MgzqQ' },
    { title: '小幸运',        artist: '田馥甄',      videoId: '_sQSXwdtxlY' },
    { title: '说好的幸福呢',  artist: '周杰伦',      videoId: 'GY7G7hJ0iRw' },
    { title: '好久不见',      artist: '陈奕迅',      videoId: 'U7dN8Q2GEs8' },
    { title: '忽然之间',      artist: '莫文蔚',      videoId: 'Fz82ncmM8F0' },
    { title: '后来',          artist: '刘若英',      videoId: 't0igPuDzorg' },
    { title: '体面',          artist: '于文文',      videoId: 'vtRJgJJd0a0' },
    { title: '可惜没如果',    artist: '林俊杰',      videoId: 'vsBf_0gDxSM' },
    { title: '等你下课',      artist: '周杰伦',      videoId: 'k2C2_N4kRh4' },
    { title: '错过',          artist: '梁静茹',      videoId: 'WrGzPJw1FwA' },
    { title: '独角戏',        artist: '许茹芸',      videoId: 'KfZBhF8tUKU' },
  ];

  let currentIdx = 0;
  let isPlaying = false;
  let player = null;
  let volume = 50;
  let panelEl = null;
  let toggleBtn = null;

  // YouTube Iframe API ready callback
  function onYouTubeIframeAPIReady() {
    player = new YT.Player('music-youtube-player', {
      videoId: PLAYLIST[0].videoId,
      playerVars: { autoplay: 0, controls: 0, modestbranding: 1, rel: 0, showinfo: 0 },
      events: {
        onReady: function() { player.setVolume(volume); },
        onStateChange: function(e) {
          if (e.data === YT.PlayerState.ENDED) { nextTrack(); }
        }
      }
    });
  }
  window.onYouTubeIframeAPIReady = onYouTubeIframeAPIReady;

  function ensurePlayer() {
    // Lazy-load YouTube iframe API
    if (!document.getElementById('yt-iframe-api')) {
      var tag = document.createElement('script');
      tag.id = 'yt-iframe-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      var firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  function loadTrack(idx) {
    currentIdx = idx;
    if (player && player.loadVideoById) {
      player.loadVideoById(PLAYLIST[idx].videoId);
      if (isPlaying) player.playVideo();
    }
    updatePanelInfo();
  }

  function playPause() {
    if (!player) { ensurePlayer(); loadTrack(0); }
    if (isPlaying) {
      player.pauseVideo();
      isPlaying = false;
    } else {
      player.playVideo();
      isPlaying = true;
    }
    updateToggleState();
  }

  function nextTrack() {
    const next = (currentIdx + 1) % PLAYLIST.length;
    loadTrack(next);
    if (!isPlaying) { isPlaying = true; }
    updateToggleState();
  }

  function prevTrack() {
    const prev = (currentIdx - 1 + PLAYLIST.length) % PLAYLIST.length;
    loadTrack(prev);
    if (!isPlaying) { isPlaying = true; }
    updateToggleState();
  }

  function setVolume(v) {
    volume = v;
    if (player && player.setVolume) { player.setVolume(v); }
    localStorage.setItem('cdtu-music-volume', v);
  }

  function updateToggleState() {
    if (toggleBtn) { toggleBtn.classList.toggle('playing', isPlaying); }
    const icon = toggleBtn ? toggleBtn.querySelector('.music-icon-text') : null;
    if (icon) { icon.textContent = isPlaying ? '🎵' : '🎧'; }
  }

  function updatePanelInfo() {
    const t = PLAYLIST[currentIdx];
    const titleEl = document.querySelector('.music-track-title');
    const artistEl = document.querySelector('.music-track-artist');
    if (titleEl) titleEl.textContent = t.title;
    if (artistEl) artistEl.textContent = t.artist;

    // Update active tag
    document.querySelectorAll('.music-tag').forEach(function(el, i) {
      el.classList.toggle('active', i === currentIdx);
    });
  }

  function togglePanel() {
    if (!panelEl) return;
    const open = panelEl.classList.contains('open');
    if (open) { closePanel(); } else { openPanel(); }
  }

  function openPanel() {
    if (!panelEl) { buildPanel(); }
    panelEl.classList.add('open');
    ensurePlayer();
    updatePanelInfo();
  }

  function closePanel() {
    if (panelEl) { panelEl.classList.remove('open'); }
  }

  function buildPanel() {
    panelEl = document.getElementById('app-music-panel');
    if (!panelEl) return;

    var html = '<div class="music-player-panel" id="music-panel-inner">';
    html += '<div class="music-panel-header">';
    html += '<h3>🎧 音乐播放器</h3>';
    html += '<button class="music-close" onclick="CDTU.MusicPlayer.closePanel()">✕</button>';
    html += '</div>';

    // Genre tabs
    html += '<div class="music-selector" id="music-playlist">';
    PLAYLIST.forEach(function(song, i) {
      html += '<button class="music-tag' + (i === 0 ? ' active' : '') + '" onclick="CDTU.MusicPlayer.selectTrack(' + i + ')" title="' + song.artist + ' - ' + song.title + '">' + song.title + '</button>';
    });
    html += '</div>';

    // Controls
    html += '<div class="music-controls">';
    html += '<button class="music-play-btn" onclick="CDTU.MusicPlayer.playPause()" id="music-play-btn">▶</button>';
    html += '<div class="music-info">';
    html += '<div class="music-track-title">' + PLAYLIST[0].title + '</div>';
    html += '<div class="music-track-artist">' + PLAYLIST[0].artist + '</div>';
    html += '</div>';
    html += '</div>';

    // Volume
    html += '<div class="music-volume">';
    html += '<span class="music-vol-icon">🔈</span>';
    html += '<input type="range" min="0" max="100" value="' + volume + '" oninput="CDTU.MusicPlayer.setVolume(this.value)">';
    html += '</div>';

    // YouTube player placeholder (hidden)
    html += '<div id="music-youtube-player" style="display:none;"></div>';

    html += '</div>';
    panelEl.innerHTML = html;

    // Track changes
    document.addEventListener('click', function(e) {
      if (panelEl && !panelEl.contains(e.target) && e.target !== toggleBtn && !toggleBtn.contains(e.target)) {
        closePanel();
      }
    });

    // Restore volume
    var savedVol = localStorage.getItem('cdtu-music-volume');
    if (savedVol) { volume = parseInt(savedVol); }
    var volSlider = document.querySelector('.music-volume input');
    if (volSlider) { volSlider.value = volume; }

    updatePlayBtn();
  }

  function updatePlayBtn() {
    var btn = document.getElementById('music-play-btn');
    if (btn) { btn.textContent = isPlaying ? '⏸' : '▶'; }
  }

  function selectTrack(idx) {
    if (idx === currentIdx && player && player.getPlayerState) {
      playPause();
      return;
    }
    loadTrack(idx);
    isPlaying = true;
    if (player && player.playVideo) { player.playVideo(); }
    updateToggleState();
    updatePlayBtn();
  }

  var MusicPlayer = {
    init: function() {
      toggleBtn = document.querySelector('.music-toggle');
      panelEl = document.getElementById('app-music-panel');
      if (toggleBtn) {
        toggleBtn.addEventListener('click', function() {
          if (!panelEl || !panelEl.querySelector('.music-player-panel')) {
            buildPanel();
          }
          togglePanel();
        });
      }
      // Restore saved volume
      var sv = localStorage.getItem('cdtu-music-volume');
      if (sv) { volume = parseInt(sv); }
    },
    togglePanel: togglePanel,
    openPanel: openPanel,
    closePanel: closePanel,
    playPause: function() {
      playPause();
      updatePlayBtn();
    },
    selectTrack: selectTrack,
    setVolume: function(v) { setVolume(parseInt(v)); },
    isPanelOpen: function() { return panelEl && panelEl.querySelector('.music-player-panel.open'); }
  };

  window.CDTU = window.CDTU || {};
  window.CDTU.MusicPlayer = MusicPlayer;
})();
