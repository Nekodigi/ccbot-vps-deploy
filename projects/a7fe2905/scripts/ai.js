import {
    getVertexAI,
    getGenerativeModel
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-vertexai.js';

let vertexAI = null;
let model = null;

export function initAI(app) {
    try {
        vertexAI = getVertexAI(app);
        model = getGenerativeModel(vertexAI, {
            model: "gemini-2.0-flash-exp"
        });
        return model;
    } catch (error) {
        console.error('Error initializing AI:', error);
        throw new Error('AI機能の初期化に失敗しました');
    }
}

export async function generateAIResponse(prompt, context = []) {
    if (!model) throw new Error('AI not initialized');

    try {
        // Build conversation history
        let fullPrompt = '';

        if (context.length > 0) {
            fullPrompt += '以下は過去の会話履歴です:\n\n';
            context.forEach((msg) => {
                if (msg.role === 'user') {
                    fullPrompt += `ユーザー: ${msg.content}\n`;
                } else if (msg.role === 'ai') {
                    fullPrompt += `AI: ${msg.content}\n`;
                }
            });
            fullPrompt += '\n';
        }

        fullPrompt += `あなたは親切で有能なビジネスアシスタントです。日本語で簡潔かつ専門的に回答してください。\n\nユーザーの質問: ${prompt}`;

        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error generating AI response:', error);
        throw new Error('AI応答の生成に失敗しました: ' + error.message);
    }
}

export async function analyzeData(data) {
    if (!model) throw new Error('AI not initialized');

    try {
        const prompt = `以下のデータを分析し、重要なポイントや傾向を簡潔に日本語で説明してください:\n\n${JSON.stringify(data, null, 2)}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        return text;
    } catch (error) {
        console.error('Error analyzing data:', error);
        throw new Error('データ分析に失敗しました: ' + error.message);
    }
}
