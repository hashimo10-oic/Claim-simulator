let gameDifficulty = 'normal'; // デフォルトの難易度

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const difficultyFromUrl = urlParams.get('difficulty');
    if (['easy', 'normal', 'crazy'].includes(difficultyFromUrl)) {
        gameDifficulty = difficultyFromUrl;
    }

    // バックエンドAPIのエンドポイントURL
    const BACKEND_URL = 'http://localhost:3000';

    const gameTimerDisplay = document.getElementById('gameTimer');
    const lifeIconsContainer = document.getElementById('lifeIcons');
    const messageHistory = document.getElementById('messageHistory');
    const myMessageInput = document.getElementById('myMessageInput');
    const sendMessageButton = document.getElementById('sendMessageButton');
    const complaintTextDisplay = document.getElementById('complaintText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const getHintButton = document.getElementById('getHintButton');
    const customerImage = document.getElementById('customerImage');

    // 設定モーダル関連の要素
    const settingsButton = document.getElementById('settingsButton');
    const settingsModal = document.getElementById('settingsModal');
    const closeSettingsButton = document.getElementById('closeSettings');
    const bgmVolumeControl = document.getElementById('bgmVolume');
    const seVolumeControl = document.getElementById('seVolume');
    const giveUpButton = document.getElementById('giveUpButton');
    const bgmVolumeDisplay = document.getElementById('bgmVolumeDisplay');
    const seVolumeDisplay = document.getElementById('seVolumeDisplay');

    // ゲームの状態変数
    let timeLeft = 5 * 60; // 5分 = 300秒
    let currentHP = 3;    // 初期HP
    let gameInterval;     // タイマーのインターバルID
    let chatHistory = []; // 会話履歴
    let currentComplaint = ""; // 現在のクレーム内容

    // お客様のアイコン画像のリスト
    const customerImageList = [
        'images/icon1.png', 'images/icon2.png', 'images/icon3.png',
        'images/icon4.png', 'images/icon5.png'
    ];

    function getRelativePath(targetFile) {
        const currentPath = window.location.pathname;
        const currentDirectory = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
        return window.location.origin + currentDirectory + targetFile;
    }

    function showAlert(message, type = 'info') {
        const alertBox = document.createElement('div');
        alertBox.className = `custom-alert`;
        if (type === 'success') alertBox.style.backgroundColor = '#4CAF50';
        else if (type === 'error') alertBox.style.backgroundColor = '#f44336';
        else if (type === 'hint') alertBox.style.backgroundColor = '#34D399';
        else alertBox.style.backgroundColor = '#2196F3';
        
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        setTimeout(() => alertBox.classList.add('show'), 10);
        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.addEventListener('transitionend', () => alertBox.remove());
        }, 5000);
    }

    function addMessageToHistory(sender, message) {
        const messageBox = document.createElement('div');
        messageBox.className = 'message-box';
        const labelSpan = document.createElement('span');
        labelSpan.className = 'message-label';
        labelSpan.textContent = `${sender}:`;
        const messageSpan = document.createElement('span');
        messageSpan.textContent = message;
        messageBox.appendChild(labelSpan);
        messageBox.appendChild(messageSpan);
        messageHistory.appendChild(messageBox);
        messageHistory.scrollTop = messageHistory.scrollHeight;
    }

    function updateLifeIcons() {
        lifeIconsContainer.innerHTML = '';
        for (let i = 0; i < currentHP; i++) {
            const heartIcon = document.createElement('i');
            heartIcon.className = 'fas fa-heart';
            lifeIconsContainer.appendChild(heartIcon);
        }
        if (currentHP <= 0) {
            clearInterval(gameInterval);
            showAlert('HPが0になりました！ゲームオーバー...', 'error');
            setTimeout(() => window.location.href = getRelativePath('game_over.html'), 1500);
        }
    }

    function updateTimer() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        gameTimerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(gameInterval);
            showAlert('時間切れ！ゲームオーバー...', 'error');
            setTimeout(() => window.location.href = getRelativePath('game_over.html'), 1500);
        } else {
            timeLeft--;
        }
    }
    
    function setUIState(isLoading) {
        loadingIndicator.classList.toggle('hidden', !isLoading);
        sendMessageButton.disabled = isLoading;
        myMessageInput.disabled = isLoading;
        getHintButton.disabled = isLoading;
        if (!isLoading) {
            myMessageInput.focus();
        }
    }
    
    function checkGameStatus(customerReply) {
        let displayReply = customerReply;

        // クリア判定
        if (customerReply.includes('[CLEAR]')) {
            displayReply = customerReply.replace('[CLEAR]', '').trim(); // 目印を削除
            clearInterval(gameInterval);
            showAlert('クレーム解決！完璧な対応だ！', 'success');
            setTimeout(() => window.location.href = getRelativePath('game_clear.html'), 1500);
        }
        // ダメージ判定
        else if (customerReply.includes('[DAMAGE]')) {
            displayReply = customerReply.replace('[DAMAGE]', '').trim(); // 目印を削除
            currentHP--;
            updateLifeIcons(); // HP表示を更新
        }

        return displayReply; // 画面に表示する用の、目印が削除されたテキストを返す
    }
    
    async function getGeminiHint() {
        showAlert('ヒントを生成中...', 'info');
        setUIState(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/get-hint`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationHistory: chatHistory,
                    complaint: currentComplaint
                }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `サーバーエラー: ${response.status}`);
            }
            const data = await response.json();
            showAlert(`✨ヒント: ${data.hint}`, 'hint');
        } catch (error) {
            console.error('Gemini API呼び出しエラー (ヒント):', error);
            showAlert(`ヒント生成中にエラーが発生しました: ${error.message}`, 'error');
        } finally {
            setUIState(false);
        }
    }

    function setRandomCustomerImage() {
        const randomIndex = Math.floor(Math.random() * customerImageList.length);
        customerImage.src = customerImageList[randomIndex];
        customerImage.onerror = () => {
            customerImage.src = 'https://placehold.co/96x96/f0f0f0/808080?text=Error';
            console.error('Failed to load customer image:', customerImageList[randomIndex]);
        };
    }

    async function initializeGameConversation() {
        setRandomCustomerImage();
        setUIState(true);
        try {
            const response = await fetch(`${BACKEND_URL}/api/initiate-claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ difficulty: gameDifficulty }) // 難易度情報を追加
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `サーバーエラー: ${response.status}`);
            }
            const data = await response.json();
            const initialClaim = data.claim;
            
            currentComplaint = initialClaim;
            complaintTextDisplay.textContent = currentComplaint;
            addMessageToHistory('お客様', initialClaim);
            
            chatHistory = [{ role: "model", parts: [{ text: initialClaim }] }];
            
        } catch (error) {
            showAlert(`ゲームの開始に失敗しました: ${error.message}`, 'error');
            console.error(error);
        } finally {
            setUIState(false);
        }
    }

    sendMessageButton.addEventListener('click', async () => {
        const message = myMessageInput.value.trim();
        if (message) {
            addMessageToHistory('自分', message);
            myMessageInput.value = '';
            setUIState(true);

            try {
                const response = await fetch(`${BACKEND_URL}/api/handle-response`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        conversationHistory: chatHistory,
                        playerMessage: message,
                        difficulty: gameDifficulty // 難易度情報を追加
                    }),
                });
                if (!response.ok) {
                    const errData = await response.json();
                    throw new Error(errData.error || `サーバーエラー: ${response.status}`);
                }
                const data = await response.json();
                const customerReply = data.response;

                chatHistory.push({ role: "user", parts: [{ text: message }] });
                chatHistory.push({ role: "model", parts: [{ text: customerReply }] });

                const displayReply = checkGameStatus(customerReply); // 判定とテキスト整形を同時に行う
                addMessageToHistory('お客様', displayReply); // 整形後のテキストを表示

            } catch (error) {
                showAlert(`AI応答の取得に失敗しました: ${error.message}`, 'error');
                console.error(error);
                addMessageToHistory('システム', `エラー: ${error.message}`);
            } finally {
                setUIState(false);
            }
        } else {
            showAlert('メッセージを入力してください！', 'info');
        }
    });
    
    getHintButton.addEventListener('click', getGeminiHint);
    settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
    const bgmAudio = new Audio();
    bgmAudio.loop = true;
    const seAudio = new Audio();
    
    const updateVolumeDisplays = () => {
        bgmAudio.volume = parseFloat(localStorage.getItem('bgmVolume') || 0.5);
        seAudio.volume = parseFloat(localStorage.getItem('seVolume') || 0.5);
        bgmVolumeControl.value = bgmAudio.volume;
        seVolumeControl.value = seAudio.volume;
        bgmVolumeDisplay.textContent = Math.round(bgmAudio.volume * 100);
        seVolumeDisplay.textContent = Math.round(seAudio.volume * 100);
    };

    bgmVolumeControl.addEventListener('input', (event) => {
        const volume = parseFloat(event.target.value);
        bgmAudio.volume = volume;
        localStorage.setItem('bgmVolume', volume);
        bgmVolumeDisplay.textContent = Math.round(volume * 100);
    });

    seVolumeControl.addEventListener('input', (event) => {
        const volume = parseFloat(event.target.value);
        seAudio.volume = volume;
        localStorage.setItem('seVolume', volume);
        seVolumeDisplay.textContent = Math.round(volume * 100);
    });

    giveUpButton.addEventListener('click', () => {
        showAlert('ゲームをあきらめます...', 'error');
        clearInterval(gameInterval);
        setTimeout(() => window.location.href = getRelativePath('game_over.html'), 1500);
    });

    myMessageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessageButton.click();
        }
    });

    // ゲームの初期化
    updateLifeIcons();
    updateVolumeDisplays();
    gameInterval = setInterval(updateTimer, 1000);
    initializeGameConversation();
});