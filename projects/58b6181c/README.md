# タスク管理アプリ

シンプルで洗練されたデザインのタスク管理アプリケーション。ビジネスシーンに適した機能性とユーザビリティを両立させています。

## 特徴

- **シンプルで洗練されたデザイン**: ビジネスシーンに適した、余分な装飾のないプロフェッショナルなUI
- **ユーザー認証**: Firebase Authenticationによる安全なユーザー管理
- **リアルタイム同期**: Firestoreによるタスクのリアルタイム更新
- **タスク管理機能**: 追加、編集、完了、削除の基本機能を完備
- **優先度設定**: 重要なタスクを視覚的に強調表示
- **フィルタリング**: すべて、未完了、完了でタスクを絞り込み
- **レスポンシブデザイン**: デスクトップからモバイルまで対応

## 技術スタック

- **フロントエンド**:
  - React 18 (CDN経由)
  - Pure HTML/CSS/JavaScript
  - Babel Standalone (JSX変換)

- **バックエンド**:
  - Firebase Authentication
  - Cloud Firestore

- **デザイン**:
  - カスタムCSS
  - CSS変数によるテーマ管理
  - モダンなビジネスカラーパレット

## プロジェクト構成

```
/
├── index.html              # メインHTMLファイル
├── styles/
│   └── main.css           # メインスタイルシート
├── scripts/
│   ├── firebase-config.js # Firebase設定ファイル
│   └── app.js             # Reactアプリケーション
├── assets/                # 画像などの静的アセット
└── README.md              # このファイル
```

## セットアップ

### 必要な環境

- モダンなWebブラウザ（Chrome, Firefox, Safari, Edge）
- インターネット接続（CDNからライブラリを取得するため）

### インストール

1. このプロジェクトをクローンまたはダウンロード
2. Webサーバーで`index.html`を公開
3. ブラウザでアクセス

### Firebase設定

プロジェクトは既に設定済みのFirebase設定を使用していますが、独自のFirebaseプロジェクトを使用する場合は、`scripts/firebase-config.js`の設定を変更してください。

```javascript
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
};
```

### Firestoreセキュリティルール

Firestoreコンソールで以下のセキュリティルールを設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ccbotDev/{username}/apps/{projectId}/tasks/{taskId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 使い方

### 新規登録とログイン

1. アプリにアクセスすると、認証画面が表示されます
2. 「新規登録」タブでメールアドレスとパスワード（6文字以上）を入力して登録
3. または「ログイン」タブで既存のアカウントでログイン

### タスクの管理

#### タスクの追加
1. 上部の入力フォームにタスクのタイトルを入力
2. 重要なタスクの場合は「重要」チェックボックスをオン
3. 「追加」ボタンをクリック

#### タスクの完了
- タスクの左側にあるチェックボックスをクリック
- 完了したタスクは半透明になり、リストの下部に移動

#### タスクの編集
1. タスクの編集ボタン（✏️）をクリック
2. タイトルを編集
3. 「保存」ボタンをクリック

#### タスクの削除
1. タスクの削除ボタン（🗑️）をクリック
2. 確認ダイアログで「OK」をクリック

### フィルタリング

- **すべて**: すべてのタスクを表示
- **未完了**: 完了していないタスクのみ表示
- **完了**: 完了済みのタスクのみ表示

各フィルタボタンには該当するタスクの件数が表示されます。

## デザインガイドライン

### カラーパレット

- **プライマリカラー**: #2563eb（青）
- **成功**: #10b981（緑）
- **警告**: #f59e0b（オレンジ）
- **危険**: #ef4444（赤）
- **グレースケール**: #f9fafb 〜 #111827

### タイポグラフィ

- **フォント**: システムフォント（Noto Sans JP含む）
- **ベースサイズ**: 16px
- **行高**: 1.6

### スペーシング

- XS: 0.25rem (4px)
- SM: 0.5rem (8px)
- MD: 1rem (16px)
- LG: 1.5rem (24px)
- XL: 2rem (32px)
- 2XL: 3rem (48px)

## セキュリティ

- Firebase Authenticationによるユーザー認証
- Firestoreセキュリティルールによるデータ保護
- ユーザーごとに分離されたデータストレージ
- パスワードは最低6文字以上

## ブラウザサポート

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## ライセンス

このプロジェクトは教育目的で作成されています。

## 作成者

Nekokazu (@nekokazu)

## プロジェクト情報

- **プロジェクトID**: 58b6181c
- **プロジェクトURL**: https://vps.nekodigi.com/ccbot/projects/58b6181c
- **チャンネル**: general

## バージョン履歴

### v1.0.0 (2025-10-18)
- 初回リリース
- ユーザー認証機能
- タスクのCRUD操作
- タスクフィルタリング
- 優先度設定
- レスポンシブデザイン
