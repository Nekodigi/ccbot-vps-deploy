// ========================================
// 定数と初期設定
// ========================================
const CONFIG = {
    MAX_CHARS: 500,
    TYPING_TIMEOUT: 2000,
    AUTO_REACTION_DELAY: 1500,
    WAVE_DURATION: 2000,
    BOT_RESPONSE_DELAY: 1000,
    COMBO_THRESHOLD: 3000, // 3秒以内に送信でコンボ
};

const REACTIONS = ['👍', '❤️', '😊', '🎉', '🔥', '✨', '👏', '💯'];

const SPECIAL_KEYWORDS = {
    'こんにちは': '👋',
    'ありがとう': '🙏',
    'おめでとう': '🎉',
    '完了': '✅',
    'すごい': '🔥',
    'いいね': '👍',
    '了解': '👌',
    'お疲れ': '💪',
};

const BOT_RESPONSES = [
    'なるほど、興味深いですね',
    'そうなんですね！',
    '素晴らしい意見です',
    'それは良いアイデアですね',
    'もっと詳しく聞かせてください',
    '確かにそうですね',
    '勉強になります',
    'その視点は面白いですね',
];

const THEMES = {
    blue: { primary: '#667eea', secondary: '#764ba2' },
    green: { primary: '#84fab0', secondary: '#8fd3f4' },
    orange: { primary: '#fa709a', secondary: '#fee140' },
    purple: { primary: '#a18cd1', secondary: '#fbc2eb' },
};

// ========================================
// 状態管理
// ========================================
class ChatState {
    constructor() {
        this.messages = [];
        this.messageCount = 0;
        this.waveLevel = 0;
        this.lastMessageTime = 0;
        this.comboCount = 0;
        this.typingStartTime = 0;
        this.typingChars = 0;
        this.currentTheme = 'blue';
        this.settings = {
            waveEffect: true,
            soundEffect: true,
            autoReaction: true,
        };
    }

    addMessage(message) {
        this.messages.push(message);
        this.messageCount++;
        this.updateCombo();
    }

    updateCombo() {
        const now = Date.now();
        if (now - this.lastMessageTime < CONFIG.COMBO_THRESHOLD) {
            this.comboCount++;
        } else {
            this.comboCount = 1;
        }
        this.lastMessageTime = now;
    }

    calculateTypingSpeed(chars, duration) {
        if (duration === 0) return 0;
        return Math.round((chars / duration) * 1000);
    }

    calculateWaveIntensity(speed) {
        // タイピング速度から波動強度を計算 (0-100)
        return Math.min(100, Math.floor(speed / 2));
    }
}

const state = new ChatState();

// ========================================
// DOM要素
// ========================================
const elements = {
    messagesContainer: document.getElementById('messagesContainer'),
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    clearBtn: document.getElementById('clearChat'),
    typingIndicator: document.getElementById('typingIndicator'),
    waveLevel: document.getElementById('waveLevel'),
    messageCount: document.getElementById('messageCount'),
    typingSpeed: document.getElementById('typingSpeed'),
    charCount: document.getElementById('charCount'),
    usernameInput: document.getElementById('usernameInput'),
    waveCanvas: document.getElementById('waveCanvas'),
    waveEffectToggle: document.getElementById('waveEffect'),
    soundEffectToggle: document.getElementById('soundEffect'),
    autoReactionToggle: document.getElementById('autoReaction'),
    themeButtons: document.querySelectorAll('.theme-btn'),
};

// ========================================
// キャンバス設定
// ========================================
const ctx = elements.waveCanvas.getContext('2d');
let particles = [];

