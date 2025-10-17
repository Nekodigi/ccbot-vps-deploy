// LocalStorageのキー
const STORAGE_KEY = 'taskflow_tasks';

// タスクの配列
let tasks = [];

// DOM要素
const taskInput = document.getElementById('taskInput');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const totalCount = document.getElementById('totalCount');
const completedCount = document.getElementById('completedCount');
const pendingCount = document.getElementById('pendingCount');

// 初期化
function init() {
    loadTasks();
    renderTasks();
    registerServiceWorker();
}

// Service Workerの登録
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker registered:', registration.scope);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

// LocalStorageからタスクを読み込み
function loadTasks() {
    const stored = localStorage.getItem(STORAGE_KEY);
    tasks = stored ? JSON.parse(stored) : [];
}

// LocalStorageにタスクを保存
function saveTasks() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// タスクを追加
function addTask() {
    const text = taskInput.value.trim();
    if (text === '') return;

    const task = {
        id: Date.now(),
        text: text,
        completed: false,
        createdAt: new Date().toISOString()
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    taskInput.focus();
}

// タスクの完了状態をトグル
function toggleTask(id) {
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

// タスクを削除
function deleteTask(id) {
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    renderTasks();
}

// タスクをレンダリング
function renderTasks() {
    if (tasks.length === 0) {
        taskList.innerHTML = `
            <div class="empty-state">
                <p>タスクがありません</p>
                <small>上の入力欄から新しいタスクを追加してください</small>
            </div>
        `;
    } else {
        taskList.innerHTML = tasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}">
                <input
                    type="checkbox"
                    ${task.completed ? 'checked' : ''}
                    onchange="toggleTask(${task.id})"
                >
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="delete-btn" onclick="deleteTask(${task.id})">削除</button>
            </div>
        `).join('');
    }

    updateStats();
}

// 統計を更新
function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const pending = total - completed;

    totalCount.textContent = total;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// イベントリスナー
addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

// 初期化実行
init();
