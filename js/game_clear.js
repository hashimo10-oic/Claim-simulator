document.addEventListener('DOMContentLoaded', () => {
    const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
    const fullscreenGameClearVideo = document.getElementById('fullscreenGameClearVideo');
    const mainGameClearContent = document.getElementById('mainGameClearContent');

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
        if (fullscreenGameClearVideo) {
            fullscreenGameClearVideo.pause(); // 念のため動画を停止
        }
        if (mainGameClearContent) {
            mainGameClearContent.classList.remove('hidden-content');
        }
        console.log("動画設定が無効のため、ゲームクリア画面をすぐに表示します。");
    } else {
        // 動画が有効な場合、全画面動画を表示し、再生を試みる
        if (mainGameClearContent) {
            mainGameClearContent.classList.add('hidden-content');
        }
        if (fullscreenVideoContainer) {
            fullscreenVideoContainer.classList.remove('hidden-content');
        }

        if (fullscreenGameClearVideo) {
            fullscreenGameClearVideo.play().then(() => {
                console.log("全画面動画の自動再生を開始しました。");
            }).catch(error => {
                console.error("全画面動画の自動再生に失敗しました:", error);
                // 自動再生がブロックされた場合のフォールバック: すぐにメインコンテンツを表示
                if (fullscreenVideoContainer) {
                    fullscreenVideoContainer.classList.add('hidden-content');
                }
                if (mainGameClearContent) {
                    mainGameClearContent.classList.remove('hidden-content');
                }
                console.log("全画面動画の自動再生がブロックされたため、直接メインコンテンツを表示します。");
            });

            // 全画面動画の再生が終了したら、メインコンテンツに切り替える
            fullscreenGameClearVideo.addEventListener('ended', () => {
                console.log("全画面動画が終了しました。メインコンテンツに切り替えます。");
                if (fullscreenVideoContainer) {
                    fullscreenVideoContainer.classList.add('hidden-content'); // 全画面動画を非表示に
                }
                if (mainGameClearContent) {
                    mainGameClearContent.classList.remove('hidden-content'); // メインコンテンツを表示に
                }
            });
        }
    }

    // 🌟 ランダムメッセージの表示処理 (以前のロジックを維持)
    const messages = [
        "完璧な対応ではないか！",
        "素晴らしい.....いい対応だ",
        "君...天才って呼ばれてる？",
        "ふーん.....やるやん",
        "店の評価が☆５になったぜ！",
        "あなたがカスタマーの神ですか？",
        "悪くない、プラス５点",
        "店長「給料あげとくね」",
        "「恐ろしく丁寧な対応。俺でなきゃ驚いてたね」",
        "（ふっ、我ながら完璧な対応力だ)"
    ];

    const rareMessage = "橋本社長も大喜び！";
    const rareProbability = 0.005; // 0.5%の確率でレアメッセージが出現するよ

    const messageElement = document.getElementById('randomMessage');

    // 確率でレアメッセージを表示するか、通常のメッセージを表示するか決めるよ
    if (Math.random() < rareProbability) {
        messageElement.textContent = rareMessage;
        messageElement.classList.add('rare-message');
    } else {
        const randomIndex = Math.floor(Math.random() * messages.length);
        messageElement.textContent = messages[randomIndex];
        messageElement.classList.remove('rare-message'); // 通常メッセージの場合はレアスタイルを削除
    }

    // 🎮 ボタン処理
    const changeDifficultyButton = document.getElementById('changeDifficultyButton');
    const homeButton = document.getElementById('homeButton');

    changeDifficultyButton.addEventListener('click', () => {
        console.log('「次の難易度へ」が選択されました。');
        window.location.href = "Level.html"; // 難易度選択画面へ遷移
    });

    homeButton.addEventListener('click', () => {
        console.log('「メインメニューへ」が選択されました。');
        window.location.href = "start.html"; // タイトル画面へ遷移
    });
});
