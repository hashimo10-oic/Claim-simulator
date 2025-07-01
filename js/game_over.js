document.addEventListener('DOMContentLoaded', () => {
    // 以前のランダムメッセージ一覧に戻すよ
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

    // レアメッセージも以前の内容に戻すよ
    const rareMessage = "橋本社長も大慌て！";
    const rareProbability = 0.005; // 0.5%

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

    // 各ボタンのイベント処理 (変更なし)
    document.getElementById('doAgainButton').addEventListener('click', () => {
        console.log('「再挑戦」が選択されました。');
        window.location.href = "Level.html"; // 難易度選択画面に戻る
    });

    document.getElementById('differentPatternButton').addEventListener('click', () => {
        console.log('「難易度調整」が選択されました。');
        window.location.href = "Level.html"; // 難易度選択画面に戻る
    });

    document.getElementById('homeButton').addEventListener('click', () => {
        console.log('「メインメニューへ」が選択されました。');
        window.location.href = "start.html";
    });
});
