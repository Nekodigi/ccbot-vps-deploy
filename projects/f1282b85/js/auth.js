// 認証状態の確認とリダイレクト
async function checkAuth(requireAuth = true) {
  return new Promise((resolve) => {
    onAuthStateChanged((user) => {
      if (requireAuth && !user) {
        // 認証が必要なページで未認証の場合
        window.location.href = './login.html';
      } else if (!requireAuth && user) {
        // ログインページで認証済みの場合
        window.location.href = './index.html';
      } else {
        resolve(user);
      }
    });
  });
}

// サインアップ
async function signUp(email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // ユーザードキュメントの作成
    const userDocRef = db.doc(`${getUserBasePath(user.uid)}/profile/data`);
    await userDocRef.set({
      email: user.email,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      purchaseHistory: []
    });

    return { success: true, user };
  } catch (error) {
    console.error('SignUp error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ログイン
async function signIn(email, password) {
  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error('SignIn error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// ログアウト
async function signOut() {
  try {
    await auth.signOut();
    window.location.href = './login.html';
    return { success: true };
  } catch (error) {
    console.error('SignOut error:', error);
    return { success: false, error: 'ログアウトに失敗しました' };
  }
}

// 現在のユーザーを取得
function getCurrentUser() {
  return auth.currentUser;
}

// エラーメッセージの取得
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
    'auth/invalid-email': '無効なメールアドレスです',
    'auth/operation-not-allowed': 'この操作は許可されていません',
    'auth/weak-password': 'パスワードが弱すぎます。6文字以上にしてください',
    'auth/user-disabled': 'このアカウントは無効化されています',
    'auth/user-not-found': 'ユーザーが見つかりません',
    'auth/wrong-password': 'パスワードが正しくありません',
    'auth/too-many-requests': '試行回数が多すぎます。しばらくしてから再度お試しください',
    'auth/network-request-failed': 'ネットワークエラーが発生しました'
  };

  return errorMessages[errorCode] || '認証エラーが発生しました';
}

// ユーザープロフィールの取得
async function getUserProfile(userId) {
  try {
    const docRef = db.doc(`${getUserBasePath(userId)}/profile/data`);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      return { success: true, data: docSnap.data() };
    } else {
      return { success: false, error: 'プロフィールが見つかりません' };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'プロフィールの取得に失敗しました' };
  }
}

// ユーザープロフィールの更新
async function updateUserProfile(userId, data) {
  try {
    const docRef = db.doc(`${getUserBasePath(userId)}/profile/data`);
    await docRef.update(data);
    return { success: true };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'プロフィールの更新に失敗しました' };
  }
}

// エクスポート
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    checkAuth,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    getUserProfile,
    updateUserProfile
  };
}
