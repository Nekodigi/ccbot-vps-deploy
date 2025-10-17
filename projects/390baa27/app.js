// タスク管理アプリのメインロジック

class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.cacheDOMElements();
        this.bindEvents();
        this.render();
        this.updateOnlineStatus();
        this.registerServiceWorker();
    }

    cacheDOMElements() {
        this.taskForm = document.getElementById('taskForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.emptyState = document.getElementById('emptyState');
        this.taskCount = document.getElementById('taskCount');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.filterButtons = document.querySelectorAll('.filter-button');
    }

    bindEvents() {
        this.taskForm.addEventListener('submit', (e) => this.handleAddTask(e));

        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e) => this.handleFilterChange(e));
        });

        window.addEventListener('online', () => this.updateOnlineStatus());
        window.addEventListener('offline', () => this.updateOnlineStatus());
    }

    handleAddTask(e) {
        e.preventDefault();

        const text = this.taskInput.value.trim();
        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.taskInput.value = '';
        this.taskInput.focus();
    }

    handleToggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    handleDeleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    handleFilterChange(e) {
        const filter = e.target.dataset.filter;
        this.currentFilter = filter;

        this.filterButtons.forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');

        this.render();
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'active':
                return this.tasks.filter(t => !t.completed);
            case 'completed':
                return this.tasks.filter(t => t.completed);
            default:
                return this.tasks;
        }
    }

    render() {
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            this.taskList.style.display = 'none';
            this.emptyState.classList.add('visible');
        } else {
            this.taskList.style.display = 'flex';
            this.emptyState.classList.remove('visible');
        }

        this.taskList.innerHTML = filteredTasks.map(task => this.createTaskHTML(task)).join('');

        this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.handleToggleTask(id);
            });
        });

        this.taskList.querySelectorAll('.task-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const id = parseInt(e.target.dataset.id);
                this.handleDeleteTask(id);
            });
        });

        this.updateTaskCount();
    }

    createTaskHTML(task) {
        const date = new Date(task.createdAt);
        const timeString = this.formatTime(date);

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}">
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    data-id="${task.id}"
                >
                <span class="task-text">${this.escapeHTML(task.text)}</span>
                <span class="task-time">${timeString}</span>
                <button class="task-delete" data-id="${task.id}">削除</button>
            </li>
        `;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'たった今';
        if (minutes < 60) return `${minutes}分前`;
        if (hours < 24) return `${hours}時間前`;
        if (days < 7) return `${days}日前`;

        return `${date.getMonth() + 1}/${date.getDate()}`;
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateTaskCount() {
        const activeCount = this.tasks.filter(t => !t.completed).length;
        const totalCount = this.tasks.length;

        if (this.currentFilter === 'active') {
            this.taskCount.textContent = `${activeCount}件の未完了タスク`;
        } else if (this.currentFilter === 'completed') {
            this.taskCount.textContent = `${totalCount - activeCount}件の完了済みタスク`;
        } else {
            this.taskCount.textContent = `${totalCount}件のタスク（未完了: ${activeCount}件）`;
        }
    }

    updateOnlineStatus() {
        if (navigator.onLine) {
            this.statusIndicator.textContent = 'オンライン';
            this.statusIndicator.className = 'status-indicator online';
        } else {
            this.statusIndicator.textContent = 'オフライン';
            this.statusIndicator.className = 'status-indicator offline';
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow-tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('タスクの読み込みに失敗しました:', error);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('タスクの保存に失敗しました:', error);
        }
    }

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./sw.js');
                console.log('Service Worker登録成功:', registration.scope);
            } catch (error) {
                console.error('Service Worker登録失敗:', error);
            }
        }
    }
}

// アプリ初期化
document.addEventListener('DOMContentLoaded', () => {
    new TaskManager();
});
