// Firebase SDK のインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';
import { getGenerativeModel } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-ai-logic.js';

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appcompat.gserviceaccount.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ユーザーIDの生成（実際のアプリではFirebase Authenticationを使用）
const userId = 'API';
const tasksCollectionPath = `ccbotDev/${userId}/apps/494e7c67/tasks`;

// グローバル変数
let tasks = [];
let currentFilter = 'all';
let aiModel = null;

// DOM要素
const elements = {
    taskForm: document.getElementById('taskForm'),
    taskInput: document.getElementById('taskInput'),
    taskList: document.getElementById('taskList'),
    activeCount: document.getElementById('activeCount'),
    aiAnalyzeBtn: document.getElementById('aiAnalyzeBtn'),
    aiResult: document.getElementById('aiResult'),
    loading: document.getElementById('loading'),
    offlineNotice: document.getElementById('offlineNotice'),
    filterBtns: document.querySelectorAll('.filter-btn')
};

// AI Modelの初期化
async function initializeAI() {
    try {
        aiModel = getGenerativeModel(app, {
            model: 'gemini-2.5-flash-preview-04-17'
        });
        console.log('AI Model initialized successfully');
    } catch (error) {
        console.error('AI Model initialization failed:', error);
        elements.aiAnalyzeBtn.disabled = true;
        elements.aiAnalyzeBtn.innerHTML = '<span>AI利用不可</span>';
    }
}

// ローディング表示制御
function setLoading(show) {
    if (show) {
        elements.loading.classList.add('show');
        elements.loading.setAttribute('aria-hidden', 'false');
    } else {
        elements.loading.classList.remove('show');
        elements.loading.setAttribute('aria-hidden', 'true');
    }
}

// オフライン通知制御
function showOfflineNotice(show) {
    if (show) {
        elements.offlineNotice.classList.add('show');
    } else {
        elements.offlineNotice.classList.remove('show');
    }
}

// ネットワーク状態の監視
window.addEventListener('online', () => {
    showOfflineNotice(false);
    loadTasks();
});

window.addEventListener('offline', () => {
    showOfflineNotice(true);
});

// タスクの読み込み
async function loadTasks() {
    try {
        const tasksCollection = collection(db, tasksCollectionPath);
        const q = query(tasksCollection, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        tasks = [];
        querySnapshot.forEach((doc) => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });

        renderTasks();
        updateStats();
    } catch (error) {
        console.error('タスクの読み込みに失敗:', error);
        // オフライン時はローカルのtasksを使用
        renderTasks();
    }
}

// タスクの追加
async function addTask(text) {
    try {
        setLoading(true);

        const newTask = {
            text: text.trim(),
            completed: false,
            createdAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, tasksCollectionPath), newTask);

        // ローカルの配列にも追加
        tasks.unshift({
            id: docRef.id,
            ...newTask,
            createdAt: new Date()
        });

        renderTasks();
        updateStats();
        elements.taskInput.value = '';

        setLoading(false);
    } catch (error) {
        console.error('タスクの追加に失敗:', error);
        setLoading(false);
        alert('タスクの追加に失敗しました。インターネット接続を確認してください。');
    }
}

// タスクの完了/未完了切り替え
async function toggleTask(taskId) {
    try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        const taskRef = doc(db, tasksCollectionPath, taskId);
        await updateDoc(taskRef, {
            completed: !task.completed
        });

        // ローカルの配列も更新
        task.completed = !task.completed;

        renderTasks();
        updateStats();
    } catch (error) {
        console.error('タスクの更新に失敗:', error);
    }
}

// タスクの削除
async function deleteTask(taskId) {
    try {
        setLoading(true);

        const taskRef = doc(db, tasksCollectionPath, taskId);
        await deleteDoc(taskRef);

        // ローカルの配列からも削除
        tasks = tasks.filter(t => t.id !== taskId);

        renderTasks();
        updateStats();

        setLoading(false);
    } catch (error) {
        console.error('タスクの削除に失敗:', error);
        setLoading(false);
        alert('タスクの削除に失敗しました。');
    }
}

// タスクの表示
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        elements.taskList.innerHTML = `
            <li class="task-item" style="justify-content: center; opacity: 0.5;">
                <span class="task-text">タスクがありません</span>
            </li>
        `;
        return;
    }

    elements.taskList.innerHTML = filteredTasks.map(task => {
        const timeStr = formatTime(task.createdAt);
        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                     role="checkbox"
                     aria-checked="${task.completed}"
                     tabindex="0"
                     aria-label="タスクを${task.completed ? '未完了' : '完了'}にする"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <span class="task-time">${timeStr}</span>
                <button class="task-delete" aria-label="タスクを削除">削除</button>
            </li>
        `;
    }).join('');

    // イベントリスナーの設定
    document.querySelectorAll('.task-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            toggleTask(taskId);
        });

        checkbox.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const taskId = e.target.closest('.task-item').dataset.taskId;
                toggleTask(taskId);
            }
        });
    });

    document.querySelectorAll('.task-delete').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            if (confirm('このタスクを削除しますか?')) {
                deleteTask(taskId);
            }
        });
    });
}

// フィルター適用
function getFilteredTasks() {
    switch (currentFilter) {
        case 'active':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// 統計情報の更新
function updateStats() {
    const activeCount = tasks.filter(t => !t.completed).length;
    elements.activeCount.textContent = activeCount;
}

// 時刻フォーマット
function formatTime(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' });
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// AI分析機能
async function analyzeTasksWithAI() {
    if (!aiModel) {
        alert('AI機能が利用できません。');
        return;
    }

    if (tasks.length === 0) {
        elements.aiResult.textContent = 'タスクがありません。まずはタスクを追加してください。';
        elements.aiResult.classList.add('show');
        return;
    }

    try {
        setLoading(true);
        elements.aiAnalyzeBtn.disabled = true;

        const activeTasks = tasks.filter(t => !t.completed);
        const taskTexts = activeTasks.map(t => t.text).join('\n- ');

        const prompt = `以下のタスクリストを分析して、簡潔なアドバイスを日本語で提供してください：

タスク:
- ${taskTexts}

以下の観点で分析してください：
1. 優先順位の提案
2. タスクの分類（重要度・緊急度）
3. 効率的な実行順序

3〜5文程度で簡潔にまとめてください。`;

        const result = await aiModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        elements.aiResult.textContent = text;
        elements.aiResult.classList.add('show');

        setLoading(false);
        elements.aiAnalyzeBtn.disabled = false;
    } catch (error) {
        console.error('AI分析に失敗:', error);
        elements.aiResult.textContent = 'AI分析に失敗しました。しばらくしてから再度お試しください。';
        elements.aiResult.classList.add('show');
        setLoading(false);
        elements.aiAnalyzeBtn.disabled = false;
    }
}

// イベントリスナーの設定
elements.taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = elements.taskInput.value.trim();
    if (text) {
        addTask(text);
    }
});

elements.filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        elements.filterBtns.forEach(b => {
            b.classList.remove('active');
            b.setAttribute('aria-pressed', 'false');
        });

        e.target.classList.add('active');
        e.target.setAttribute('aria-pressed', 'true');

        currentFilter = e.target.dataset.filter;
        renderTasks();
    });
});

elements.aiAnalyzeBtn.addEventListener('click', analyzeTasksWithAI);

// Service Workerの登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('Service Worker registered:', registration);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}

// 初期化
async function init() {
    await initializeAI();
    await loadTasks();

    // オフライン状態のチェック
    if (!navigator.onLine) {
        showOfflineNotice(true);
    }
}

init();