function resizeCanvas() {
    elements.waveCanvas.width = window.innerWidth;
    elements.waveCanvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// パーティクルクラス
// ========================================
class Particle {
    constructor(x, y, intensity) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * (intensity / 10);
        this.vy = (Math.random() - 0.5) * (intensity / 10);
        this.life = 1;
        this.decay = 0.02;
        this.size = Math.random() * 4 + 2;
        this.color = state.currentTheme;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.vy += 0.1; // 重力効果
    }

    draw() {
        const theme = THEMES[this.color];
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, theme.primary + Math.floor(this.life * 255).toString(16).padStart(2, '0'));
        gradient.addColorStop(1, theme.secondary + '00');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }

    isDead() {
        return this.life <= 0;
    }
}

// ========================================
// アニメーションループ
// ========================================
function animate() {
    ctx.clearRect(0, 0, elements.waveCanvas.width, elements.waveCanvas.height);

    particles = particles.filter(p => !p.isDead());
    particles.forEach(p => {
        p.update();
        p.draw();
    });

    requestAnimationFrame(animate);
}

animate();

// ========================================
// 波動エフェクト生成
// ========================================
function createWaveEffect(x, y, intensity) {
    if (!state.settings.waveEffect) return;

    const particleCount = Math.floor(intensity / 2) + 10;
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(x, y, intensity));
    }
}

// ========================================
// メッセージ作成
// ========================================
function createMessageElement(text, author, isUser, waveIntensity = 0) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = isUser ? author.substring(0, 2).toUpperCase() : 'BOT';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';

    const authorSpan = document.createElement('span');
    authorSpan.className = 'message-author';
    authorSpan.textContent = author;

    const timeSpan = document.createElement('span');
    timeSpan.className = 'message-time';
    const now = new Date();
    timeSpan.textContent = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    headerDiv.appendChild(authorSpan);
    headerDiv.appendChild(timeSpan);

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    bubbleDiv.textContent = text;

    contentDiv.appendChild(headerDiv);
    contentDiv.appendChild(bubbleDiv);

    // 波動インジケーター
    if (isUser && waveIntensity > 0) {
        const waveIndicator = document.createElement('div');
        waveIndicator.className = 'message-wave-indicator';

        const waveText = document.createElement('span');
        waveText.textContent = `波動: ${waveIntensity}%`;

        const waveBar = document.createElement('div');
        waveBar.className = 'wave-bar';
        const barCount = Math.min(5, Math.floor(waveIntensity / 20) + 1);
        for (let i = 0; i < barCount; i++) {
            const span = document.createElement('span');
            waveBar.appendChild(span);
        }

        waveIndicator.appendChild(waveText);
        waveIndicator.appendChild(waveBar);
        contentDiv.appendChild(waveIndicator);
    }

    // リアクションコンテナ
    const reactionsDiv = document.createElement('div');
    reactionsDiv.className = 'message-reactions';
    contentDiv.appendChild(reactionsDiv);

    messageDiv.appendChild(avatar);
    messageDiv.appendChild(contentDiv);

    return messageDiv;
}

// ========================================
// 自動リアクション追加
// ========================================
function addAutoReaction(messageElement, text) {
    if (!state.settings.autoReaction) return;

    setTimeout(() => {
        const reactionsDiv = messageElement.querySelector('.message-reactions');

        // 特殊キーワードチェック
        let reaction = null;
        for (const [keyword, emoji] of Object.entries(SPECIAL_KEYWORDS)) {
            if (text.includes(keyword)) {
                reaction = emoji;
                break;
            }
        }

        // ランダムリアクション
        if (!reaction && Math.random() > 0.5) {
            reaction = REACTIONS[Math.floor(Math.random() * REACTIONS.length)];
        }

        if (reaction) {
            const reactionSpan = document.createElement('span');
            reactionSpan.className = 'reaction';
            reactionSpan.innerHTML = `${reaction} <span class="reaction-count">1</span>`;
            reactionsDiv.appendChild(reactionSpan);
        }
    }, CONFIG.AUTO_REACTION_DELAY);
}

