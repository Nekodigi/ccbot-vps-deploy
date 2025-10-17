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

// グローバル変数
let app;
let auth;
let db;
let messaging;
let aiSession;

// Firebase初期化
async function initializeFirebase() {
  try {
    // Firebase Appを初期化
    app = firebase.initializeApp(firebaseConfig);

    // Firebase Authを初期化
    auth = firebase.auth();

    // Firestoreを初期化
    db = firebase.firestore();

    // Firebase Cloud Messagingを初期化 (サポートされている場合)
    if (firebase.messaging.isSupported()) {
      messaging = firebase.messaging();
    }

    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return false;
  }
}

// 認証状態の監視
function onAuthStateChanged(callback) {
  return auth.onAuthStateChanged(callback);
}

// Firestoreパス取得 (ユーザー固有のパス)
function getUserBasePath(userId) {
  return `ccbotDev/nekokazu/apps/f1282b85/users/${userId}`;
}

function getEventsBasePath() {
  return 'ccbotDev/nekokazu/apps/f1282b85/events';
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    initializeFirebase,
    onAuthStateChanged,
    getUserBasePath,
    getEventsBasePath
  };
}
