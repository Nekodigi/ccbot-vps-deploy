// Firebase設定とAI Logic SDKの初期化

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

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

// AI解説機能
export async function getAIExplanation(prompt) {
    try {
        // Gemini APIを直接使用
        const apiKey = firebaseConfig.apiKey;
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 1000,
                }
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        } else {
            throw new Error('Unexpected API response format');
        }
    } catch (error) {
        console.error('AI解説エラー:', error);
        return 'AI解説の取得に失敗しました。もう一度お試しください。';
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
