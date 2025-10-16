// ========================================
// Firebase設定
// ========================================
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ユーザー名からFirestoreパスを生成
const username = 'nekokazu'; // ユーザー名
const projectId = '75a7cc05';
const messagesRef = db.collection('ccbotDev').doc(username).collection('apps').doc(projectId).collection('messages');
const usersRef = db.collection('ccbotDev').doc(username).collection('apps').doc(projectId).collection('users');
const settingsRef = db.collection('ccbotDev').doc(username).collection('apps').doc(projectId).collection('settings');

// ========================================
// AI設定
// ========================================
let aiConfig = {
  enabled: false,
  username: 'AI アシスタント',
  userId: 'ai-user-001',
  responseMode: 'mention', // 'all', 'mention', 'random'
  personality: 'friendly', // 'friendly', 'professional', 'casual', 'helpful'
  responseDelay: 3 // 秒
};

let genAI = null;
let aiModel = null;

// ========================================
// グローバル変数
// ========================================
let currentUser = null;
let unsubscribeMessages = null;
let unsubscribeUsers = null;
let typingTimeout = null;

// ========================================
// DOM要素
// ========================================
const elements = {
  loading: document.getElementById('loading'),
  loginScreen: document.getElementById('loginScreen'),
  chatScreen: document.getElementById('chatScreen'),
  usernameInput: document.getElementById('usernameInput'),
  loginBtn: document.getElementById('loginBtn'),
  logoutBtn: document.getElementById('logoutBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  messageInput: document.getElementById('messageInput'),
  sendBtn: document.getElementById('sendBtn'),
  messagesList: document.getElementById('messagesList'),
  messagesContainer: document.getElementById('messagesContainer'),
  currentUserDisplay: document.getElementById('currentUser'),
  onlineCount: document.getElementById('onlineCount'),
  charCount: document.getElementById('charCount'),
  typingIndicator: document.getElementById('typingIndicator'),
  settingsModal: document.getElementById('settingsModal'),
  closeSettings: document.getElementById('closeSettings'),
  aiEnabled: document.getElementById('aiEnabled'),
  aiSettings: document.getElementById('aiSettings'),
  aiUsername: document.getElementById('aiUsername'),
  aiResponseMode: document.getElementById('aiResponseMode'),
  aiPersonality: document.getElementById('aiPersonality'),
  aiResponseDelay: document.getElementById('aiResponseDelay'),
  saveSettings: document.getElementById('saveSettings')
};

// ========================================
// PWA Service Worker登録
// ========================================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/ccbot/projects/75a7cc05/sw.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.error('Service Worker registration failed:', error);
      });
  });
}

// ========================================
// 初期化
// ========================================
window.addEventListener('DOMContentLoaded', () => {
  // ローカルストレージから保存されたユーザー名を確認
  const savedUsername = localStorage.getItem('chatUsername');

  if (savedUsername) {
    loginUser(savedUsername);
  } else {
    hideLoading();
  }

  setupEventListeners();
});

function setupEventListeners() {
  // ログインボタン
  elements.loginBtn.addEventListener('click', handleLogin);

  // Enterキーでログイン
  elements.usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  });

  // ログアウトボタン
  elements.logoutBtn.addEventListener('click', handleLogout);

  // 設定ボタン
  elements.settingsBtn.addEventListener('click', openSettings);

  // 設定モーダル閉じる
  elements.closeSettings.addEventListener('click', closeSettings);

  // モーダル外クリックで閉じる
  elements.settingsModal.addEventListener('click', (e) => {
    if (e.target === elements.settingsModal) {
      closeSettings();
    }
  });

  // AI有効化トグル
  elements.aiEnabled.addEventListener('change', handleAIToggle);

  // 設定保存
  elements.saveSettings.addEventListener('click', saveAISettings);

  // 送信ボタン
  elements.sendBtn.addEventListener('click', handleSendMessage);

  // Enterキーでメッセージ送信（Shift+Enterで改行）
  elements.messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  });

  // 文字数カウント
  elements.messageInput.addEventListener('input', handleMessageInput);

  // タイピングインジケーター
  elements.messageInput.addEventListener('input', handleTypingIndicator);
}

