// ai-support.js - AI Support Module using Firebase AI Logic SDK (Gemini)
import { getGenerativeModel } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-vertexai-preview.js';

let genAI;
let model;
let currentUser;

// Wait for Firebase and user authentication
function waitForAuth() {
    return new Promise((resolve) => {
        window.addEventListener('user-authenticated', (e) => {
            currentUser = e.detail.user;
            resolve();
        });
    });
}

// Initialize AI module
async function initAI() {
    await waitForAuth();

    try {
        const app = window.firebaseApp;

        // Initialize Gemini model using Firebase AI Logic
        // Using gemini-2.0-flash-lite (or gemini-1.5-flash as fallback)
        model = getGenerativeModel(app, { model: 'gemini-1.5-flash' });

        // UI Elements
        const aiSuggestBtn = document.getElementById('ai-suggest-btn');
        const aiSuggestion = document.getElementById('ai-suggestion');
        const infoTitle = document.getElementById('info-title');
        const infoContent = document.getElementById('info-content');

        // AI Suggest button handler
        aiSuggestBtn.addEventListener('click', async () => {
            const title = infoTitle.value.trim();
            const content = infoContent.value.trim();

            // Hide previous suggestions
            aiSuggestion.style.display = 'none';

            if (!title && !content) {
                showAISuggestion('タイトルまたは内容を入力してからAI提案をリクエストしてください。', false);
                return;
            }

            try {
                aiSuggestBtn.disabled = true;
                aiSuggestBtn.textContent = 'AI処理中...';

                let suggestion;
                if (title && content) {
                    // Both title and content provided - get improvement suggestions
                    suggestion = await getImprovementSuggestion(title, content);
                } else if (title) {
                    // Only title provided - suggest content
                    suggestion = await getContentSuggestion(title);
                } else {
                    // Only content provided - suggest title
                    suggestion = await getTitleSuggestion(content);
                }

                showAISuggestion(suggestion, true);

            } catch (error) {
                console.error('AI suggestion error:', error);
                showAISuggestion('AI提案の取得に失敗しました。後でもう一度お試しください。', false);
            } finally {
                aiSuggestBtn.disabled = false;
                aiSuggestBtn.textContent = 'AI提案を取得';
            }
        });

        // Get content suggestion based on title
        async function getContentSuggestion(title) {
            const prompt = `以下のタイトルに基づいて、情報管理アプリに追加する内容の提案を日本語で簡潔に提供してください。提案は具体的で実用的なものにしてください。

タイトル: ${title}

提案内容:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        // Get title suggestion based on content
        async function getTitleSuggestion(content) {
            const prompt = `以下の内容に基づいて、適切なタイトルを日本語で提案してください。タイトルは簡潔で内容を的確に表すものにしてください。

内容: ${content}

提案タイトル:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        // Get improvement suggestion for existing title and content
        async function getImprovementSuggestion(title, content) {
            const prompt = `以下のタイトルと内容について、より良い表現や追加すべき情報の提案を日本語で簡潔に提供してください。

タイトル: ${title}
内容: ${content}

改善提案:`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        }

        // Show AI suggestion in UI
        function showAISuggestion(text, isSuccess) {
            aiSuggestion.innerHTML = '';

            const heading = document.createElement('h3');
            heading.textContent = isSuccess ? 'AI提案' : '通知';

            const paragraph = document.createElement('p');
            paragraph.textContent = text;

            aiSuggestion.appendChild(heading);
            aiSuggestion.appendChild(paragraph);
            aiSuggestion.style.display = 'block';
        }

    } catch (error) {
        console.error('Error initializing AI module:', error);
        // Gracefully degrade - AI features just won't be available
        const aiSuggestBtn = document.getElementById('ai-suggest-btn');
        if (aiSuggestBtn) {
            aiSuggestBtn.disabled = true;
            aiSuggestBtn.title = 'AI機能は現在利用できません';
        }
    }
}

// Initialize when user is authenticated
window.addEventListener('user-authenticated', initAI);

// Export AI functions for potential use in other modules
export async function getAISuggestion(title, content) {
    if (!model) {
        throw new Error('AI model not initialized');
    }

    if (title && content) {
        const prompt = `以下のタイトルと内容について、改善提案を日本語で提供してください。

タイトル: ${title}
内容: ${content}

改善提案:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    }

    return null;
}
