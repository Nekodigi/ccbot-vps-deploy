// Firebase v12.4.0 モジュラーSDKのインポート
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    query,
    orderBy,
    serverTimestamp
} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

// Firebase設定
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};

// Firebaseの初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Firestoreコレクションパス（アクセス権限内）
const COLLECTION_PATH = 'ccbotDev/nekokazu/apps/977fb8bc';

// DOM要素の取得
const contentList = document.getElementById('contentList');
const emptyState = document.getElementById('emptyState');
const loadingState = document.getElementById('loadingState');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const addBtn = document.getElementById('addBtn');
const addModal = document.getElementById('addModal');
const closeAddModal = document.getElementById('closeAddModal');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addContentForm = document.getElementById('addContentForm');
const detailModal = document.getElementById('detailModal');
const closeDetailModal = document.getElementById('closeDetailModal');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const deleteBtn = document.getElementById('deleteBtn');

// 状態管理
let allContents = [];
let currentContentId = null;

// ============================
// データ操作関数
// ============================

/**
 * すべてのコンテンツを取得
 */
async function loadContents() {
    try {
        showLoading(true);
        const q = query(collection(db, COLLECTION_PATH), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        allContents = [];
        querySnapshot.forEach((doc) => {
            allContents.push({
                id: doc.id,
                ...doc.data()
            });
        });

        displayContents(allContents);
    } catch (error) {
        console.error('コンテンツの読み込みエラー:', error);
        alert('コンテンツの読み込みに失敗しました。');
    } finally {
        showLoading(false);
    }
}

/**
 * コンテンツを追加
 */
async function addContent(title, description, priority) {
    try {
        showLoading(true);
        await addDoc(collection(db, COLLECTION_PATH), {
            title,
            description,
            priority,
            createdAt: serverTimestamp()
        });

        await loadContents();
        closeModal(addModal);
        addContentForm.reset();
    } catch (error) {
        console.error('コンテンツの追加エラー:', error);
        alert('コンテンツの追加に失敗しました。');
    } finally {
        showLoading(false);
    }
}

/**
 * コンテンツを削除
 */
async function deleteContent(id) {
    if (!confirm('このコンテンツを削除してもよろしいですか?')) {
        return;
    }

    try {
        showLoading(true);
        await deleteDoc(doc(db, COLLECTION_PATH, id));
        await loadContents();
        closeModal(detailModal);
    } catch (error) {
        console.error('コンテンツの削除エラー:', error);
        alert('コンテンツの削除に失敗しました。');
    } finally {
        showLoading(false);
    }
}

// ============================
// UI表示関数
// ============================

/**
 * コンテンツを表示
 */
function displayContents(contents) {
    contentList.innerHTML = '';

    if (contents.length === 0) {
        emptyState.style.display = 'block';
        contentList.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        contentList.style.display = 'grid';

        contents.forEach(content => {
            const item = createContentItem(content);
            contentList.appendChild(item);
        });
    }
}

/**
 * コンテンツアイテムのHTML要素を作成
 */
function createContentItem(content) {
    const item = document.createElement('div');
    item.className = 'content-item';
    item.dataset.id = content.id;

    const timestamp = content.createdAt
        ? new Date(content.createdAt.seconds * 1000).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '日付不明';

    item.innerHTML = `
        <div class="content-item-header">
            <h3 class="content-item-title">${escapeHtml(content.title)}</h3>
            <span class="priority-badge ${content.priority}">${getPriorityText(content.priority)}</span>
        </div>
        <p class="content-item-description">${escapeHtml(content.description)}</p>
        <div class="content-item-footer">
            <span>${timestamp}</span>
        </div>
    `;

    item.addEventListener('click', () => showContentDetail(content));

    return item;
}

/**
 * コンテンツ詳細を表示
 */
function showContentDetail(content) {
    currentContentId = content.id;

    document.getElementById('detailTitle').textContent = content.title;
    document.getElementById('detailDescription').textContent = content.description;

    const priorityBadge = document.getElementById('detailPriority');
    priorityBadge.className = `priority-badge ${content.priority}`;
    priorityBadge.textContent = getPriorityText(content.priority);

    const timestamp = content.createdAt
        ? new Date(content.createdAt.seconds * 1000).toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })
        : '日付不明';
    document.getElementById('detailTimestamp').textContent = `作成日時: ${timestamp}`;

    openModal(detailModal);
}

/**
 * 検索を実行
 */
function searchContents(searchTerm) {
    if (!searchTerm.trim()) {
        displayContents(allContents);
        return;
    }

    const filtered = allContents.filter(content => {
        const searchLower = searchTerm.toLowerCase();
        return content.title.toLowerCase().includes(searchLower) ||
               content.description.toLowerCase().includes(searchLower);
    });

    displayContents(filtered);
}

/**
 * ローディング状態を表示/非表示
 */
function showLoading(show) {
    loadingState.style.display = show ? 'block' : 'none';
}

/**
 * モーダルを開く
 */
function openModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * モーダルを閉じる
 */
function closeModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

// ============================
// ユーティリティ関数
// ============================

/**
 * HTMLエスケープ
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 重要度のテキストを取得
 */
function getPriorityText(priority) {
    const priorityMap = {
        'normal': '通常',
        'high': '高',
        'urgent': '緊急'
    };
    return priorityMap[priority] || '通常';
}

// ============================
// イベントリスナー
// ============================

// コンテンツ追加ボタン
addBtn.addEventListener('click', () => {
    openModal(addModal);
});

// 追加モーダルを閉じる
closeAddModal.addEventListener('click', () => {
    closeModal(addModal);
});

cancelAddBtn.addEventListener('click', () => {
    closeModal(addModal);
});

// モーダルの背景クリックで閉じる
addModal.addEventListener('click', (e) => {
    if (e.target === addModal) {
        closeModal(addModal);
    }
});

detailModal.addEventListener('click', (e) => {
    if (e.target === detailModal) {
        closeModal(detailModal);
    }
});

// コンテンツ追加フォーム送信
addContentForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('contentTitle').value.trim();
    const description = document.getElementById('contentDescription').value.trim();
    const priority = document.getElementById('contentPriority').value;

    if (title && description) {
        await addContent(title, description, priority);
    }
});

// 検索
searchBtn.addEventListener('click', () => {
    searchContents(searchInput.value);
});

searchInput.addEventListener('input', (e) => {
    searchContents(e.target.value);
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchContents(searchInput.value);
    }
});

// 詳細モーダルを閉じる
closeDetailModal.addEventListener('click', () => {
    closeModal(detailModal);
});

closeDetailBtn.addEventListener('click', () => {
    closeModal(detailModal);
});

// コンテンツ削除
deleteBtn.addEventListener('click', () => {
    if (currentContentId) {
        deleteContent(currentContentId);
    }
});

// ESCキーでモーダルを閉じる
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (addModal.classList.contains('active')) {
            closeModal(addModal);
        }
        if (detailModal.classList.contains('active')) {
            closeModal(detailModal);
        }
    }
});

// ============================
// Service Workerの登録
// ============================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(registration => {
                console.log('Service Worker登録成功:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker登録失敗:', error);
            });
    });
}

// ============================
// 初期化
// ============================
loadContents();
