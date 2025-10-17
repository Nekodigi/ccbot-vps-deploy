// ========================================
// Firebase AI Logic SDK - Photo Description App
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-ai.js';

// ========================================
// 初期化
// ========================================
const firebaseApp = initializeApp(window.firebaseConfig);
const db = getFirestore(firebaseApp);
const ai = getAI(firebaseApp, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: 'gemini-2.5-flash' });

// Firestoreコレクションパス（アクセス権限に準拠）
const COLLECTION_PATH = 'ccbotDev/nekokazu/apps/ba6c295f/photos';

// ========================================
// DOM要素
// ========================================
const elements = {
    // Loading
    loading: document.getElementById('loading'),

    // Screens
    homeScreen: document.getElementById('homeScreen'),
    cameraScreen: document.getElementById('cameraScreen'),
    resultScreen: document.getElementById('resultScreen'),
    historyScreen: document.getElementById('historyScreen'),

    // Home buttons
    captureBtn: document.getElementById('captureBtn'),
    historyBtn: document.getElementById('historyBtn'),

    // Camera elements
    video: document.getElementById('video'),
    canvas: document.getElementById('canvas'),
    preview: document.getElementById('preview'),
    snapBtn: document.getElementById('snapBtn'),
    analyzeBtn: document.getElementById('analyzeBtn'),
    retakeBtn: document.getElementById('retakeBtn'),
    cancelCaptureBtn: document.getElementById('cancelCaptureBtn'),

    // Result elements
    resultImage: document.getElementById('resultImage'),
    resultDescription: document.getElementById('resultDescription'),
    resultMeta: document.getElementById('resultMeta'),
    resultTimestamp: document.getElementById('resultTimestamp'),
    saveBtn: document.getElementById('saveBtn'),
    newCaptureBtn: document.getElementById('newCaptureBtn'),
    backToHomeBtn: document.getElementById('backToHomeBtn'),

    // History elements
    historyList: document.getElementById('historyList'),
    closeHistoryBtn: document.getElementById('closeHistoryBtn'),

    // Notifications
    errorNotification: document.getElementById('errorNotification'),
    errorMessage: document.getElementById('errorMessage'),
    closeErrorBtn: document.getElementById('closeErrorBtn'),
    successNotification: document.getElementById('successNotification'),
    successMessage: document.getElementById('successMessage')
};

// ========================================
// アプリケーションステート
// ========================================
let currentStream = null;
let currentPhotoData = null;
let currentDescription = null;

// ========================================
// ユーティリティ関数
// ========================================

/**
 * 画面切り替え
 */
function showScreen(screenElement) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('screen--active');
    });
    screenElement.classList.add('screen--active');
}

/**
 * ローディング表示制御
 */
function setLoading(isLoading) {
    if (isLoading) {
        elements.loading.classList.remove('loading--hidden');
    } else {
        elements.loading.classList.add('loading--hidden');
    }
}

/**
 * エラー表示
 */
function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorNotification.style.display = 'flex';
    setTimeout(() => {
        elements.errorNotification.style.display = 'none';
    }, 5000);
}

/**
 * 成功メッセージ表示
 */
function showSuccess(message) {
    elements.successMessage.textContent = message;
    elements.successNotification.style.display = 'flex';
    setTimeout(() => {
        elements.successNotification.style.display = 'none';
    }, 3000);
}

/**
 * 日時フォーマット
 */
function formatTimestamp(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
}

/**
 * Base64画像をBlobに変換
 */
function base64ToBlob(base64, mimeType = 'image/jpeg') {
    const byteString = atob(base64.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);

    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    return new Blob([arrayBuffer], { type: mimeType });
}

// ========================================
// カメラ機能
// ========================================

/**
 * カメラストリーム開始
 */