// ========================================
// ログイン処理
// ========================================
function handleLogin() {
  const username = elements.usernameInput.value.trim();

  if (!username) {
    alert('ユーザー名を入力してください');
    return;
  }

  if (username.length > 20) {
    alert('ユーザー名は20文字以内で入力してください');
    return;
  }

  loginUser(username);
}

async function loginUser(username) {
  try {
    showLoading();

    currentUser = {
      username: username,
      id: generateUserId(),
      joinedAt: new Date()
    };

    // Firestoreにユーザー情報を保存
    await usersRef.doc(currentUser.id).set({
      username: currentUser.username,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      online: true
    });

    // ローカルストレージに保存
    localStorage.setItem('chatUsername', username);
    localStorage.setItem('chatUserId', currentUser.id);

    // システムメッセージを送信
    await sendSystemMessage(`${username}さんが参加しました`);

    // UIを更新
    elements.currentUserDisplay.textContent = `@${username}`;
    elements.loginScreen.style.display = 'none';
    elements.chatScreen.style.display = 'flex';

    // メッセージをリッスン
    listenToMessages();
    listenToUsers();

    // AI設定を読み込み
    await loadAISettings();

    hideLoading();

    // 入力欄にフォーカス
    elements.messageInput.focus();

  } catch (error) {
    console.error('Login error:', error);
    alert('ログインに失敗しました。もう一度お試しください。');
    hideLoading();
  }
}

// ========================================
// ログアウト処理
// ========================================
async function handleLogout() {
  if (!confirm('ログアウトしますか?')) {
    return;
  }

  try {
    // システムメッセージを送信
    await sendSystemMessage(`${currentUser.username}さんが退出しました`);

    // Firestoreのユーザー情報を更新
    await usersRef.doc(currentUser.id).update({
      online: false,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });

    // リスナーを解除
    if (unsubscribeMessages) unsubscribeMessages();
    if (unsubscribeUsers) unsubscribeUsers();

    // ローカルストレージをクリア
    localStorage.removeItem('chatUsername');
    localStorage.removeItem('chatUserId');

    // UIをリセット
    currentUser = null;
    elements.messagesList.innerHTML = '';
    elements.usernameInput.value = '';
    elements.messageInput.value = '';
    elements.chatScreen.style.display = 'none';
    elements.loginScreen.style.display = 'flex';

  } catch (error) {
    console.error('Logout error:', error);
    alert('ログアウトに失敗しました。');
  }
}

// ========================================
// メッセージ送信
// ========================================
async function handleSendMessage() {
  const messageText = elements.messageInput.value.trim();

  if (!messageText) {
    return;
  }

  if (messageText.length > 500) {
    alert('メッセージは500文字以内で入力してください');
    return;
  }

  try {
    // Firestoreにメッセージを保存
    await messagesRef.add({
      text: messageText,
      username: currentUser.username,
      userId: currentUser.id,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'user'
    });

    // 入力欄をクリア
    elements.messageInput.value = '';
    updateCharCount();
    updateSendButton();

    // ユーザーの最終アクティブ時刻を更新
    await usersRef.doc(currentUser.id).update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });

  } catch (error) {
    console.error('Send message error:', error);
    alert('メッセージの送信に失敗しました。');
  }
}

async function sendSystemMessage(text) {
  try {
    await messagesRef.add({
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'system'
    });
  } catch (error) {
    console.error('Send system message error:', error);
  }
}

// ========================================
// メッセージのリスニング
// ========================================
function listenToMessages() {
  unsubscribeMessages = messagesRef
    .orderBy('timestamp', 'asc')
    .limit(100)
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const message = change.doc.data();
          const messageId = change.doc.id;
          displayMessage(message, messageId);

          // AI応答処理
          handleNewMessage(message, messageId);
        }
      });
    }, (error) => {
      console.error('Listen messages error:', error);
    });
}

