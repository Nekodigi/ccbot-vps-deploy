// Authentication Module
import { auth } from './firebase-config.js';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';

// DOM Elements
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const loadingScreen = document.getElementById('loading');

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const authError = document.getElementById('auth-error');

const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');

const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');

const userEmailDisplay = document.getElementById('user-email');

// Error messages in Japanese
const errorMessages = {
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています。',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません。',
    'auth/operation-not-allowed': 'この操作は許可されていません。',
    'auth/weak-password': 'パスワードは6文字以上にしてください。',
    'auth/user-disabled': 'このアカウントは無効化されています。',
    'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが正しくありません。',
    'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください。',
    'auth/network-request-failed': 'ネットワークエラーが発生しました。',
};

// Show error message
function showError(errorCode) {
    const message = errorMessages[errorCode] || 'エラーが発生しました。もう一度お試しください。';
    authError.textContent = message;
    authError.style.display = 'block';
}

// Hide error message
function hideError() {
    authError.style.display = 'none';
}

// Switch to register form
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    hideError();
});

// Switch to login form
showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerForm.style.display = 'none';
    loginForm.style.display = 'block';
    hideError();
});

// Login handler
loginBtn.addEventListener('click', async () => {
    hideError();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showError('auth/invalid-email');
        return;
    }

    try {
        loginBtn.disabled = true;
        loginBtn.textContent = 'ログイン中...';

        await signInWithEmailAndPassword(auth, email, password);

        loginEmail.value = '';
        loginPassword.value = '';
    } catch (error) {
        console.error('Login error:', error);
        showError(error.code);
    } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = 'ログイン';
    }
});

// Register handler
registerBtn.addEventListener('click', async () => {
    hideError();
    const email = registerEmail.value.trim();
    const password = registerPassword.value;

    if (!email || !password) {
        showError('auth/invalid-email');
        return;
    }

    if (password.length < 6) {
        showError('auth/weak-password');
        return;
    }

    try {
        registerBtn.disabled = true;
        registerBtn.textContent = '登録中...';

        await createUserWithEmailAndPassword(auth, email, password);

        registerEmail.value = '';
        registerPassword.value = '';
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.code);
    } finally {
        registerBtn.disabled = false;
        registerBtn.textContent = '新規登録';
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
        alert('ログアウトに失敗しました。');
    }
});

// Allow Enter key to submit forms
loginEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginPassword.focus();
});

loginPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

registerEmail.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerPassword.focus();
});

registerPassword.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') registerBtn.click();
});

// Auth state observer
export function initAuthStateObserver() {
    onAuthStateChanged(auth, (user) => {
        loadingScreen.style.display = 'none';

        if (user) {
            // User is signed in
            console.log('User signed in:', user.email);
            userEmailDisplay.textContent = user.email;
            authScreen.style.display = 'none';
            appScreen.style.display = 'block';

            // Dispatch custom event for tasks module
            window.dispatchEvent(new CustomEvent('userAuthenticated', { detail: { user } }));
        } else {
            // User is signed out
            console.log('User signed out');
            appScreen.style.display = 'none';
            authScreen.style.display = 'flex';
        }
    });
}

console.log('Auth module loaded');
