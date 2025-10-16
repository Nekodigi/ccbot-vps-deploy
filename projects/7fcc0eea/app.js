/**
 * AR体験アプリケーション
 * WebXR & Model Viewer による拡張現実体験
 */

class ARApp {
    constructor() {
        this.modelViewer = document.getElementById('modelViewer');
        this.modelGrid = document.getElementById('modelGrid');
        this.toast = document.getElementById('toast');

        this.currentModel = './models/box.glb';

        this.init();
    }

    /**
     * アプリケーション初期化
     */
    init() {
        this.setupEventListeners();
        this.checkARSupport();
        this.setupModelViewer();
    }

    /**
     * イベントリスナーの設定
     */
    setupEventListeners() {
        // モデル選択ボタン
        const modelCards = this.modelGrid.querySelectorAll('.model-card');
        modelCards.forEach(card => {
            card.addEventListener('click', (e) => this.handleModelSelect(e));
        });

        // Model Viewer イベント
        if (this.modelViewer) {
            this.modelViewer.addEventListener('load', () => this.handleModelLoad());
            this.modelViewer.addEventListener('error', (e) => this.handleModelError(e));
            this.modelViewer.addEventListener('progress', (e) => this.handleProgress(e));
            this.modelViewer.addEventListener('ar-status', (e) => this.handleARStatus(e));
        }
    }

    /**
     * AR対応チェック
     */
    async checkARSupport() {
        try {
            if (this.modelViewer) {
                const arSupported = await this.modelViewer.canActivateAR;

                if (!arSupported) {
                    console.warn('AR is not supported on this device');
                    this.showToast('このデバイスはARに対応していません', 'warning');
                }
            }

            // WebXR サポートチェック
            if (navigator.xr) {
                const isARSupported = await navigator.xr.isSessionSupported('immersive-ar');
                console.log('WebXR AR Support:', isARSupported);

                if (isARSupported) {
                    this.showToast('WebXR AR対応デバイスです', 'success');
                }
            }
        } catch (error) {
            console.error('AR support check failed:', error);
        }
    }

    /**
     * Model Viewer セットアップ
     */
    setupModelViewer() {
        if (!this.modelViewer) return;

        // カメラ位置の調整
        this.modelViewer.cameraOrbit = '45deg 55deg 2.5m';
        this.modelViewer.cameraTarget = '0m 0m 0m';
        this.modelViewer.fieldOfView = '45deg';

        // 環境設定
        this.modelViewer.shadowIntensity = 1;
        this.modelViewer.exposure = 1;
    }

    /**
     * モデル選択処理
     */
    handleModelSelect(event) {
        const card = event.currentTarget;
        const modelPath = card.dataset.model;
        const modelName = card.dataset.name;

        if (modelPath === this.currentModel) return;

        // アクティブ状態の更新
        const allCards = this.modelGrid.querySelectorAll('.model-card');
        allCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // モデルの変更
        this.currentModel = modelPath;
        this.modelViewer.src = modelPath;

        this.showToast(`${modelName}に切り替えました`);
    }

    /**
     * モデル読み込み完了処理
     */
    handleModelLoad() {
        console.log('Model loaded successfully');
        this.showToast('モデルの読み込みが完了しました', 'success');
    }

    /**
     * モデル読み込みエラー処理
     */
    handleModelError(event) {
        console.error('Model loading error:', event);
        this.showToast('モデルの読み込みに失敗しました', 'error');
    }

    /**
     * 読み込み進捗処理
     */
    handleProgress(event) {
        const progressBar = document.querySelector('.update-bar');
        if (progressBar && event.detail && event.detail.totalProgress !== undefined) {
            const progress = event.detail.totalProgress * 100;
            progressBar.style.width = `${progress}%`;
        }
    }

    /**
     * ARステータス処理
     */
    handleARStatus(event) {
        if (event.detail.status === 'session-started') {
            console.log('AR session started');
            this.showToast('AR体験を開始しました', 'success');
        } else if (event.detail.status === 'failed') {
            console.error('AR session failed:', event.detail);
            this.showToast('ARの起動に失敗しました', 'error');
        } else if (event.detail.status === 'not-presenting') {
            console.log('AR session ended');
        }
    }

    /**
     * トースト通知表示
     */
    showToast(message, type = 'info') {
        if (!this.toast) return;

        this.toast.textContent = message;
        this.toast.classList.add('show');

        // 3秒後に非表示
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

/**
 * Service Worker登録
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            console.log('Service Worker registered:', registration.scope);
        } catch (error) {
            console.error('Service Worker registration failed:', error);
        }
    }
}

/**
 * アプリケーション起動
 */
document.addEventListener('DOMContentLoaded', () => {
    // ARアプリ初期化
    const app = new ARApp();

    // Service Worker登録
    registerServiceWorker();

    // Install prompt処理
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        console.log('PWA install prompt available');
    });

    window.addEventListener('appinstalled', () => {
        console.log('PWA installed');
        deferredPrompt = null;
    });
});

/**
 * パフォーマンスモニタリング
 */
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
    });
}

/**
 * エラーハンドリング
 */
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
});
