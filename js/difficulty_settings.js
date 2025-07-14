document.addEventListener('DOMContentLoaded', () => {
    const normalModeButton = document.getElementById('normalMode');
    const hardModeButton = document.getElementById('hardMode');
    const crazyModeButton = document.getElementById('crazyMode');
    const backButton = document.getElementById('backButton');

    // 各ボタンにクリックイベントリスナーを追加
    normalModeButton.addEventListener('click', () => {
        // "ノーマルモード"ボタンで難易度"easy"を指定してゲーム画面へ
        window.location.href = '../html/game_play.html?difficulty=easy';
    });
    hardModeButton.addEventListener('click', () => {
        // "ハードモード"ボタンで難易-度"normal"を指定してゲーム画面へ
        window.location.href = '../html/game_play.html?difficulty=normal';
    });
    crazyModeButton.addEventListener('click', () => {
        // "クレイジーモード"ボタンで難易度"crazy"を指定してゲーム画面へ
          window.location.href = '../html/game_play.html?difficulty=crazy';
    });

    // 戻るボタンの処理 (前のページに戻る)
    backButton.addEventListener('click', () => {
        window.history.back();
    });
});
