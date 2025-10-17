// Firebase設定
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    deleteDoc,
    updateDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

// Firebase初期化
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
const db = getFirestore(app);

// ユーザー固有のコレクションパス
const tasksRef = collection(db, 'ccbotDev', 'nekokazu', 'apps', '571e5352', 'tasks');

// DOM要素
const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const filterButtons = document.querySelectorAll('.filter-btn');
const connectionStatus = document.getElementById('connectionStatus');
const activeTasksElement = document.getElementById('activeTasks');
const completedTasksElement = document.getElementById('completedTasks');
const totalTasksElement = document.getElementById('totalTasks');

// 状態管理
let tasks = [];
let currentFilter = 'all';

// 統計情報の更新
function updateStats() {
    const activeTasks = tasks.filter(task => !task.completed).length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;

    activeTasksElement.textContent = activeTasks;
    completedTasksElement.textContent = completedTasks;
    totalTasksElement.textContent = totalTasks;
}

// タスクの表示
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        tasksList.innerHTML = filteredTasks.map(task => createTaskElement(task)).join('');
        attachTaskEventListeners();
    }

    updateStats();
}

// タスク要素の作成
function createTaskElement(task) {
    const date = task.createdAt ? new Date(task.createdAt.seconds * 1000).toLocaleString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) : '';

    return `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
            >
            <span class="task-text">${escapeHtml(task.text)}</span>
            <span class="task-date">${date}</span>
            <button class="btn btn-danger task-delete">削除</button>
        </div>
    `;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// イベントリスナーの追加
function attachTaskEventListeners() {
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', handleTaskToggle);
    });

    document.querySelectorAll('.task-delete').forEach(button => {
        button.addEventListener('click', handleTaskDelete);
    });
}

// タスクの追加
async function handleTaskSubmit(e) {
    e.preventDefault();

    const text = taskInput.value.trim();
    if (!text) return;

    try {
        await addDoc(tasksRef, {
            text: text,
            completed: false,
            createdAt: serverTimestamp()
        });

        taskInput.value = '';
        taskInput.focus();
    } catch (error) {
        console.error('タスクの追加に失敗しました:', error);
        alert('タスクの追加に失敗しました。もう一度お試しください。');
    }
}

// タスクの完了/未完了の切り替え
async function handleTaskToggle(e) {
    const taskElement = e.target.closest('.task-item');
    const taskId = taskElement.dataset.id;
    const task = tasks.find(t => t.id === taskId);

    if (!task) return;

    try {
        const taskDocRef = doc(db, 'ccbotDev', 'nekokazu', 'apps', '571e5352', 'tasks', taskId);
        await updateDoc(taskDocRef, {
            completed: !task.completed
        });
    } catch (error) {
        console.error('タスクの更新に失敗しました:', error);
        alert('タスクの更新に失敗しました。もう一度お試しください。');
    }
}

// タスクの削除
async function handleTaskDelete(e) {
    const taskElement = e.target.closest('.task-item');
    const taskId = taskElement.dataset.id;

    if (!confirm('このタスクを削除してもよろしいですか?')) return;

    try {
        const taskDocRef = doc(db, 'ccbotDev', 'nekokazu', 'apps', '571e5352', 'tasks', taskId);
        await deleteDoc(taskDocRef);
    } catch (error) {
        console.error('タスクの削除に失敗しました:', error);
        alert('タスクの削除に失敗しました。もう一度お試しください。');
    }
}

// フィルターの切り替え
function handleFilterChange(e) {
    filterButtons.forEach(btn => btn.classList.remove('active'));
    e.target.classList.add('active');
    currentFilter = e.target.dataset.filter;
    renderTasks();
}

// Firestoreのリアルタイム監視
function setupRealtimeListener() {
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    onSnapshot(q, (snapshot) => {
        tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        renderTasks();
        updateConnectionStatus(true);
    }, (error) => {
        console.error('Firestoreの監視エラー:', error);
        updateConnectionStatus(false);
    });
}

// 接続状態の更新
function updateConnectionStatus(isConnected) {
    if (isConnected) {
        connectionStatus.textContent = 'オンライン';
        connectionStatus.classList.remove('offline');
    } else {
        connectionStatus.textContent = 'オフライン';
        connectionStatus.classList.add('offline');
    }
}

// オンライン/オフライン状態の監視
window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// イベントリスナーの設定
taskForm.addEventListener('submit', handleTaskSubmit);
filterButtons.forEach(btn => {
    btn.addEventListener('click', handleFilterChange);
});

// アプリの初期化
function initApp() {
    setupRealtimeListener();
    updateConnectionStatus(navigator.onLine);
    emptyState.classList.remove('hidden');
}

// アプリの起動
initApp();
