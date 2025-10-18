// ========================================
// Firebase AI Logic SDK (Gemini) 画像質問アプリ
// ========================================

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-ai.js';

// ========================================
// Firebase設定
// ========================================
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.5-flash" });

// ========================================
// DOM要素取得
// ========================================
const cameraPreview = document.getElementById('camera-preview');
const cameraCanvas = document.getElementById('camera-canvas');
const capturedImage = document.getElementById('captured-image');
const startCameraBtn = document.getElementById('start-camera-btn');
const captureBtn = document.getElementById('capture-btn');
const retakeBtn = document.getElementById('retake-btn');
const questionInput = document.getElementById('question-input');
const askBtn = document.getElementById('ask-btn');
const answerSection = document.querySelector('.answer-section');
const answerContent = document.getElementById('answer-content');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

// ========================================
// グローバル変数
// ========================================
let stream = null;
let capturedImageData = null;

// ========================================
// エラー表示関数
// ========================================
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 5000);
}

// ========================================
// ローディング表示制御
// ========================================
function showLoading(show) {
    loading.style.display = show ? 'block' : 'none';
}

// ========================================
// カメラ起動
// ========================================
async function startCamera() {
    try {
        // 既存のストリームを停止
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }

        // カメラへのアクセスを要求（背面カメラを優先）
        const constraints = {
            video: {
                facingMode: { ideal: 'environment' },
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };

        stream = await navigator.mediaDevices.getUserMedia(constraints);
        cameraPreview.srcObject = stream;
        cameraPreview.classList.add('active');
        capturedImage.classList.remove('active');

        // ボタン状態を更新
        startCameraBtn.disabled = true;
        captureBtn.disabled = false;
        retakeBtn.style.display = 'none';

    } catch (error) {
        console.error('カメラ起動エラー:', error);

        let errorMsg = 'カメラの起動に失敗しました。';
        if (error.name === 'NotFoundError') {
            errorMsg = 'カメラデバイスが見つかりません。';
        } else if (error.name === 'NotAllowedError') {
            errorMsg = 'カメラへのアクセスが拒否されました。ブラウザの設定を確認してください。';
        } else if (error.name === 'NotReadableError') {
            errorMsg = 'カメラは既に使用中です。';
        } else if (error.name === 'OverconstrainedError') {
            errorMsg = '指定されたカメラ設定がサポートされていません。';
        }

        showError(errorMsg);
    }
}

// ========================================
// 画像撮影
// ========================================
function captureImage() {
    try {
        // キャンバスのサイズをビデオに合わせる
        cameraCanvas.width = cameraPreview.videoWidth;
        cameraCanvas.height = cameraPreview.videoHeight;

        // キャンバスに現在のフレームを描画
        const context = cameraCanvas.getContext('2d');
        context.drawImage(cameraPreview, 0, 0);

        // Base64形式で画像を取得
        capturedImageData = cameraCanvas.toDataURL('image/jpeg', 0.8);

        // 撮影した画像を表示
        capturedImage.src = capturedImageData;
        capturedImage.classList.add('active');
        cameraPreview.classList.remove('active');

        // ストリームを停止
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
        }

        // ボタン状態を更新
        captureBtn.disabled = true;
        retakeBtn.style.display = 'inline-flex';
        questionInput.disabled = false;
        askBtn.disabled = false;

    } catch (error) {
        console.error('撮影エラー:', error);
        showError('画像の撮影に失敗しました。');
    }
}

// ========================================
// 撮り直し
// ========================================
function retakeImage() {
    capturedImageData = null;
    capturedImage.src = '';
    capturedImage.classList.remove('active');
    questionInput.value = '';
    questionInput.disabled = true;
    askBtn.disabled = true;
    answerSection.style.display = 'none';
    startCameraBtn.disabled = false;
    retakeBtn.style.display = 'none';
}

// ========================================
// 画像をGenerativePart形式に変換
// ========================================
function imageDataToGenerativePart(imageData, mimeType = 'image/jpeg') {
    // "data:image/jpeg;base64," の部分を削除してbase64データのみを取得
    const base64Data = imageData.split(',')[1];

    return {
        inlineData: {
            data: base64Data,
            mimeType: mimeType
        }
    };
}

// ========================================
// AIに質問
// ========================================
async function askAI() {
    const question = questionInput.value.trim();

    if (!question) {
        showError('質問を入力してください。');
        return;
    }

    if (!capturedImageData) {
        showError('画像を撮影してください。');
        return;
    }

    try {
        showLoading(true);
        askBtn.disabled = true;

        // 画像をGenerativePart形式に変換
        const imagePart = imageDataToGenerativePart(capturedImageData);

        // Geminiに質問を送信（画像とテキストの両方）
        const result = await model.generateContent([question, imagePart]);
        const response = await result.response;
        const answerText = response.text();

        // 回答を表示
        answerContent.textContent = answerText;
        answerSection.style.display = 'block';

        // Firestoreに保存（/ccbotDev/nekokazu/apps/f1aae677 の中に保存）
        try {
            await addDoc(collection(db, 'ccbotDev', 'nekokazu', 'apps', 'f1aae677', 'questions'), {
                question: question,
                answer: answerText,
                timestamp: serverTimestamp(),
                imageDataLength: capturedImageData.length
            });
        } catch (firestoreError) {
            console.warn('Firestore保存エラー:', firestoreError);
            // Firestoreエラーは警告のみで、メイン機能は継続
        }

    } catch (error) {
        console.error('AI質問エラー:', error);

        let errorMsg = 'AIの回答生成に失敗しました。';
        if (error.message.includes('quota')) {
            errorMsg = 'APIの利用制限に達しました。しばらく時間をおいて再度お試しください。';
        } else if (error.message.includes('network')) {
            errorMsg = 'ネットワークエラーが発生しました。接続を確認してください。';
        }

        showError(errorMsg);

    } finally {
        showLoading(false);
        askBtn.disabled = false;
    }
}

// ========================================
// イベントリスナー設定
// ========================================
startCameraBtn.addEventListener('click', startCamera);
captureBtn.addEventListener('click', captureImage);
retakeBtn.addEventListener('click', retakeImage);
askBtn.addEventListener('click', askAI);

// Enterキーでの質問送信（Shift+Enterで改行）
questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (!askBtn.disabled) {
            askAI();
        }
    }
});

// ========================================
// Service Worker登録（PWA対応）
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker登録成功:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker登録失敗:', error);
            });
    });
}

// ========================================
// 初期化完了メッセージ
// ========================================
console.log('AI画像質問アプリが正常に起動しました。');
