import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-ai.js';

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

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// AI Logic SDK初期化
let ai;
let model;

// DOM要素
const chatContainer = document.getElementById('chatContainer');
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const statusIndicator = document.getElementById('statusIndicator');
const statusText = document.getElementById('statusText');

// チャット履歴
let chatHistory = [];

// 初期化
async function initialize() {
    try {
        // AI Logic SDKの初期化
        ai = getAI(app, { backend: new GoogleAIBackend() });
        model = getGenerativeModel(ai, {
            model: "gemini-2.5-flash",
            generationConfig: {
                temperature: 0.9,
                topP: 1,
                maxOutputTokens: 2048,
            }
        });

        updateStatus('ready', '接続完了');
        sendButton.disabled = false;

        // ウェルカムメッセージを削除
        const welcomeMessage = chatContainer.querySelector('.welcome-message');
        if (welcomeMessage) {
            welcomeMessage.style.display = 'none';
        }

    } catch (error) {
        console.error('初期化エラー:', error);
        updateStatus('error', '接続エラー');
        showError('AIの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

// ステータス更新
function updateStatus(status, text) {
    statusIndicator.className = `status-indicator ${status}`;
    statusText.textContent = text;
}

// メッセージを表示
function displayMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;

    messageDiv.appendChild(messageContent);

    // ウェルカムメッセージを削除
    const welcomeMessage = chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
        welcomeMessage.remove();
    }

    chatContainer.appendChild(messageDiv);
    scrollToBottom();

    return messageDiv;
}

// タイピングインジケーター表示
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typingIndicator';

    const typingContent = document.createElement('div');
    typingContent.className = 'message-content typing-indicator';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('span');
        dot.className = 'typing-dot';
        typingContent.appendChild(dot);
    }

    typingDiv.appendChild(typingContent);
    chatContainer.appendChild(typingDiv);
    scrollToBottom();
}

// タイピングインジケーター削除
function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// エラー表示
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = `エラー: ${message}`;
    chatContainer.appendChild(errorDiv);
    scrollToBottom();
}

// スクロール
function scrollToBottom() {
    chatContainer.parentElement.scrollTop = chatContainer.parentElement.scrollHeight;
}

// メッセージ送信
async function sendMessage(userMessage) {
    if (!userMessage.trim()) return;

    try {
        // ユーザーメッセージを表示
        displayMessage(userMessage, 'user');

        // チャット履歴に追加
        chatHistory.push({
            role: 'user',
            parts: [{ text: userMessage }]
        });

        // 入力フィールドをクリア
        messageInput.value = '';
        messageInput.style.height = 'auto';

        // 送信ボタンを無効化
        sendButton.disabled = true;
        updateStatus('processing', '処理中...');

        // タイピングインジケーター表示
        showTypingIndicator();

        // AI応答を取得
        const chat = model.startChat({
            history: chatHistory.slice(0, -1),
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response;
        const aiMessage = response.text();

        // タイピングインジケーター削除
        removeTypingIndicator();

        // AI応答を表示
        displayMessage(aiMessage, 'ai');

        // チャット履歴に追加
        chatHistory.push({
            role: 'model',
            parts: [{ text: aiMessage }]
        });

        // ステータス更新
        updateStatus('ready', '接続完了');
        sendButton.disabled = false;
        messageInput.focus();

    } catch (error) {
        console.error('送信エラー:', error);
        removeTypingIndicator();
        showError('メッセージの送信に失敗しました。もう一度お試しください。');
        updateStatus('ready', '接続完了');
        sendButton.disabled = false;
    }
}

// フォーム送信イベント
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const message = messageInput.value.trim();
    if (message) {
        sendMessage(message);
    }
});

// テキストエリアの自動リサイズ
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = messageInput.scrollHeight + 'px';
});

// Enterキーで送信（Shift+Enterで改行）
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// PWA登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker登録成功:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker登録失敗:', error);
            });
    });
}

// アプリ初期化
initialize();
