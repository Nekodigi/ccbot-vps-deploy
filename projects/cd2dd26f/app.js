// アプリケーションの状態管理
class TaskManager {
  constructor() {
    this.tasks = [];
    this.filter = 'all';
    this.deferredPrompt = null;

    this.init();
  }

  // 初期化
  init() {
    this.loadTasks();
    this.registerServiceWorker();
    this.setupEventListeners();
    this.updateUI();
    this.checkOnlineStatus();
    this.setupInstallPrompt();
  }

  // Service Workerの登録
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('./service-worker.js');
        console.log('Service Worker registered successfully:', registration.scope);

        // Service Workerの更新チェック
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.showToast('新しいバージョンが利用可能です');
            }
          });
        });
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  // イベントリスナーのセットアップ
  setupEventListeners() {
    // タスクフォーム
    const taskForm = document.getElementById('taskForm');
    taskForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.addTask();
    });

    // フィルターボタン
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = e.currentTarget.dataset.filter;
        this.setFilter(filter);
      });
    });

    // 同期ボタン
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.addEventListener('click', () => {
      this.syncTasks();
    });

    // 設定ボタン
    const settingsBtn = document.getElementById('settingsBtn');
    settingsBtn.addEventListener('click', () => {
      this.showToast('設定機能は開発中です');
    });

    // インストールプロンプトのクローズ
    const closeInstallPrompt = document.getElementById('closeInstallPrompt');
    closeInstallPrompt.addEventListener('click', () => {
      this.hideInstallPrompt();
    });

    // オンライン/オフライン検知
    window.addEventListener('online', () => {
      this.updateOnlineStatus(true);
      this.showToast('オンラインに接続しました');
    });

    window.addEventListener('offline', () => {
      this.updateOnlineStatus(false);
      this.showToast('オフラインモードです');
    });
  }

  // タスクの追加
  addTask() {
    const input = document.getElementById('taskInput');
    const text = input.value.trim();

    if (text === '') return;

    const task = {
      id: Date.now().toString(),
      text: text,
      completed: false,
      createdAt: new Date().toISOString()
    };

    this.tasks.unshift(task);
    this.saveTasks();
    this.updateUI();

    input.value = '';
    input.focus();

    this.showToast('タスクを追加しました');
  }

  // タスクの切り替え
  toggleTask(id) {
    const task = this.tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks();
      this.updateUI();

      const message = task.completed ? 'タスクを完了しました' : 'タスクを未完了に戻しました';
      this.showToast(message);
    }
  }

  // タスクの削除
  deleteTask(id) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    this.saveTasks();
    this.updateUI();
    this.showToast('タスクを削除しました');
  }

  // フィルターの設定
  setFilter(filter) {
    this.filter = filter;

    // フィルターボタンのアクティブ状態を更新
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === filter);
    });

    this.updateUI();
  }

  // フィルター済みタスクの取得
  getFilteredTasks() {
    switch (this.filter) {
      case 'active':
        return this.tasks.filter(t => !t.completed);
      case 'completed':
        return this.tasks.filter(t => t.completed);
      default:
        return this.tasks;
    }
  }

  // UIの更新
  updateUI() {
    this.renderTasks();
    this.updateStats();
    this.updateEmptyState();
  }

  // タスクのレンダリング
  renderTasks() {
    const taskList = document.getElementById('taskList');
    const filteredTasks = this.getFilteredTasks();

    taskList.innerHTML = '';

    filteredTasks.forEach(task => {
      const taskItem = this.createTaskElement(task);
      taskList.appendChild(taskItem);
    });
  }

  // タスク要素の作成
  createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item ${task.completed ? 'completed' : ''}`;
    div.dataset.id = task.id;

    div.innerHTML = `
      <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-action="toggle"></div>
      <div class="task-content">${this.escapeHtml(task.text)}</div>
      <div class="task-actions">
        <button class="btn-delete" data-action="delete" title="削除">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </button>
      </div>
    `;

    // イベントリスナーの追加
    div.addEventListener('click', (e) => {
      const action = e.target.closest('[data-action]')?.dataset.action;

      if (action === 'toggle') {
        this.toggleTask(task.id);
      } else if (action === 'delete') {
        this.deleteTask(task.id);
      }
    });

    return div;
  }

  // 統計の更新
  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    const activeTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    document.getElementById('totalTasks').textContent = totalTasks;
    document.getElementById('completedTasks').textContent = completedTasks;
    document.getElementById('completionRate').textContent = `${completionRate}%`;

    // バッジの更新
    document.getElementById('allCount').textContent = totalTasks;
    document.getElementById('activeCount').textContent = activeTasks;
    document.getElementById('completedCount').textContent = completedTasks;
  }

  // 空の状態の更新
  updateEmptyState() {
    const emptyState = document.getElementById('emptyState');
    const filteredTasks = this.getFilteredTasks();

    if (filteredTasks.length === 0) {
      emptyState.classList.add('show');
    } else {
      emptyState.classList.remove('show');
    }
  }

  // タスクの保存
  saveTasks() {
    try {
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.error('Failed to save tasks:', error);
      this.showToast('タスクの保存に失敗しました');
    }
  }

  // タスクの読み込み
  loadTasks() {
    try {
      const saved = localStorage.getItem('tasks');
      if (saved) {
        this.tasks = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load tasks:', error);
      this.showToast('タスクの読み込みに失敗しました');
    }
  }

  // タスクの同期
  syncTasks() {
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.classList.add('syncing');

    // 同期のシミュレーション
    setTimeout(() => {
      syncBtn.classList.remove('syncing');
      this.showToast('同期が完了しました');
    }, 1000);
  }

  // オンライン状態のチェック
  checkOnlineStatus() {
    this.updateOnlineStatus(navigator.onLine);
  }

  // オンライン状態の更新
  updateOnlineStatus(isOnline) {
    const statusIndicator = document.getElementById('statusIndicator');
    const statusDot = statusIndicator.querySelector('.status-dot');
    const statusText = statusIndicator.querySelector('.status-text');

    if (isOnline) {
      statusDot.classList.add('online');
      statusDot.classList.remove('offline');
      statusText.textContent = 'オンライン';
    } else {
      statusDot.classList.add('offline');
      statusDot.classList.remove('online');
      statusText.textContent = 'オフライン';
    }
  }

  // インストールプロンプトのセットアップ
  setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt();
    });

    const installBtn = document.getElementById('installBtn');
    installBtn.addEventListener('click', async () => {
      if (!this.deferredPrompt) return;

      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        this.showToast('インストールありがとうございます');
      }

      this.deferredPrompt = null;
      this.hideInstallPrompt();
    });

    // インストール完了を検知
    window.addEventListener('appinstalled', () => {
      this.showToast('アプリがインストールされました');
      this.hideInstallPrompt();
    });
  }

  // インストールプロンプトの表示
  showInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    installPrompt.classList.add('show');
  }

  // インストールプロンプトの非表示
  hideInstallPrompt() {
    const installPrompt = document.getElementById('installPrompt');
    installPrompt.classList.remove('show');
  }

  // トースト通知の表示
  showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }

  // HTMLエスケープ
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// アプリケーションの起動
document.addEventListener('DOMContentLoaded', () => {
  const app = new TaskManager();

  // グローバルスコープにアプリインスタンスを設定（デバッグ用）
  window.taskManager = app;

  console.log('Task Manager PWA initialized');
});
