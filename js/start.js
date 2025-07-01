document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('mainTitle');
  const marqueeContent = mainTitle.querySelector('.marquee-content'); // 新しいラッパーdivを取得
  const scrollingTextItem = marqueeContent.querySelector('.scrolling-text-item');
  const scrollingTextItemClone = marqueeContent.querySelector('.scrolling-text-item-clone');
  const container = document.getElementById('mainContainer');

  // 背景音楽用のオーディオタグを取得するよ
  const backgroundMusic = document.getElementById('backgroundMusic');

  // メッセージの元となる短いフレーズ
  const baseTitleText = "カスタマーマスター"; // タイトルは常にこれにするよ

  // レアメッセージの元となる短いフレーズ
  const baseRareMessages = [
    "橋本社長考案！カスタマーマスター",
    "駿之介監督絶賛！カスタマーマスター",
    "前谷プロが作りました👍カスタマーマスター",
    "カスタマーYOUKOUマスター"
  ];

  const isRare = Math.random() < 0.05; // 5%

  // テキストを複数回繰り返して長い文字列を生成する関数
  // 無限ループのシームレスさを確保するため、テキストは十分な長さにする必要があるよ
  // ここでは、1つのアイテムに表示するテキストを生成するよ
  const generateSingleItemText = (message, repeatCount = 20) => { // 繰り返し回数を大幅に増やしたよ (例: 20)
    return Array(repeatCount).fill(message).join('　　'); // 全角スペースで区切って繰り返すよ
  };

  let actualTextForScrolling = ""; // 実際にスクロールアイテムに設定するテキスト

  if (isRare) {
    const message = baseRareMessages[Math.floor(Math.random() * baseRareMessages.length)];
    actualTextForScrolling = generateSingleItemText(message, 10); // レアメッセージも多めに繰り返す
    mainTitle.classList.add('rare-title');
    container.classList.remove('normal-background');
    container.classList.add('rare-background');
    console.log("🎉 レア演出が表示されました！");
  } else {
    actualTextForScrolling = generateSingleItemText(baseTitleText, 20); // 通常タイトルはさらに長めに繰り返す
    mainTitle.classList.remove('rare-title');
    container.classList.add('normal-background'); // 念のため通常背景を適用
  }

  // スクロールテキストコンテンツにテキストを設定
  scrollingTextItem.textContent = actualTextForScrolling;
  scrollingTextItemClone.textContent = actualTextForScrolling;

  // アニメーションの計算と設定
  // DOMがレンダリングされてから幅を取得するために、setTimeoutを使うよ
  setTimeout(() => {
    const singleItemWidth = scrollingTextItem.offsetWidth; // 1つのテキストアイテムの幅
    const textGapPx = parseFloat(getComputedStyle(scrollingTextItem).paddingRight); // CSSで設定したpadding-rightを取得

    // アニメーションの移動距離 = 1つのアイテムの幅 + 隙間
    const scrollDistance = -(singleItemWidth + textGapPx); // 左に移動するため負の値

    // スクロール速度 (px/秒)。この値を調整して速度を変えるよ
    const scrollSpeedPxPerSec = 60; // 以前の60px/秒を維持

    // アニメーション時間 = 距離 / 速度
    const animationDuration = Math.abs(scrollDistance) / scrollSpeedPxPerSec;

    // CSS変数に値を設定するよ
    marqueeContent.style.setProperty('--scroll-distance', `${scrollDistance}px`);
    marqueeContent.style.setProperty('--scroll-duration', `${animationDuration}s`);

    // アニメーションをリセットして再開することで、新しい設定を適用するよ
    marqueeContent.style.animation = 'none'; // 一旦アニメーションを停止
    void marqueeContent.offsetWidth; // 強制的にリフロー
    marqueeContent.style.animation = `scrollText var(--scroll-duration) linear infinite`; // アニメーションを再開

  }, 0); // DOMレンダリング後に実行

  // 「クレーム対応開始！」ボタンのイベントリスナー
  document.getElementById('startClaimButton').addEventListener('click', () => {
    console.log('「クレーム対応開始」が選択されました。');
    // 別のページに遷移するなら音楽を一時停止するよ
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  });

  // 「設定」ボタンのイベントリスナー
  document.getElementById('customerSettingsButton').addEventListener('click', () => {
    console.log('「設定」が選択されました。');
    // window.location.href = 'customer_settings.html'; // 必要に応じて遷移
    // 別のページに遷移するなら音楽を一時停止するよ
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  });

  // 多くのブラウザでは、ユーザーがページ上で何らかの操作を行うまで音声の自動再生がブロックされるよ。
  // そのため、ユーザーの最初のクリックで音楽が再生されるように試みるね。
  document.body.addEventListener('click', () => {
    // 音楽がまだ再生されていない場合（または一時停止中の場合）のみ再生を試みる
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => {
        console.log("BGMの自動再生を試みました。");
      }).catch(error => {
        console.log("BGMの自動再生はブロックされました。", error);
        // ここにユーザーへのメッセージ表示などを追加してもいいよ
      });
    }
  }, { once: true }); // 最初のクリックでのみ実行する
});
