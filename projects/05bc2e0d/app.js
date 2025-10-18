// Firebase SDKのインポート（CDN版・モジュラーAPI v12.4.0）
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy
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

// プロジェクトIDとユーザー名（指定されたパスに従う）
const projectId = '05bc2e0d';
const userName = 'nekokazu';
const collectionPath = `ccbotDev/${userName}/apps/${projectId}/data`;

// DOM要素の取得
const dataInput = document.getElementById('dataInput');
const saveButton = document.getElementById('saveButton');
const dataList = document.getElementById('dataList');
const connectionStatus = document.getElementById('connectionStatus');
const swStatus = document.getElementById('swStatus');

// Service Workerの登録
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('./sw.js')
    .then((registration) => {
      console.log('[Service Worker] 登録成功:', registration.scope);
      updateSWStatus('登録済み', true);

      // 更新の確認
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        console.log('[Service Worker] 更新が見つかりました');

        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // 新しいService Workerが利用可能
            if (confirm('新しいバージョンが利用可能です。更新しますか?')) {
              newWorker.postMessage({ type: 'SKIP_WAITING' });
              window.location.reload();
            }
          }
        });
      });
    })
    .catch((error) => {
      console.error('[Service Worker] 登録失敗:', error);
      updateSWStatus('未登録', false);
    });
} else {
  console.warn('[Service Worker] Service Workerはサポートされていません');
  updateSWStatus('未対応', false);
}

// オンライン/オフライン状態の監視
window.addEventListener('online', () => updateConnectionStatus(true));
window.addEventListener('offline', () => updateConnectionStatus(false));

// 初期状態の設定
updateConnectionStatus(navigator.onLine);

// 接続状態の更新
function updateConnectionStatus(isOnline) {
  const statusElement = connectionStatus;
  if (isOnline) {
    statusElement.textContent = 'オンライン';
    statusElement.classList.add('online');
    statusElement.classList.remove('offline');
  } else {
    statusElement.textContent = 'オフライン';
    statusElement.classList.add('offline');
    statusElement.classList.remove('online');
  }
}

// Service Worker状態の更新
function updateSWStatus(status, isActive) {
  const statusElement = swStatus;
  statusElement.textContent = status;
  if (isActive) {
    statusElement.classList.add('active');
  } else {
    statusElement.classList.remove('active');
  }
}

// データの保存
async function saveData() {
  const text = dataInput.value.trim();

  if (!text) {
    alert('データを入力してください');
    return;
  }

  try {
    saveButton.classList.add('loading');
    saveButton.textContent = '保存中...';

    const docRef = await addDoc(collection(db, collectionPath), {
      text: text,
      createdAt: serverTimestamp()
    });

    console.log('[Firestore] データ保存成功:', docRef.id);
    dataInput.value = '';
    await loadData();
  } catch (error) {
    console.error('[Firestore] データ保存エラー:', error);
    alert('データの保存に失敗しました。オンライン状態を確認してください。');
  } finally {
    saveButton.classList.remove('loading');
    saveButton.textContent = '保存';
  }
}

// データの読み込み
async function loadData() {
  try {
    const q = query(
      collection(db, collectionPath),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      dataList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-text">保存されたデータはありません</div>
        </div>
      `;
      return;
    }

    dataList.innerHTML = '';

    querySnapshot.forEach((docSnapshot) => {
      const data = docSnapshot.data();
      const dataId = docSnapshot.id;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'data-item';

      const textSpan = document.createElement('span');
      textSpan.className = 'data-item-text';
      textSpan.textContent = data.text;

      const metaSpan = document.createElement('span');
      metaSpan.className = 'data-item-meta';
      if (data.createdAt) {
        const date = data.createdAt.toDate();
        metaSpan.textContent = formatDate(date);
      } else {
        metaSpan.textContent = '保存中...';
      }

      const deleteButton = document.createElement('button');
      deleteButton.className = 'button button-danger';
      deleteButton.textContent = '削除';
      deleteButton.onclick = () => deleteData(dataId);

      itemDiv.appendChild(textSpan);
      itemDiv.appendChild(metaSpan);
      itemDiv.appendChild(deleteButton);

      dataList.appendChild(itemDiv);
    });
  } catch (error) {
    console.error('[Firestore] データ読み込みエラー:', error);
    dataList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-text">データの読み込みに失敗しました</div>
      </div>
    `;
  }
}

// データの削除
async function deleteData(dataId) {
  if (!confirm('このデータを削除してもよろしいですか?')) {
    return;
  }

  try {
    await deleteDoc(doc(db, collectionPath, dataId));
    console.log('[Firestore] データ削除成功:', dataId);
    await loadData();
  } catch (error) {
    console.error('[Firestore] データ削除エラー:', error);
    alert('データの削除に失敗しました');
  }
}

// 日付のフォーマット
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}/${month}/${day} ${hours}:${minutes}`;
}

// イベントリスナーの設定
saveButton.addEventListener('click', saveData);

dataInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    saveData();
  }
});

// 初期データの読み込み
loadData();
