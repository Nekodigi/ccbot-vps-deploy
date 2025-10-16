// Firebase configuration
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
firebase.initializeApp(firebaseConfig);
const database = firebase.database();
const auth = firebase.auth();

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const chatContainer = document.getElementById('chatContainer');
const nameInput = document.getElementById('nameInput');
const loginBtn = document.getElementById('loginBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messagesDiv = document.getElementById('messages');
const userNameSpan = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');

// Current user
let currentUser = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showChat();
    }

    // Login button event
    loginBtn.addEventListener('click', handleLogin);
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });

    // Send message button event
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Logout button event
    logoutBtn.addEventListener('click', handleLogout);
});

// Handle login
function handleLogin() {
    const name = nameInput.value.trim();
    if (name === '') {
        alert('ニックネームを入力してください');
        return;
    }

    // Sign in anonymously with Firebase Auth
    auth.signInAnonymously().then(() => {
        currentUser = {
            id: auth.currentUser.uid,
            name: name
        };
        localStorage.setItem('chatUser', JSON.stringify(currentUser));
        showChat();
    }).catch((error) => {
        console.error('Authentication error:', error);
        alert('ログインに失敗しました');
    });
}

// Handle logout
function handleLogout() {
    auth.signOut().then(() => {
        currentUser = null;
        localStorage.removeItem('chatUser');
        showLogin();
        messagesDiv.innerHTML = '';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// Show chat interface
function showChat() {
    loginContainer.style.display = 'none';
    chatContainer.style.display = 'flex';
    userNameSpan.textContent = currentUser.name;
    logoutBtn.style.display = 'block';
    nameInput.value = '';

    // Start listening for messages
    listenForMessages();
}

// Show login interface
function showLogin() {
    loginContainer.style.display = 'flex';
    chatContainer.style.display = 'none';
    logoutBtn.style.display = 'none';
    userNameSpan.textContent = 'ゲスト';
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    if (message === '' || !currentUser) {
        return;
    }

    const messagesRef = database.ref('messages');
    const newMessage = {
        userId: currentUser.id,
        userName: currentUser.name,
        text: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    };

    messagesRef.push(newMessage).then(() => {
        messageInput.value = '';
        messageInput.focus();
    }).catch((error) => {
        console.error('Error sending message:', error);
        alert('メッセージの送信に失敗しました');
    });
}

// Listen for messages
function listenForMessages() {
    const messagesRef = database.ref('messages').orderByChild('timestamp').limitToLast(50);

    messagesRef.on('child_added', (snapshot) => {
        const message = snapshot.val();
        displayMessage(message);
    });
}

// Display message
function displayMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';

    // Check if this is the current user's message
    if (currentUser && message.userId === currentUser.id) {
        messageDiv.classList.add('own');
    }

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';

    const userSpan = document.createElement('span');
    userSpan.className = 'message-user';
    userSpan.textContent = message.userName;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    timeSpan.textContent = formatTime(message.timestamp);

    headerDiv.appendChild(userSpan);
    headerDiv.appendChild(timeSpan);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = message.text;

    messageDiv.appendChild(headerDiv);
    messageDiv.appendChild(contentDiv);

    messagesDiv.appendChild(messageDiv);

    // Scroll to bottom
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

// Format timestamp
function formatTime(timestamp) {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Handle authentication state changes
auth.onAuthStateChanged((user) => {
    if (user && currentUser) {
        // User is signed in
        console.log('User authenticated:', user.uid);
    } else if (!user && currentUser) {
        // User is signed out but currentUser exists (shouldn't happen normally)
        handleLogout();
    }
});

// Clean up old messages (optional, runs once on load)
function cleanupOldMessages() {
    const messagesRef = database.ref('messages');
    messagesRef.once('value', (snapshot) => {
        const messages = [];
        snapshot.forEach((childSnapshot) => {
            messages.push({
                key: childSnapshot.key,
                timestamp: childSnapshot.val().timestamp
            });
        });

        // Keep only last 100 messages
        if (messages.length > 100) {
            messages.sort((a, b) => a.timestamp - b.timestamp);
            const toDelete = messages.slice(0, messages.length - 100);
            toDelete.forEach((msg) => {
                database.ref('messages/' + msg.key).remove();
            });
        }
    });
}

// Run cleanup occasionally
if (Math.random() < 0.1) {
    cleanupOldMessages();
}
