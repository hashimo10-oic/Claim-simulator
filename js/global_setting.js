document.addEventListener('DOMContentLoaded', () => {
  const SETTINGS_KEYS = {
    VIDEO_ENABLED: 'videoEnabled',
    MUSIC_ENABLED: 'musicEnabled',
    COLOR_INVERSION_ENABLED: 'colorInversionEnabled',
    BGM_VOLUME: 'bgmVolume',
    SFX_VOLUME: 'sfxVolume'
  };

  // 色反転設定の適用
  const savedColorInversionEnabled = localStorage.getItem(SETTINGS_KEYS.COLOR_INVERSION_ENABLED);
  if (savedColorInversionEnabled === 'true') {
    document.body.classList.add('color-inverted');
  } else {
    document.body.classList.remove('color-inverted');
  }

  // 音楽設定の適用 (BGM)
  const savedMusicEnabled = localStorage.getItem(SETTINGS_KEYS.MUSIC_ENABLED);
  const backgroundMusic = document.getElementById('backgroundMusic');
  if (backgroundMusic) {
    if (savedMusicEnabled === 'false') {
      backgroundMusic.muted = true;
      backgroundMusic.pause();
    } else {
      backgroundMusic.muted = false;
      const savedBGMVolume = localStorage.getItem(SETTINGS_KEYS.BGM_VOLUME);
      if (savedBGMVolume !== null) {
        backgroundMusic.volume = parseFloat(savedBGMVolume);
      }
      // BGM再生を試みる関数
      const tryPlayBGM = () => {
        // BGMが有効かつ一時停止中の場合のみ再生を試みる
        if (backgroundMusic.paused && !backgroundMusic.muted) {
          backgroundMusic.play().then(() => {
            console.log("BGMの自動再生を試みました (global_settings.js)。");
          }).catch(error => {
            console.warn("BGMの自動再生がブロックされました (global_settings.js):", error);
            // ここでユーザーに再生を促すUIを表示することもできる
          });
        }
      };

      // DOMContentLoaded後、少し遅れて再生を試みる
      // これはブラウザがオーディオ要素を完全に準備する時間を与えるため
      setTimeout(tryPlayBGM, 100); // 100msの遅延

      // ユーザーがページをクリックしたときにBGM再生を試みる（フォールバック）
      // このリスナーは一度だけではなく、BGMが有効な限り常に機能する
      document.body.addEventListener('click', () => {
        tryPlayBGM();
      });
    }
  }

  // 動画設定の適用 (game_over.html, game_clear.html の全画面動画)
  const savedVideoEnabled = localStorage.getItem(SETTINGS_KEYS.VIDEO_ENABLED);
  const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
  const fullscreenVideo = document.getElementById('fullscreenGameOverVideo') || document.getElementById('fullscreenGameClearVideo');

  if (fullscreenVideoContainer && fullscreenVideo) {
    if (savedVideoEnabled === 'false') {
      fullscreenVideoContainer.classList.add('hidden-content');
      fullscreenVideo.pause();
      const mainContent = document.getElementById('mainGameOverContent') || document.getElementById('mainGameClearContent');
      if (mainContent) {
        mainContent.classList.remove('hidden-content');
      }
    } else {
      fullscreenVideoContainer.classList.remove('hidden-content'); // 表示を確実にする
    }
  }
});
