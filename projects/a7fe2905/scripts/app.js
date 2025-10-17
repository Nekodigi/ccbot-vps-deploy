import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { firebaseConfig } from './firebase-config.js';
import {
    initAuth,
    onAuthChange,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    getCurrentUser
} from './auth.js';
import {
    initDatabase,
    setUsername,
    saveData,
    loadData,
    deleteData
} from './database.js';
import {
    initAI,
    generateAIResponse,
    analyzeData
} from './ai.js';

// Initialize Firebase
let app = null;
let currentUser = null;
let chatHistory = [];

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loadingOverlay = document.getElementById('loading-overlay');
const toast = document.getElementById('toast');

// Auth elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginButton = document.getElementById('login-button');
const registerButton = document.getElementById('register-button');
const googleLoginButton = document.getElementById('google-login-button');
const authError = document.getElementById('auth-error');

// App elements
const userEmailSpan = document.getElementById('user-email');
const logoutButton = document.getElementById('logout-button');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const dataTitle = document.getElementById('data-title');
const dataContent = document.getElementById('data-content');
const saveDataButton = document.getElementById('save-data-button');
const dataList = document.getElementById('data-list');

// Initialize app
async function init() {
    try {
        // Initialize Firebase
        app = initializeApp(firebaseConfig);
        initAuth(app);
        initDatabase(app);
        initAI(app);

        // Register service worker
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.error('Service Worker registration failed:', error);
            }
        }

        // Setup auth state listener
        onAuthChange((user) => {
            currentUser = user;
            if (user) {
                showAppScreen(user);
            } else {
                showAuthScreen();
            }
        });

        // Setup event listeners
        setupEventListeners();

    } catch (error) {
        console.error('Initialization error:', error);
        showToast('アプリの初期化に失敗しました', 'error');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            switchTab(tab);
        });
    });

    // Auth buttons
    loginButton.addEventListener('click', handleLogin);
    registerButton.addEventListener('click', handleRegister);
    googleLoginButton.addEventListener('click', handleGoogleLogin);
    logoutButton.addEventListener('click', handleLogout);

    // Chat
    sendButton.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });

    // Data management
    saveDataButton.addEventListener('click', handleSaveData);
}

// Tab switching
function switchTab(tab) {
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.querySelectorAll('.form-content').forEach(form => {
        form.classList.toggle('active', form.id === `${tab}-form`);
    });

    authError.classList.remove('show');
}

// Auth handlers
async function handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    if (!email || !password) {
        showAuthError('メールアドレスとパスワードを入力してください');
        return;
    }

    showLoading(true);
    try {
        await loginWithEmail(email, password);
        showToast('ログインしました', 'success');
    } catch (error) {
        showAuthError(error.message);
    } finally {
        showLoading(false);
    }
}

async function handleRegister() {
    const email = document.getElementById('register-email').value.trim();
    const password = document.getElementById('register-password').value;

    if (!email || !password) {
        showAuthError('メールアドレスとパスワードを入力してください');
        return;
    }

    if (password.length < 6) {
        showAuthError('パスワードは6文字以上で設定してください');
        return;
    }

    showLoading(true);
    try {
        await registerWithEmail(email, password);
        showToast('アカウントを作成しました', 'success');
    } catch (error) {
        showAuthError(error.message);
    } finally {
        showLoading(false);
    }
}

