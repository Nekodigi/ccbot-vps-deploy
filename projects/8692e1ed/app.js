// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firebase Configuration & Initialization
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    doc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Gemini API configuration (using Google Generative AI directly)
const GEMINI_API_KEY = firebaseConfig.apiKey;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Global State
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

let currentUser = null;
let infoItems = [];
let unsubscribeSnapshot = null;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DOM Elements
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const offlineScreen = document.getElementById('offline-screen');
const loadingSpinner = document.getElementById('loading-spinner');

// Auth elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const signupEmail = document.getElementById('signup-email');
const signupPassword = document.getElementById('signup-password');
const loginBtn = document.getElementById('login-btn');
const signupBtn = document.getElementById('signup-btn');
const showSignupLink = document.getElementById('show-signup');
const showLoginLink = document.getElementById('show-login');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');

// Tab elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Collect tab elements
const infoTitle = document.getElementById('info-title');
const infoContent = document.getElementById('info-content');
const infoUrl = document.getElementById('info-url');
const infoTags = document.getElementById('info-tags');
const addInfoBtn = document.getElementById('add-info-btn');

// Organize tab elements
const searchInput = document.getElementById('search-input');
const categoryFilter = document.getElementById('category-filter');
const infoList = document.getElementById('info-list');

// AI assistant elements
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const sendChatBtn = document.getElementById('send-chat-btn');

// Offline elements
const retryConnectionBtn = document.getElementById('retry-connection');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Utility Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function showLoading() {
    loadingSpinner.style.display = 'flex';
}

function hideLoading() {
    loadingSpinner.style.display = 'none';
}

