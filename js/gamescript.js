let gameDifficulty = 'normal';

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const difficultyFromUrl = urlParams.get('difficulty');
    if (['easy', 'normal', 'crazy'].includes(difficultyFromUrl)) {
        gameDifficulty = difficultyFromUrl;
    }

    const BACKEND_URL = 'http://localhost:3000';

    const gameTimerDisplay = document.getElementById('gameTimer');
    const lifeIconsContainer = document.getElementById('lifeIcons');
    const messageHistory = document.getElementById('messageHistory');
    const myMessageInput = document.getElementById('myMessageInput');
    const sendMessageButton = document.getElementById('sendMessageButton');
    const complaintTextDisplay = document.getElementById('complaintText');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const customerImage = document.getElementById('customerImage');

    const getHintButton = document.getElementById('getHintButton');
    const showHintAgainButton = document.getElementById('showHintAgainButton');
    const hintContainer = document.getElementById('hintContainer');
    const hintTextDisplay = document.getElementById('hintText');
    const closeHintButton = document.getElementById('closeHintButton');

    // 削除された設定ボタンとモーダルに関連する要素の宣言を削除
    // const settingsButton = document.getElementById('settingsButton');
    // const settingsModal = document.getElementById('settingsModal');
    // const closeSettingsButton = document.getElementById('closeSettings');
    // const bgmVolumeControl = document.getElementById('bgmVolume');
    // const seVolumeControl = document.getElementById('seVolume');
    // const giveUpButton = document.getElementById('giveUpButton'); // このgiveUpButtonは設定モーダル内のものなので削除
    // const bgmVolumeDisplay = document.getElementById('bgmVolumeDisplay');
    // const seVolumeDisplay = document.getElementById('seVolumeDisplay');

    // 新しく追加された「諦める」ボタンの参照
    const giveUpGameButton = document.getElementById('giveUpGameButton');

    let timeLeft = 5 * 60;
    let currentHP = 3;
    let gameInterval;
    let chatHistory = [];
    let currentComplaint = "";
    let storedHint = null;

    const customerImageList = [
        '../images/icon1.png', '../images/icon2.png', '../images/icon3.png',
        '../images/icon4.png', '../images/icon5.png'
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
        else alertBox.style.backgroundColor = '#2196F3';
        
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        setTimeout(() => alertBox.classList.add('show'), 10);
        setTimeout(() => {
            alertBox.classList.remove('show');
            alertBox.addEventListener('transitionend', () => alertBox.remove());
        }, 3000);
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
            showAlert('HPが0になりました!ゲームオーバー...', 'error');
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
        if (storedHint === null) {
            getHintButton.disabled = isLoading;
        } else {
            showHintAgainButton.disabled = isLoading;
        }
        if (!isLoading) {
            myMessageInput.focus();
        }
    }
    
    function checkGameStatus(customerReply) {
        let displayReply = customerReply;

        if (customerReply.includes('[CLEAR]')) {
            displayReply = customerReply.replace('[CLEAR]', '').trim();
            clearInterval(gameInterval);
            showAlert('クレーム解決！完璧な対応だ！', 'success');
            setTimeout(() => window.location.href = getRelativePath('game_clear.html'), 1500);
        }
        else if (customerReply.includes('[DAMAGE]')) {
            displayReply = customerReply.replace('[DAMAGE]', '').trim();
            currentHP--;
            updateLifeIcons();
        }

        return displayReply;
    }
    
    async function getGeminiHint() {
        getHintButton.disabled = true; // 連打防止
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
            console.log("サーバーから受信したヒントデータ:", data); // デバッグ用に受信データを表示

            const hintsArray = data.hints;

            // 受信したデータが 'hints' キーを持つ配列であり、中身が空でないかを確認
            if (Array.isArray(hintsArray) && hintsArray.length > 0) {
                // データを箇条書きのHTMLリストに変換
                storedHint = '<ul>' + hintsArray.map(h => `<li class="mb-1">・${h}</li>`).join('') + '</ul>';
                hintTextDisplay.innerHTML = storedHint; // innerHTMLを使ってHTMLを解釈させる
                hintContainer.classList.remove('hidden'); // ヒントボックスを表示
                
                getHintButton.classList.add('hidden'); // 「ヒントをもらう」を隠す
                showHintAgainButton.classList.remove('hidden'); // 「再表示」を表示
            } else {
                // 想定外のデータだった場合はエラーとして扱う
                throw new Error("AIから有効な形式のヒントが得られませんでした。");
            }

        } catch (error) {
            console.error('ヒント取得処理中のエラー:', error);
            showAlert(error.message || 'ヒントの取得に失敗しました。再度お試しください。', 'error');
            getHintButton.disabled = false; // エラーなら再度押せるようにする
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
                body: JSON.stringify({ difficulty: gameDifficulty })
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || `サーバーエラー: ${response.status}`);
            }
            
            const data = await response.json();
            const initialClaim = data.claim;
            const claimSummary = data.summary;
            
            currentComplaint = initialClaim;
            complaintTextDisplay.textContent = claimSummary;
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
                        difficulty: gameDifficulty
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

                const displayReply = checkGameStatus(customerReply);
                addMessageToHistory('お客様', displayReply);

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
    
    showHintAgainButton.addEventListener('click', () => {
        if (storedHint) {
            hintContainer.classList.remove('hidden');
        }
    });

    closeHintButton.addEventListener('click', () => {
        hintContainer.classList.add('hidden');
    });

    // 削除された設定ボタンとモーダルに関連するイベントリスナーを削除
    // settingsButton.addEventListener('click', () => settingsModal.classList.remove('hidden'));
    // closeSettingsButton.addEventListener('click', () => settingsModal.classList.add('hidden'));
    
    // BGMとSEの音量コントロールは設定モーダル内にあったため、関連する要素がHTMLから削除された場合、
    // これらのロジックも機能しなくなります。必要であれば、HTMLの別の場所に音量コントロールを移動してください。
    // const bgmAudio = new Audio();
    // bgmAudio.loop = true;
    // const seAudio = new Audio();
    
    // const updateVolumeDisplays = () => {
    //     bgmAudio.volume = parseFloat(localStorage.getItem('bgmVolume') || 0.5);
    //     seAudio.volume = parseFloat(localStorage.getItem('seVolume') || 0.5);
    //     bgmVolumeControl.value = bgmAudio.volume;
    //     seVolumeControl.value = seAudio.volume;
    //     bgmVolumeDisplay.textContent = Math.round(bgmAudio.volume * 100);
    //     seVolumeDisplay.textContent = Math.round(seAudio.volume * 100);
    // };

    // bgmVolumeControl.addEventListener('input', (event) => {
    //     const volume = parseFloat(event.target.value);
    //     bgmAudio.volume = volume;
    //     localStorage.setItem('bgmVolume', volume);
    //     bgmVolumeDisplay.textContent = Math.round(volume * 100);
    // });

    // seVolumeControl.addEventListener('input', (event) => {
    //     const volume = parseFloat(event.target.value);
    //     seAudio.volume = volume;
    //     localStorage.setItem('seVolume', volume);
    //     seVolumeDisplay.textContent = Math.round(volume * 100);
    // });

    // 新しい「諦める」ボタンのイベントリスナー
    if (giveUpGameButton) {
        giveUpGameButton.addEventListener('click', () => {
            // ここではshowAlertを使用していますが、よりリッチなカスタムモーダルUIを推奨します。
            const confirmGiveUp = window.confirm('対応をあきらめますか？');
            if (confirmGiveUp) {
                clearInterval(gameInterval); // ゲームタイマーを停止
                window.location.href = getRelativePath('game_over.html'); // game_over.htmlに遷移
            }
        });
    } else {
        console.error("Element with ID 'giveUpGameButton' not found.");
    }

    myMessageInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            sendMessageButton.click();
        }
    });

    updateLifeIcons();
    // updateVolumeDisplays(); // 音量コントロールがHTMLから削除されたため、コメントアウト
    gameInterval = setInterval(updateTimer, 1000);
    initializeGameConversation();
});
