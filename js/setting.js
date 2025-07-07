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
    const bgmVolumeSlider = document.getElementById('bgmVolume');
    const sfxVolumeSlider = document.getElementById('sfxVolume');
    const videoToggle = document.getElementById('videoToggle');
    const musicToggle = document.getElementById('musicToggle');
    const colorInversionToggle = document.getElementById('colorInversionToggle'); // 新しい色反転トグル
    const notificationCheckbox = document.querySelector('.setting-item input[type="checkbox"]'); // 既存の通知設定チェックボックス

    // localStorageのキーを定義
    const SETTINGS_KEYS = {
        BGM_VOLUME: 'bgmVolume',
        SFX_VOLUME: 'sfxVolume',
        VIDEO_ENABLED: 'videoEnabled',
        MUSIC_ENABLED: 'musicEnabled',
        COLOR_INVERSION_ENABLED: 'colorInversionEnabled', // 新しいキー
        NOTIFICATIONS_ENABLED: 'notificationsEnabled' // 既存の通知設定用
    };

    /**
     * localStorageから設定を読み込み、UIに反映する
     * ページ全体の色反転もここで適用する
     */
    const loadSettings = () => {
        // BGM音量
        const savedBGMVolume = localStorage.getItem(SETTINGS_KEYS.BGM_VOLUME);
        if (bgmVolumeSlider && savedBGMVolume !== null) {
            bgmVolumeSlider.value = parseFloat(savedBGMVolume);
        } else if (bgmVolumeSlider) {
            localStorage.setItem(SETTINGS_KEYS.BGM_VOLUME, bgmVolumeSlider.value);
        }

        // 効果音量
        const savedSFXVolume = localStorage.getItem(SETTINGS_KEYS.SFX_VOLUME);
        if (sfxVolumeSlider && savedSFXVolume !== null) {
            sfxVolumeSlider.value = parseFloat(savedSFXVolume);
        } else if (sfxVolumeSlider) {
            localStorage.setItem(SETTINGS_KEYS.SFX_VOLUME, sfxVolumeSlider.value);
        }

        // 動画有効/無効
        const savedVideoEnabled = localStorage.getItem(SETTINGS_KEYS.VIDEO_ENABLED);
        if (videoToggle) {
            videoToggle.checked = (savedVideoEnabled === 'true' || savedVideoEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.VIDEO_ENABLED, videoToggle.checked);
        }

        // 音楽有効/無効
        const savedMusicEnabled = localStorage.getItem(SETTINGS_KEYS.MUSIC_ENABLED);
        if (musicToggle) {
            musicToggle.checked = (savedMusicEnabled === 'true' || savedMusicEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.MUSIC_ENABLED, musicToggle.checked);
        }

        // 色反転有効/無効
        const savedColorInversionEnabled = localStorage.getItem(SETTINGS_KEYS.COLOR_INVERSION_ENABLED);
        if (colorInversionToggle) {
            // デフォルトは無効 (false)
            colorInversionToggle.checked = (savedColorInversionEnabled === 'true');
            localStorage.setItem(SETTINGS_KEYS.COLOR_INVERSION_ENABLED, colorInversionToggle.checked);
            applyColorInversion(colorInversionToggle.checked); // ページ全体に適用
        }

        // 通知設定 (既存)
        const savedNotificationsEnabled = localStorage.getItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED);
        if (notificationCheckbox) {
            notificationCheckbox.checked = (savedNotificationsEnabled === 'true' || savedNotificationsEnabled === null); // デフォルトは有効
            localStorage.setItem(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, notificationCheckbox.checked);
        }

        console.log("設定が読み込まれました:", {
            bgm: bgmVolumeSlider ? bgmVolumeSlider.value : 'N/A',
            sfx: sfxVolumeSlider ? sfxVolumeSlider.value : 'N/A',
            video: videoToggle ? videoToggle.checked : 'N/A',
            music: musicToggle ? musicToggle.checked : 'N/A',
            colorInversion: colorInversionToggle ? colorInversionToggle.checked : 'N/A', // 新しいログ
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
    if (bgmVolumeSlider) {
        bgmVolumeSlider.addEventListener('input', (event) => saveSetting(SETTINGS_KEYS.BGM_VOLUME, event.target.value));
    }
    if (sfxVolumeSlider) {
        sfxVolumeSlider.addEventListener('input', (event) => saveSetting(SETTINGS_KEYS.SFX_VOLUME, event.target.value));
    }
    if (videoToggle) {
        videoToggle.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.VIDEO_ENABLED, event.target.checked));
    }
    if (musicToggle) {
        musicToggle.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.MUSIC_ENABLED, event.target.checked));
    }
    if (colorInversionToggle) {
        colorInversionToggle.addEventListener('change', (event) => {
            const isChecked = event.target.checked;
            saveSetting(SETTINGS_KEYS.COLOR_INVERSION_ENABLED, isChecked);
            applyColorInversion(isChecked); // 変更を即座に適用
        });
    }
    if (notificationCheckbox) {
        notificationCheckbox.addEventListener('change', (event) => saveSetting(SETTINGS_KEYS.NOTIFICATIONS_ENABLED, event.target.checked));
    }

    // ページ読み込み時に設定をロード
    loadSettings();
});
