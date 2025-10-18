// AI Suggestions Module using Firebase AI Logic SDK
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js';
import { getGenerativeModel } from 'https://www.gstatic.com/firebasejs/11.0.2/firebase-vertexai.js';
import { getCurrentTaskData, applySuggestedPriority } from './tasks.js';

// DOM Elements
const aiSuggestBtn = document.getElementById('ai-suggest-btn');
const aiSuggestion = document.getElementById('ai-suggestion');
const aiSuggestionText = document.getElementById('ai-suggestion-text');
const applyAiSuggestionBtn = document.getElementById('apply-ai-suggestion');
const closeAiSuggestionBtn = document.getElementById('close-ai-suggestion');

let suggestedPriority = null;

// Initialize Gemini model
let model = null;

async function initAI() {
    try {
        // Get Firebase app instance
        const firebaseConfig = {
            apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
            authDomain: "sandbox-35d1d.firebaseapp.com",
            projectId: "sandbox-35d1d",
            storageBucket: "sandbox-35d1d.appspot.com",
            messagingSenderId: "906287459396",
            appId: "1:906287459396:web:c931c95d943157cae36011",
            measurementId: "G-LE2Q0XC7B6"
        };

        const app = initializeApp(firebaseConfig, 'ai-app');

        // Initialize Gemini model using Vertex AI
        model = getGenerativeModel(app, {
            model: "gemini-1.5-flash"
        });

        console.log('AI model initialized');
    } catch (error) {
        console.error('Error initializing AI:', error);
    }
}

// Get AI priority suggestion
aiSuggestBtn.addEventListener('click', async () => {
    const taskData = getCurrentTaskData();

    if (!taskData.title) {
        alert('タスクのタイトルを入力してください。');
        return;
    }

    try {
        aiSuggestBtn.disabled = true;
        aiSuggestBtn.textContent = 'AI分析中...';

        // Initialize AI if not already done
        if (!model) {
            await initAI();
        }

        // Create prompt for AI
        const prompt = `
あなたはタスク管理の専門家です。以下のタスクについて、優先度を分析してください。

タスク情報:
- タイトル: ${taskData.title}
- 説明: ${taskData.description || 'なし'}
- 期限: ${taskData.deadline || 'なし'}

以下の形式で回答してください:
1. 推奨される優先度（high、medium、lowのいずれか）
2. その理由（簡潔に1-2文で）

回答形式:
優先度: [high/medium/low]
理由: [理由の説明]
        `.trim();

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse AI response
        const priorityMatch = text.match(/優先度[：:]\s*(high|medium|low)/i);
        const reasonMatch = text.match(/理由[：:]\s*(.+)/i);

        if (priorityMatch) {
            suggestedPriority = priorityMatch[1].toLowerCase();
            const reason = reasonMatch ? reasonMatch[1] : 'AIによる分析結果です。';

            const priorityJa = suggestedPriority === 'high' ? '高' :
                             suggestedPriority === 'medium' ? '中' : '低';

            aiSuggestionText.innerHTML = `
                <strong>推奨優先度: ${priorityJa}</strong><br>
                ${reason}
            `;

            aiSuggestion.style.display = 'block';
        } else {
            throw new Error('AIからの応答を解析できませんでした。');
        }

    } catch (error) {
        console.error('Error getting AI suggestion:', error);
        alert('AI提案の取得に失敗しました。もう一度お試しください。');
    } finally {
        aiSuggestBtn.disabled = false;
        aiSuggestBtn.textContent = 'AI優先度提案';
    }
});

// Apply AI suggestion
applyAiSuggestionBtn.addEventListener('click', () => {
    if (suggestedPriority) {
        applySuggestedPriority(suggestedPriority);
        aiSuggestion.style.display = 'none';
        alert('AI提案を適用しました。');
    }
});

// Close AI suggestion
closeAiSuggestionBtn.addEventListener('click', () => {
    aiSuggestion.style.display = 'none';
});

console.log('AI suggestions module loaded');
