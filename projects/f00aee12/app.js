// TaskFlow - Simple Task Management PWA
// Version: 1.0.0

class TaskManager {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.render();
        this.registerServiceWorker();
        this.setupInstallPrompt();
    }

    // Service Worker Registration
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', async () => {
                try {
                    const registration = await navigator.serviceWorker.register('./sw.js');
                    console.log('ServiceWorker registered:', registration.scope);
                } catch (error) {
                    console.error('ServiceWorker registration failed:', error);
                }
            });
        }
    }

    // PWA Install Prompt
    setupInstallPrompt() {
        let deferredPrompt;
        const installPrompt = document.getElementById('installPrompt');
        const installBtn = document.getElementById('installBtn');
        const dismissBtn = document.getElementById('dismissInstall');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;

            // Show install prompt if not dismissed before
            const dismissed = localStorage.getItem('installPromptDismissed');
            if (!dismissed) {
                installPrompt.classList.remove('hidden');
            }
        });

        installBtn.addEventListener('click', async () => {
            if (!deferredPrompt) return;

            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;

            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
            installPrompt.classList.add('hidden');
        });

        dismissBtn.addEventListener('click', () => {
            installPrompt.classList.add('hidden');
            localStorage.setItem('installPromptDismissed', 'true');
        });

        window.addEventListener('appinstalled', () => {
            console.log('PWA installed');
            installPrompt.classList.add('hidden');
        });
    }

    // Setup Event Listeners
    setupEventListeners() {
        const taskForm = document.getElementById('taskForm');
        const clearBtn = document.getElementById('clearCompleted');
        const filterTabs = document.querySelectorAll('.filter-tab');

        taskForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTask();
        });

        clearBtn.addEventListener('click', () => {
            this.clearCompleted();
        });

        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.setFilter(e.target.dataset.filter);
            });
        });
    }

    // Load tasks from localStorage
    loadTasks() {
        const stored = localStorage.getItem('taskflow_tasks');
        if (stored) {
            try {
                this.tasks = JSON.parse(stored);
            } catch (error) {
                console.error('Failed to parse tasks:', error);
                this.tasks = [];
            }
        }
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Failed to save tasks:', error);
        }
    }

    // Add new task
    addTask() {
        const input = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const text = input.value.trim();

        if (!text) return;

        const task = {
            id: Date.now(),
            text: text,
            completed: false,
            priority: prioritySelect.value,
            createdAt: new Date().toISOString()
        };

        this.tasks.unshift(task);
        this.saveTasks();
        this.render();

        input.value = '';
        prioritySelect.value = 'medium';
        input.focus();
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
        }
    }

    // Delete task
    deleteTask(id) {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.render();
    }

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.tasks.filter(t => t.completed).length;
        if (completedCount === 0) return;

        if (confirm(`完了済みのタスク ${completedCount} 件を削除しますか?`)) {
            this.tasks = this.tasks.filter(t => !t.completed);
            this.saveTasks();
            this.render();
        }
    }

    // Set filter
    setFilter(filter) {
        this.currentFilter = filter;

        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.dataset.filter === filter) {
                tab.classList.add('active');
            }
        });

        this.render();
    }

    // Get filtered tasks
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

    // Format date
    formatDate(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'たった今';
        if (diffMins < 60) return `${diffMins}分前`;
        if (diffHours < 24) return `${diffHours}時間前`;
        if (diffDays < 7) return `${diffDays}日前`;

        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Get priority label
    getPriorityLabel(priority) {
        const labels = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return labels[priority] || labels.medium;
    }

    // Render tasks
    render() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        // Update stats
        this.updateStats();

        // Clear task list
        taskList.innerHTML = '';

        // Show/hide empty state
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
            return;
        } else {
            emptyState.classList.add('hidden');
        }

        // Render tasks
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <input
                    type="checkbox"
                    class="task-checkbox"
                    ${task.completed ? 'checked' : ''}
                    data-id="${task.id}"
                >
                <div class="task-content">
                    <div class="task-text">${this.escapeHtml(task.text)}</div>
                    <div class="task-meta">
                        <span class="task-priority ${task.priority}">
                            ${this.getPriorityLabel(task.priority)}
                        </span>
                        <span class="task-date">${this.formatDate(task.createdAt)}</span>
                    </div>
                </div>
                <button class="btn-delete" data-id="${task.id}">削除</button>
            `;

            // Add event listeners
            const checkbox = li.querySelector('.task-checkbox');
            const deleteBtn = li.querySelector('.btn-delete');

            checkbox.addEventListener('change', () => {
                this.toggleTask(task.id);
            });

            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });

            taskList.appendChild(li);
        });
    }

    // Update statistics
    updateStats() {
        const activeCount = this.tasks.filter(t => !t.completed).length;
        const completedCount = this.tasks.filter(t => t.completed).length;
        const totalCount = this.tasks.length;

        document.getElementById('activeCount').textContent = activeCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = totalCount;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new TaskManager();
    });
} else {
    new TaskManager();
}