// ========================================
// ボット応答生成
// ========================================
function generateBotResponse() {
    setTimeout(() => {
        // タイピングインジケーター表示
        elements.typingIndicator.classList.add('active');

        setTimeout(() => {
            elements.typingIndicator.classList.remove('active');

            const response = BOT_RESPONSES[Math.floor(Math.random() * BOT_RESPONSES.length)];
            const messageElement = createMessageElement(response, 'AIアシスタント', false);

            // ウェルカムメッセージを削除
            const welcomeMsg = elements.messagesContainer.querySelector('.welcome-message');
            if (welcomeMsg) welcomeMsg.remove();

            elements.messagesContainer.appendChild(messageElement);
            elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;

            state.addMessage({ text: response, author: 'AIアシスタント', isUser: false });
            updateStats();

            // ランダムでリアクション
            if (Math.random() > 0.6) {
                addAutoReaction(messageElement, response);
            }
        }, CONFIG.BOT_RESPONSE_DELAY);
    }, 500);
}

// ========================================
// メッセージ送信
// ========================================
function sendMessage() {
    const text = elements.messageInput.value.trim();
    if (!text) return;

    const username = elements.usernameInput.value || 'ゲスト';

    // タイピング速度計算
    const duration = Date.now() - state.typingStartTime;
    const speed = state.calculateTypingSpeed(state.typingChars, duration);
    const intensity = state.calculateWaveIntensity(speed);

    // メッセージ要素作成
    const messageElement = createMessageElement(text, username, true, intensity);

    // ウェルカムメッセージを削除
    const welcomeMsg = elements.messagesContainer.querySelector('.welcome-message');
    if (welcomeMsg) welcomeMsg.remove();

    elements.messagesContainer.appendChild(messageElement);
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;

    // 波動エフェクト生成
    const rect = messageElement.getBoundingClientRect();
    createWaveEffect(rect.left + rect.width / 2, rect.top + rect.height / 2, intensity);

    // 状態更新
    state.addMessage({ text, author: username, isUser: true, waveIntensity: intensity });
    state.waveLevel = Math.max(state.waveLevel, intensity);
    updateStats();

    // 自動リアクション
    addAutoReaction(messageElement, text);

    // コンボボーナス
    if (state.comboCount >= 3) {
        showComboNotification(state.comboCount);
    }

    // 入力欄リセット
    elements.messageInput.value = '';
    state.typingChars = 0;
    state.typingStartTime = 0;
    updateCharCount();
    autoResizeTextarea();

    // ボット応答（30%の確率）
    if (Math.random() > 0.7) {
        generateBotResponse();
    }
}

// ========================================
// コンボ通知
// ========================================
function showComboNotification(combo) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 48px;
        border-radius: 16px;
        font-size: 32px;
        font-weight: 700;
        z-index: 10000;
        animation: comboNotification 1s ease-out;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    `;
    notification.textContent = `${combo} COMBO!`;
    document.body.appendChild(notification);

    // スタイル追加
    if (!document.getElementById('combo-animation-style')) {
        const style = document.createElement('style');
        style.id = 'combo-animation-style';
        style.textContent = `
            @keyframes comboNotification {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }

    setTimeout(() => notification.remove(), 1000);
}

// ========================================
// 統計更新
// ========================================
function updateStats() {
    elements.messageCount.textContent = state.messageCount;
    elements.waveLevel.textContent = state.waveLevel;

    // 波動レベルを徐々に減少
    setTimeout(() => {
        state.waveLevel = Math.max(0, state.waveLevel - 5);
        elements.waveLevel.textContent = state.waveLevel;
    }, 3000);
}

// ========================================
// タイピング速度計測
// ========================================
function updateTypingSpeed() {
    if (state.typingStartTime === 0) {
        state.typingStartTime = Date.now();
    }

    state.typingChars++;
    const duration = Date.now() - state.typingStartTime;
    const speed = state.calculateTypingSpeed(state.typingChars, duration);
    elements.typingSpeed.textContent = `${speed} 文字/秒`;
}

