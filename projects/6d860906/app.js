// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';
import { getGenerativeModel } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-vertexai.js';

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

// Firestore collection path - using the specified path structure
const COLLECTION_PATH = 'ccbotDev/nekokazu/apps/6d860906/tasks';

// Current filter
let currentFilter = 'all';

// DOM Elements
const taskTitleInput = document.getElementById('taskTitle');
const taskDateInput = document.getElementById('taskDate');
const taskPrioritySelect = document.getElementById('taskPriority');
const addTaskBtn = document.getElementById('addTaskBtn');
const taskList = document.getElementById('taskList');
const emptyState = document.getElementById('emptyState');
const filterBtns = document.querySelectorAll('.filter-btn');
const aiPromptInput = document.getElementById('aiPrompt');
const aiSuggestBtn = document.getElementById('aiSuggestBtn');
const aiResponse = document.getElementById('aiResponse');

// Initialize the app
async function init() {
    // Register service worker for PWA
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('./service-worker.js');
            console.log('Service Worker registered successfully');
        } catch (error) {
            console.log('Service Worker registration failed:', error);
        }
    }

    // Load tasks from Firestore
    await loadTasks();

    // Set up event listeners
    addTaskBtn.addEventListener('click', handleAddTask);
    aiSuggestBtn.addEventListener('click', handleAISuggest);

    taskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAddTask();
        }
    });

    aiPromptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAISuggest();
        }
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

// Task storage
let tasks = [];

// Load tasks from Firestore
async function loadTasks() {
    try {
        const tasksRef = collection(db, COLLECTION_PATH);
        const q = query(tasksRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        tasks = [];
        querySnapshot.forEach((docSnap) => {
            tasks.push({
                id: docSnap.id,
                ...docSnap.data()
            });
        });

        renderTasks();
    } catch (error) {
        console.error('Error loading tasks:', error);
        // If Firestore fails, load from localStorage as fallback
        const savedTasks = localStorage.getItem('taskflow_tasks');
        if (savedTasks) {
            tasks = JSON.parse(savedTasks);
            renderTasks();
        }
    }
}

// Save tasks to Firestore and localStorage (fallback)
function saveTasks() {
    localStorage.setItem('taskflow_tasks', JSON.stringify(tasks));
}

// Add new task
async function handleAddTask() {
    const title = taskTitleInput.value.trim();
    const date = taskDateInput.value;
    const priority = taskPrioritySelect.value;

    if (!title) {
        taskTitleInput.focus();
        return;
    }

    const newTask = {
        title,
        date,
        priority,
        completed: false,
        createdAt: new Date().toISOString()
    };

    try {
        const tasksRef = collection(db, COLLECTION_PATH);
        const docRef = await addDoc(tasksRef, newTask);

        tasks.unshift({
            id: docRef.id,
            ...newTask
        });
    } catch (error) {
        console.error('Error adding task to Firestore:', error);
        // Fallback to local storage
        newTask.id = Date.now().toString();
        tasks.unshift(newTask);
    }

    // Clear inputs
    taskTitleInput.value = '';
    taskDateInput.value = '';
    taskPrioritySelect.value = 'medium';

    saveTasks();
    renderTasks();
    taskTitleInput.focus();
}

// Toggle task completion
async function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    task.completed = !task.completed;

    try {
        const taskRef = doc(db, COLLECTION_PATH, taskId);
        await updateDoc(taskRef, { completed: task.completed });
    } catch (error) {
        console.error('Error updating task in Firestore:', error);
    }

    saveTasks();
    renderTasks();
}

// Delete task
async function deleteTask(taskId) {
    try {
        const taskRef = doc(db, COLLECTION_PATH, taskId);
        await deleteDoc(taskRef);

        tasks = tasks.filter(t => t.id !== taskId);
    } catch (error) {
        console.error('Error deleting task from Firestore:', error);
        // Fallback to local deletion
        tasks = tasks.filter(t => t.id !== taskId);
    }

    saveTasks();
    renderTasks();
}

// Filter tasks based on current filter
function getFilteredTasks() {
    switch (currentFilter) {
        case 'high':
            return tasks.filter(t => t.priority === 'high' && !t.completed);
        case 'medium':
            return tasks.filter(t => t.priority === 'medium' && !t.completed);
        case 'low':
            return tasks.filter(t => t.priority === 'low' && !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Render tasks
function renderTasks() {
    const filteredTasks = getFilteredTasks();

    if (filteredTasks.length === 0) {
        taskList.innerHTML = '';
        emptyState.classList.remove('hidden');
        return;
    }

    emptyState.classList.add('hidden');

    taskList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}">
            <input
                type="checkbox"
                class="task-checkbox"
                ${task.completed ? 'checked' : ''}
                onchange="toggleTask('${task.id}')"
            >
            <div class="task-content">
                <div class="task-title">${escapeHtml(task.title)}</div>
                <div class="task-meta">
                    ${task.date ? `<span class="task-date">期限: ${task.date}</span>` : ''}
                    <span class="task-priority">
                        <span class="priority-badge ${task.priority}">
                            ${getPriorityLabel(task.priority)}
                        </span>
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn-icon btn-delete" onclick="deleteTask('${task.id}')" title="削除">
                    🗑️
                </button>
            </div>
        </div>
    `).join('');
}

// Get priority label in Japanese
function getPriorityLabel(priority) {
    const labels = {
        'high': '高',
        'medium': '中',
        'low': '低'
    };
    return labels[priority] || priority;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Make functions globally accessible
window.toggleTask = toggleTask;
window.deleteTask = deleteTask;

// AI Suggestion using Gemini
async function handleAISuggest() {
    const prompt = aiPromptInput.value.trim();

    if (!prompt) {
        aiPromptInput.focus();
        return;
    }

    // Show loading state
    const btnText = aiSuggestBtn.querySelector('.btn-text');
    const btnLoader = aiSuggestBtn.querySelector('.btn-loader');
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    aiSuggestBtn.disabled = true;

    try {
        const model = getGenerativeModel(app, { model: "gemini-2.0-flash-exp" });

        const systemPrompt = `あなたはタスク管理アシスタントです。ユーザーの要求に基づいて、具体的で実行可能なタスクを提案してください。
各タスクは簡潔で明確な行動を示すようにしてください。優先度や期限の提案も含めてください。`;

        const result = await model.generateContent([
            systemPrompt,
            prompt
        ]);

        const response = await result.response;
        const text = response.text();

        aiResponse.textContent = text;
        aiResponse.classList.remove('hidden');
    } catch (error) {
        console.error('Error with AI suggestion:', error);
        aiResponse.textContent = 'AI提案の取得に失敗しました。もう一度お試しください。\n\nエラー: ' + error.message;
        aiResponse.classList.remove('hidden');
    } finally {
        // Reset button state
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
        aiSuggestBtn.disabled = false;
    }
}

// Initialize app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
