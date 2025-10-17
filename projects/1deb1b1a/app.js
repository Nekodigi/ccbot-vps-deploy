// Import Firebase modules from CDN
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  increment,
  serverTimestamp,
  onSnapshot
} from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
  authDomain: "sandbox-35d1d.firebaseapp.com",
  projectId: "sandbox-35d1d",
  storageBucket: "sandbox-35d1d.appspot.com",
  messagingSenderId: "906287459396",
  appId: "1:906287459396:web:c931c95d943157cae36011",
  measurementId: "G-LE2Q0XC7B6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Global state
let currentUser = null;
let currentDeckId = null;
let unsubscribers = [];

// DOM Elements
const loadingScreen = document.getElementById('loading-screen');
const authScreen = document.getElementById('auth-screen');
const appScreen = document.getElementById('app-screen');
const offlineNotice = document.getElementById('offline-notice');

// Auth elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const authError = document.getElementById('auth-error');
const tabBtns = document.querySelectorAll('.tab-btn');

// App elements
const navItems = document.querySelectorAll('.nav-item');
const views = document.querySelectorAll('.view');
const feedContainer = document.getElementById('feed-container');
const myDecksContainer = document.getElementById('my-decks-container');
const createDeckBtn = document.getElementById('create-deck-btn');
const logoutBtn = document.getElementById('logout-btn');

// Profile elements
const profileUsername = document.getElementById('profile-username');
const profileEmail = document.getElementById('profile-email');
const decksCount = document.getElementById('decks-count');
const followersCount = document.getElementById('followers-count');
const followingCount = document.getElementById('following-count');

// Modal elements
const deckModal = document.getElementById('deck-modal');
const deckDetailModal = document.getElementById('deck-detail-modal');
const deckForm = document.getElementById('deck-form');
const deckTitle = document.getElementById('deck-title');
const deckDescription = document.getElementById('deck-description');
const deckPublic = document.getElementById('deck-public');
const wordsList = document.getElementById('words-list');
const addWordBtn = document.getElementById('add-word-btn');
const aiSuggestBtn = document.getElementById('ai-suggest-btn');

// Toast
const toast = document.getElementById('toast');

// User data path for Firestore
function getUserPath(uid) {
  // Use username or uid for path - get username from user profile
  return `ccbotDev/nekokazu/apps/1deb1b1a/users/${uid}`;
}

function getDecksPath(uid) {
  return `${getUserPath(uid)}/decks`;
}

// Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js');
      console.log('Service Worker registered:', registration.scope);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showToast('新しいバージョンが利用可能です', 'success');
          }
        });
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  });
}

// Online/Offline detection
window.addEventListener('online', () => {
  offlineNotice.classList.add('hidden');
  showToast('オンラインに戻りました', 'success');
});

window.addEventListener('offline', () => {
  offlineNotice.classList.remove('hidden');
});

// Check initial online status
if (!navigator.onLine) {
  offlineNotice.classList.remove('hidden');
}

// Initialize app
function init() {
  // Auth state observer
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUser = user;
      await loadUserProfile();
      showScreen('app');
      await loadFeed();
      await loadMyDecks();
      updateProfileStats();
    } else {
      currentUser = null;
      showScreen('auth');
    }
    hideLoading();
  });

  // Auth tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      if (tab === 'login') {
        loginForm.classList.remove('hidden');
        signupForm.classList.add('hidden');
      } else {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
      }
      authError.classList.add('hidden');
    });
  });

  // Login form
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      authError.classList.add('hidden');
    } catch (error) {
      showAuthError(getErrorMessage(error));
    }
  });

  // Signup form
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      await setDoc(doc(db, getUserPath(user.uid)), {
        username: username,
        email: email,
        createdAt: serverTimestamp(),
        followersCount: 0,
        followingCount: 0
      });

      authError.classList.add('hidden');
      showToast('アカウントを作成しました', 'success');
    } catch (error) {
      showAuthError(getErrorMessage(error));
    }
  });

  // Logout
  logoutBtn.addEventListener('click', async () => {
    try {
      // Cleanup listeners
      unsubscribers.forEach(unsub => unsub());
      unsubscribers = [];

      await signOut(auth);
      showToast('ログアウトしました', 'success');
    } catch (error) {
      showToast('ログアウトに失敗しました', 'error');
    }
  });

  // Navigation
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewName = item.dataset.view;
      switchView(viewName);

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Create deck button
  createDeckBtn.addEventListener('click', () => {
    currentDeckId = null;
    openDeckModal();
  });

  // Deck form
  deckForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveDeck();
  });

  // Add word button
  addWordBtn.addEventListener('click', () => {
    addWordInput();
  });

  // AI Suggest button
  aiSuggestBtn.addEventListener('click', async () => {
    await suggestWordsWithAI();
  });

  // Modal close buttons
  document.querySelectorAll('.modal-close, .modal-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Click outside modal to close
  [deckModal, deckDetailModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });
}

