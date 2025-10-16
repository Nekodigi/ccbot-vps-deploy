// Firebase imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, query, onSnapshot, orderBy, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';
import { getVertexAI, getGenerativeModel } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-vertexai.js';

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
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

// User ID - In production, this would come from authentication
const userId = '1043761710227533865';
const projectId = '645f98fc';
const tasksCollectionPath = `ccbotDev/nekokazu/apps/${projectId}/tasks`;

// State
let currentFilter = 'all';
let tasks = [];

// DOM Elements
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const tasksList = document.getElementById('tasksList');
const emptyState = document.getElementById('emptyState');
const aiAssistBtn = document.getElementById('aiAssistBtn');
const aiModal = document.getElementById('aiModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const chatContainer = document.getElementById('chatContainer');
const filterTabs = document.querySelectorAll('.tab');
const loadingOverlay = document.getElementById('loadingOverlay');
const aiSuggestion = document.getElementById('aiSuggestion');
const suggestionContent = document.getElementById('suggestionContent');
const applySuggestionBtn = document.getElementById('applySuggestionBtn');

// Initialize app
function init() {
    setupEventListeners();
    subscribeToTasks();
}

// Event Listeners
function setupEventListeners() {
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    aiAssistBtn.addEventListener('click', openAIModal);
    closeModalBtn.addEventListener('click', closeAIModal);
    aiModal.addEventListener('click', (e) => {
        if (e.target === aiModal) closeAIModal();
    });

    sendChatBtn.addEventListener('click', sendChatMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendChatMessage();
    });

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentFilter = tab.dataset.filter;
            renderTasks();
        });
    });

    applySuggestionBtn.addEventListener('click', applySuggestion);
}

// Task Management
async function addTask() {
    const title = taskInput.value.trim();
    if (!title) return;

    showLoading(true);

    try {
        // AI analysis for priority
        const priority = await analyzeTaskPriority(title);

        await addDoc(collection(db, tasksCollectionPath), {
            title,
            completed: false,
            priority,
            createdAt: serverTimestamp(),
            userId
        });

        taskInput.value = '';

        // Get AI suggestion
        await getTaskSuggestion(title);
    } catch (error) {
        console.error('Error adding task:', error);
        alert('タスクの追加に失敗しました');
    } finally {
        showLoading(false);
    }
}

async function analyzeTaskPriority(title) {
    try {
        const prompt = `次のタスクの優先度を「high」「medium」「low」の3段階で判定してください。回答は単語のみで答えてください。

タスク: ${title}

判定基準:
- high: 緊急性が高い、重要度が高い、期限が迫っている
- medium: 通常の重要度
- low: 緊急性が低い、将来的なタスク

優先度:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text().toLowerCase().trim();

        if (text.includes('high')) return 'high';
        if (text.includes('low')) return 'low';
        return 'medium';
    } catch (error) {
        console.error('Error analyzing priority:', error);
        return 'medium';
    }
}

async function getTaskSuggestion(title) {
    try {
        const prompt = `次のタスクに関する具体的なアクションステップを3つ提案してください。簡潔に箇条書きで回答してください。

タスク: ${title}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        suggestionContent.textContent = text;
        aiSuggestion.style.display = 'block';
    } catch (error) {
        console.error('Error getting suggestion:', error);
    }
}

function applySuggestion() {
    aiSuggestion.style.display = 'none';
}

async function toggleTask(taskId, completed) {
    try {
        const taskRef = doc(db, tasksCollectionPath, taskId);
        await updateDoc(taskRef, { completed });
    } catch (error) {
        console.error('Error updating task:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('このタスクを削除しますか?')) return;

    try {
        await deleteDoc(doc(db, tasksCollectionPath, taskId));
    } catch (error) {
        console.error('Error deleting task:', error);
    }
}

// Firestore Subscription
function subscribeToTasks() {
    const q = query(
        collection(db, tasksCollectionPath),
        orderBy('createdAt', 'desc')
    );

    onSnapshot(q, (snapshot) => {
        tasks = [];
        snapshot.forEach((doc) => {
            tasks.push({
                id: doc.id,
                ...doc.data()
            });
        });
        renderTasks();
        updateStats();
    }, (error) => {
        console.error('Error fetching tasks:', error);
    });
}

// Rendering
function renderTasks() {
    const filteredTasks = tasks.filter(task => {
        if (currentFilter === 'active') return !task.completed;
        if (currentFilter === 'completed') return task.completed;
        return true;
    });

    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="window.toggleTaskHandler('${task.id}', this.checked)"
            >
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    <span class="task-priority priority-${task.priority}">${getPriorityLabel(task.priority)}</span>
                    <span>${formatDate(task.createdAt)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon delete" onclick="window.deleteTaskHandler('${task.id}')" title="削除">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `).join('');
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const active = total - completed;

    document.getElementById('totalTasks').textContent = total;
    document.getElementById('activeTasks').textContent = active;
    document.getElementById('completedTasks').textContent = completed;
}

// AI Chat
async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    chatInput.value = '';

    showLoading(true);

    try {
        const context = `現在のタスク一覧:\n${tasks.map((t, i) => `${i + 1}. [${t.completed ? '完了' : '未完了'}] ${t.title} (優先度: ${t.priority})`).join('\n')}\n\nユーザーの質問: ${message}`;

        const result = await model.generateContent(context);
        const response = await result.response;
        const text = response.text();

        addChatMessage(text, 'assistant');
    } catch (error) {
        console.error('Error sending chat:', error);
        addChatMessage('エラーが発生しました。もう一度お試しください。', 'assistant');
    } finally {
        showLoading(false);
    }
}

function addChatMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${role}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Modal
function openAIModal() {
    aiModal.classList.add('active');
    if (chatContainer.children.length === 0) {
        addChatMessage('こんにちは！タスク管理についてお手伝いします。何か質問はありますか？', 'assistant');
    }
}

function closeAIModal() {
    aiModal.classList.remove('active');
}

// Utilities
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getPriorityLabel(priority) {
    const labels = {
        high: '高',
        medium: '中',
        low: '低'
    };
    return labels[priority] || '中';
}

function formatDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'たった今';
    if (minutes < 60) return `${minutes}分前`;
    if (hours < 24) return `${hours}時間前`;
    if (days < 7) return `${days}日前`;

    return date.toLocaleDateString('ja-JP');
}

function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

// Global handlers for inline event handlers
window.toggleTaskHandler = toggleTask;
window.deleteTaskHandler = deleteTask;

// Initialize
init();
