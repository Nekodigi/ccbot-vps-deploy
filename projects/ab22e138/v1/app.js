// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js';
import {
    getFirestore,
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';

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
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const authError = document.getElementById('auth-error');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');
const taskTitleInput = document.getElementById('task-title');
const taskDeadlineInput = document.getElementById('task-deadline');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const filterBtns = document.querySelectorAll('.filter-btn');
const sortSelect = document.getElementById('sort-select');
const editModal = document.getElementById('edit-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');
const editTaskTitleInput = document.getElementById('edit-task-title');
const editTaskDeadlineInput = document.getElementById('edit-task-deadline');
const saveEditBtn = document.getElementById('save-edit-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// State
let currentUser = null;
let tasks = [];
let currentFilter = 'all';
let currentSort = 'created-desc';
let editingTaskId = null;
let unsubscribeTasks = null;

// Auth State Observer
onAuthStateChanged(auth, (user) => {
    loadingScreen.classList.add('hidden');

    if (user) {
        currentUser = user;
        userEmailSpan.textContent = user.email;
        authScreen.classList.add('hidden');
        appScreen.classList.remove('hidden');
        loadTasks();

        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    } else {
        currentUser = null;
        authScreen.classList.remove('hidden');
        appScreen.classList.add('hidden');
        if (unsubscribeTasks) {
            unsubscribeTasks();
        }
    }
});

// Auth Functions
function showAuthError(message) {
    authError.textContent = message;
    authError.classList.remove('hidden');
    setTimeout(() => {
        authError.classList.add('hidden');
    }, 5000);
}

loginBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthError('メールアドレスとパスワードを入力してください');
        return;
    }

    try {
        loginBtn.disabled = true;
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Login error:', error);
        if (error.code === 'auth/invalid-credential') {
            showAuthError('メールアドレスまたはパスワードが正しくありません');
        } else if (error.code === 'auth/too-many-requests') {
            showAuthError('試行回数が多すぎます。しばらく待ってから再度お試しください');
        } else {
            showAuthError('ログインに失敗しました: ' + error.message);
        }
    } finally {
        loginBtn.disabled = false;
    }
});

registerBtn.addEventListener('click', async () => {
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthError('メールアドレスとパスワードを入力してください');
        return;
    }

    if (password.length < 6) {
        showAuthError('パスワードは6文字以上にしてください');
        return;
    }

    try {
        registerBtn.disabled = true;
        await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error('Register error:', error);
        if (error.code === 'auth/email-already-in-use') {
            showAuthError('このメールアドレスは既に使用されています');
        } else if (error.code === 'auth/invalid-email') {
            showAuthError('メールアドレスの形式が正しくありません');
        } else if (error.code === 'auth/weak-password') {
            showAuthError('パスワードが弱すぎます');
        } else {
            showAuthError('登録に失敗しました: ' + error.message);
        }
    } finally {
        registerBtn.disabled = false;
    }
});

logoutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error('Logout error:', error);
    }
});

// Task Functions
function loadTasks() {
    if (!currentUser) return;

    const tasksRef = collection(db, 'ccbotDev', 'nekokazu', 'apps', 'ab22e138', 'tasks');
    const q = query(tasksRef, where('userId', '==', currentUser.uid));

    unsubscribeTasks = onSnapshot(q, (snapshot) => {
        tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderTasks();
        checkUpcomingDeadlines();
    });
}

addTaskBtn.addEventListener('click', async () => {
    const title = taskTitleInput.value.trim();
    const deadline = taskDeadlineInput.value;

    if (!title) {
        return;
    }

    try {
        addTaskBtn.disabled = true;

        const tasksRef = collection(db, 'ccbotDev', 'nekokazu', 'apps', 'ab22e138', 'tasks');
        await addDoc(tasksRef, {
            userId: currentUser.uid,
            title: title,
            completed: false,
            deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        taskTitleInput.value = '';
        taskDeadlineInput.value = '';
    } catch (error) {
        console.error('Add task error:', error);
        alert('タスクの追加に失敗しました');
    } finally {
        addTaskBtn.disabled = false;
    }
});

// Enter key to add task
taskTitleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTaskBtn.click();
    }
});

