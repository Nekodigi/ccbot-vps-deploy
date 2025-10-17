import { firebaseConfig } from './firebase-config.js';

// Firebase SDKをCDNから読み込む
const FIREBASE_VERSION = '11.2.0';
const AI_LOGIC_VERSION = '0.1.0';

// 動的にFirebase SDKを読み込む
async function loadFirebaseSDK() {
    return new Promise((resolve, reject) => {
        const script1 = document.createElement('script');
        script1.type = 'module';
        script1.textContent = `
            import { initializeApp } from 'https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js';
            import { getFirestore, collection, addDoc, getDocs, query, orderBy, limit } from 'https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js';
            window.firebaseModules = { initializeApp, getFirestore, collection, addDoc, getDocs, query, orderBy, limit };
            window.dispatchEvent(new Event('firebase-loaded'));
        `;
        script1.onerror = reject;
        document.head.appendChild(script1);
        resolve();
    });
}

// アプリケーション状態
let app = null;
let db = null;
let currentUser = 'nekokazu'; // ユーザー名
let projectId = '063a6ee0'; // プロジェクトID

// DOM要素
const docTypeSelect = document.getElementById('docType');
const inputText = document.getElementById('inputText');
const inputHint = document.getElementById('inputHint');
const generateBtn = document.getElementById('generateBtn');
const btnText = document.getElementById('btnText');
const btnLoader = document.getElementById('btnLoader');
const outputSection = document.getElementById('outputSection');
const outputText = document.getElementById('outputText');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');
const copyBtn = document.getElementById('copyBtn');
const historyList = document.getElementById('historyList');
const toast = document.getElementById('toast');
const toastText = document.getElementById('toastText');

// 文書タイプごとのヒント
const hints = {
    minutes: '会議の内容やポイントを入力してください',
    email: 'メールの目的、相手、伝えたい内容を入力してください',
    report: '報告する内容、成果、課題などを入力してください',
    proposal: '提案内容、背景、期待効果などを入力してください',
    summary: '要約したい文章やテキストを入力してください'
};

// 文書タイプの日本語名
const docTypeNames = {
    minutes: '議事録',
    email: 'ビジネスメール',
    report: '業務報告書',
    proposal: '提案書',
    summary: '要約'
};

// プロンプトテンプレート
const promptTemplates = {
    minutes: (content, tone) => `以下の会議内容を元に、ビジネスで使用できる議事録を作成してください。

会議内容:
${content}

要件:
- ${getToneDescription(tone)}な文体で記述
- 日時、参加者、議題、決定事項、次回アクションなど、議事録として必要な項目を含める
- 箇条書きを活用し、読みやすく整理された形式にする
- 実際のビジネスシーンで使用できる完成度の高い内容にする`,

    email: (content, tone) => `以下の内容を元に、ビジネスメールの文章を作成してください。

メール内容:
${content}

要件:
- ${getToneDescription(tone)}な文体で記述
- 件名、宛名、本文、署名など、メールとして必要な要素を含める
- ビジネスマナーに沿った適切な表現を使用する
- 簡潔で分かりやすい文章にする`,

    report: (content, tone) => `以下の内容を元に、業務報告書を作成してください。

報告内容:
${content}

要件:
- ${getToneDescription(tone)}な文体で記述
- 報告日、報告者、概要、詳細、成果、課題、今後の予定など、報告書として必要な項目を含める
- 事実を正確に、かつ分かりやすく記述する
- 箇条書きや段落分けを活用し、読みやすい構成にする`,

    proposal: (content, tone) => `以下の内容を元に、提案書を作成してください。

提案内容:
${content}

要件:
- ${getToneDescription(tone)}な文体で記述
- 提案の背景、目的、具体的な内容、期待される効果、実施スケジュールなど、提案書として必要な項目を含める
- 説得力のある論理的な構成にする
- 読み手が理解しやすい明快な表現を使用する`,

    summary: (content, tone) => `以下の文章を要約してください。

文章:
${content}

要件:
- ${getToneDescription(tone)}な文体で記述
- 重要なポイントを漏らさず、簡潔にまとめる
- 元の文章の趣旨を正確に反映する
- 箇条書きを活用し、分かりやすく整理する`
};

function getToneDescription(tone) {
    const descriptions = {
        formal: 'フォーマルで格式高い',
        casual: 'カジュアルで親しみやすい',
        polite: '丁寧で敬意を込めた'
    };
    return descriptions[tone] || 'フォーマル';
}

// Gemini APIを使用してテキスト生成
async function generateWithGemini(prompt) {
    const apiKey = firebaseConfig.apiKey;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
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
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            }
        })
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'AI生成に失敗しました');
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
        throw new Error('AIからの応答がありません');
    }

    return data.candidates[0].content.parts[0].text;
}

