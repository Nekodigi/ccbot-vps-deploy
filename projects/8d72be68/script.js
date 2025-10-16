// ========================================
// 定数と設定
// ========================================
const CONFIG = {
    MAX_MESSAGE_LENGTH: 1000,
    TYPING_TIMEOUT: 3000,
    AUTO_SCROLL_THRESHOLD: 100,
    MESSAGE_ANIMATION_DELAY: 100,
};

// ========================================
// 状態管理
// ========================================
class ChatState {
    constructor() {
        this.currentChannel = 'general';
        this.messages = [];
        this.typingTimer = null;
        this.currentUser = {
            name: '山田太郎',
            avatar: '山田',
            role: '部長'
        };
    }

    addMessage(message) {
        this.messages.push({
            ...message,
            id: Date.now() + Math.random(),
            timestamp: new Date(),
        });
    }

    getMessages() {
        return this.messages;
    }
}

const state = new ChatState();

// ========================================
// DOM要素
// ========================================
const elements = {
    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    messagesWrapper: document.querySelector('.messages-wrapper'),
    channelItems: document.querySelectorAll('.channel-item'),
    dmItems: document.querySelectorAll('.dm-item'),
    typingIndicator: document.getElementById('typingIndicator'),
    infoPanel: document.getElementById('infoPanel'),
    closePanelBtn: document.getElementById('closePanelBtn'),
    actionBtns: document.querySelectorAll('.action-btn'),
};

// ========================================
// ユーティリティ関数
// ========================================
function formatTime(date) {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function shouldAutoScroll() {
    const threshold = CONFIG.AUTO_SCROLL_THRESHOLD;
    const scrollPosition = elements.messagesWrapper.scrollTop + elements.messagesWrapper.clientHeight;
    const scrollHeight = elements.messagesWrapper.scrollHeight;
    return scrollHeight - scrollPosition < threshold;
}

function scrollToBottom(smooth = true) {
    elements.messagesWrapper.scrollTo({
        top: elements.messagesWrapper.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
    });
}

// ========================================
// メッセージ作成
// ========================================
function createMessageElement(message) {
    const messageGroup = document.createElement('div');
    messageGroup.className = 'message-group';

    const avatarCol = document.createElement('div');
    avatarCol.className = 'message-avatar-col';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    avatar.textContent = message.avatar;

    avatarCol.appendChild(avatar);

    const contentCol = document.createElement('div');
    contentCol.className = 'message-content-col';

    const header = document.createElement('div');
    header.className = 'message-header';

    const author = document.createElement('span');
    author.className = 'message-author';
    author.textContent = message.author;

    const role = document.createElement('span');
    role.className = 'message-role';
    role.textContent = message.role;

    const time = document.createElement('span');
    time.className = 'message-time';
    time.textContent = formatTime(message.timestamp);

    header.appendChild(author);
    header.appendChild(role);
    header.appendChild(time);

    const text = document.createElement('div');
    text.className = 'message-text';
    text.innerHTML = escapeHtml(message.text).replace(/\n/g, '<br>');

    const actions = document.createElement('div');
    actions.className = 'message-actions';
    actions.innerHTML = `
        <button class="message-action-btn" title="スレッドを開始">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7H12M7 2L12 7L7 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>返信</span>
        </button>
        <button class="message-action-btn" title="リアクションを追加">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5"/>
                <circle cx="5" cy="6" r="0.5" fill="currentColor"/>
                <circle cx="9" cy="6" r="0.5" fill="currentColor"/>
                <path d="M5 8.5C5 8.5 6 10 7 10C8 10 9 8.5 9 8.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </svg>
        </button>
        <button class="message-action-btn" title="メニュー">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="3" cy="7" r="1" fill="currentColor"/>
                <circle cx="7" cy="7" r="1" fill="currentColor"/>
                <circle cx="11" cy="7" r="1" fill="currentColor"/>
            </svg>
        </button>
    `;

    contentCol.appendChild(header);
    contentCol.appendChild(text);
    contentCol.appendChild(actions);

    messageGroup.appendChild(avatarCol);
    messageGroup.appendChild(contentCol);

    return messageGroup;
}

// ========================================
// メッセージ送信
// ========================================
function sendMessage() {
    const text = elements.messageInput.value.trim();

    if (!text) return;

    if (text.length > CONFIG.MAX_MESSAGE_LENGTH) {
        alert(`メッセージは${CONFIG.MAX_MESSAGE_LENGTH}文字以内で入力してください`);
        return;
    }

    const message = {
        text: text,
        author: state.currentUser.name,
        avatar: state.currentUser.avatar,
        role: state.currentUser.role,
        timestamp: new Date(),
        isUser: true
    };

    state.addMessage(message);

    const messageElement = createMessageElement(message);

    const typingIndicator = elements.messagesWrapper.querySelector('.typing-indicator');
    if (typingIndicator) {
        elements.messagesWrapper.insertBefore(messageElement, typingIndicator);
    } else {
        elements.messagesWrapper.appendChild(messageElement);
    }

    elements.messageInput.value = '';
    autoResizeTextarea();

    scrollToBottom();

    setTimeout(() => {
        simulateBotResponse(text);
    }, 1000 + Math.random() * 2000);
}

// ========================================
// ボット応答シミュレーション
// ========================================
function simulateBotResponse(userMessage) {
    showTypingIndicator();

    setTimeout(() => {
        hideTypingIndicator();

        const responses = [
            '承知しました。確認して対応いたします。',
            'ありがとうございます。参考にさせていただきます。',
            '了解です。進めていきましょう。',
            'その件については、後ほど詳しくご説明させていただきます。',
            '素晴らしいアイデアですね。検討させていただきます。',
            'わかりました。チームで共有いたします。',
        ];

        const botMessage = {
            text: responses[Math.floor(Math.random() * responses.length)],
            author: '佐藤花子',
            avatar: '佐藤',
            role: 'マネージャー',
            timestamp: new Date(),
            isUser: false
        };

        state.addMessage(botMessage);

        const messageElement = createMessageElement(botMessage);
        elements.messagesWrapper.appendChild(messageElement);

        scrollToBottom();
    }, 1500 + Math.random() * 1500);
}

// ========================================
// タイピングインジケーター
// ========================================
function showTypingIndicator() {
    if (elements.typingIndicator) {
        elements.typingIndicator.classList.add('active');
        scrollToBottom();
    }
}

function hideTypingIndicator() {
    if (elements.typingIndicator) {
        elements.typingIndicator.classList.remove('active');
    }
}

// ========================================
// テキストエリア自動リサイズ
// ========================================
function autoResizeTextarea() {
    if (!elements.messageInput) return;

    elements.messageInput.style.height = 'auto';
    elements.messageInput.style.height = elements.messageInput.scrollHeight + 'px';
}

// ========================================
// チャンネル切り替え
// ========================================
function switchChannel(channelId, channelName) {
    state.currentChannel = channelId;

    elements.channelItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.channel === channelId) {
            item.classList.add('active');
        }
    });

    const chatTitle = document.querySelector('.chat-title');
    if (chatTitle) {
        chatTitle.textContent = `# ${channelName}`;
    }
}

