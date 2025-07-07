document.addEventListener('DOMContentLoaded', () => {
    // すべての難易度ボタンにまとめてイベントを設定するよ
    const difficultyButtons = document.querySelectorAll('.difficulty-button');

    difficultyButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            // aタグのデフォルトの挙動をいったん止めるよ
            event.preventDefault();

            // すべてのボタンから 'selected' クラスを削除
            difficultyButtons.forEach(btn => btn.classList.remove('selected'));
            // クリックされたボタンに 'selected' クラスを追加
            button.classList.add('selected');

            const difficultyName = button.querySelector('.text-2xl').textContent;
            console.log(`${difficultyName} が選択されました。`);

            // 対応するaタグのリンク先に遷移するよ
            const link = button.closest('a');
            if (link && link.href && !link.href.endsWith('#')) {
                // 少し待ってから画面遷移すると、選択エフェクトが見えるよ
                setTimeout(() => {
                    window.location.href = link.href;
                }, 200);
            }
        });
    });
});
