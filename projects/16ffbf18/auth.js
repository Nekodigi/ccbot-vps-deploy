// auth.js - User Authentication Module
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

let auth;

// Wait for Firebase to be ready
function waitForFirebase() {
    return new Promise((resolve) => {
        if (window.firebaseReady) {
            resolve();
        } else {
            window.addEventListener('firebase-ready', resolve);
        }
    });
}

// Initialize auth module
async function initAuth() {
    await waitForFirebase();
    auth = window.firebaseAuth;

    // UI Elements
    const loadingScreen = document.getElementById('loading-screen');
    const authContainer = document.getElementById('auth-container');
    const appContainer = document.getElementById('app-container');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const authError = document.getElementById('auth-error');

    // Show/Hide form switches
    const showSignup = document.getElementById('show-signup');
    const showLogin = document.getElementById('show-login');

    // Login elements
    const loginEmail = document.getElementById('login-email');
    const loginPassword = document.getElementById('login-password');
    const loginBtn = document.getElementById('login-btn');

    // Signup elements
    const signupEmail = document.getElementById('signup-email');
    const signupPassword = document.getElementById('signup-password');
    const signupPasswordConfirm = document.getElementById('signup-password-confirm');
    const signupBtn = document.getElementById('signup-btn');

    // Logout button
    const logoutBtn = document.getElementById('logout-btn');
    const userEmailSpan = document.getElementById('user-email');

    // Toggle between login and signup forms
    showSignup.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authError.style.display = 'none';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        signupForm.style.display = 'none';
        loginForm.style.display = 'block';
        authError.style.display = 'none';
    });

    // Login handler
    loginBtn.addEventListener('click', async () => {
        const email = loginEmail.value.trim();
        const password = loginPassword.value;

        if (!email || !password) {
            showError('メールアドレスとパスワードを入力してください。');
            return;
        }

        try {
            loginBtn.disabled = true;
            loginBtn.textContent = 'ログイン中...';
            await signInWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the UI update
        } catch (error) {
            console.error('Login error:', error);
            handleAuthError(error);
            loginBtn.disabled = false;
            loginBtn.textContent = 'ログイン';
        }
    });

    // Signup handler
    signupBtn.addEventListener('click', async () => {
        const email = signupEmail.value.trim();
        const password = signupPassword.value;
        const passwordConfirm = signupPasswordConfirm.value;

        if (!email || !password || !passwordConfirm) {
            showError('すべての項目を入力してください。');
            return;
        }

        if (password.length < 6) {
            showError('パスワードは6文字以上で入力してください。');
            return;
        }

        if (password !== passwordConfirm) {
            showError('パスワードが一致しません。');
            return;
        }

        try {
            signupBtn.disabled = true;
            signupBtn.textContent = '登録中...';
            await createUserWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the UI update
        } catch (error) {
            console.error('Signup error:', error);
            handleAuthError(error);
            signupBtn.disabled = false;
            signupBtn.textContent = '登録';
        }
    });

    // Logout handler
    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            // onAuthStateChanged will handle the UI update
        } catch (error) {
            console.error('Logout error:', error);
            showError('ログアウトに失敗しました。');
        }
    });

    // Auth state observer
    onAuthStateChanged(auth, (user) => {
        loadingScreen.style.display = 'none';

        if (user) {
            // User is signed in
            authContainer.style.display = 'none';
            appContainer.style.display = 'flex';
            userEmailSpan.textContent = user.email;

            // Trigger custom event for app initialization
            window.dispatchEvent(new CustomEvent('user-authenticated', { detail: { user } }));
        } else {
            // User is signed out
            appContainer.style.display = 'none';
            authContainer.style.display = 'flex';

            // Reset forms
            loginEmail.value = '';
            loginPassword.value = '';
            signupEmail.value = '';
            signupPassword.value = '';
            signupPasswordConfirm.value = '';
            loginBtn.disabled = false;
            loginBtn.textContent = 'ログイン';
            signupBtn.disabled = false;
            signupBtn.textContent = '登録';

            // Trigger custom event for app cleanup
            window.dispatchEvent(new Event('user-signed-out'));
        }
    });

    // Error display function
    function showError(message) {
        authError.textContent = message;
        authError.style.display = 'block';
        setTimeout(() => {
            authError.style.display = 'none';
        }, 5000);
    }

    // Handle Firebase auth errors
    function handleAuthError(error) {
        let message = 'エラーが発生しました。';

        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'このメールアドレスは既に使用されています。';
                break;
            case 'auth/invalid-email':
                message = '無効なメールアドレスです。';
                break;
            case 'auth/operation-not-allowed':
                message = 'この操作は許可されていません。';
                break;
            case 'auth/weak-password':
                message = 'パスワードが弱すぎます。';
                break;
            case 'auth/user-disabled':
                message = 'このユーザーアカウントは無効化されています。';
                break;
            case 'auth/user-not-found':
                message = 'ユーザーが見つかりません。';
                break;
            case 'auth/wrong-password':
                message = 'メールアドレスまたはパスワードが正しくありません。';
                break;
            case 'auth/invalid-credential':
                message = 'メールアドレスまたはパスワードが正しくありません。';
                break;
            case 'auth/too-many-requests':
                message = 'リクエストが多すぎます。しばらくしてから再試行してください。';
                break;
            case 'auth/network-request-failed':
                message = 'ネットワークエラーが発生しました。接続を確認してください。';
                break;
            default:
                message = `エラー: ${error.message}`;
        }

        showError(message);
    }

    // Enable Enter key submission
    [loginEmail, loginPassword].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loginBtn.click();
            }
        });
    });

    [signupEmail, signupPassword, signupPasswordConfirm].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                signupBtn.click();
            }
        });
    });
}

// Export current user getter
export function getCurrentUser() {
    return window.firebaseAuth?.currentUser;
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}
