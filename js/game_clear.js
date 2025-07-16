document.addEventListener('DOMContentLoaded', () => {
    const fullscreenVideoContainer = document.getElementById('fullscreenVideoContainer');
    const fullscreenGameClearVideo = document.getElementById('fullscreenGameClearVideo');
    const mainGameClearContent = document.getElementById('mainGameClearContent');

    // 動画ソースの定義とランダム選択ロジックを統合
    const videoSources = [
        'mv/game_clear.mp4',
        'mv/game_clear2.mp4',
        'mv/game_clear3.mp4',
        'mv/game_clear4.mp4'
    ];
    const randomIndex = Math.floor(Math.random() * videoSources.length);
    const selectedVideoSource = videoSources[randomIndex];

    if (fullscreenGameClearVideo) {
        fullscreenGameClearVideo.src = selectedVideoSource; // 動画ソースを設定
        // fullscreenGameClearVideo.loop は削除済み
        
        // 音量をlocalStorageから読み込む（存在すれば）
        const savedBGMVolume = localStorage.getItem('bgmVolume'); // BGMと同じボリューム設定を使う例
        if (savedBGMVolume !== null) {
            fullscreenGameClearVideo.volume = parseFloat(savedBGMVolume);
        } else {
            fullscreenGameClearVideo.volume = 0.5; // デフォルトの音量
        }
    } else {
        console.error("fullscreenGameClearVideo 要素が見つかりません。");
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

    // 🌟 ランダムメッセージの表示処理
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
