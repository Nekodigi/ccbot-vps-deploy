// Firebase設定
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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

// ユーザーID生成（セッション毎）
const userId = 'nekokazu';
const projectId = '790f6ce8';
const messagesPath = `ccbotDev/${userId}/apps/${projectId}/messages`;

// DOM要素
const chatContainer = document.getElementById('chat-container');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const statusIndicator = document.getElementById('status-indicator');
const statusText = document.getElementById('status-text');
const loadingOverlay = document.getElementById('loading-overlay');

// 状態管理
let isProcessing = false;
let aiModel = null;

// Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then((registration) => {
                console.log('Service Worker registered:', registration);
            })
            .catch((error) => {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// AI機能の初期化
async function initializeAI() {
    try {
        // Firebase AI Logic SDKを動的にロード
        const { getGenerativeModel } = await import('https://www.gstatic.com/firebasejs/10.8.0/firebase-vertexai.js');

        // Gemini 1.5 Flashモデルを使用
        aiModel = getGenerativeModel(app, { model: 'gemini-1.5-flash' });

        updateStatus('ready', '接続済み');
        enableInput();
        hideLoading();
    } catch (error) {
        console.error('AI initialization error:', error);
        updateStatus('error', '初期化失敗');
        hideLoading();

        // 代替として簡易応答システムを使用
        aiModel = { fallback: true };
        enableInput();
    }
}

// ステータス更新
function updateStatus(status, text) {
    statusIndicator.className = 'status-indicator ' + status;
    statusText.textContent = text;
}

// 入力の有効化
function enableInput() {
    messageInput.disabled = false;
    sendButton.disabled = false;
    messageInput.focus();
}

// ローディング非表示
function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

// メッセージ表示
function displayMessage(role, text) {
    const welcomeMsg = chatContainer.querySelector('.welcome-message');
    if (welcomeMsg) {
        welcomeMsg.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = role === 'user' ? '👤' : '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = text;

    contentDiv.appendChild(textDiv);
    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(contentDiv);

    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// タイピングインジケーター表示
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message ai';
    typingDiv.id = 'typing-indicator';

    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'message-avatar';
    avatarDiv.textContent = '🤖';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const indicatorDiv = document.createElement('div');
    indicatorDiv.className = 'typing-indicator';
    indicatorDiv.innerHTML = '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';

    contentDiv.appendChild(indicatorDiv);
    typingDiv.appendChild(avatarDiv);
    typingDiv.appendChild(contentDiv);

    chatContainer.appendChild(typingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// タイピングインジケーター非表示
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// AI応答生成
async function generateAIResponse(userMessage) {
    try {
        if (aiModel.fallback) {
            // フォールバック応答
            return generateFallbackResponse(userMessage);
        }

        // Gemini APIを使用
        const result = await aiModel.generateContent(userMessage);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('AI response error:', error);
        return 'すみません、エラーが発生しました。もう一度お試しください。';
    }
}

// 簡易フォールバック応答
function generateFallbackResponse(message) {
    const responses = [
        'ご質問ありがとうございます。',
        'なるほど、興味深い質問ですね。',
        'それについて考えてみましょう。',
        'お答えできることがあれば幸いです。'
    ];

    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('こんにちは') || lowerMessage.includes('はじめまして')) {
        return 'こんにちは！何かお手伝いできることはありますか？';
    } else if (lowerMessage.includes('ありがとう')) {
        return 'どういたしまして！他にご質問はありますか？';
    } else if (lowerMessage.includes('?') || lowerMessage.includes('？')) {
        return responses[Math.floor(Math.random() * responses.length)] + ' ' + message + 'について、詳しく教えていただけますか？';
    } else {
        return responses[Math.floor(Math.random() * responses.length)] + ' ' + message + 'についてですね。';
    }
}

// メッセージ送信
async function sendMessage() {
    const message = messageInput.value.trim();

    if (!message || isProcessing) {
        return;
    }

    isProcessing = true;
    messageInput.value = '';
    messageInput.disabled = true;
    sendButton.disabled = true;

    // ユーザーメッセージを表示
    displayMessage('user', message);

    // タイピングインジケーター表示
    showTypingIndicator();

    try {
        // Firestoreにメッセージを保存
        await addDoc(collection(db, messagesPath), {
            role: 'user',
            content: message,
            timestamp: serverTimestamp()
        });

        // AI応答を生成
        const aiResponse = await generateAIResponse(message);

        // タイピングインジケーター非表示
        hideTypingIndicator();

        // AI応答を表示
        displayMessage('ai', aiResponse);

        // Firestoreに応答を保存
        await addDoc(collection(db, messagesPath), {
            role: 'ai',
            content: aiResponse,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error('Send message error:', error);
        hideTypingIndicator();
        displayMessage('ai', 'エラーが発生しました。もう一度お試しください。');
    } finally {
        isProcessing = false;
        messageInput.disabled = false;
        sendButton.disabled = false;
        messageInput.focus();
    }
}

// イベントリスナー
sendButton.addEventListener('click', sendMessage);

messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// テキストエリアの自動リサイズ
messageInput.addEventListener('input', () => {
    messageInput.style.height = 'auto';
    messageInput.style.height = Math.min(messageInput.scrollHeight, 120) + 'px';
});

// 初期化実行
initializeAI();
