// Firebase SDKをCDN経由でインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// グローバル変数
let currentUser = null;
let unsubscribe = null;

// DOM要素
const loginScreen = document.getElementById('loginScreen');
const chatScreen = document.getElementById('chatScreen');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUsername = document.getElementById('currentUsername');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesContainer = document.getElementById('messagesContainer');

// ログイン処理
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (username) {
        currentUser = username;
        currentUsername.textContent = username;
        loginScreen.style.display = 'none';
        chatScreen.style.display = 'flex';
        usernameInput.value = '';
        startListeningToMessages();
    }
});

// Enterキーでログイン
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        loginBtn.click();
    }
});

// ログアウト処理
logoutBtn.addEventListener('click', () => {
    if (unsubscribe) {
        unsubscribe();
    }
    currentUser = null;
    chatScreen.style.display = 'none';
    loginScreen.style.display = 'flex';
    messagesContainer.innerHTML = '<div class="loading">メッセージを読み込み中...</div>';
});

// メッセージ送信処理
async function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentUser) return;

    try {
        sendBtn.disabled = true;
        await addDoc(collection(db, 'messages'), {
            username: currentUser,
            message: message,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
        messageInput.focus();
    } catch (error) {
        console.error('メッセージ送信エラー:', error);
        alert('メッセージの送信に失敗しました');
    } finally {
        sendBtn.disabled = false;
    }
}

// 送信ボタンのクリックイベント
sendBtn.addEventListener('click', sendMessage);

// Enterキーでメッセージ送信
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// メッセージのリアルタイムリスニング
function startListeningToMessages() {
    const q = query(
        collection(db, 'messages'),
        orderBy('timestamp', 'desc'),
        limit(50)
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
            messages.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // 時系列順に並び替え（古い順）
        messages.reverse();

        renderMessages(messages);
        scrollToBottom();
    }, (error) => {
        console.error('メッセージ取得エラー:', error);
        messagesContainer.innerHTML = '<div class="loading">メッセージの取得に失敗しました</div>';
    });
}

// メッセージを画面に表示
function renderMessages(messages) {
    if (messages.length === 0) {
        messagesContainer.innerHTML = '<div class="loading">まだメッセージがありません。最初のメッセージを送信しましょう！</div>';
        return;
    }

    messagesContainer.innerHTML = '';

    messages.forEach((msg) => {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        if (msg.username === currentUser) {
            messageDiv.classList.add('own');
        }

        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';

        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'message-username';
        usernameSpan.textContent = msg.username;

        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'message-timestamp';
        timestampSpan.textContent = formatTimestamp(msg.timestamp);

        headerDiv.appendChild(usernameSpan);
        headerDiv.appendChild(timestampSpan);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.textContent = msg.message;

        messageDiv.appendChild(headerDiv);
        messageDiv.appendChild(contentDiv);

        messagesContainer.appendChild(messageDiv);
    });
}

// タイムスタンプをフォーマット
function formatTimestamp(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate();
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
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    return `${month}/${day} ${hour}:${minute}`;
}

// メッセージコンテナを最下部にスクロール
function scrollToBottom() {
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 初期化時にログイン画面にフォーカス
usernameInput.focus();
