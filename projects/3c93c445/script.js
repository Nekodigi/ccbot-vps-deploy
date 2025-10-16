// ========================================
// データ管理
// ========================================

// お題リスト
const themes = [
    'こんな〇〇は嫌だ！「こんな会議は嫌だ」',
    'こんな〇〇は嫌だ！「こんな医者は嫌だ」',
    'こんな〇〇は嫌だ！「こんなコンビニは嫌だ」',
    '〇〇に「令和」を付けて一番面白かったやつが優勝',
    '「これ実は〇〇なんです」〜意外な事実〜',
    '画像で一言（※お題は想像で）',
    'もしも〇〇が△△だったら',
    '新しいことわざを作ってください',
    '〇〇あるあるを教えてください',
    '架空の商品名を考えてください',
];

// LocalStorageのキー
const STORAGE_KEYS = {
    ANSWERS: 'oogiri_answers',
    CURRENT_THEME: 'oogiri_current_theme',
    LIKES: 'oogiri_likes',
};

// ========================================
// 状態管理
// ========================================
let currentTheme = '';
let answers = [];
let likedAnswers = new Set();

// ========================================
// DOM要素の取得
// ========================================
const elements = {
    currentTheme: document.getElementById('currentTheme'),
    changeThemeBtn: document.getElementById('changeThemeBtn'),
    answerInput: document.getElementById('answerInput'),
    charCount: document.getElementById('charCount'),
    submitBtn: document.getElementById('submitBtn'),
    sortSelect: document.getElementById('sortSelect'),
    answerCount: document.getElementById('answerCount'),
    answersList: document.getElementById('answersList'),
};

// ========================================
// 初期化
// ========================================
function init() {
    loadFromStorage();
    setupEventListeners();
    renderAnswers();
    updateAnswerCount();
}

// ========================================
// LocalStorage操作
// ========================================
function loadFromStorage() {
    // お題の読み込み
    const savedTheme = localStorage.getItem(STORAGE_KEYS.CURRENT_THEME);
    if (savedTheme) {
        currentTheme = savedTheme;
    } else {
        currentTheme = themes[0];
        localStorage.setItem(STORAGE_KEYS.CURRENT_THEME, currentTheme);
    }
    elements.currentTheme.textContent = currentTheme;

    // 回答の読み込み
    const savedAnswers = localStorage.getItem(STORAGE_KEYS.ANSWERS);
    if (savedAnswers) {
        answers = JSON.parse(savedAnswers);
    }

    // いいねの読み込み
    const savedLikes = localStorage.getItem(STORAGE_KEYS.LIKES);
    if (savedLikes) {
        likedAnswers = new Set(JSON.parse(savedLikes));
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
    localStorage.setItem(STORAGE_KEYS.CURRENT_THEME, currentTheme);
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify([...likedAnswers]));
}

// ========================================
// イベントリスナー設定
// ========================================
function setupEventListeners() {
    // お題変更ボタン
    elements.changeThemeBtn.addEventListener('click', changeTheme);

    // 文字数カウント
    elements.answerInput.addEventListener('input', updateCharCount);

    // 投稿ボタン
    elements.submitBtn.addEventListener('click', submitAnswer);

    // エンターキーで投稿（Shift+Enterで改行）
    elements.answerInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            submitAnswer();
        }
    });

    // ソート変更
    elements.sortSelect.addEventListener('change', renderAnswers);
}

// ========================================
// お題変更
// ========================================
function changeTheme() {
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    currentTheme = themes[nextIndex];
    elements.currentTheme.textContent = currentTheme;

    // お題が変わったら回答をクリア
    if (confirm('お題を変更すると、これまでの回答が削除されます。よろしいですか？')) {
        answers = [];
        likedAnswers.clear();
        saveToStorage();
        renderAnswers();
        updateAnswerCount();
    } else {
        // キャンセルした場合は元に戻す
        currentTheme = themes[currentIndex];
        elements.currentTheme.textContent = currentTheme;
    }
}

// ========================================
// 文字数カウント更新
// ========================================
function updateCharCount() {
    const count = elements.answerInput.value.length;
    elements.charCount.textContent = count;

    // 文字数が上限に近づいたら色を変える
    if (count >= 180) {
        elements.charCount.style.color = 'var(--danger)';
    } else if (count >= 150) {
        elements.charCount.style.color = 'var(--accent-color)';
    } else {
        elements.charCount.style.color = 'var(--text-secondary)';
    }
}

