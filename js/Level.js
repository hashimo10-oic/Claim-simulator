document.addEventListener('DOMContentLoaded', () => {
    const normalModeButton = document.getElementById('normalMode');
    const hardModeButton = document.getElementById('hardMode');
    const crazyModeButton = document.getElementById('crazyMode');
    const backButton = document.getElementById('backButton');

    // 難易度ボタンがクリックされた時の処理だよ
    const selectDifficulty = (button, difficultyName) => {
        // まず全てのボタンから 'selected' クラスを削除するよ
        [normalModeButton, hardModeButton, crazyModeButton].forEach(btn => {
            btn.classList.remove('selected');
        });
        // クリックされたボタンに 'selected' クラスを追加するよ
        button.classList.add('selected');

        // 選択された難易度をコンソールに表示するよ
        console.log(`${difficultyName} が選択されました。`);
    };

    // 各ボタンにクリックイベントリスナーを追加するよ
    // HTML側で<a>タグを使っているので、JavaScriptでの遷移は不要だが、
    // ここではselectedクラスの切り替えのためにイベントリスナーは残すよ
    normalModeButton.addEventListener('click', () => {
        selectDifficulty(normalModeButton, 'ノーマルモード');
        // 必要であれば、ここにノーマルモード開始のロジックや遷移を追加するよ
        // window.location.href = "normal.html"; // 例
    });
    hardModeButton.addEventListener('click', () => {
        selectDifficulty(hardModeButton, 'ハードモード');
        // hard.htmlへの遷移はHTMLの<a>タグで処理されるよ
    });
    crazyModeButton.addEventListener('click', () => {
        selectDifficulty(crazyModeButton, 'クレイジーモード');
        // 必要であれば、ここにクレイジーモード開始のロジックや遷移を追加するよ
        // window.location.href = "crazy.html"; // 例
    });

    // 戻るボタンがクリックされた時の処理だよ
    backButton.addEventListener('click', () => {
        console.log('戻るボタンがクリックされました。');
        // HTMLの<a>タグでstart.htmlへの遷移が処理されるので、ここではカスタムアラートの表示のみにするよ
        alertMessage('前の画面に戻ります。', 'info'); // カスタムアラートを表示
    });

    // カスタムアラートメッセージを表示する関数だよ
    function alertMessage(message, type) {
        const alertBox = document.createElement('div');
        // Tailwind CSSのクラスを使って、アラートの見た目を調整するよ
        alertBox.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg text-white z-50 transition-opacity duration-300 ease-out opacity-0`;
        if (type === 'info') {
            alertBox.classList.add('bg-blue-500');
        } else if (type === 'success') {
            alertBox.classList.add('bg-green-500');
        } else if (type === 'error') {
            alertBox.classList.add('bg-red-500');
        }
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        // フェードイン効果
        setTimeout(() => {
            alertBox.classList.remove('opacity-0');
            alertBox.classList.add('opacity-100');
        }, 10); // 短い遅延でトランジションをトリガー

        // フェードアウト効果
        setTimeout(() => {
            alertBox.classList.remove('opacity-100');
            alertBox.classList.add('opacity-0');
            alertBox.addEventListener('transitionend', () => alertBox.remove(), { once: true });
        }, 3000); // 3秒後にフェードアウトを開始
    }
});