// ========================================
// ユーザーのリスニング
// ========================================
function listenToUsers() {
  unsubscribeUsers = usersRef
    .where('online', '==', true)
    .onSnapshot((snapshot) => {
      const onlineUsers = snapshot.size;
      elements.onlineCount.textContent = `オンライン: ${onlineUsers}人`;
    }, (error) => {
      console.error('Listen users error:', error);
    });
}

// ========================================
// メッセージ表示
// ========================================
function displayMessage(message, messageId) {
  // 既に表示されているメッセージかチェック
  if (document.getElementById(`msg-${messageId}`)) {
    return;
  }

  const messageElement = document.createElement('div');
  messageElement.id = `msg-${messageId}`;
  messageElement.className = 'message-item';

  if (message.type === 'system') {
    messageElement.classList.add('system');
    messageElement.innerHTML = `
      <div class="message-bubble">
        <div class="message-text">${escapeHtml(message.text)}</div>
      </div>
    `;
  } else {
    const isOwn = message.userId === currentUser.id;
    messageElement.classList.add(isOwn ? 'own' : 'other');

    // AIメッセージの場合、data属性を追加
    if (message.isAI) {
      messageElement.setAttribute('data-is-ai', 'true');
    }

    const timestamp = message.timestamp ? formatTimestamp(message.timestamp.toDate()) : '送信中...';

    messageElement.innerHTML = `
      <div class="message-header">
        <span class="message-username">${escapeHtml(message.username)}</span>
        <span class="message-time">${timestamp}</span>
      </div>
      <div class="message-bubble">
        <div class="message-text">${escapeHtml(message.text)}</div>
      </div>
    `;
  }

  elements.messagesList.appendChild(messageElement);
  scrollToBottom();
}

// ========================================
// UI更新
// ========================================
function handleMessageInput() {
  updateCharCount();
  updateSendButton();
}

function updateCharCount() {
  const length = elements.messageInput.value.length;
  elements.charCount.textContent = `${length}/500`;

  if (length > 450) {
    elements.charCount.style.color = 'var(--danger)';
  } else if (length > 400) {
    elements.charCount.style.color = 'var(--warning)';
  } else {
    elements.charCount.style.color = 'var(--text-tertiary)';
  }
}

function updateSendButton() {
  const hasText = elements.messageInput.value.trim().length > 0;
  elements.sendBtn.disabled = !hasText;
}

function handleTypingIndicator() {
  clearTimeout(typingTimeout);

  typingTimeout = setTimeout(() => {
    elements.typingIndicator.textContent = '';
  }, 1000);
}

function scrollToBottom() {
  requestAnimationFrame(() => {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
  });
}

function showLoading() {
  elements.loading.style.display = 'flex';
}

function hideLoading() {
  elements.loading.style.display = 'none';
}

