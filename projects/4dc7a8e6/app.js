// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6",
    databaseURL: "https://sandbox-35d1d-default-rtdb.firebaseio.com"
};

// Firebase初期化
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const messagesRef = database.ref('messages');

// DOM要素の取得
const usernameInput = document.getElementById('username');
const messageInput = document.getElementById('message');
const postBtn = document.getElementById('postBtn');
const refreshBtn = document.getElementById('refreshBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const messagesContainer = document.getElementById('messagesContainer');
const emptyState = document.getElementById('emptyState');
const charCount = document.getElementById('charCount');
const connectionStatus = document.getElementById('connectionStatus');
const btnText = document.querySelector('.btn-text');
const btnLoading = document.querySelector('.btn-loading');

// ローカルストレージからユーザー名を復元
if (localStorage.getItem('username')) {
    usernameInput.value = localStorage.getItem('username');
}

// 文字数カウント
messageInput.addEventListener('input', () => {
    const count = messageInput.value.length;
    charCount.textContent = count;

    if (count > 450) {
        charCount.style.color = 'var(--danger-color)';
    } else if (count > 400) {
        charCount.style.color = 'var(--warning-color)';
    } else {
        charCount.style.color = 'var(--text-secondary)';
    }
});

// 接続ステータスの監視
const connectedRef = database.ref('.info/connected');
connectedRef.on('value', (snapshot) => {
    const statusText = connectionStatus.querySelector('.status-text');
    if (snapshot.val() === true) {
        connectionStatus.classList.add('connected');
        connectionStatus.classList.remove('disconnected');
        statusText.textContent = '接続済み';
    } else {
        connectionStatus.classList.remove('connected');
        connectionStatus.classList.add('disconnected');
        statusText.textContent = '切断中';
    }
});

// メッセージ投稿
postBtn.addEventListener('click', async () => {
    const username = usernameInput.value.trim() || '匿名';
    const message = messageInput.value.trim();

    if (!message) {
        alert('メッセージを入力してください');
        messageInput.focus();
        return;
    }

    // ユーザー名をローカルストレージに保存
    if (usernameInput.value.trim()) {
        localStorage.setItem('username', usernameInput.value.trim());
    }

    // ボタンの状態を変更
    postBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline';

    try {
        // 新しいメッセージをデータベースに追加
        await messagesRef.push({
            username: username,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        // フォームをクリア
        messageInput.value = '';
        charCount.textContent = '0';
        charCount.style.color = 'var(--text-secondary)';

        // 成功フィードバック
        showNotification('メッセージを投稿しました！', 'success');
    } catch (error) {
        console.error('Error posting message:', error);
        showNotification('投稿に失敗しました。もう一度お試しください。', 'error');
    } finally {
        // ボタンの状態を元に戻す
        postBtn.disabled = false;
        btnText.style.display = 'inline';
        btnLoading.style.display = 'none';
    }
});

// Enterキーで投稿（Shift+Enterで改行）
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postBtn.click();
    }
});

// メッセージのリアルタイム取得
messagesRef.on('value', (snapshot) => {
    const loadingElement = messagesContainer.querySelector('.loading');
    if (loadingElement) {
        loadingElement.remove();
    }

    messagesContainer.innerHTML = '';

    const messages = [];
    snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        messages.push({
            id: childSnapshot.key,
            ...data
        });
    });

    // タイムスタンプで降順ソート（新しいものが上）
    messages.sort((a, b) => b.timestamp - a.timestamp);

    if (messages.length === 0) {
        emptyState.style.display = 'block';
        return;
    } else {
        emptyState.style.display = 'none';
    }

    // メッセージを表示
    messages.forEach((msg) => {
        const messageCard = createMessageCard(msg);
        messagesContainer.appendChild(messageCard);
    });
});

// メッセージカードの作成
function createMessageCard(msg) {
    const card = document.createElement('div');
    card.className = 'message-card';
    card.dataset.id = msg.id;

    const header = document.createElement('div');
    header.className = 'message-header';

    const author = document.createElement('div');
    author.className = 'message-author';
    author.textContent = msg.username || '匿名';

    const meta = document.createElement('div');
    meta.className = 'message-meta';

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTimestamp(msg.timestamp);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'message-delete';
    deleteBtn.textContent = '削除';
    deleteBtn.onclick = () => deleteMessage(msg.id);

    meta.appendChild(time);
    meta.appendChild(deleteBtn);

    header.appendChild(author);
    header.appendChild(meta);

    const content = document.createElement('div');
    content.className = 'message-content';
    content.textContent = msg.message;

    card.appendChild(header);
    card.appendChild(content);

    return card;
}

// タイムスタンプのフォーマット
function formatTimestamp(timestamp) {
    if (!timestamp) return '不明';

    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    // 1分未満
    if (diff < 60000) {
        return 'たった今';
    }

    // 1時間未満
    if (diff < 3600000) {
        const minutes = Math.floor(diff / 60000);
        return `${minutes}分前`;
    }

    // 24時間未満
    if (diff < 86400000) {
        const hours = Math.floor(diff / 3600000);
        return `${hours}時間前`;
    }

    // それ以上
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    // 今年の場合は年を省略
    if (year === now.getFullYear()) {
        return `${month}/${day} ${hours}:${minutes}`;
    }

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// メッセージの削除
async function deleteMessage(messageId) {
    if (!confirm('このメッセージを削除しますか？')) {
        return;
    }

    try {
        await database.ref(`messages/${messageId}`).remove();
        showNotification('メッセージを削除しました', 'success');
    } catch (error) {
        console.error('Error deleting message:', error);
        showNotification('削除に失敗しました', 'error');
    }
}

// 全メッセージの削除
clearAllBtn.addEventListener('click', async () => {
    if (!confirm('本当に全てのメッセージを削除しますか？\nこの操作は取り消せません。')) {
        return;
    }

    try {
        await messagesRef.remove();
        showNotification('全てのメッセージを削除しました', 'success');
    } catch (error) {
        console.error('Error clearing messages:', error);
        showNotification('削除に失敗しました', 'error');
    }
});

// 更新ボタン
refreshBtn.addEventListener('click', () => {
    showNotification('メッセージを更新しました', 'success');
    // リアルタイムで自動更新されるため、実際には何もしない
    // ユーザーフィードバックのみ
});

// 通知表示
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;

    // タイプに応じたスタイル
    const colors = {
        success: '#34a853',
        error: '#ea4335',
        info: '#4285f4'
    };

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
        word-wrap: break-word;
    `;

    document.body.appendChild(notification);

    // 3秒後に削除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// 通知用のアニメーションをCSSに追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// エラーハンドリング
database.ref('.info/connected').on('value', (snapshot) => {
    if (!snapshot.val()) {
        console.warn('Firebase database disconnected');
    }
});

// ページ読み込み時のメッセージ
console.log('🔥 Firebase Realtime Database App initialized');
console.log('📝 Ready to send and receive messages in real-time!');