// Firestoreに履歴を保存
async function saveToHistory(docType, input, output, tone) {
    try {
        const { collection, addDoc } = window.firebaseModules;
        const historyRef = collection(db, 'ccbotDev', currentUser, 'apps', projectId, 'history');

        await addDoc(historyRef, {
            docType,
            input,
            output,
            tone,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('履歴の保存に失敗:', error);
        // 保存失敗はユーザー体験を妨げないため、エラーを投げない
    }
}

// Firestoreから履歴を読み込み
async function loadHistory() {
    try {
        const { collection, getDocs, query, orderBy, limit } = window.firebaseModules;
        const historyRef = collection(db, 'ccbotDev', currentUser, 'apps', projectId, 'history');
        const q = query(historyRef, orderBy('timestamp', 'desc'), limit(10));

        const querySnapshot = await getDocs(q);
        const histories = [];

        querySnapshot.forEach((doc) => {
            histories.push({ id: doc.id, ...doc.data() });
        });

        displayHistory(histories);
    } catch (error) {
        console.error('履歴の読み込みに失敗:', error);
        // 履歴読み込み失敗は致命的ではないため、エラーを投げない
    }
}

// 履歴を表示
function displayHistory(histories) {
    if (histories.length === 0) {
        historyList.innerHTML = '<p style="color: var(--text-muted); font-size: 14px;">履歴がありません</p>';
        return;
    }

    historyList.innerHTML = histories.map(item => {
        const date = new Date(item.timestamp);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        const preview = item.input.length > 100 ? item.input.substring(0, 100) + '...' : item.input;

        return `
            <div class="history-item" data-output="${escapeHtml(item.output)}">
                <div class="history-item-header">
                    <span class="history-item-type">${docTypeNames[item.docType]}</span>
                    <span class="history-item-date">${formattedDate}</span>
                </div>
                <p class="history-item-preview">${escapeHtml(preview)}</p>
            </div>
        `;
    }).join('');

    // 履歴アイテムのクリックイベント
    document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', () => {
            const output = item.getAttribute('data-output');
            outputText.textContent = output;
            outputSection.classList.remove('hidden');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    });
}

// HTMLエスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// トースト表示
function showToast(message) {
    toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// エラー表示
function showError(message) {
    errorText.textContent = message;
    errorSection.classList.remove('hidden');
    outputSection.classList.add('hidden');
}

// エラー非表示
function hideError() {
    errorSection.classList.add('hidden');
}

// 文書生成
async function generateDocument() {
    const input = inputText.value.trim();
    if (!input) {
        showError('入力内容を入力してください');
        return;
    }

    const docType = docTypeSelect.value;
    const tone = document.querySelector('input[name="tone"]:checked').value;

    // UI更新
    generateBtn.disabled = true;
    btnText.textContent = '生成中...';
    btnLoader.classList.remove('hidden');
    hideError();

    try {
        // プロンプト作成
        const prompt = promptTemplates[docType](input, tone);

        // AI生成
        const result = await generateWithGemini(prompt);

        // 結果表示
        outputText.textContent = result;
        outputSection.classList.remove('hidden');

        // 履歴に保存
        await saveToHistory(docType, input, result, tone);

        // 履歴を再読み込み
        await loadHistory();

        // 成功メッセージ
        showToast('文書を生成しました');
    } catch (error) {
        console.error('生成エラー:', error);
        showError(error.message || '文書の生成に失敗しました。もう一度お試しください。');
    } finally {
        // UI復元
        generateBtn.disabled = false;
        btnText.textContent = '文書を生成';
        btnLoader.classList.add('hidden');
    }
}

// コピー機能
function copyToClipboard() {
    const text = outputText.textContent;
    navigator.clipboard.writeText(text).then(() => {
        showToast('コピーしました');
    }).catch(err => {
        console.error('コピー失敗:', err);
        showToast('コピーに失敗しました');
    });
}

// 文書タイプ変更時のヒント更新
docTypeSelect.addEventListener('change', () => {
    inputHint.textContent = hints[docTypeSelect.value];
});

// イベントリスナー設定
generateBtn.addEventListener('click', generateDocument);
copyBtn.addEventListener('click', copyToClipboard);

// Enterキーで生成（Shift+Enterは改行）
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        generateDocument();
    }
});

// 初期化
async function initialize() {
    try {
        // Firebase SDKを読み込む
        await loadFirebaseSDK();

        // Firebase SDKが読み込まれるまで待機
        await new Promise((resolve) => {
            if (window.firebaseModules) {
                resolve();
            } else {
                window.addEventListener('firebase-loaded', resolve, { once: true });
            }
        });

        // Firebase初期化
        const { initializeApp, getFirestore } = window.firebaseModules;
        app = initializeApp(firebaseConfig);
        db = getFirestore(app);

        // 履歴を読み込む
        await loadHistory();

        console.log('アプリケーションが正常に初期化されました');
    } catch (error) {
        console.error('初期化エラー:', error);
        showError('アプリケーションの初期化に失敗しました。ページを再読み込みしてください。');
    }
}

// Service Workerの登録
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

// アプリ起動
initialize();