// ========================================
// ユーティリティ関数
// ========================================
function generateUserId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function formatTimestamp(date) {
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}日前`;
  } else if (hours > 0) {
    return `${hours}時間前`;
  } else if (minutes > 0) {
    return `${minutes}分前`;
  } else if (seconds > 10) {
    return `${seconds}秒前`;
  } else {
    return '今';
  }
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ========================================
// ページ離脱時の処理
// ========================================
window.addEventListener('beforeunload', async () => {
  if (currentUser) {
    try {
      await usersRef.doc(currentUser.id).update({
        online: false,
        lastActive: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Beforeunload error:', error);
    }
  }
});

// ========================================
// オフライン検知
// ========================================
window.addEventListener('online', () => {
  console.log('オンラインに復帰しました');
  if (currentUser) {
    usersRef.doc(currentUser.id).update({
      online: true,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  }
});

window.addEventListener('offline', () => {
  console.log('オフラインになりました');
  if (currentUser) {
    usersRef.doc(currentUser.id).update({
      online: false
    });
  }
});

// ========================================
// 古いメッセージの定期クリーンアップ（オプション）
// ========================================
async function cleanupOldMessages() {
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const oldMessages = await messagesRef
      .where('timestamp', '<', threeDaysAgo)
      .limit(50)
      .get();

    const batch = db.batch();
    oldMessages.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`${oldMessages.size}件の古いメッセージを削除しました`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

// 1日1回クリーンアップを実行（オプション）
// setInterval(cleanupOldMessages, 24 * 60 * 60 * 1000);

// ========================================
// AI機能
// ========================================

// AI初期化
async function initializeAI() {
  try {
    // Genkit AIを初期化（Firebase AI Logic SDK使用）
    const { genkit, googleAI, gemini15Flash } = window.genkitAI;

    genAI = genkit({
      plugins: [googleAI({ apiKey: firebaseConfig.apiKey })],
    });

    // Gemini 1.5 Flash モデルを使用
    aiModel = gemini15Flash;

    console.log('AI初期化完了 (Firebase AI Logic SDK - Gemini 1.5 Flash)');
    return true;
  } catch (error) {
    console.error('AI初期化エラー:', error);
    return false;
  }
}

// AI設定の読み込み
async function loadAISettings() {
  try {
    const doc = await settingsRef.doc('ai').get();
    if (doc.exists) {
      const data = doc.data();
      aiConfig = { ...aiConfig, ...data };

      // UI更新
      elements.aiEnabled.checked = aiConfig.enabled;
      elements.aiUsername.value = aiConfig.username;
      elements.aiResponseMode.value = aiConfig.responseMode;
      elements.aiPersonality.value = aiConfig.personality;
      elements.aiResponseDelay.value = aiConfig.responseDelay;

      if (aiConfig.enabled) {
        elements.aiSettings.style.display = 'block';
        await startAI();
      }
    }
  } catch (error) {
    console.error('AI設定読み込みエラー:', error);
  }
}

// AI設定の保存
async function saveAISettings() {
  try {
    aiConfig.username = elements.aiUsername.value.trim() || 'AI アシスタント';
    aiConfig.responseMode = elements.aiResponseMode.value;
    aiConfig.personality = elements.aiPersonality.value;
    aiConfig.responseDelay = parseInt(elements.aiResponseDelay.value) || 3;

    await settingsRef.doc('ai').set(aiConfig);

    if (aiConfig.enabled) {
      // AIユーザー情報を更新
      await usersRef.doc(aiConfig.userId).update({
        username: aiConfig.username
      });
    }

    closeSettings();
    alert('設定を保存しました');
  } catch (error) {
    console.error('AI設定保存エラー:', error);
    alert('設定の保存に失敗しました');
  }
}

// 設定モーダル
function openSettings() {
  elements.settingsModal.style.display = 'flex';
}

function closeSettings() {
  elements.settingsModal.style.display = 'none';
}

function handleAIToggle() {
  const enabled = elements.aiEnabled.checked;
  elements.aiSettings.style.display = enabled ? 'block' : 'none';

  if (enabled) {
    startAI();
  } else {
    stopAI();
  }
}

// AI開始
async function startAI() {
  if (aiConfig.enabled) return;

  showLoading();

  try {
    // AI初期化
    const initialized = await initializeAI();
    if (!initialized) {
      throw new Error('AI初期化に失敗しました');
    }

    aiConfig.enabled = true;

    // AIユーザーをFirestoreに登録
    await usersRef.doc(aiConfig.userId).set({
      username: aiConfig.username,
      lastActive: firebase.firestore.FieldValue.serverTimestamp(),
      online: true,
      isAI: true
    });

    // システムメッセージ
    await sendSystemMessage(`${aiConfig.username}が参加しました`);

    console.log('AI起動完了');
  } catch (error) {
    console.error('AI起動エラー:', error);
    elements.aiEnabled.checked = false;
    elements.aiSettings.style.display = 'none';
    alert('AIの起動に失敗しました');
  } finally {
    hideLoading();
  }
}

// AI停止
async function stopAI() {
  if (!aiConfig.enabled) return;

  try {
    aiConfig.enabled = false;

    // AIユーザーをオフラインに
    await usersRef.doc(aiConfig.userId).update({
      online: false,
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });

    // システムメッセージ
    await sendSystemMessage(`${aiConfig.username}が退出しました`);

    console.log('AI停止完了');
  } catch (error) {
    console.error('AI停止エラー:', error);
  }
}

// メッセージ監視とAI応答
let lastProcessedMessageId = null;

async function handleNewMessage(message, messageId) {
  // AI無効時は何もしない
  if (!aiConfig.enabled || !aiModel) return;

  // 自分のメッセージまたはシステムメッセージは無視
  if (message.userId === aiConfig.userId || message.type === 'system') return;

  // 既に処理済みのメッセージは無視
  if (messageId === lastProcessedMessageId) return;

  // 応答判定
  const shouldRespond = checkShouldRespond(message);
  if (!shouldRespond) return;

  lastProcessedMessageId = messageId;

  // 応答遅延
  await delay(aiConfig.responseDelay * 1000);

  // AI応答生成
  try {
    const response = await generateAIResponse(message);
    await sendAIMessage(response);
  } catch (error) {
    console.error('AI応答エラー:', error);
  }
}

// 応答判定
function checkShouldRespond(message) {
  const text = message.text.toLowerCase();
  const aiName = aiConfig.username.toLowerCase();

  switch (aiConfig.responseMode) {
    case 'all':
      return true;

    case 'mention':
      return text.includes(aiName) || text.includes('@ai') || text.includes('ai');

    case 'random':
      return Math.random() < 0.3; // 30%の確率で応答

    default:
      return false;
  }
}

// AI応答生成
async function generateAIResponse(message) {
  try {
    const personality = getPersonalityPrompt();
    const prompt = `${personality}