// ========================================
// 情報パネル切り替え
// ========================================
function toggleInfoPanel() {
    if (elements.infoPanel) {
        elements.infoPanel.classList.toggle('active');
    }
}

// ========================================
// イベントリスナー
// ========================================

// 送信ボタン
if (elements.sendBtn) {
    elements.sendBtn.addEventListener('click', sendMessage);
}

// メッセージ入力
if (elements.messageInput) {
    elements.messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    elements.messageInput.addEventListener('input', () => {
        autoResizeTextarea();

        if (state.typingTimer) {
            clearTimeout(state.typingTimer);
        }

        state.typingTimer = setTimeout(() => {
        }, CONFIG.TYPING_TIMEOUT);
    });
}

// チャンネル選択
elements.channelItems.forEach(item => {
    item.addEventListener('click', () => {
        const channelId = item.dataset.channel;
        const channelName = item.querySelector('.channel-name').textContent;
        switchChannel(channelId, channelName);
    });
});

// DM選択
elements.dmItems.forEach(item => {
    item.addEventListener('click', () => {
        const userName = item.querySelector('.dm-name').textContent;

        elements.channelItems.forEach(ch => ch.classList.remove('active'));
        elements.dmItems.forEach(dm => dm.classList.remove('active'));
        item.classList.add('active');

        const chatTitle = document.querySelector('.chat-title');
        if (chatTitle) {
            chatTitle.textContent = userName;
        }

        const chatDescription = document.querySelector('.chat-description');
        if (chatDescription) {
            chatDescription.textContent = `${userName}とのダイレクトメッセージ`;
        }
    });
});

// 情報パネルボタン
elements.actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const title = btn.getAttribute('title');
        if (title === 'メンバーを表示') {
            toggleInfoPanel();
        }
    });
});

// 情報パネルを閉じる
if (elements.closePanelBtn) {
    elements.closePanelBtn.addEventListener('click', () => {
        toggleInfoPanel();
    });
}

// リアクションボタン
document.addEventListener('click', (e) => {
    if (e.target.closest('.reaction-item')) {
        const reactionItem = e.target.closest('.reaction-item');
        const countElement = reactionItem.querySelector('.reaction-count');
        if (countElement) {
            const currentCount = parseInt(countElement.textContent) || 0;
            countElement.textContent = currentCount + 1;

            reactionItem.style.transform = 'scale(1.1)';
            setTimeout(() => {
                reactionItem.style.transform = 'scale(1)';
            }, 200);
        }
    }
});

// ========================================
// 初期化
// ========================================
function initialize() {
    autoResizeTextarea();

    console.log('TeamConnect initialized successfully');
    console.log('カラーテーマ: 赤と黒');
    console.log('コミュニケーション機能: 有効');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
} else {
    initialize();
}
