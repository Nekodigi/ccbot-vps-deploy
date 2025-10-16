// Firebase設定とAI Logic SDKの初期化

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';
import { getAI, getGenerativeModel, GoogleAIBackend } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-ai.js';

const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firebase AI Logic SDKを使用してGemini APIを初期化
const ai = getAI(app, { backend: new GoogleAIBackend() });
const model = getGenerativeModel(ai, { model: "gemini-2.0-flash-exp" });

// AI解説機能
export async function getAIExplanation(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return text;
    } catch (error) {
        console.error('AI解説エラー:', error);
        return 'AI解説の取得に失敗しました。もう一度お試しください。エラー: ' + error.message;
    }
}

// Firestoreにログを保存
export async function saveSimulationLog(circuitData, stateData) {
    try {
        const docRef = await addDoc(collection(db, 'ccbotDev/nekokazu/apps/4ed0f069/simulations'), {
            circuit: circuitData,
            state: stateData,
            timestamp: serverTimestamp()
        });
        console.log('シミュレーションログを保存しました:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('ログ保存エラー:', error);
        return null;
    }
}

export { db };
