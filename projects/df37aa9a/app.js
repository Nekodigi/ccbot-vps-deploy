// Firebase configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Get user ID from project requirements
const userId = '1043761710227533865';
const projectId = 'df37aa9a';

// Firestore path: /ccbotDev/[username]/apps/[projectID]/messages
const messagesPath = `ccbotDev/nekokazu/apps/${projectId}/messages`;

// DOM Elements
const loginSection = document.getElementById('login-section');
const chatSection = document.getElementById('chat-section');
const usernameInput = document.getElementById('username-input');
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userDisplay = document.getElementById('user-display');
const messagesContainer = document.getElementById('messages-container');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const loading = document.getElementById('loading');

// State
let currentUsername = null;
let unsubscribe = null;

// Utility Functions
function showLoading() {
    loading.classList.remove('hidden');
}

function hideLoading() {
    loading.classList.add('hidden');
}

function formatTime(timestamp) {
    if (!timestamp) return '';

    let date;
    if (timestamp instanceof Timestamp) {
        date = timestamp.toDate();
    } else if (timestamp.toDate) {
        date = timestamp.toDate();
    } else {
        date = new Date(timestamp);
    }

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Create message element
function createMessageElement(messageData, username) {
    const messageDiv = document.createElement('div');
    const isSent = messageData.username === username;
    messageDiv.className = `message ${isSent ? 'sent' : 'received'}`;

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';

    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'message-username';
    usernameSpan.textContent = messageData.username;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(messageData.timestamp);

    headerDiv.appendChild(usernameSpan);
    headerDiv.appendChild(timeSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = sanitizeHTML(messageData.text);

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

// Create system message
function createSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(contentDiv);
    return messageDiv;
}

// Scroll to bottom
function scrollToBottom() {
    const container = document.querySelector('.chat-container');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Login functionality
async function handleLogin() {
    const username = usernameInput.value.trim();

    if (!username) {
        alert('ユーザー名を入力してください');
        return;
    }

    if (username.length > 20) {
        alert('ユーザー名は20文字以内で入力してください');
        return;
    }

    showLoading();

    try {
        currentUsername = username;
        localStorage.setItem('chatUsername', username);

        // Switch to chat view
        loginSection.classList.add('hidden');
        chatSection.classList.remove('hidden');
        userDisplay.textContent = username;

        // Start listening to messages
        startListeningToMessages();

    } catch (error) {
        console.error('Login error:', error);
        alert('ログインに失敗しました。もう一度お試しください。');
    } finally {
        hideLoading();
    }
}

// Logout functionality
function handleLogout() {
    if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
    }

    currentUsername = null;
    localStorage.removeItem('chatUsername');
    messagesContainer.innerHTML = '';
    messageInput.value = '';

    chatSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    usernameInput.value = '';
}

// Send message
async function sendMessage() {
    const text = messageInput.value.trim();

    if (!text) {
        return;
    }

    if (!currentUsername) {
        alert('ログインしてください');
        return;
    }

    sendBtn.disabled = true;

    try {
        await addDoc(collection(db, messagesPath), {
            text: text,
            username: currentUsername,
            timestamp: serverTimestamp(),
            userId: userId
        });

        messageInput.value = '';
        scrollToBottom();

    } catch (error) {
        console.error('Error sending message:', error);
        alert('メッセージの送信に失敗しました。もう一度お試しください。');
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Listen to messages
function startListeningToMessages() {
    const messagesRef = collection(db, messagesPath);
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    unsubscribe = onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const messageData = change.doc.data();
                const messageElement = createMessageElement(messageData, currentUsername);
                messagesContainer.appendChild(messageElement);
                scrollToBottom();
            }
        });
    }, (error) => {
        console.error('Error listening to messages:', error);
        messagesContainer.appendChild(
            createSystemMessage('メッセージの取得に失敗しました。ページを更新してください。')
        );
    });
}

// Event listeners
loginBtn.addEventListener('click', handleLogin);

usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

logoutBtn.addEventListener('click', handleLogout);

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Check for saved username
const savedUsername = localStorage.getItem('chatUsername');
if (savedUsername) {
    usernameInput.value = savedUsername;
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