// ========================================
// 回答投稿
// ========================================
function submitAnswer() {
    const content = elements.answerInput.value.trim();

    if (!content) {
        alert('回答を入力してください');
        return;
    }

    if (content.length > 200) {
        alert('回答は200文字以内で入力してください');
        return;
    }

    // 新しい回答を作成
    const newAnswer = {
        id: Date.now(),
        content: content,
        timestamp: new Date().toISOString(),
        likes: 0,
        theme: currentTheme,
    };

    // 回答を追加
    answers.unshift(newAnswer);

    // 保存
    saveToStorage();

    // UIを更新
    elements.answerInput.value = '';
    updateCharCount();
    renderAnswers();
    updateAnswerCount();

    // 投稿完了メッセージ
    showNotification('回答を投稿しました！');
}

// ========================================
// 回答一覧の描画
// ========================================
function renderAnswers() {
    const sortValue = elements.sortSelect.value;

    // ソート
    let sortedAnswers = [...answers];
    if (sortValue === 'popular') {
        sortedAnswers.sort((a, b) => b.likes - a.likes);
    } else {
        // 新着順（デフォルト）
        sortedAnswers.sort((a, b) => b.id - a.id);
    }

    // 描画
    if (sortedAnswers.length === 0) {
        elements.answersList.innerHTML = `
            <div class="empty-state">
                <p>まだ回答がありません</p>
                <p class="empty-sub">最初の回答を投稿してみましょう！</p>
            </div>
        `;
        return;
    }

    elements.answersList.innerHTML = sortedAnswers
        .map((answer, index) => createAnswerCard(answer, index + 1))
        .join('');

    // いいねボタンと削除ボタンのイベントリスナーを設定
    sortedAnswers.forEach((answer) => {
        const likeBtn = document.getElementById(`like-${answer.id}`);
        const deleteBtn = document.getElementById(`delete-${answer.id}`);

        if (likeBtn) {
            likeBtn.addEventListener('click', () => toggleLike(answer.id));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => deleteAnswer(answer.id));
        }
    });
}

// ========================================
// 回答カードのHTML生成
// ========================================
function createAnswerCard(answer, number) {
    const isLiked = likedAnswers.has(answer.id);
    const likedClass = isLiked ? 'liked' : '';
    const likeIcon = isLiked ? '★' : '☆';

    // タイムスタンプをフォーマット
    const timeAgo = getTimeAgo(new Date(answer.timestamp));

    return `
        <div class="answer-card">
            <div class="answer-header">
                <div class="answer-meta">
                    <span class="answer-number">#${number}</span>
                    <span class="answer-time">${timeAgo}</span>
                </div>
            </div>
            <div class="answer-content">${escapeHtml(answer.content)}</div>
            <div class="answer-footer">
                <button class="like-btn ${likedClass}" id="like-${answer.id}">
                    <span class="like-icon">${likeIcon}</span>
                    <span class="like-count">${answer.likes}</span>
                </button>
                <button class="delete-btn" id="delete-${answer.id}">削除</button>
            </div>
        </div>
    `;
}

// ========================================
// いいね機能
// ========================================
function toggleLike(answerId) {
    const answer = answers.find(a => a.id === answerId);
    if (!answer) return;

    if (likedAnswers.has(answerId)) {
        // いいねを取り消し
        likedAnswers.delete(answerId);
        answer.likes = Math.max(0, answer.likes - 1);
    } else {
        // いいねを追加
        likedAnswers.add(answerId);
        answer.likes += 1;
    }

    saveToStorage();
    renderAnswers();
}

// ========================================
// 回答削除
// ========================================
function deleteAnswer(answerId) {
    if (!confirm('この回答を削除してもよろしいですか？')) {
        return;
    }

    // 回答を削除
    answers = answers.filter(a => a.id !== answerId);

    // いいねも削除
    likedAnswers.delete(answerId);

    // 保存
    saveToStorage();

    // UIを更新
    renderAnswers();
    updateAnswerCount();

    showNotification('回答を削除しました');
}

// ========================================
// 回答数の更新
// ========================================
function updateAnswerCount() {
    elements.answerCount.textContent = answers.length;
}

// ========================================
// 通知表示
// ========================================
function showNotification(message) {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--success);
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        box-shadow: var(--shadow-lg);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // 3秒後に削除
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ========================================
// ユーティリティ関数
// ========================================

// HTML エスケープ
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 相対時間表示
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'たった今';
    } else if (diffMin < 60) {
        return `${diffMin}分前`;
    } else if (diffHour < 24) {
        return `${diffHour}時間前`;
    } else if (diffDay < 7) {
        return `${diffDay}日前`;
    } else {
        return date.toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    }
}

// ========================================
// アプリケーション起動
// ========================================
document.addEventListener('DOMContentLoaded', init);