async function startCamera() {
    try {
        // 既存のストリームを停止
        if (currentStream) {
            stopCamera();
        }

        // カメラアクセス
        const constraints = {
            video: {
                facingMode: 'environment', // 背面カメラを優先
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        elements.video.srcObject = currentStream;

        // UI調整
        elements.video.style.display = 'block';
        elements.preview.style.display = 'none';
        elements.snapBtn.style.display = 'inline-flex';
        elements.analyzeBtn.style.display = 'none';
        elements.retakeBtn.style.display = 'none';

    } catch (error) {
        console.error('Camera access error:', error);
        showError('カメラへのアクセスに失敗しました。カメラの権限を許可してください。');
    }
}

/**
 * カメラストリーム停止
 */
function stopCamera() {
    if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
        currentStream = null;
        elements.video.srcObject = null;
    }
}

/**
 * 写真撮影
 */
function capturePhoto() {
    try {
        const context = elements.canvas.getContext('2d');

        // キャンバスサイズをビデオに合わせる
        elements.canvas.width = elements.video.videoWidth;
        elements.canvas.height = elements.video.videoHeight;

        // キャンバスに現在のフレームを描画
        context.drawImage(elements.video, 0, 0, elements.canvas.width, elements.canvas.height);

        // Base64データURL取得
        currentPhotoData = elements.canvas.toDataURL('image/jpeg', 0.9);

        // プレビュー表示
        elements.preview.src = currentPhotoData;
        elements.preview.style.display = 'block';
        elements.video.style.display = 'none';

        // カメラストリーム停止
        stopCamera();

        // UI調整
        elements.snapBtn.style.display = 'none';
        elements.analyzeBtn.style.display = 'inline-flex';
        elements.retakeBtn.style.display = 'inline-flex';

    } catch (error) {
        console.error('Photo capture error:', error);
        showError('写真の撮影に失敗しました。');
    }
}

/**
 * 再撮影
 */
function retakePhoto() {
    currentPhotoData = null;
    startCamera();
}

// ========================================
// AI画像解析機能
// ========================================

/**
 * Gemini APIで画像解析
 */
async function analyzeImage(imageData) {
    try {
        // Base64からデータ部分のみ抽出
        const base64Data = imageData.split(',')[1];

        // Gemini APIリクエスト
        const prompt = "この写真について、何が写っているのか、どのような状況なのかを詳しく説明してください。日本語で回答してください。";

        const result = await model.generateContent([
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: base64Data
                }
            },
            { text: prompt }
        ]);

        const response = result.response;
        const text = response.text();

        return text;

    } catch (error) {
        console.error('Image analysis error:', error);
        throw new Error('画像解析に失敗しました: ' + error.message);
    }
}

/**
 * 解析開始
 */
async function startAnalysis() {
    if (!currentPhotoData) {
        showError('写真データがありません。');
        return;
    }

    // 結果画面へ遷移
    showScreen(elements.resultScreen);
    elements.resultImage.src = currentPhotoData;
    elements.resultDescription.innerHTML = '<p class="result__loading">解析中...</p>';
    elements.resultMeta.style.display = 'none';
    elements.saveBtn.disabled = true;

    try {
        // AI解析実行
        const description = await analyzeImage(currentPhotoData);
        currentDescription = description;

        // 結果表示
        elements.resultDescription.innerHTML = `<p>${description}</p>`;

        // タイムスタンプ表示
        const timestamp = new Date();
        elements.resultTimestamp.textContent = formatTimestamp(timestamp);
        elements.resultMeta.style.display = 'block';

        // 保存ボタン有効化
        elements.saveBtn.disabled = false;

    } catch (error) {
        console.error('Analysis error:', error);
        elements.resultDescription.innerHTML = `<p class="result__loading" style="color: var(--color-accent);">エラー: ${error.message}</p>`;
        showError(error.message);
    }
}

// ========================================
// Firestore履歴管理
// ========================================

/**
 * 履歴に保存
 */