ユーザー「${message.username}」からのメッセージ: ${message.text}

上記のメッセージに対して、自然な会話として返答してください。
返答は簡潔に、1-3文程度で。`;

    // Genkit AIフローで生成
    const flow = genAI.defineFlow(
      {
        name: 'chatResponse',
        inputSchema: 'string',
        outputSchema: 'string',
      },
      async (input) => {
        const result = await genAI.generate({
          model: aiModel,
          prompt: input,
          config: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        });
        return result.text();
      }
    );

    const response = await flow(prompt);
    return response;
  } catch (error) {
    console.error('AI応答生成エラー:', error);
    return 'すみません、今は応答できません。';
  }
}

// パーソナリティプロンプト
function getPersonalityPrompt() {
  const prompts = {
    friendly: 'あなたは親しみやすく、フレンドリーなAIアシスタントです。絵文字は使わず、カジュアルで温かい言葉遣いで会話してください。',
    professional: 'あなたはプロフェッショナルで丁寧なAIアシスタントです。敬語を使い、正確な情報提供を心がけてください。',
    casual: 'あなたはカジュアルで気さくなAIアシスタントです。友達のような気軽な言葉遣いで会話してください。',
    helpful: 'あなたは助けになることを最優先するAIアシスタントです。ユーザーの質問に対して具体的で実用的な回答を提供してください。'
  };

  return prompts[aiConfig.personality] || prompts.friendly;
}

// AIメッセージ送信
async function sendAIMessage(text) {
  try {
    await messagesRef.add({
      text: text,
      username: aiConfig.username,
      userId: aiConfig.userId,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'user',
      isAI: true
    });

    // AIユーザーの最終アクティブ時刻を更新
    await usersRef.doc(aiConfig.userId).update({
      lastActive: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('AIメッセージ送信エラー:', error);
  }
}

// 遅延ユーティリティ
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
