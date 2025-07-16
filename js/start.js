document.addEventListener('DOMContentLoaded', () => {
  const mainTitle = document.getElementById('mainTitle');
  const marqueeContent = mainTitle.querySelector('.marquee-content');
  const scrollingTextItem = marqueeContent.querySelector('.scrolling-text-item');
  const scrollingTextItemClone = marqueeContent.querySelector('.scrolling-text-item-clone');
  const container = document.getElementById('mainContainer');

  const imageMarqueeContainer = document.querySelector('.image-marquee-container');
  const imageMarqueeContent = document.getElementById('imageMarqueeContent');
  // ユーザーのファイル構造と表示確認に基づき、画像パスを修正しました。
  // start.htmlからの相対パスで、ikariフォルダ内の画像を参照します。
  const imageSources = [
    '../images/icon1.png',
    '../images/icon2.png',
    '../images/icon3.png',
    '../images/icon4.png',
    '../images/icon5.png'
  ];

  const backgroundMusic = document.getElementById('backgroundMusic');

  const baseTitleText = "カスタマーマスター";
  const baseRareMessages = [
    "橋本社長考案！カスタマーマスター",
    "駿之介監督絶賛！カスタマーマスター",
    "前谷プロが作りました👍カスタマーマスター",
    "カスタマーYOUKOUマスター"
  ];

  const isRare = Math.random() < 0.05;

  const generateSingleItemText = (message, repeatCount = 20) => {
    return Array(repeatCount).fill(message).join('  ');
  };

  let actualTextForScrolling = "";

  if (isRare) {
    const message = baseRareMessages[Math.floor(Math.random() * baseRareMessages.length)];
    actualTextForScrolling = generateSingleItemText(message, 10);
    mainTitle.classList.add('rare-title');
    container.classList.remove('normal-background');
    container.classList.add('rare-background');
    console.log("🎉 レア演出が表示されました！");
  } else {
    actualTextForScrolling = generateSingleItemText(baseTitleText, 20);
    mainTitle.classList.remove('rare-title');
    container.classList.add('normal-background');
  }

  scrollingTextItem.textContent = actualTextForScrolling;
  scrollingTextItemClone.textContent = actualTextForScrolling;

  // DOMがレンダリングされてから幅を取得するために、setTimeoutを使うよ
  setTimeout(() => {
    // テキストスクロールの設定
    const singleItemWidth = scrollingTextItem.offsetWidth;
    const textGapPx = parseFloat(getComputedStyle(scrollingTextItem).paddingRight);
    const scrollDistance = -(singleItemWidth + textGapPx); // 右から左へ移動するため負の値
    const scrollSpeedPxPerSec = 60; // テキストのスクロール速度
    const animationDuration = Math.abs(scrollDistance) / scrollSpeedPxPerSec;

    marqueeContent.style.setProperty('--scroll-distance', `${scrollDistance}px`);
    marqueeContent.style.setProperty('--scroll-duration', `${animationDuration}s`);
    marqueeContent.style.animation = 'none';
    void marqueeContent.offsetWidth; // 強制的にリフロー
    marqueeContent.style.animation = `scrollText var(--scroll-duration) linear infinite`;

    // 画像スクロールの設定
    imageMarqueeContent.innerHTML = ''; // 既存の画像をクリア
    console.log("画像スクロールコンテンツをクリアしました。");

    const images = [];
    const imageLoadPromises = imageSources.map(src => new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src; // ここで正しいパスを使用
      img.alt = 'スクロール画像';
      console.log(`画像を読み込み中: ${src}`); // 読み込み中のログ
      img.onload = () => {
        console.log(`画像の読み込み成功: ${src}`); // 成功ログ
        images.push(img); // 成功した画像のみを配列に追加
        resolve(img);
      };
      img.onerror = () => {
        console.error(`画像の読み込み失敗: ${src}。パスを確認してください。`); // 失敗ログ
        reject(new Error(`Failed to load image: ${src}`));
      };
    }));

    let singleSetWidth = 0; // 1セットの画像の合計幅

    // 全ての画像がロードされるのを待つ
    Promise.all(imageLoadPromises)
    .then(loadedImages => {
      // ロードに失敗した画像がある場合、loadedImagesには含まれないので、images配列を使用
      if (images.length === 0) {
        console.warn("読み込みに成功した画像がありません。画像パスとファイルを確認してください。");
        return; // 処理を中断
      }

      // 1セット分の画像要素を一時的に作成し、幅を測定
      const tempDiv = document.createElement('div');
      tempDiv.style.display = 'flex';
      tempDiv.style.visibility = 'hidden'; // 画面に表示しない
      tempDiv.style.position = 'absolute'; // レイアウトに影響を与えない
      tempDiv.style.height = '80px'; // CSSのimage-marquee-containerの高さと合わせる

      images.forEach(img => {
        const imgWrapper = document.createElement('div');
        imgWrapper.classList.add('scrolling-image-item');
        imgWrapper.appendChild(img.cloneNode(true)); // クローンを追加してDOM操作の副作用を避ける
        tempDiv.appendChild(imgWrapper);
      });
      document.body.appendChild(tempDiv); // DOMに一時的に追加して正確な幅を取得
      
      // 個々の要素のoffsetWidthを合計して、より正確な1セットの幅を計算
      Array.from(tempDiv.children).forEach(child => {
        singleSetWidth += child.offsetWidth;
      });

      document.body.removeChild(tempDiv); // 測定後、一時的なdivを削除
      console.log(`1セットの画像の合計幅 (計算後): ${singleSetWidth}px`);

      // imageMarqueeContentに画像を複数セット追加
      // シームレスなループのためには最低2セット必要。画面幅や画像サイズに応じて調整
      // ここでは、コンテナの幅の2倍をカバーできる数 + 1セット分の余裕を持たせる
      const numCopies = Math.ceil(imageMarqueeContainer.offsetWidth * 2 / singleSetWidth) + 1;
      console.log(`複製するセット数: ${numCopies}`);
      
      for (let i = 0; i < numCopies; i++) {
        images.forEach(img => { // ここでもimages配列を使用
          const imgWrapper = document.createElement('div');
          imgWrapper.classList.add('scrolling-image-item');
          imgWrapper.appendChild(img.cloneNode(true));
          imageMarqueeContent.appendChild(imgWrapper);
        });
      }
      console.log(`画像がimageMarqueeContentに追加されました。`);

      // スクロール距離と時間を設定
      // 左から右へのスクロールなので、正の値
      // 移動距離は1セット分の幅とする
      const imageScrollDistance = singleSetWidth;
      console.log(`画像スクロール距離 (正方向): ${imageScrollDistance}px`);

      // 画像のスクロール速度をテキストと同じに設定
      const imageScrollSpeedPxPerSec = scrollSpeedPxPerSec; // テキストと同じ速度 (60px/秒)
      const imageAnimationDuration = imageScrollDistance / imageScrollSpeedPxPerSec;
      console.log(`画像アニメーション時間: ${imageAnimationDuration}s`);

      // CSS変数に設定
      imageMarqueeContent.style.setProperty('--image-scroll-distance', `${imageScrollDistance}px`);
      imageMarqueeContent.style.setProperty('--image-scroll-duration', `${imageAnimationDuration}s`);
      // 初期オフセットをCSS変数で設定（アニメーションの開始位置）
      // これにより、アニメーションの0%が画面の左端から始まるように見せる
      imageMarqueeContent.style.setProperty('--initial-image-offset', `-${imageScrollDistance}px`);


      // アニメーションをリセットして再開
      imageMarqueeContent.style.animation = 'none';
      void imageMarqueeContent.offsetWidth; // 強制的にリフロー
      imageMarqueeContent.style.animation = `scrollImage var(--image-scroll-duration) linear infinite`;
      console.log("画像スクロールアニメーションを開始しました。");

    })
    .catch(error => {
      console.error("画像ロードまたは処理中に致命的なエラーが発生しました:", error);
    });

  }, 0);

  document.getElementById('startClaimButton').addEventListener('click', () => {
    console.log('「クレーム対応開始」が選択されました。');
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  });

  document.getElementById('customerSettingsButton').addEventListener('click', () => {
    console.log('「設定」が選択されました。');
    if (!backgroundMusic.paused) {
      backgroundMusic.pause();
    }
  });

  document.body.addEventListener('click', () => {
    if (backgroundMusic.paused) {
      backgroundMusic.play().then(() => {
        console.log("BGMの自動再生を試みました。");
      }).catch(error => {
        console.log("BGMの自動再生はブロックされました。", error);
      });
    }
  }, { once: true });
});