async function saveToHistory() {
    if (!currentPhotoData || !currentDescription) {
        showError('保存するデータがありません。');
        return;
    }

    try {
        elements.saveBtn.disabled = true;
        elements.saveBtn.textContent = '保存中...';

        const photoData = {
            imageData: currentPhotoData,
            description: currentDescription,
            timestamp: new Date().toISOString(),
            createdAt: new Date()
        };

        await addDoc(collection(db, COLLECTION_PATH), photoData);

        showSuccess('履歴に保存しました');
        elements.saveBtn.textContent = '保存完了';

        setTimeout(() => {
            elements.saveBtn.textContent = '履歴に保存';
            elements.saveBtn.disabled = false;
        }, 2000);

    } catch (error) {
        console.error('Save error:', error);
        showError('保存に失敗しました: ' + error.message);
        elements.saveBtn.textContent = '履歴に保存';
        elements.saveBtn.disabled = false;
    }
}

/**
 * 履歴を読み込み
 */
async function loadHistory() {
    try {
        const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            elements.historyList.innerHTML = '<p class="history__empty">履歴がありません</p>';
            return;
        }

        elements.historyList.innerHTML = '';

        querySnapshot.forEach((docSnapshot) => {
            const data = docSnapshot.data();
            const historyItem = createHistoryItem(data, docSnapshot.id);
            elements.historyList.appendChild(historyItem);
        });

    } catch (error) {
        console.error('Load history error:', error);
        showError('履歴の読み込みに失敗しました: ' + error.message);
    }
}

/**
 * 履歴アイテムHTML作成
 */
function createHistoryItem(data, docId) {
    const item = document.createElement('div');
    item.className = 'history-item';

    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();

    item.innerHTML = `
        <img class="history-item__image" src="${data.imageData}" alt="履歴の写真">
        <div class="history-item__content">
            <p class="history-item__description">${data.description}</p>
            <span class="history-item__timestamp">${formatTimestamp(timestamp)}</span>
        </div>
        <div class="history-item__actions">
            <button class="btn btn--secondary btn--small" data-action="delete" data-id="${docId}">削除</button>
        </div>
    `;

    // 削除ボタンイベント
    const deleteBtn = item.querySelector('[data-action="delete"]');
    deleteBtn.addEventListener('click', () => deleteHistoryItem(docId));

    return item;
}

/**
 * 履歴アイテム削除
 */
async function deleteHistoryItem(docId) {
    if (!confirm('この履歴を削除しますか?')) {
        return;
    }

    try {
        await deleteDoc(doc(db, COLLECTION_PATH, docId));
        showSuccess('履歴を削除しました');
        await loadHistory();
    } catch (error) {
        console.error('Delete error:', error);
        showError('削除に失敗しました: ' + error.message);
    }
}

// ========================================
// イベントリスナー
// ========================================

// ホーム画面
elements.captureBtn.addEventListener('click', () => {
    showScreen(elements.cameraScreen);
    startCamera();
});

elements.historyBtn.addEventListener('click', () => {
    showScreen(elements.historyScreen);
    loadHistory();
});

// カメラ画面
elements.snapBtn.addEventListener('click', capturePhoto);
elements.analyzeBtn.addEventListener('click', startAnalysis);
elements.retakeBtn.addEventListener('click', retakePhoto);
elements.cancelCaptureBtn.addEventListener('click', () => {
    stopCamera();
    currentPhotoData = null;
    showScreen(elements.homeScreen);
});

// 結果画面
elements.saveBtn.addEventListener('click', saveToHistory);
elements.newCaptureBtn.addEventListener('click', () => {
    currentPhotoData = null;
    currentDescription = null;
    showScreen(elements.cameraScreen);
    startCamera();
});
elements.backToHomeBtn.addEventListener('click', () => {
    currentPhotoData = null;
    currentDescription = null;
    showScreen(elements.homeScreen);
});

// 履歴画面
elements.closeHistoryBtn.addEventListener('click', () => {
    showScreen(elements.homeScreen);
});

// 通知
elements.closeErrorBtn.addEventListener('click', () => {
    elements.errorNotification.style.display = 'none';
});

// ========================================
// 初期化処理
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // ローディング非表示
    setTimeout(() => {
        setLoading(false);
    }, 500);

    // ホーム画面を表示
    showScreen(elements.homeScreen);
});

// ページ離脱時にカメラストリーム停止
window.addEventListener('beforeunload', () => {
    stopCamera();
});