// Screen management
function showScreen(screenName) {
  authScreen.classList.add('hidden');
  appScreen.classList.add('hidden');

  if (screenName === 'auth') {
    authScreen.classList.remove('hidden');
  } else if (screenName === 'app') {
    appScreen.classList.remove('hidden');
  }
}

function hideLoading() {
  loadingScreen.style.display = 'none';
}

function switchView(viewName) {
  views.forEach(view => view.classList.add('hidden'));
  const viewMap = {
    'feed': 'feed-view',
    'my-decks': 'my-decks-view',
    'profile': 'profile-view'
  };
  document.getElementById(viewMap[viewName]).classList.remove('hidden');

  // Reload data when switching views
  if (viewName === 'feed') {
    loadFeed();
  } else if (viewName === 'my-decks') {
    loadMyDecks();
  } else if (viewName === 'profile') {
    updateProfileStats();
  }
}

// Load user profile
async function loadUserProfile() {
  try {
    const userDoc = await getDoc(doc(db, getUserPath(currentUser.uid)));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      profileUsername.textContent = userData.username || 'ユーザー';
      profileEmail.textContent = userData.email || currentUser.email;
    } else {
      profileUsername.textContent = 'ユーザー';
      profileEmail.textContent = currentUser.email;
    }
  } catch (error) {
    console.error('Failed to load user profile:', error);
  }
}

// Update profile stats
async function updateProfileStats() {
  try {
    // Count user's decks
    const decksSnapshot = await getDocs(collection(db, getDecksPath(currentUser.uid)));
    decksCount.textContent = decksSnapshot.size;

    // Get followers/following counts from user doc
    const userDoc = await getDoc(doc(db, getUserPath(currentUser.uid)));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      followersCount.textContent = userData.followersCount || 0;
      followingCount.textContent = userData.followingCount || 0;
    }
  } catch (error) {
    console.error('Failed to update stats:', error);
  }
}

