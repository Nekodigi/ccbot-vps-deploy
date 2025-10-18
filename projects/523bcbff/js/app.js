// メインアプリケーション
import { db } from './firebase-init.js';
import {
    collection,
    addDoc,
    getDocs,
    query,
    orderBy,
    serverTimestamp,
    deleteDoc,
    doc
} from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js';

// ユーザー名とプロジェクトID（Firestoreのアクセス権限に必要）
const USERNAME = 'nekokazu';
const PROJECT_ID = '523bcbff';
const COLLECTION_PATH = `ccbotDev/${USERNAME}/apps/${PROJECT_ID}/data`;

// DOM要素の取得
const elements = {
    menuBtn: document.getElementById('menuBtn'),
    addDataBtn: document.getElementById('addDataBtn'),
    dataModal: document.getElementById('dataModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    cancelBtn: document.getElementById('cancelBtn'),
    dataForm: document.getElementById('dataForm'),
    dataList: document.getElementById('dataList'),
    onlineStatus: document.getElementById('onlineStatus'),
    viewTasksBtn: document.getElementById('viewTasksBtn')
};

// 初期化
document.addEventListener('DOMContentLoaded', () => {
    console.log('App initialized');

    // イベントリスナーの設定
    setupEventListeners();

    // ネットワークステータスの監視
    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // データの読み込み
    loadData();
});

// イベントリスナーの設定
function setupEventListeners() {
    // モーダル関連
    elements.addDataBtn.addEventListener('click', openModal);
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.cancelBtn.addEventListener('click', closeModal);
    elements.dataModal.addEventListener('click', (e) => {
        if (e.target === elements.dataModal) {
            closeModal();
        }
    });

    // フォーム送信
    elements.dataForm.addEventListener('submit', handleFormSubmit);

    // メニューボタン（将来の拡張用）
    elements.menuBtn.addEventListener('click', () => {
        console.log('Menu button clicked');
        alert('メニュー機能は準備中です');
    });

    // タスク表示ボタン
    if (elements.viewTasksBtn) {
        elements.viewTasksBtn.addEventListener('click', () => {
            console.log('View tasks button clicked');
            alert('タスク詳細機能は準備中です');
        });
    }

    // Escキーでモーダルを閉じる
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.dataModal.classList.contains('active')) {
            closeModal();
        }
    });
}

// モーダルを開く
function openModal() {
    elements.dataModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('dataTitle').focus();
}

// モーダルを閉じる
function closeModal() {
    elements.dataModal.classList.remove('active');
    document.body.style.overflow = '';
    elements.dataForm.reset();
}

// フォーム送信処理
async function handleFormSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('dataTitle').value.trim();
    const content = document.getElementById('dataContent').value.trim();

    if (!title || !content) {
        alert('すべての項目を入力してください');
        return;
    }

    try {
        // Firestoreにデータを追加
        await addDataToFirestore(title, content);

        // モーダルを閉じてデータをリロード
        closeModal();
        await loadData();

        // 成功メッセージ
        showNotification('データを保存しました', 'success');
    } catch (error) {
        console.error('Error saving data:', error);
        showNotification('データの保存に失敗しました', 'error');
    }
}

// Firestoreにデータを追加
async function addDataToFirestore(title, content) {
    try {
        const dataRef = collection(db, COLLECTION_PATH);
        const docRef = await addDoc(dataRef, {
            title: title,
            content: content,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
        console.log('Document written with ID:', docRef.id);
        return docRef;
    } catch (error) {
        console.error('Error adding document:', error);
        throw error;
    }
}

// Firestoreからデータを読み込み
async function loadData() {
    try {
        const dataRef = collection(db, COLLECTION_PATH);
        const q = query(dataRef, orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            elements.dataList.innerHTML = `
                <div class="empty-state">
                    <p>まだデータがありません</p>
                    <p style="font-size: 0.875rem; color: var(--color-text-light); margin-top: 0.5rem;">
                        「データを追加」ボタンから新しいデータを作成できます
                    </p>
                </div>
            `;
            return;
        }

        // データリストの構築
        const dataItems = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            dataItems.push(createDataItemHTML(doc.id, data));
        });

        elements.dataList.innerHTML = dataItems.join('');

        // 削除ボタンのイベントリスナーを設定
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', handleDelete);
        });

    } catch (error) {
        console.error('Error loading data:', error);
        elements.dataList.innerHTML = `
            <div class="empty-state">
                <p>データの読み込みに失敗しました</p>
                <p style="font-size: 0.875rem; color: var(--color-text-light); margin-top: 0.5rem;">
                    ${error.message}
                </p>
            </div>
        `;
    }
}

// データアイテムのHTML生成
function createDataItemHTML(id, data) {
    const date = data.createdAt ? formatDate(data.createdAt.toDate()) : '日付不明';

    return `
        <div class="data-item" data-id="${id}">
            <div class="data-item-header">
                <h3 class="data-item-title">${escapeHTML(data.title)}</h3>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="data-item-date">${date}</span>
                    <button class="delete-btn" data-id="${id}" aria-label="削除" style="
                        background: none;
                        border: none;
                        color: var(--color-accent);
                        cursor: pointer;
                        font-size: 1.25rem;
                        padding: 0.25rem;
                        line-height: 1;
                    ">&times;</button>
                </div>
            </div>
            <p class="data-item-content">${escapeHTML(data.content)}</p>
        </div>
    `;
}

// データ削除処理
async function handleDelete(e) {
    const id = e.target.dataset.id;

    if (!confirm('このデータを削除しますか?')) {
        return;
    }

    try {
        const docRef = doc(db, COLLECTION_PATH, id);
        await deleteDoc(docRef);
        console.log('Document deleted:', id);

        await loadData();
        showNotification('データを削除しました', 'success');
    } catch (error) {
        console.error('Error deleting document:', error);
        showNotification('データの削除に失敗しました', 'error');
    }
}

// 日付フォーマット
function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// HTMLエスケープ
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// オンラインステータスの更新
function updateOnlineStatus() {
    const statusDot = elements.onlineStatus.querySelector('.status-dot');
    const statusText = elements.onlineStatus.querySelector('.status-text');

    if (navigator.onLine) {
        statusDot.classList.add('online');
        statusText.textContent = 'オンライン';
    } else {
        statusDot.classList.remove('online');
        statusText.textContent = 'オフライン';
    }
}

// 通知表示
function showNotification(message, type = 'info') {
    // シンプルな通知実装
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        padding: 1rem 1.5rem;
        background-color: ${type === 'error' ? 'var(--color-accent)' : 'var(--color-success)'};
        color: white;
        border-radius: var(--border-radius);
        box-shadow: var(--shadow-lg);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// アニメーションスタイルの追加
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }

    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;
document.head.appendChild(style);
