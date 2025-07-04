document.addEventListener('DOMContentLoaded', () => {
  const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
  const fullscreenGameOverVideo = document.getElementById('fullscreenGameOverVideo');
  const mainGameOverContent = document.getElementById('mainGameOverContent');
  // const smallGameOverVideo = document.getElementById('gameOverVideo'); // 小動画の参照は削除しました

  // 初期設定: メインコンテンツを非表示にし、全画面動画を表示
  mainGameOverContent.classList.add('hidden-content');
  fullscreenVideoContainer.classList.remove('hidden-content');

  // 全画面動画の再生を試みる
  fullscreenGameOverVideo.play().then(() => {
    console.log("全画面動画の自動再生を開始しました。");
  }).catch(error => {
    console.error("全画面動画の自動再生に失敗しました:", error);
    // 自動再生がブロックされた場合のフォールバック: すぐにメインコンテンツを表示
    fullscreenVideoContainer.classList.add('hidden-content');
    mainGameOverContent.classList.remove('hidden-content');
    console.log("全画面動画の自動再生がブロックされたため、直接メインコンテンツを表示します。");
    // 小動画は削除されたため、ここでの再生試行は不要
  });

  // 全画面動画の再生が終了したら、メインコンテンツに切り替える
  fullscreenGameOverVideo.addEventListener('ended', () => {
    console.log("全画面動画が終了しました。メインコンテンツに切り替えます。");
    fullscreenVideoContainer.classList.add('hidden-content'); // 全画面動画を非表示に
    mainGameOverContent.classList.remove('hidden-content'); // メインコンテンツを表示に

    // 小動画は削除されたため、ここでの再生試行は不要
  });

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
  const isRare = Math.random() < rareProbability;
  let selectedMessage;

  if (isRare) {
      selectedMessage = rareMessage;
      messageElement.classList.add('rare-message');
  } else {
      const randomIndex = Math.floor(Math.random() * messages.length);
      selectedMessage = messages[randomIndex];
      messageElement.classList.remove('rare-message');
  }
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