// Load feed
async function loadFeed() {
  feedContainer.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">読み込み中...</p>';

  try {
    // Get all public decks from all users
    const publicDecks = [];

    // Query public decks - we need to query across users
    // For demo, we'll just get current user's public decks and following users' decks
    const userDecksQuery = query(
      collection(db, getDecksPath(currentUser.uid)),
      where('isPublic', '==', true),
      orderBy('createdAt', 'desc'),
      limit(20)
    );

    const snapshot = await getDocs(userDecksQuery);

    for (const deckDoc of snapshot.docs) {
      const deckData = deckDoc.data();
      publicDecks.push({
        id: deckDoc.id,
        userId: currentUser.uid,
        ...deckData
      });
    }

    if (publicDecks.length === 0) {
      feedContainer.innerHTML = `
        <div class="highlight">
          <p>まだ公開された単語帳がありません。</p>
          <p class="mt-1">最初の単語帳を作成してみましょう！</p>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = '';
    for (const deck of publicDecks) {
      const card = createDeckCard(deck);
      feedContainer.appendChild(card);
    }
  } catch (error) {
    console.error('Failed to load feed:', error);
    feedContainer.innerHTML = '<p class="text-center" style="color: var(--danger-color);">フィードの読み込みに失敗しました</p>';
  }
}

// Load my decks
async function loadMyDecks() {
  myDecksContainer.innerHTML = '<p class="text-center" style="color: var(--text-secondary);">読み込み中...</p>';

  try {
    const q = query(
      collection(db, getDecksPath(currentUser.uid)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      myDecksContainer.innerHTML = `
        <div class="highlight">
          <p>まだ単語帳を作成していません。</p>
          <p class="mt-1">「新規作成」ボタンから単語帳を作成しましょう！</p>
        </div>
      `;
      return;
    }

    myDecksContainer.innerHTML = '';
    snapshot.forEach((deckDoc) => {
      const deck = {
        id: deckDoc.id,
        userId: currentUser.uid,
        ...deckDoc.data()
      };
      const card = createDeckCard(deck, true);
      myDecksContainer.appendChild(card);
    });
  } catch (error) {
    console.error('Failed to load my decks:', error);
    myDecksContainer.innerHTML = '<p class="text-center" style="color: var(--danger-color);">単語帳の読み込みに失敗しました</p>';
  }
}

// Create deck card
function createDeckCard(deck, isOwner = false) {
  const card = document.createElement('div');
  card.className = 'deck-card';

  const wordsCount = deck.words ? deck.words.length : 0;
  const likesCount = deck.likesCount || 0;

  card.innerHTML = `
    <div class="deck-card-header">
      <div>
        <h3 class="deck-title">${escapeHtml(deck.title)}</h3>
        ${!isOwner ? `<p class="deck-author">@${escapeHtml(deck.authorName || 'unknown')}</p>` : ''}
      </div>
      ${deck.isPublic ? '<span class="badge">公開</span>' : '<span class="badge badge-secondary">非公開</span>'}
    </div>
    ${deck.description ? `<p class="deck-description">${escapeHtml(deck.description)}</p>` : ''}
    <div class="deck-meta">
      <span>${wordsCount} 単語</span>
      <span>❤️ ${likesCount}</span>
    </div>
    ${isOwner ? `
      <div class="deck-actions">
        <button class="btn btn-sm btn-secondary edit-deck-btn" data-deck-id="${deck.id}">編集</button>
        <button class="btn btn-sm delete-deck-btn" data-deck-id="${deck.id}">削除</button>
      </div>
    ` : ''}
  `;

  // Click to view details
  card.addEventListener('click', (e) => {
    if (!e.target.closest('.edit-deck-btn') && !e.target.closest('.delete-deck-btn')) {
      openDeckDetailModal(deck);
    }
  });

  // Edit button
  if (isOwner) {
    const editBtn = card.querySelector('.edit-deck-btn');
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      editDeck(deck);
    });

    // Delete button
    const deleteBtn = card.querySelector('.delete-deck-btn');
    deleteBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (confirm('本当にこの単語帳を削除しますか?')) {
        await deleteDeck(deck.id);
      }
    });
  }

  return card;
}

// Open deck modal
function openDeckModal(deck = null) {
  const modalTitle = document.getElementById('deck-modal-title');

  if (deck) {
    modalTitle.textContent = '単語帳を編集';
    deckTitle.value = deck.title;
    deckDescription.value = deck.description || '';
    deckPublic.checked = deck.isPublic;
    currentDeckId = deck.id;

    // Load words
    wordsList.innerHTML = '';
    if (deck.words && deck.words.length > 0) {
      deck.words.forEach(word => {
        addWordInput(word.term, word.definition);
      });
    } else {
      addWordInput();
    }
  } else {
    modalTitle.textContent = '単語帳を作成';
    deckForm.reset();
    wordsList.innerHTML = '';
    addWordInput();
    currentDeckId = null;
  }

  deckModal.classList.remove('hidden');
}

// Edit deck
function editDeck(deck) {
  openDeckModal(deck);
}

// Delete deck
async function deleteDeck(deckId) {
  try {
    await deleteDoc(doc(db, getDecksPath(currentUser.uid), deckId));
    showToast('単語帳を削除しました', 'success');
    await loadMyDecks();
    updateProfileStats();
  } catch (error) {
    console.error('Failed to delete deck:', error);
    showToast('削除に失敗しました', 'error');
  }
}

// Add word input
function addWordInput(term = '', definition = '') {
  const wordItem = document.createElement('div');
  wordItem.className = 'word-item';
  wordItem.innerHTML = `
    <div class="word-input-group">
      <input type="text" placeholder="単語" value="${escapeHtml(term)}" class="word-term" required>
      <input type="text" placeholder="意味" value="${escapeHtml(definition)}" class="word-definition" required>
      <button type="button" class="remove-word-btn">削除</button>
    </div>
  `;

  wordItem.querySelector('.remove-word-btn').addEventListener('click', () => {
    if (wordsList.children.length > 1) {
      wordItem.remove();
    } else {
      showToast('最低1つの単語が必要です', 'error');
    }
  });

  wordsList.appendChild(wordItem);
}

// Save deck
async function saveDeck() {
  const title = deckTitle.value.trim();
  const description = deckDescription.value.trim();
  const isPublic = deckPublic.checked;

  // Get words
  const words = [];
  const wordItems = wordsList.querySelectorAll('.word-item');

  for (const item of wordItems) {
    const term = item.querySelector('.word-term').value.trim();
    const definition = item.querySelector('.word-definition').value.trim();

    if (term && definition) {
      words.push({ term, definition });
    }
  }

  if (words.length === 0) {
    showToast('最低1つの単語を追加してください', 'error');
    return;
  }

  try {
    // Get user profile for author name
    const userDoc = await getDoc(doc(db, getUserPath(currentUser.uid)));
    const userData = userDoc.data();
    const authorName = userData?.username || 'unknown';

    const deckData = {
      title,
      description,
      isPublic,
      words,
      authorId: currentUser.uid,
      authorName,
      likesCount: 0,
      updatedAt: serverTimestamp()
    };

    if (currentDeckId) {
      // Update existing deck
      await updateDoc(doc(db, getDecksPath(currentUser.uid), currentDeckId), deckData);
      showToast('単語帳を更新しました', 'success');
    } else {
      // Create new deck
      deckData.createdAt = serverTimestamp();
      await addDoc(collection(db, getDecksPath(currentUser.uid)), deckData);
      showToast('単語帳を作成しました', 'success');
    }

    closeAllModals();
    await loadMyDecks();
    await loadFeed();
    updateProfileStats();
  } catch (error) {
    console.error('Failed to save deck:', error);
    showToast('保存に失敗しました: ' + error.message, 'error');
  }
}

// Open deck detail modal
async function openDeckDetailModal(deck) {
  document.getElementById('detail-deck-title').textContent = deck.title;
  document.getElementById('detail-author').textContent = '@' + (deck.authorName || 'unknown');
  document.getElementById('detail-description').textContent = deck.description || '説明なし';

  // Display words
  const detailWords = document.getElementById('detail-words');
  detailWords.innerHTML = '';

  if (deck.words && deck.words.length > 0) {
    deck.words.forEach(word => {
      const wordItem = document.createElement('div');
      wordItem.className = 'word-display-item';
      wordItem.innerHTML = `
        <div class="word-term">${escapeHtml(word.term)}</div>
        <div class="word-definition">${escapeHtml(word.definition)}</div>
      `;
      detailWords.appendChild(wordItem);
    });
  } else {
    detailWords.innerHTML = '<p style="color: var(--text-secondary);">単語がありません</p>';
  }

  // Like button
  const likeBtn = document.getElementById('like-btn');
  const likeCount = document.getElementById('like-count');
  likeCount.textContent = deck.likesCount || 0;

  // Follow button (hide if own deck)
  const followBtn = document.getElementById('follow-author-btn');
  if (deck.userId === currentUser.uid) {
    followBtn.classList.add('hidden');
  } else {
    followBtn.classList.remove('hidden');
  }

  // Load comments
  await loadComments(deck);

  // Comment form
  const commentForm = document.getElementById('comment-form');
  commentForm.onsubmit = async (e) => {
    e.preventDefault();
    await postComment(deck);
  };

  // Like button click
  likeBtn.onclick = async () => {
    await toggleLike(deck);
  };

  deckDetailModal.classList.remove('hidden');
}

// Load comments
async function loadComments(deck) {
  const commentsList = document.getElementById('comments-list');
  commentsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">コメントを読み込み中...</p>';

  try {
    const commentsPath = `${getUserPath(deck.userId)}/decks/${deck.id}/comments`;
    const q = query(collection(db, commentsPath), orderBy('createdAt', 'desc'), limit(20));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      commentsList.innerHTML = '<p style="color: var(--text-secondary); font-size: 14px;">まだコメントがありません</p>';
      return;
    }

    commentsList.innerHTML = '';
    snapshot.forEach((commentDoc) => {
      const comment = commentDoc.data();
      const commentItem = document.createElement('div');
      commentItem.className = 'comment-item';

      const timeAgo = comment.createdAt ? getTimeAgo(comment.createdAt.toDate()) : 'たった今';

      commentItem.innerHTML = `
        <div class="comment-author">@${escapeHtml(comment.authorName || 'unknown')}</div>
        <div class="comment-text">${escapeHtml(comment.text)}</div>
        <div class="comment-time">${timeAgo}</div>
      `;
      commentsList.appendChild(commentItem);
    });
  } catch (error) {
    console.error('Failed to load comments:', error);
    commentsList.innerHTML = '<p style="color: var(--danger-color); font-size: 14px;">コメントの読み込みに失敗しました</p>';
  }
}

// Post comment
async function postComment(deck) {
  const commentInput = document.getElementById('comment-input');
  const text = commentInput.value.trim();

  if (!text) return;

  try {
    const userDoc = await getDoc(doc(db, getUserPath(currentUser.uid)));
    const userData = userDoc.data();
    const authorName = userData?.username || 'unknown';

    const commentsPath = `${getUserPath(deck.userId)}/decks/${deck.id}/comments`;
    await addDoc(collection(db, commentsPath), {
      text,
      authorId: currentUser.uid,
      authorName,
      createdAt: serverTimestamp()
    });

    commentInput.value = '';
    showToast('コメントを投稿しました', 'success');
    await loadComments(deck);
  } catch (error) {
    console.error('Failed to post comment:', error);
    showToast('コメントの投稿に失敗しました', 'error');
  }
}

// Toggle like
async function toggleLike(deck) {
  try {
    const deckRef = doc(db, getUserPath(deck.userId), 'decks', deck.id);
    const likesPath = `${getUserPath(deck.userId)}/decks/${deck.id}/likes`;
    const likeDoc = doc(db, likesPath, currentUser.uid);

    const likeSnapshot = await getDoc(likeDoc);

    if (likeSnapshot.exists()) {
      // Unlike
      await deleteDoc(likeDoc);
      await updateDoc(deckRef, {
        likesCount: increment(-1)
      });
      showToast('いいねを取り消しました', 'success');
    } else {
      // Like
      await setDoc(likeDoc, {
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });
      await updateDoc(deckRef, {
        likesCount: increment(1)
      });
      showToast('いいねしました', 'success');
    }

    // Update like count display
    const updatedDeck = await getDoc(deckRef);
    const likeCount = document.getElementById('like-count');
    likeCount.textContent = updatedDeck.data().likesCount || 0;

    // Reload feed
    await loadFeed();
  } catch (error) {
    console.error('Failed to toggle like:', error);
    showToast('いいねの処理に失敗しました', 'error');
  }
}

// AI Suggest Words using Firebase AI Logic SDK
async function suggestWordsWithAI() {
  const title = deckTitle.value.trim();

  if (!title) {
    showToast('単語帳のタイトルを入力してください', 'error');
    return;
  }

  aiSuggestBtn.disabled = true;
  aiSuggestBtn.textContent = 'AI生成中...';

  try {
    // Use Gemini API directly via fetch since Firebase AI Logic SDK requires module setup
    const apiKey = firebaseConfig.apiKey;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `「${title}」というテーマで学習に役立つ単語を5つ提案してください。各単語について、単語と簡潔な定義を日本語で提供してください。以下のJSON形式で返してください：
[
  {"term": "単語1", "definition": "定義1"},
  {"term": "単語2", "definition": "定義2"}
]`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error('AI API request failed');
    }

    const data = await response.json();
    const textResponse = data.candidates[0].content.parts[0].text;

    // Extract JSON from response
    const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const suggestedWords = JSON.parse(jsonMatch[0]);

    // Clear existing words and add suggested ones
    wordsList.innerHTML = '';
    suggestedWords.forEach(word => {
      addWordInput(word.term, word.definition);
    });

    showToast('AI推奨の単語を追加しました', 'success');
  } catch (error) {
    console.error('AI suggestion failed:', error);
    showToast('AI推奨に失敗しました。手動で単語を追加してください。', 'error');

    // Add at least one empty word input
    if (wordsList.children.length === 0) {
      addWordInput();
    }
  } finally {
    aiSuggestBtn.disabled = false;
    aiSuggestBtn.textContent = 'AI推奨';
  }
}

// Close all modals
function closeAllModals() {
  deckModal.classList.add('hidden');
  deckDetailModal.classList.add('hidden');
}

// Toast notification
function showToast(message, type = 'info') {
  toast.textContent = message;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');

  setTimeout(() => {
    toast.classList.add('hidden');
  }, 3000);
}

// Auth error
function showAuthError(message) {
  authError.textContent = message;
  authError.classList.remove('hidden');
}

// Get error message
function getErrorMessage(error) {
  const errorMessages = {
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/invalid-email': 'メールアドレスの形式が正しくありません',
    'auth/weak-password': 'パスワードは6文字以上にしてください',
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが間違っています',
    'auth/invalid-credential': 'メールアドレスまたはパスワードが間違っています'
  };

  return errorMessages[error.code] || 'エラーが発生しました: ' + error.message;
}

// Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Get time ago
function getTimeAgo(date) {
  const seconds = Math.floor((new Date() - date) / 1000);

  const intervals = {
    年: 31536000,
    ヶ月: 2592000,
    週間: 604800,
    日: 86400,
    時間: 3600,
    分: 60
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval}${unit}前`;
    }
  }

  return 'たった今';
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
