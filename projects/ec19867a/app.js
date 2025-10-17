import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js';
import { getFirestore, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js';

// Firebase設定
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

// Service Worker登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((error) => {
        console.error('Service Worker登録失敗:', error);
    });
}

// DOM要素の取得
const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('captureImage');
const askBtn = document.getElementById('askButton');
const video = document.getElementById('cameraPreview');
const canvas = document.getElementById('canvas');
const capturedImage = document.getElementById('capturedImage');
const questionInput = document.getElementById('questionInput');
const capturedSection = document.getElementById('capturedSection');
const answerSection = document.getElementById('answerSection');
const answerContent = document.getElementById('answerContent');
const loading = document.getElementById('loading');

let stream = null;
let currentImageData = null;

// カメラ起動
startCameraBtn.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        captureBtn.disabled = false;
        startCameraBtn.textContent = 'カメラ起動中';
        startCameraBtn.disabled = true;
    } catch (error) {
        console.error('カメラアクセスエラー:', error);
        alert('カメラへのアクセスに失敗しました。カメラの使用を許可してください。');
    }
});

// 写真撮影
captureBtn.addEventListener('click', () => {
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    canvas.toBlob((blob) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64data = reader.result;
            currentImageData = base64data;
            capturedImage.src = base64data;
            capturedSection.style.display = 'block';
            questionInput.disabled = false;
            askBtn.disabled = false;

            // カメラを停止
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                video.srcObject = null;
            }

            startCameraBtn.textContent = 'カメラを起動';
            startCameraBtn.disabled = false;
            captureBtn.disabled = true;
        };
        reader.readAsDataURL(blob);
    }, 'image/jpeg', 0.9);
});

// 質問送信
askBtn.addEventListener('click', async () => {
    const question = questionInput.value.trim();

    if (!question) {
        alert('質問を入力してください');
        return;
    }

    if (!currentImageData) {
        alert('まず写真を撮影してください');
        return;
    }

    try {
        loading.style.display = 'flex';
        answerSection.style.display = 'none';
        askBtn.disabled = true;

        // Gemini APIを使用して画像分析
        const answer = await analyzeImageWithGemini(currentImageData, question);

        answerContent.textContent = answer;
        answerSection.style.display = 'block';

    } catch (error) {
        console.error('質問処理エラー:', error);
        alert('AIの回答取得に失敗しました。もう一度お試しください。');
    } finally {
        loading.style.display = 'none';
        askBtn.disabled = false;
    }
});

// Enterキーで質問送信
questionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !askBtn.disabled) {
        askBtn.click();
    }
});

// Gemini APIで画像分析
async function analyzeImageWithGemini(imageData, question) {
    const API_KEY = 'AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ';
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

    // base64データからヘッダーを削除
    const base64Image = imageData.split(',')[1];

    const requestBody = {
        contents: [{
            parts: [
                {
                    text: question
                },
                {
                    inline_data: {
                        mime_type: "image/jpeg",
                        data: base64Image
                    }
                }
            ]
        }],
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
        }
    };

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API エラー:', errorData);
            throw new Error(`API エラー: ${response.status}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const textParts = data.candidates[0].content.parts
                .filter(part => part.text)
                .map(part => part.text)
                .join('');
            return textParts || 'AIから回答を取得できませんでした。';
        } else {
            throw new Error('予期しないレスポンス形式');
        }
    } catch (error) {
        console.error('Gemini API エラー:', error);
        throw error;
    }
}
