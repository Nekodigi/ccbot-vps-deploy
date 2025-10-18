// Tasks Management Module
import { db, getUserTasksPath } from './firebase-config.js';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

// DOM Elements
const taskTitle = document.getElementById('task-title');
const taskDescription = document.getElementById('task-description');
const taskDeadline = document.getElementById('task-deadline');
const taskPriority = document.getElementById('task-priority');

const addTaskBtn = document.getElementById('add-task-btn');
const updateTaskBtn = document.getElementById('update-task-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

const tasksContainer = document.getElementById('tasks-container');
const noTasksMessage = document.getElementById('no-tasks');

const filterBtns = document.querySelectorAll('.filter-btn');

// State
let tasks = [];
let currentFilter = 'all';
let editingTaskId = null;
let unsubscribe = null;

// Initialize tasks listener when user is authenticated
window.addEventListener('userAuthenticated', () => {
    initTasksListener();
});

// Initialize Firestore listener for tasks
function initTasksListener() {
    try {
        const tasksPath = getUserTasksPath();
        const tasksRef = collection(db, tasksPath);
        const q = query(tasksRef, orderBy('createdAt', 'desc'));

        // Real-time listener
        unsubscribe = onSnapshot(q, (snapshot) => {
            tasks = [];
            snapshot.forEach((doc) => {
                tasks.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            renderTasks();
        }, (error) => {
            console.error('Error listening to tasks:', error);
            alert('タスクの読み込みに失敗しました。');
        });

        console.log('Tasks listener initialized');
    } catch (error) {
        console.error('Error initializing tasks listener:', error);
    }
}

// Add new task
addTaskBtn.addEventListener('click', async () => {
    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const deadline = taskDeadline.value;
    const priority = taskPriority.value;

    if (!title) {
        alert('タスクのタイトルを入力してください。');
        return;
    }

    try {
        addTaskBtn.disabled = true;
        addTaskBtn.textContent = '追加中...';

        const tasksPath = getUserTasksPath();
        const tasksRef = collection(db, tasksPath);

        await addDoc(tasksRef, {
            title,
            description,
            deadline: deadline || null,
            priority,
            completed: false,
            createdAt: serverTimestamp()
        });

        // Clear form
        clearForm();
    } catch (error) {
        console.error('Error adding task:', error);
        alert('タスクの追加に失敗しました。');
    } finally {
        addTaskBtn.disabled = false;
        addTaskBtn.textContent = 'タスクを追加';
    }
});

// Update task
updateTaskBtn.addEventListener('click', async () => {
    if (!editingTaskId) return;

    const title = taskTitle.value.trim();
    const description = taskDescription.value.trim();
    const deadline = taskDeadline.value;
    const priority = taskPriority.value;

    if (!title) {
        alert('タスクのタイトルを入力してください。');
        return;
    }

    try {
        updateTaskBtn.disabled = true;
        updateTaskBtn.textContent = '更新中...';

        const tasksPath = getUserTasksPath();
        const taskRef = doc(db, tasksPath, editingTaskId);

        await updateDoc(taskRef, {
            title,
            description,
            deadline: deadline || null,
            priority
        });

        clearForm();
        cancelEdit();
    } catch (error) {
        console.error('Error updating task:', error);
        alert('タスクの更新に失敗しました。');
    } finally {
        updateTaskBtn.disabled = false;
        updateTaskBtn.textContent = 'タスクを更新';
    }
});

// Cancel edit
cancelEditBtn.addEventListener('click', () => {
    clearForm();
    cancelEdit();
});

// Delete task
async function deleteTask(taskId) {
    if (!confirm('このタスクを削除してもよろしいですか?')) {
        return;
    }

    try {
        const tasksPath = getUserTasksPath();
        const taskRef = doc(db, tasksPath, taskId);
        await deleteDoc(taskRef);
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('タスクの削除に失敗しました。');
    }
}

// Toggle task completion
async function toggleTaskCompletion(taskId, currentStatus) {
    try {
        const tasksPath = getUserTasksPath();
        const taskRef = doc(db, tasksPath, taskId);
        await updateDoc(taskRef, {
            completed: !currentStatus
        });
    } catch (error) {
        console.error('Error toggling task:', error);
        alert('タスクの状態変更に失敗しました。');
    }
}

// Edit task
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    editingTaskId = taskId;

    taskTitle.value = task.title;
    taskDescription.value = task.description || '';
    taskDeadline.value = task.deadline || '';
    taskPriority.value = task.priority;

    addTaskBtn.style.display = 'none';
    updateTaskBtn.style.display = 'inline-block';
    cancelEditBtn.style.display = 'inline-block';

    taskTitle.focus();
}

// Cancel edit mode
function cancelEdit() {
    editingTaskId = null;
    addTaskBtn.style.display = 'inline-block';
    updateTaskBtn.style.display = 'none';
    cancelEditBtn.style.display = 'none';
}

// Clear form
function clearForm() {
    taskTitle.value = '';
    taskDescription.value = '';
    taskDeadline.value = '';
    taskPriority.value = 'medium';
}

// Render tasks
function renderTasks() {
    tasksContainer.innerHTML = '';

    // Filter tasks
    let filteredTasks = tasks;

    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    } else if (currentFilter === 'high') {
        filteredTasks = tasks.filter(t => t.priority === 'high');
    }

    // Show/hide no tasks message
    if (filteredTasks.length === 0) {
        noTasksMessage.style.display = 'block';
        return;
    } else {
        noTasksMessage.style.display = 'none';
    }

    // Render each task
    filteredTasks.forEach(task => {
        const taskElement = createTaskElement(task);
        tasksContainer.appendChild(taskElement);
    });
}

// Create task element
function createTaskElement(task) {
    const taskItem = document.createElement('div');
    taskItem.className = `task-item ${task.completed ? 'completed' : ''}`;

    const taskHeader = document.createElement('div');
    taskHeader.className = 'task-header';

    const taskTitleWrapper = document.createElement('div');
    taskTitleWrapper.className = 'task-title-wrapper';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskCompletion(task.id, task.completed));

    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;

    taskTitleWrapper.appendChild(checkbox);
    taskTitleWrapper.appendChild(title);

    const priorityBadge = document.createElement('span');
    priorityBadge.className = `task-priority ${task.priority}`;
    priorityBadge.textContent = task.priority === 'high' ? '高' : task.priority === 'medium' ? '中' : '低';

    taskHeader.appendChild(taskTitleWrapper);
    taskHeader.appendChild(priorityBadge);

    taskItem.appendChild(taskHeader);

    // Description
    if (task.description) {
        const description = document.createElement('div');
        description.className = 'task-description';
        description.textContent = task.description;
        taskItem.appendChild(description);
    }

    // Meta (deadline and actions)
    const taskMeta = document.createElement('div');
    taskMeta.className = 'task-meta';

    // Deadline
    if (task.deadline) {
        const deadlineElement = document.createElement('div');
        deadlineElement.className = 'task-deadline';

        const deadlineDate = new Date(task.deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isOverdue = deadlineDate < today && !task.completed;
        if (isOverdue) {
            deadlineElement.classList.add('overdue');
        }

        deadlineElement.textContent = `期限: ${formatDate(task.deadline)}`;
        taskMeta.appendChild(deadlineElement);
    }

    // Actions
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn task-edit-btn';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => editTask(task.id));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn task-delete-btn';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);

    taskMeta.appendChild(taskActions);
    taskItem.appendChild(taskMeta);

    return taskItem;
}

// Format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
}

// Filter buttons
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

// Export for AI suggestions module
export function getCurrentTaskData() {
    return {
        title: taskTitle.value.trim(),
        description: taskDescription.value.trim(),
        deadline: taskDeadline.value,
        priority: taskPriority.value
    };
}

export function applySuggestedPriority(priority) {
    if (['low', 'medium', 'high'].includes(priority)) {
        taskPriority.value = priority;
    }
}

console.log('Tasks module loaded');
