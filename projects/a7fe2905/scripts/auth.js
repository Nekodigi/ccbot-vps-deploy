import {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup,
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';

let auth = null;

export function initAuth(app) {
    auth = getAuth(app);
    return auth;
}

export function onAuthChange(callback) {
    if (!auth) throw new Error('Auth not initialized');
    return onAuthStateChanged(auth, callback);
}

export async function loginWithEmail(email, password) {
    if (!auth) throw new Error('Auth not initialized');
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw handleAuthError(error);
    }
}

export async function registerWithEmail(email, password) {
    if (!auth) throw new Error('Auth not initialized');
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return userCredential.user;
    } catch (error) {
        throw handleAuthError(error);
    }
}

export async function loginWithGoogle() {
    if (!auth) throw new Error('Auth not initialized');
    const provider = new GoogleAuthProvider();
    try {
        const result = await signInWithPopup(auth, provider);
        return result.user;
    } catch (error) {
        throw handleAuthError(error);
    }
}

export async function logout() {
    if (!auth) throw new Error('Auth not initialized');
    try {
        await signOut(auth);
    } catch (error) {
        throw new Error('ログアウトに失敗しました');
    }
}

export function getCurrentUser() {
    if (!auth) throw new Error('Auth not initialized');
    return auth.currentUser;
}

function handleAuthError(error) {
    const errorMessages = {
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/operation-not-allowed': 'この操作は許可されていません',
        'auth/weak-password': 'パスワードは6文字以上で設定してください',
        'auth/user-disabled': 'このアカウントは無効化されています',
        'auth/user-not-found': 'メールアドレスまたはパスワードが正しくありません',
        'auth/wrong-password': 'メールアドレスまたはパスワードが正しくありません',
        'auth/too-many-requests': 'リクエストが多すぎます。しばらく待ってから再試行してください',
        'auth/network-request-failed': 'ネットワークエラーが発生しました',
        'auth/popup-closed-by-user': 'ログインがキャンセルされました',
        'auth/cancelled-popup-request': 'ログインがキャンセルされました'
    };

    const message = errorMessages[error.code] || 'エラーが発生しました: ' + error.message;
    return new Error(message);
}