function renderTasks() {
    const filteredTasks = filterTasks(tasks);
    const sortedTasks = sortTasks(filteredTasks);

    taskList.innerHTML = '';

    if (sortedTasks.length === 0) {
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');

        sortedTasks.forEach(task => {
            const taskItem = createTaskElement(task);
            taskList.appendChild(taskItem);
        });
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = 'task-item' + (task.completed ? ' completed' : '');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.addEventListener('change', () => toggleTaskComplete(task.id, checkbox.checked));

    const content = document.createElement('div');
    content.className = 'task-content';

    const titleText = document.createElement('div');
    titleText.className = 'task-title-text';
    titleText.textContent = task.title;

    const meta = document.createElement('div');
    meta.className = 'task-meta';

    if (task.deadline) {
        const deadlineDiv = document.createElement('div');
        deadlineDiv.className = 'task-deadline';

        const deadlineDate = task.deadline.toDate();
        const now = new Date();
        const hoursDiff = (deadlineDate - now) / (1000 * 60 * 60);

        if (hoursDiff < 0 && !task.completed) {
            deadlineDiv.classList.add('urgent');
            deadlineDiv.textContent = `期限: ${formatDate(deadlineDate)} (期限切れ)`;
        } else if (hoursDiff < 24 && !task.completed) {
            deadlineDiv.classList.add('urgent');
            deadlineDiv.textContent = `期限: ${formatDate(deadlineDate)} (24時間以内)`;
        } else if (hoursDiff < 72 && !task.completed) {
            deadlineDiv.classList.add('warning');
            deadlineDiv.textContent = `期限: ${formatDate(deadlineDate)}`;
        } else {
            deadlineDiv.textContent = `期限: ${formatDate(deadlineDate)}`;
        }

        meta.appendChild(deadlineDiv);
    }

    if (task.createdAt) {
        const createdDiv = document.createElement('div');
        createdDiv.textContent = `作成: ${formatDate(task.createdAt.toDate())}`;
        meta.appendChild(createdDiv);
    }

    content.appendChild(titleText);
    content.appendChild(meta);

    const actions = document.createElement('div');
    actions.className = 'task-actions';

    const editBtn = document.createElement('button');
    editBtn.className = 'task-action-btn';
    editBtn.textContent = '編集';
    editBtn.addEventListener('click', () => openEditModal(task));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'task-action-btn delete';
    deleteBtn.textContent = '削除';
    deleteBtn.addEventListener('click', () => deleteTask(task.id));

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    div.appendChild(checkbox);
    div.appendChild(content);
    div.appendChild(actions);

    return div;
}

async function toggleTaskComplete(taskId, completed) {
    try {
        const taskRef = doc(db, 'ccbotDev', 'nekokazu', 'apps', 'ab22e138', 'tasks', taskId);
        await updateDoc(taskRef, {
            completed: completed,
            updatedAt: serverTimestamp()
        });
    } catch (error) {
        console.error('Toggle complete error:', error);
    }
}

async function deleteTask(taskId) {
    if (!confirm('このタスクを削除してもよろしいですか?')) {
        return;
    }

    try {
        const taskRef = doc(db, 'ccbotDev', 'nekokazu', 'apps', 'ab22e138', 'tasks', taskId);
        await deleteDoc(taskRef);
    } catch (error) {
        console.error('Delete task error:', error);
        alert('タスクの削除に失敗しました');
    }
}

function openEditModal(task) {
    editingTaskId = task.id;
    editTaskTitleInput.value = task.title;
    editTaskDeadlineInput.value = task.deadline ? formatDateTimeLocal(task.deadline.toDate()) : '';
    editModal.classList.remove('hidden');
}

function closeEditModal() {
    editingTaskId = null;
    editTaskTitleInput.value = '';
    editTaskDeadlineInput.value = '';
    editModal.classList.add('hidden');
}

modalCloseBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);
editModal.querySelector('.modal-overlay').addEventListener('click', closeEditModal);

saveEditBtn.addEventListener('click', async () => {
    const title = editTaskTitleInput.value.trim();

    if (!title) {
        alert('タスク名を入力してください');
        return;
    }

    try {
        saveEditBtn.disabled = true;

        const deadline = editTaskDeadlineInput.value;
        const taskRef = doc(db, 'ccbotDev', 'nekokazu', 'apps', 'ab22e138', 'tasks', editingTaskId);

        await updateDoc(taskRef, {
            title: title,
            deadline: deadline ? Timestamp.fromDate(new Date(deadline)) : null,
            updatedAt: serverTimestamp()
        });

        closeEditModal();
    } catch (error) {
        console.error('Update task error:', error);
        alert('タスクの更新に失敗しました');
    } finally {
        saveEditBtn.disabled = false;
    }
});

// Filter Functions
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        renderTasks();
    });
});

function filterTasks(tasks) {
    switch (currentFilter) {
        case 'pending':
            return tasks.filter(t => !t.completed);
        case 'completed':
            return tasks.filter(t => t.completed);
        default:
            return tasks;
    }
}

// Sort Functions
sortSelect.addEventListener('change', () => {
    currentSort = sortSelect.value;
    renderTasks();
});

function sortTasks(tasks) {
    const sorted = [...tasks];

    switch (currentSort) {
        case 'created-asc':
            return sorted.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return a.createdAt.toDate() - b.createdAt.toDate();
            });
        case 'created-desc':
            return sorted.sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return b.createdAt.toDate() - a.createdAt.toDate();
            });
        case 'deadline-asc':
            return sorted.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return a.deadline.toDate() - b.deadline.toDate();
            });
        case 'deadline-desc':
            return sorted.sort((a, b) => {
                if (!a.deadline && !b.deadline) return 0;
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return b.deadline.toDate() - a.deadline.toDate();
            });
        default:
            return sorted;
    }
}

// Notification Function
function checkUpcomingDeadlines() {
    if ('Notification' in window && Notification.permission === 'granted') {
        const now = new Date();

        tasks.forEach(task => {
            if (task.completed || !task.deadline) return;

            const deadlineDate = task.deadline.toDate();
            const hoursDiff = (deadlineDate - now) / (1000 * 60 * 60);

            // Notify for tasks within 24 hours
            if (hoursDiff > 0 && hoursDiff < 24) {
                const notified = localStorage.getItem(`notified_${task.id}`);
                if (!notified) {
                    new Notification('タスクの期限が近づいています', {
                        body: `${task.title}\n期限: ${formatDate(deadlineDate)}`,
                        icon: './icon-192.png'
                    });
                    localStorage.setItem(`notified_${task.id}`, 'true');
                }
            }
        });
    }
}

// Utility Functions
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

function formatDateTimeLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}
