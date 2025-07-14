document.addEventListener('DOMContentLoaded', () => {
    console.log('設定画面が読み込まれました。');

    const backButton = document.getElementById('backButton');
    if (backButton) {
        backButton.addEventListener('click', () => {
            console.log('戻るボタンがクリックされました。');
            // HTMLの<a>タグでstart.htmlへの遷移が処理される
        });
    }

    // 設定要素の取得
    // const bgmVolumeSlider = document.getElementById('bgmVolume'); // BGM音量スライダーは削除済み
    // const sfxVolumeSlider = document.getElementById('sfxVolume'); // 効果音量スライダーは削除済み
    const videoToggle = document.getElementById('videoToggle');
    const musicToggle = document.getElementById('musicToggle'); // 効果音のオンオフとして機能
    const colorInversionToggle = document.getElementById('colorInversionToggle');
    const notificationCheckbox = document.querySelector('.setting-item input[type="checkbox"]');

    // localStorageのキーを定義
    const SETTINGS_KEYS = {
        // BGM_VOLUME: 'bgmVolume', // BGM音量キーは削除済み
        // SFX_VOLUME: 'sfxVolume', // 効果音量キーは削除済み
        VIDEO_ENABLED: 'videoEnabled',
        MUSIC_ENABLED: 'musicEnabled', // 効果音のオンオフとして扱う
        COLOR_INVERSION_ENABLED: 'colorInversionEnabled',
        NOTIFICATIONS_ENABLED: 'notificationsEnabled'
    };

    /**
     * localStorageから設定を読み込み、UIに反映する
     * ページ全体の色反転もここで適用する
     */
    const loadSettings = () => {
        // BGM音量の読み込みロジックは削除済み
        // 効果音量の読み込みロジックは削除済み

        // 動画有効/無効
        const savedVideoEnabled = localStorage.getItem(SETTINGS_KEYS.VIDEO_ENABLED);
        if (videoToggle) {
            videoToggle.checked = (savedVideoEnabled === 'true' || savedVideoEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.VIDEO_ENABLED, videoToggle.checked);
        }

        // 音楽有効/無効（効果音のオンオフとして扱う）
        const savedMusicEnabled = localStorage.getItem(SETTINGS_KEYS.MUSIC_ENABLED);
        if (musicToggle) {
            musicToggle.checked = (savedMusicEnabled === 'true' || savedMusicEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.MUSIC_ENABLED, musicToggle.checked);
        }

        // 色反転有効/無効
        const savedColorInversionEnabled = localStorage.getItem(SETTINGS_KEYS.COLOR_INVERSION_ENABLED);
        if (colorInversionToggle) {
            colorInversionToggle.checked = (savedColorInversionEnabled === 'true'); // デフォルトは無効 (false)
            localStorage.setItem(SETTINGS_KEYS.COLOR_INVERSION_ENABLED, colorInversionToggle.checked);
            applyColorInversion(colorInversionToggle.checked);
        }

        // 通知設定 (既存)
        const savedNotificationsEnabled = localStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED);
        if (notificationCheckbox) {
            notificationCheckbox.checked = (savedNotificationsEnabled === 'true' || savedNotificationsEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, notificationCheckbox.checked);
        }

        console.log("設定が読み込まれました:", {
            video: videoToggle ? videoToggle.checked : 'N/A',
            music: musicToggle ? musicToggle.checked : 'N/A', // 効果音のオンオフとしてログ
            colorInversion: colorInversionToggle ? colorInversionToggle.checked : 'N/A',
            notifications: notificationCheckbox ? notificationCheckbox.checked : 'N/A'
        });
    };

    /**
     * 設定が変更されたときにlocalStorageに保存する
     * @param {string} key - localStorageのキー
     * @param {*} value - 保存する値
     */
    const saveSetting = (key, value) => {
        localStorage.setItem(key, value);
        console.log(`設定を保存しました: ${key} = ${value}`);
    };

    /**
     * ページ全体に色反転フィルターを適用/解除する
     * @param {boolean} enabled - 色反転を有効にするかどうか
     */
    const applyColorInversion = (enabled) => {
        if (enabled) {
            document.body.classList.add('color-inverted');
        } else {
            document.body.classList.remove('color-inverted');
        }
    };


    // イベントリスナーの追加
    // BGM音量スライダーのイベントリスナーは削除済み
    // 効果音量スライダーのイベントリスナーは削除済み
    if (videoToggle) {
        videoToggle.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.VIDEO_ENABLED, event.target.checked));
    }
    if (musicToggle) { // 効果音のオンオフとして扱う
        musicToggle.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.MUSIC_ENABLED, event.target.checked));
    }
    if (colorInversionToggle) {
        colorInversionToggle.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            saveSetting(SETTINGS_KEYS.COLOR_INVERSION_ENABLED, isChecked);
            applyColorInversion(isChecked);
        });
    }
    if (notificationCheckbox) {
        notificationCheckbox.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, event.target.checked));
    }

    // ページ読み込み時に設定をロード
    loadSettings();
});