// ========================================
// 文字数カウント
// ========================================
function updateCharCount() {
    const length = elements.messageInput.value.length;
    elements.charCount.textContent = `${length}/${CONFIG.MAX_CHARS}`;

    if (length >= CONFIG.MAX_CHARS) {
        elements.charCount.style.color = '#dc3545';
    } else if (length >= CONFIG.MAX_CHARS * 0.8) {
        elements.charCount.style.color = '#ffc107';
    } else {
        elements.charCount.style.color = 'var(--text-secondary)';
    }
}

// ========================================
// テキストエリア自動リサイズ
// ========================================
function autoResizeTextarea() {
    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

// ========================================
// テーマ変更
// ========================================
function changeTheme(themeName) {
    state.currentTheme = themeName;
    const theme = THEMES[themeName];

    document.documentElement.style.setProperty('--primary-color', theme.primary);
    document.documentElement.style.setProperty('--primary-dark', theme.secondary);

    elements.themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === themeName);
    });
}

// ========================================
// チャットクリア
// ========================================
function clearChat() {
    const messages = elements.messagesContainer.querySelectorAll('.message');
    messages.forEach(msg => msg.remove());

    state.messages = [];
    state.messageCount = 0;
    state.waveLevel = 0;
    state.comboCount = 0;

    updateStats();

    // ウェルカムメッセージを再表示
    const welcomeMsg = document.createElement('div');
    welcomeMsg.className = 'welcome-message';
    welcomeMsg.innerHTML = `
        <div class="welcome-icon">✨</div>
        <h3>WaveChatへようこそ！</h3>
        <p>メッセージを送信すると、タイピング速度に応じて波動エフェクトが発生します</p>
        <ul class="feature-list">
            <li><strong>高速タイピング</strong> → 強い波動エフェクト</li>
            <li><strong>連続送信</strong> → コンボボーナス発生</li>
            <li><strong>特定キーワード</strong> → 特殊エフェクト</li>
        </ul>
    `;
    elements.messagesContainer.appendChild(welcomeMsg);
}

// ========================================
// イベントリスナー
// ========================================

// 送信ボタン
elements.sendBtn.addEventListener('click', sendMessage);

// Enter送信（Shift+Enterで改行）
elements.messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
        e.preventDefault();
        sendMessage();
    } else if (e.key === 'Enter' && !e.shiftKey) {
        // 通常のEnterは改行
        return;
    }
});

// タイピング検出
elements.messageInput.addEventListener('input', () => {
    updateTypingSpeed();
    updateCharCount();
    autoResizeTextarea();

    // 最大文字数制限
    if (elements.messageInput.value.length > CONFIG.MAX_CHARS) {
        elements.messageInput.value = elements.messageInput.value.substring(0, CONFIG.MAX_CHARS);
    }
});

// クリアボタン
elements.clearBtn.addEventListener('click', clearChat);

// テーマボタン
elements.themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        changeTheme(btn.dataset.theme);
    });
});

// エフェクト設定
elements.waveEffectToggle.addEventListener('change', (e) => {
    state.settings.waveEffect = e.target.checked;
});

elements.soundEffectToggle.addEventListener('change', (e) => {
    state.settings.soundEffect = e.target.checked;
});

elements.autoReactionToggle.addEventListener('change', (e) => {
    state.settings.autoReaction = e.target.checked;
});

// ユーザー名保存
elements.usernameInput.addEventListener('blur', () => {
    const username = elements.usernameInput.value.trim();
    if (username) {
        localStorage.setItem('wavechat_username', username);
    }
});

// ========================================
// 初期化
// ========================================
function initialize() {
    // ローカルストレージからユーザー名読み込み
    const savedUsername = localStorage.getItem('wavechat_username');
    if (savedUsername) {
        elements.usernameInput.value = savedUsername;
    }

    // 初期文字数表示
    updateCharCount();

    // ウェルカムメッセージ表示
    console.log('WaveChat initialized successfully!');
}

// ページ読み込み時に初期化
window.addEventListener('DOMContentLoaded', initialize);
