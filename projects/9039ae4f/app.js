import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, where, onSnapshot, enableIndexedDbPersistence } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// オフライン対応
enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.log('複数のタブが開かれているため、永続化が無効になりました');
    } else if (err.code === 'unimplemented') {
        console.log('このブラウザは永続化をサポートしていません');
    }
});

// Service Worker登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
        .then(() => console.log('Service Worker登録成功'))
        .catch((err) => console.log('Service Worker登録失敗:', err));
}

// DOM要素
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userDisplay = document.getElementById('userDisplay');
const userEmail = document.getElementById('userEmail');
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const authForm = document.getElementById('authForm');
const signupBtn = document.getElementById('signupBtn');
const authError = document.getElementById('authError');
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const filterBtns = document.querySelectorAll('.filter-btn');
const statusIndicator = document.getElementById('statusText');
const statusDot = document.querySelector('.status-dot');

let currentUser = null;
let currentFilter = 'all';
let unsubscribe = null;

// 認証状態の監視
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        loginBtn.style.display = 'none';
        userDisplay.style.display = 'flex';
        userEmail.textContent = user.email;
        taskInput.disabled = false;
        addTaskBtn.disabled = false;
        loadTasks();
    } else {
        loginBtn.style.display = 'block';
        userDisplay.style.display = 'none';
        taskInput.disabled = true;
        addTaskBtn.disabled = true;
        if (unsubscribe) {
            unsubscribe();
        }
        taskList.innerHTML = '<div class="empty-state">ログインしてタスクを管理しましょう</div>';
    }
});

// ログインモーダル表示
loginBtn.addEventListener('click', () => {
    authModal.style.display = 'flex';
    authError.textContent = '';
});

closeModalBtn.addEventListener('click', () => {
    authModal.style.display = 'none';
    authError.textContent = '';
});

// ログイン
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        authModal.style.display = 'none';
        authError.textContent = '';
        authForm.reset();
    } catch (error) {
        authError.textContent = getErrorMessage(error.code);
    }
});

// 新規登録
signupBtn.addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) {
        authError.textContent = 'メールアドレスとパスワードを入力してください';
        return;
    }

    if (password.length < 6) {
        authError.textContent = 'パスワードは6文字以上にしてください';
        return;
    }

    try {
        await createUserWithEmailAndPassword(auth, email, password);
        authModal.style.display = 'none';
        authError.textContent = '';
        authForm.reset();
    } catch (error) {
        authError.textContent = getErrorMessage(error.code);
    }
});

// ログアウト
logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('ログアウトエラー:', error);
    }
});

// タスク追加
addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

async function addTask() {
    const text = taskInput.value.trim();
    if (!text || !currentUser) return;

    try {
        await addDoc(collection(db, `ccbotDev/nekokazu/apps/9039ae4f/tasks`), {
            text: text,
            completed: false,
            createdAt: new Date(),
            userId: currentUser.uid
        });
        taskInput.value = '';
    } catch (error) {
        console.error('タスク追加エラー:', error);
        alert('タスクの追加に失敗しました');
    }
}

// タスク読み込み（リアルタイム）
function loadTasks() {
    if (!currentUser) return;

    const q = query(
        collection(db, `ccbotDev/nekokazu/apps/9039ae4f/tasks`),
        where('userId', '==', currentUser.uid)
    );

    unsubscribe = onSnapshot(q, (snapshot) => {
        const tasks = [];
        snapshot.forEach((doc) => {
            tasks.push({ id: doc.id, ...doc.data() });
        });

        // 作成日時でソート
        tasks.sort((a, b) => b.createdAt - a.createdAt);

        renderTasks(tasks);

        // オンライン状態更新
        updateOnlineStatus(true);
    }, (error) => {
        console.error('タスク読み込みエラー:', error);
        updateOnlineStatus(false);
    });
}

// タスク表示
function renderTasks(tasks) {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        const emptyMessage = currentFilter === 'completed' ? '完了したタスクはありません' :
                           currentFilter === 'active' ? '未完了のタスクはありません' :
                           'タスクを追加してください';
        taskList.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
        return;
    }

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <span class="task-text">${escapeHtml(task.text)}</span>
            <button class="task-delete">削除</button>
        </div>
    `).join('');

    // イベントリスナー追加
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', toggleTask);
    });

    document.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', deleteTask);
    });
}

// タスク完了切り替え
async function toggleTask(e) {
    const taskItem = e.target.closest('.task-item');
    const taskId = taskItem.dataset.id;
    const completed = e.target.checked;

    try {
        await updateDoc(doc(db, `ccbotDev/nekokazu/apps/9039ae4f/tasks`, taskId), {
            completed: completed
        });
    } catch (error) {
        console.error('タスク更新エラー:', error);
        e.target.checked = !completed;
    }
}

// タスク削除
async function deleteTask(e) {
    const taskItem = e.target.closest('.task-item');
    const taskId = taskItem.dataset.id;

    try {
        await deleteDoc(doc(db, `ccbotDev/nekokazu/apps/9039ae4f/tasks`, taskId));
    } catch (error) {
        console.error('タスク削除エラー:', error);
    }
}

// フィルター切り替え
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        if (currentUser) {
            loadTasks();
        }
    });
});

// オンライン状態更新
function updateOnlineStatus(isOnline) {
    if (isOnline) {
        statusDot.classList.remove('offline');
        statusDot.classList.add('online');
        statusIndicator.textContent = 'オンライン';
    } else {
        statusDot.classList.remove('online');
        statusDot.classList.add('offline');
        statusIndicator.textContent = 'オフライン';
    }
}

// ネットワーク状態監視
window.addEventListener('online', () => updateOnlineStatus(true));
window.addEventListener('offline', () => updateOnlineStatus(false));
updateOnlineStatus(navigator.onLine);

// エラーメッセージ取得
function getErrorMessage(code) {
    const messages = {
        'auth/invalid-email': 'メールアドレスの形式が正しくありません',
        'auth/user-disabled': 'このアカウントは無効化されています',
        'auth/user-not-found': 'ユーザーが見つかりません',
        'auth/wrong-password': 'パスワードが間違っています',
        'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
        'auth/weak-password': 'パスワードは6文字以上にしてください',
        'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています'
    };
    return messages[code] || 'エラーが発生しました';
}

// HTMLエスケープ
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}
