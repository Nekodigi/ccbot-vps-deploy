// Firebase SDK (CDN版を使用)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

// Firebase Configuration
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

// Firestore collection path - ユーザー名をローカルストレージから取得して使用
let currentUsername = localStorage.getItem('username') || 'ゲスト';
const COLLECTION_PATH = 'ccbotDev/nekokazu/apps/2c207063';
const messagesRef = collection(db, COLLECTION_PATH, 'messages');

// DOM Elements
const usernameInput = document.getElementById('usernameInput');
const saveUsernameBtn = document.getElementById('saveUsername');
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messagesContainer');

// Initialize username
usernameInput.value = currentUsername;

// Save username
saveUsernameBtn.addEventListener('click', () => {
  const username = usernameInput.value.trim();
  if (username) {
    currentUsername = username;
    localStorage.setItem('username', username);
    showNotification('ユーザー名を設定しました');
  }
});

// Send message
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

async function sendMessage() {
  const text = messageInput.value.trim();
  if (!text) return;

  try {
    await addDoc(collection(db, COLLECTION_PATH, 'messages'), {
      username: currentUsername,
      text: text,
      timestamp: serverTimestamp(),
      type: 'user'
    });

    messageInput.value = '';

    // ランダムでAIが反応するかを決定（30%の確率）
    if (Math.random() < 0.3) {
      setTimeout(() => {
        generateAIResponse(text);
      }, 1000 + Math.random() * 2000);
    }
  } catch (error) {
    console.error('Error sending message:', error);
    showError('メッセージの送信に失敗しました');
  }
}

// Listen to messages
const q = query(collection(db, COLLECTION_PATH, 'messages'), orderBy('timestamp', 'asc'));
onSnapshot(q, (snapshot) => {
  messagesContainer.innerHTML = '';

  snapshot.forEach((doc) => {
    const data = doc.data();
    displayMessage(data);
  });

  // Auto scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}, (error) => {
  console.error('Error listening to messages:', error);
  showError('メッセージの取得に失敗しました');
});

function displayMessage(data) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${data.type === 'ai' ? 'ai' : (data.username === currentUsername ? 'user' : 'other')}`;

  const infoDiv = document.createElement('div');
  infoDiv.className = 'message-info';

  const usernameSpan = document.createElement('span');
  usernameSpan.textContent = data.username;

  const timestampSpan = document.createElement('span');
  timestampSpan.className = 'timestamp';
  if (data.timestamp) {
    const date = data.timestamp.toDate();
    timestampSpan.textContent = formatTime(date);
  }

  infoDiv.appendChild(usernameSpan);
  infoDiv.appendChild(timestampSpan);

  const bubbleDiv = document.createElement('div');
  bubbleDiv.className = 'message-bubble';
  bubbleDiv.textContent = data.text;

  messageDiv.appendChild(infoDiv);
  messageDiv.appendChild(bubbleDiv);
  messagesContainer.appendChild(messageDiv);
}

function formatTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

// AI Response using Gemini
async function generateAIResponse(userMessage) {
  try {
    // Gemini APIを直接呼び出し（ブラウザから）
    const API_KEY = firebaseConfig.apiKey;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `あなたは自然な日本語で会話するAIアシスタントです。以下のメッセージに対して、簡潔で自然な返答をしてください（1-2文程度）。友達のように親しみやすく、カジュアルなトーンで話してください。\n\nメッセージ: ${userMessage}`
          }]
        }],
        generationConfig: {
          temperature: 0.9,
          maxOutputTokens: 150
        }
      })
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const aiText = data.candidates[0].content.parts[0].text;

    // AIの返答をFirestoreに保存
    await addDoc(collection(db, COLLECTION_PATH, 'messages'), {
      username: 'AI Assistant',
      text: aiText,
      timestamp: serverTimestamp(),
      type: 'ai'
    });

  } catch (error) {
    console.error('Error generating AI response:', error);
    // エラーが発生してもユーザーには通知しない（AIは任意の機能のため）
  }
}

function showNotification(message) {
  // 簡易通知
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #4CAF50;
    color: white;
    padding: 1rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 1000;
    animation: slideDown 0.3s ease;
  `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transition = 'opacity 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function showError(message) {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'error-message';
  errorDiv.textContent = message;
  messagesContainer.insertBefore(errorDiv, messagesContainer.firstChild);

  setTimeout(() => {
    errorDiv.style.opacity = '0';
    errorDiv.style.transition = 'opacity 0.3s ease';
    setTimeout(() => errorDiv.remove(), 300);
  }, 3000);
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./service-worker.js')
    .then(() => console.log('Service Worker registered'))
    .catch((error) => console.error('Service Worker registration failed:', error));
}
