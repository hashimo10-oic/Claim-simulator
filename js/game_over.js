document.addEventListener('DOMContentLoaded', () => {
  const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
  const fullscreenGameOverVideo = document.getElementById('fullscreenGameOverVideo');
  const mainGameOverContent = document.getElementById('mainGameOverContent');

  // 動画ソースの定義とランダム選択ロジックを統合
  const videoSources = [
      'mv/game_over.mp4',
      'mv/game_over2.mp4',
      'mv/game_over3.mp4',
      'mv/game_over4.mp4'
  ];
  const randomIndex = Math.floor(Math.random() * videoSources.length);
  const selectedVideoSource = videoSources[randomIndex];

  if (fullscreenGameOverVideo) {
      fullscreenGameOverVideo.src = selectedVideoSource; // 動画ソースを設定
      // fullscreenGameOverVideo.loop は削除済み
      
      // 音量をlocalStorageから読み込む（存在すれば）
      const savedBGMVolume = localStorage.getItem('bgmVolume'); // BGMと同じボリューム設定を使う例
      if (savedBGMVolume !== null) {
          fullscreenGameOverVideo.volume = parseFloat(savedBGMVolume);
      } else {
          fullscreenGameOverVideo.volume = 0.5; // デフォルトの音量
      }
  } else {
      console.error("fullscreenGameOverVideo 要素が見つかりません。");
  }

  // localStorageから動画設定を読み込む
  const SETTINGS_KEYS = {
    VIDEO_ENABLED: 'videoEnabled'
  };
  const savedVideoEnabled = localStorage.getItem(SETTINGS_KEYS.VIDEO_ENABLED);
  const isVideoEnabled = (savedVideoEnabled === 'true' || savedVideoEnabled === null); // nullの場合はデフォルトで有効

  if (!isVideoEnabled) {
    // 動画が無効な場合、全画面動画を非表示にし、すぐにメインコンテンツを表示
    if (fullscreenVideoContainer) {
      fullscreenVideoContainer.classList.add('hidden-content');
    }
    if (fullscreenGameOverVideo) {
      fullscreenGameOverVideo.pause(); // 念のため動画を停止
    }
    if (mainGameOverContent) {
      mainGameOverContent.classList.remove('hidden-content');
    }
    console.log("動画設定が無効のため、ゲームオーバー画面をすぐに表示します。");
  } else {
    // 動画が有効な場合、全画面動画を表示し、再生を試みる
    if (mainGameOverContent) {
      mainGameOverContent.classList.add('hidden-content');
    }
    if (fullscreenVideoContainer) {
      fullscreenVideoContainer.classList.remove('hidden-content');
    }

    if (fullscreenGameOverVideo) {
      fullscreenGameOverVideo.play().then(() => {
        console.log("全画面動画の自動再生を開始しました。");
      }).catch(error => {
        console.error("全画面動画の自動再生に失敗しました:", error);
        // 自動再生がブロックされた場合のフォールバック: すぐにメインコンテンツを表示
        if (fullscreenVideoContainer) {
          fullscreenVideoContainer.classList.add('hidden-content');
        }
        if (mainGameOverContent) {
          mainGameOverContent.classList.remove('hidden-content');
        }
        console.log("全画面動画の自動再生がブロックされたため、直接メインコンテンツを表示します。");
      });

      // 全画面動画の再生が終了したら、メインコンテンツに切り替える
      fullscreenGameOverVideo.addEventListener('ended', () => {
        console.log("全画面動画が終了しました。メインコンテンツに切り替えます。");
        if (fullscreenVideoContainer) {
          fullscreenVideoContainer.classList.add('hidden-content'); // 全画面動画を非表示に
        }
        if (mainGameOverContent) {
          mainGameOverContent.classList.remove('hidden-content'); // メインコンテンツを表示に
        }
      });
    }
  }

  // 既存のランダムメッセージ表示ロジック
  const messages = [
      "お客様を怒らせてしまった...",
      "対応を間違えてしまった...",
      "失敗は成功の基、リベンジするかい？",
      "店長「給料下げとくね」",
      "事態が悪化してしまった...",
      "店の評価が☆１になってしまった...",
      "「プレイヤー、謝罪しろ」",
      "何がいけなかったのだろうか...？",
      "０点だ、次！",
      "(めんどくさいお客さんだぜ...)"
  ];
  const rareMessage = "橋本社長も大慌て！";
  const rareProbability = 0.005;
  const messageElement = document.getElementById('randomMessage');
  const containerElement = document.querySelector('.container'); // container要素を取得
  console.log("messageElement found:", messageElement);
  
  const isRare = Math.random() < rareProbability;
  let selectedMessage;

  if (isRare) {
      selectedMessage = rareMessage;
      messageElement.classList.add('rare-message');
      if (containerElement) {
          containerElement.classList.add('rare-background'); // レア背景を適用
      }
  } else {
      const randomIndex = Math.floor(Math.random() * messages.length);
      selectedMessage = messages[randomIndex];
      messageElement.classList.remove('rare-message'); // 通常メッセージの場合はレアスタイルを削除
      if (containerElement) {
          containerElement.classList.remove('rare-background'); // レア背景を削除
      }
  }
  console.log("selectedMessage:", selectedMessage);
  messageElement.textContent = selectedMessage;

  // 既存のボタンイベントハンドラ
  document.getElementById('doAgainButton').addEventListener('click', () => {
      console.log('「再挑戦」が選択されました。');
      window.location.href = "Level.html";
  });
  document.getElementById('differentPatternButton').addEventListener('click', () => {
      console.log('「難易度調整」が選択されました。');
      window.location.href = "Level.html";
  });
  document.getElementById('homeButton').addEventListener('click', () => {
      console.log('「メインメニューへ」が選択されました。');
      window.location.href = "start.html";
  });
});