function showError(message) {
    authError.textContent = message;
    authError.classList.add('show');
    setTimeout(() => {
        authError.classList.remove('show');
    }, 5000);
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function sanitizeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Authentication Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function handleSignup(e) {
    e.preventDefault();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;

    if (!email || !password) {
        showError('メールアドレスとパスワードを入力してください');
        return;
    }

    if (password.length < 6) {
        showError('パスワードは6文字以上で入力してください');
        return;
    }

    showLoading();
    try {
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showError('このメールアドレスは既に使用されています');
        } else if (error.code === 'auth/invalid-email') {
            showError('メールアドレスの形式が正しくありません');
        } else if (error.code === 'auth/weak-password') {
            showError('パスワードが弱すぎます');
        } else {
            showError('登録に失敗しました: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

async function handleLogin(e) {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError('メールアドレスとパスワードを入力してください');
        return;
    }

    showLoading();
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/user-not-found') {
            showError('ユーザーが見つかりません');
        } else if (error.code === 'auth/wrong-password') {
            showError('パスワードが間違っています');
        } else if (error.code === 'auth/invalid-email') {
            showError('メールアドレスの形式が正しくありません');
        } else if (error.code === 'auth/invalid-credential') {
            showError('メールアドレスまたはパスワードが間違っています');
        } else {
            showError('ログインに失敗しました: ' + error.message);
        }
    } finally {
        hideLoading();
    }
}

async function handleLogout() {
    showLoading();
    try {
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        await signOut(auth);
        infoItems = [];
    } catch (error) {
        console.error('Logout error:', error);
        showError('ログアウトに失敗しました');
    } finally {
        hideLoading();
    }
}

function toggleAuthForms() {
    loginForm.classList.toggle('active');
    signupForm.classList.toggle('active');
    authError.classList.remove('show');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Firestore Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function getUserCollectionPath() {
    if (!currentUser) return null;
    const username = currentUser.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
    return `ccbotDev/${username}/apps/8692e1ed/items`;
}

async function addInfoItem() {
    const title = infoTitle.value.trim();
    const content = infoContent.value.trim();
    const url = infoUrl.value.trim();
    const tagsStr = infoTags.value.trim();

    if (!title || !content) {
        showError('タイトルと内容を入力してください');
        return;
    }

    showLoading();
    try {
        const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()).filter(t => t) : [];
        const collectionPath = getUserCollectionPath();

        await addDoc(collection(db, collectionPath), {
            title,
            content,
            url: url || '',
            tags,
            notes: '',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            userId: currentUser.uid
        });

        // Clear form
        infoTitle.value = '';
        infoContent.value = '';
        infoUrl.value = '';
        infoTags.value = '';

        // Switch to organize tab
        switchTab('organize');
    } catch (error) {
        console.error('Add info error:', error);
        showError('情報の追加に失敗しました: ' + error.message);
    } finally {
        hideLoading();
    }
}

async function updateInfoNotes(itemId, notes) {
    try {
        const collectionPath = getUserCollectionPath();
        const docRef = doc(db, collectionPath, itemId);
        await updateDoc(docRef, {
            notes,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Update notes error:', error);
        showError('メモの更新に失敗しました');
    }
}

async function deleteInfoItem(itemId) {
    if (!confirm('この情報を削除しますか?')) return;

    showLoading();
    try {
        const collectionPath = getUserCollectionPath();
        await deleteDoc(doc(db, collectionPath, itemId));
    } catch (error) {
        console.error('Delete info error:', error);
        showError('情報の削除に失敗しました');
    } finally {
        hideLoading();
    }
}

function setupRealtimeListener() {
    const collectionPath = getUserCollectionPath();
    const q = query(
        collection(db, collectionPath),
        where('userId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
    );

    unsubscribeSnapshot = onSnapshot(q, (snapshot) => {
        infoItems = [];
        snapshot.forEach((doc) => {
            infoItems.push({ id: doc.id, ...doc.data() });
        });
        renderInfoList();
        updateCategoryFilter();
    }, (error) => {
        console.error('Snapshot listener error:', error);
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// UI Rendering Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function renderInfoList() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categoryFilter.value;

    let filteredItems = infoItems.filter(item => {
        const matchesSearch =
            item.title.toLowerCase().includes(searchTerm) ||
            item.content.toLowerCase().includes(searchTerm) ||
            (item.notes && item.notes.toLowerCase().includes(searchTerm));

        const matchesCategory =
            selectedCategory === 'all' ||
            (item.tags && item.tags.includes(selectedCategory));

        return matchesSearch && matchesCategory;
    });

    if (filteredItems.length === 0) {
        infoList.innerHTML = '<p style="text-align: center; color: var(--color-text-secondary); padding: 2rem;">情報がありません</p>';
        return;
    }

    infoList.innerHTML = filteredItems.map(item => `
        <div class="info-item" data-id="${item.id}">
            <div class="info-item-header">
                <h3 class="info-item-title">${sanitizeHTML(item.title)}</h3>
                <div class="info-item-actions">
                    <button class="delete-btn" onclick="window.deleteItem('${item.id}')">削除</button>
                </div>
            </div>
            <p class="info-item-content">${sanitizeHTML(item.content)}</p>
            ${item.url ? `<a href="${sanitizeHTML(item.url)}" target="_blank" rel="noopener noreferrer" class="info-item-url">${sanitizeHTML(item.url)}</a>` : ''}
            ${item.tags && item.tags.length > 0 ? `
                <div class="info-item-tags">
                    ${item.tags.map(tag => `<span class="tag">${sanitizeHTML(tag)}</span>`).join('')}
                </div>
            ` : ''}
            <p class="info-item-meta">作成日: ${formatDate(item.createdAt)}</p>
            <div class="info-item-notes">
                <textarea
                    placeholder="メモを追加..."
                    rows="2"
                    onblur="window.updateNotes('${item.id}', this.value)"
                >${sanitizeHTML(item.notes || '')}</textarea>
            </div>
        </div>
    `).join('');
}

function updateCategoryFilter() {
    const allTags = new Set();
    infoItems.forEach(item => {
        if (item.tags) {
            item.tags.forEach(tag => allTags.add(tag));
        }
    });

    const currentValue = categoryFilter.value;
    categoryFilter.innerHTML = '<option value="all">すべて</option>';

    allTags.forEach(tag => {
        const option = document.createElement('option');
        option.value = tag;
        option.textContent = tag;
        categoryFilter.appendChild(option);
    });

    if (allTags.has(currentValue)) {
        categoryFilter.value = currentValue;
    }
}

function switchTab(tabName) {
    tabBtns.forEach(btn => {
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });

    tabContents.forEach(content => {
        if (content.id === `${tabName}-tab`) {
            content.classList.add('active');
        } else {
            content.classList.remove('active');
        }
    });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI Assistant Functions
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    // Add user message to chat
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user';
    userMessageDiv.innerHTML = `<p>${sanitizeHTML(message)}</p>`;
    chatMessages.appendChild(userMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    chatInput.value = '';
    showLoading();

    try {
        // Prepare context from collected info
        const context = infoItems.map(item =>
            `タイトル: ${item.title}\n内容: ${item.content}${item.notes ? `\nメモ: ${item.notes}` : ''}`
        ).join('\n\n---\n\n');

        const prompt = `以下は、ユーザーが収集した情報です:\n\n${context}\n\n---\n\nユーザーの質問: ${message}\n\n上記の情報に基づいて、質問に答えてください。情報が不足している場合は、一般的な知識で補完してください。`;

        // Call Gemini API directly
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0].content.parts[0].text;

        // Add assistant message to chat
        const assistantMessageDiv = document.createElement('div');
        assistantMessageDiv.className = 'chat-message assistant';
        assistantMessageDiv.innerHTML = `<p>${sanitizeHTML(aiResponse)}</p>`;
        chatMessages.appendChild(assistantMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } catch (error) {
        console.error('AI chat error:', error);
        const errorMessageDiv = document.createElement('div');
        errorMessageDiv.className = 'chat-message system';
        errorMessageDiv.innerHTML = `<p>エラーが発生しました: ${sanitizeHTML(error.message)}</p>`;
        chatMessages.appendChild(errorMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    } finally {
        hideLoading();
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Online/Offline Detection
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function checkOnlineStatus() {
    if (!navigator.onLine) {
        appScreen.style.display = 'none';
        authScreen.style.display = 'none';
        offlineScreen.style.display = 'flex';
    } else {
        offlineScreen.style.display = 'none';
        if (currentUser) {
            appScreen.style.display = 'block';
        } else {
            authScreen.style.display = 'flex';
        }
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Event Listeners
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// Auth event listeners
loginBtn.addEventListener('click', handleLogin);
signupBtn.addEventListener('click', handleSignup);
logoutBtn.addEventListener('click', handleLogout);
showSignupLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms();
});
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    toggleAuthForms();
});

// Tab event listeners
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        switchTab(btn.dataset.tab);
    });
});

// Collect tab event listeners
addInfoBtn.addEventListener('click', addInfoItem);

// Organize tab event listeners
searchInput.addEventListener('input', renderInfoList);
categoryFilter.addEventListener('change', renderInfoList);

// AI assistant event listeners
sendChatBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendChatMessage();
    }
});

// Offline event listeners
retryConnectionBtn.addEventListener('click', checkOnlineStatus);
window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);

// Global functions for inline event handlers
window.deleteItem = deleteInfoItem;
window.updateNotes = updateInfoNotes;

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Auth State Observer
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        authScreen.style.display = 'none';
        appScreen.style.display = 'block';
        setupRealtimeListener();
    } else {
        currentUser = null;
        appScreen.style.display = 'none';
        authScreen.style.display = 'flex';
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
        infoItems = [];
    }
    checkOnlineStatus();
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Service Worker Registration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    });
}