async function handleGoogleLogin() {
    showLoading(true);
    try {
        await loginWithGoogle();
        showToast('Googleアカウントでログインしました', 'success');
    } catch (error) {
        showAuthError(error.message);
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    showLoading(true);
    try {
        await logout();
        chatHistory = [];
        showToast('ログアウトしました', 'success');
    } catch (error) {
        showToast('ログアウトに失敗しました', 'error');
    } finally {
        showLoading(false);
    }
}

// Chat handlers
async function handleSendMessage() {
    const message = chatInput.value.trim();

    if (!message) return;

    chatInput.value = '';
    chatInput.disabled = true;
    sendButton.disabled = true;

    // Add user message
    addChatMessage(message, 'user');
    chatHistory.push({ role: 'user', content: message });

    try {
        // Generate AI response
        const response = await generateAIResponse(message, chatHistory);
        addChatMessage(response, 'ai');
        chatHistory.push({ role: 'ai', content: response });
    } catch (error) {
        console.error('Chat error:', error);
        addChatMessage('エラー: ' + error.message, 'system');
        showToast('メッセージの送信に失敗しました', 'error');
    } finally {
        chatInput.disabled = false;
        sendButton.disabled = false;
        chatInput.focus();
    }
}

function addChatMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Data management handlers
async function handleSaveData() {
    const title = dataTitle.value.trim();
    const content = dataContent.value.trim();

    if (!title || !content) {
        showToast('タイトルと内容を入力してください', 'error');
        return;
    }

    showLoading(true);
    try {
        await saveData(title, content);
        dataTitle.value = '';
        dataContent.value = '';
        showToast('データを保存しました', 'success');
        await loadDataList();
    } catch (error) {
        console.error('Save error:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

async function loadDataList() {
    showLoading(true);
    try {
        const data = await loadData();
        renderDataList(data);
    } catch (error) {
        console.error('Load error:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

function renderDataList(data) {
    dataList.innerHTML = '';

    if (data.length === 0) {
        dataList.innerHTML = '<p style="color: var(--color-light-gray); text-align: center;">データがありません</p>';
        return;
    }

    data.forEach((item) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'data-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'data-item-content';

        const titleDiv = document.createElement('div');
        titleDiv.className = 'data-item-title';
        titleDiv.textContent = item.title;

        const textDiv = document.createElement('div');
        textDiv.className = 'data-item-text';
        textDiv.textContent = item.content;

        const dateDiv = document.createElement('div');
        dateDiv.className = 'data-item-date';
        dateDiv.textContent = formatDate(item.createdAt);

        contentDiv.appendChild(titleDiv);
        contentDiv.appendChild(textDiv);
        contentDiv.appendChild(dateDiv);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'data-item-actions';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button';
        deleteButton.textContent = '削除';
        deleteButton.addEventListener('click', () => handleDeleteData(item.id));

        actionsDiv.appendChild(deleteButton);

        itemDiv.appendChild(contentDiv);
        itemDiv.appendChild(actionsDiv);

        dataList.appendChild(itemDiv);
    });
}

async function handleDeleteData(docId) {
    if (!confirm('このデータを削除してもよろしいですか?')) {
        return;
    }

    showLoading(true);
    try {
        await deleteData(docId);
        showToast('データを削除しました', 'success');
        await loadDataList();
    } catch (error) {
        console.error('Delete error:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// UI helpers
function showAuthScreen() {
    authScreen.classList.add('active');
    appScreen.classList.remove('active');
    document.getElementById('login-email').value = '';
    document.getElementById('login-password').value = '';
    document.getElementById('register-email').value = '';
    document.getElementById('register-password').value = '';
    authError.classList.remove('show');
}

function showAppScreen(user) {
    authScreen.classList.remove('active');
    appScreen.classList.add('active');
    userEmailSpan.textContent = user.email;

    // Extract username from email
    const username = user.email.split('@')[0];
    setUsername(username);

    // Load initial data
    loadDataList();

    // Add welcome message
    if (chatHistory.length === 0) {
        addChatMessage('こんにちは。何かお手伝いできることはありますか?', 'ai');
    }
}

function showLoading(show) {
    if (show) {
        loadingOverlay.classList.add('active');
    } else {
        loadingOverlay.classList.remove('active');
    }
}

function showToast(message, type = 'success') {
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function showAuthError(message) {
    authError.textContent = message;
    authError.classList.add('show');
}

function formatDate(date) {
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Start the app
init();
