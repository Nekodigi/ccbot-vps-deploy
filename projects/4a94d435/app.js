// Firebase設定
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, getDocs, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getVertexAI, getGenerativeModel } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-vertexai.js';

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
const vertexAI = getVertexAI(app);
const model = getGenerativeModel(vertexAI, { model: "gemini-1.5-flash" });

// ユーザー情報（Firestoreパス用）
const userName = 'nekokazu';
const projectId = '4a94d435';
const historyPath = `ccbotDev/${userName}/apps/${projectId}/history`;

// DOM要素
const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const videoContainer = document.getElementById('videoContainer');
const captureOverlay = document.getElementById('captureOverlay');

const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureBtn');
const retakeBtn = document.getElementById('retakeBtn');
const askBtn = document.getElementById('askBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');

const questionSection = document.getElementById('questionSection');
const answerSection = document.getElementById('answerSection');
const historySection = document.getElementById('historySection');
const questionInput = document.getElementById('questionInput');
const answerBox = document.getElementById('answerBox');
const answerContent = document.getElementById('answerContent');
const loadingIndicator = document.getElementById('loadingIndicator');
const historyList = document.getElementById('historyList');

// 状態管理
let stream = null;
let capturedImageData = null;

// カメラ起動
startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });

        video.srcObject = stream;
        startCameraBtn.style.display = 'none';
        captureBtn.style.display = 'inline-block';

    } catch (error) {
        alert('カメラの起動に失敗しました。カメラへのアクセスを許可してください。');
        console.error('カメラエラー:', error);
    }
});

// 撮影
captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 画像データを取得
    capturedImageData = canvas.toDataURL('image/jpeg', 0.8);
    capturedImage.src = capturedImageData;

    // UIを切り替え
    captureOverlay.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    questionSection.style.display = 'block';

    // カメラストリームを停止
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// 撮り直し
retakeBtn.addEventListener('click', async () => {
    captureOverlay.style.display = 'none';
    retakeBtn.style.display = 'none';
    questionSection.style.display = 'none';
    answerSection.style.display = 'none';
    capturedImageData = null;
    questionInput.value = '';
    answerContent.textContent = '';

    // カメラを再起動
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
            audio: false
        });
        video.srcObject = stream;
        captureBtn.style.display = 'inline-block';
    } catch (error) {
        startCameraBtn.style.display = 'inline-block';
        alert('カメラの再起動に失敗しました。');
        console.error('カメラエラー:', error);
    }
});

// AIに質問
askBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();

    if (!question) {
        alert('質問を入力してください。');
        return;
    }

    if (!capturedImageData) {
        alert('画像を撮影してください。');
        return;
    }

    // UIの状態を更新
    askBtn.disabled = true;
    answerSection.style.display = 'block';
    loadingIndicator.style.display = 'flex';
    answerContent.style.display = 'none';
    answerContent.textContent = '';

    try {
        // 画像データをBase64からバイナリに変換
        const base64Data = capturedImageData.split(',')[1];
        const mimeType = capturedImageData.split(',')[0].match(/:(.*?);/)[1];

        // Gemini APIに送信
        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        const prompt = `画像を分析して、次の質問に日本語で詳しく答えてください。\n\n質問: ${question}`;

        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const text = response.text();

        // 回答を表示
        answerContent.textContent = text;
        loadingIndicator.style.display = 'none';
        answerContent.style.display = 'block';

        // Firestoreに履歴を保存
        await saveHistory(question, text);

        // 履歴を更新
        await loadHistory();
        historySection.style.display = 'block';

    } catch (error) {
        console.error('AI処理エラー:', error);
        answerContent.textContent = 'エラーが発生しました。もう一度お試しください。\n\n' + error.message;
        loadingIndicator.style.display = 'none';
        answerContent.style.display = 'block';
    } finally {
        askBtn.disabled = false;
    }
});

// 履歴を保存
async function saveHistory(question, answer) {
    try {
        await addDoc(collection(db, historyPath), {
            question: question,
            answer: answer,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('履歴保存エラー:', error);
    }
}

// 履歴を読み込み
async function loadHistory() {
    try {
        const q = query(
            collection(db, historyPath),
            orderBy('timestamp', 'desc'),
            limit(10)
        );

        const querySnapshot = await getDocs(q);
        historyList.innerHTML = '';

        if (querySnapshot.empty) {
            historySection.style.display = 'none';
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const item = document.createElement('div');
            item.className = 'history-item';

            const timestamp = new Date(data.timestamp);
            const formattedTime = timestamp.toLocaleString('ja-JP', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });

            item.innerHTML = `
                <div class="history-question">Q: ${escapeHtml(data.question)}</div>
                <div class="history-answer">A: ${escapeHtml(data.answer.substring(0, 100))}${data.answer.length > 100 ? '...' : ''}</div>
                <div class="history-timestamp">${formattedTime}</div>
            `;

            historyList.appendChild(item);
        });

        historySection.style.display = 'block';

    } catch (error) {
        console.error('履歴読み込みエラー:', error);
    }
}

// 履歴をクリア
clearHistoryBtn.addEventListener('click', async () => {
    if (!confirm('履歴をすべて削除しますか？')) {
        return;
    }

    try {
        const q = query(collection(db, historyPath));
        const querySnapshot = await getDocs(q);

        const deletePromises = [];
        querySnapshot.forEach((doc) => {
            deletePromises.push(deleteDoc(doc.ref));
        });

        await Promise.all(deletePromises);
        historyList.innerHTML = '';
        historySection.style.display = 'none';

    } catch (error) {
        console.error('履歴削除エラー:', error);
        alert('履歴の削除に失敗しました。');
    }
});

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 初期ロード時に履歴を読み込む
loadHistory();

// Service Worker登録
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('Service Worker registration failed:', error);
            });
    });
}
