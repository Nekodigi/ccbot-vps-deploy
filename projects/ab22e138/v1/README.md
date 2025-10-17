# タスク管理 PWA

シンプルで洗練されたタスク管理PWAアプリケーション。黒背景×赤アクセントのビジネス向けデザインを採用し、Firebase認証とFirestoreでデータを管理します。

## 機能

### 実装済み機能

- **ユーザー認証**
  - Firebase Authenticationによるメール/パスワード認証
  - ログイン/ログアウト機能
  - 新規ユーザー登録機能

- **タスク管理**
  - タスクの追加、編集、削除
  - タスクの完了/未完了切り替え
  - 期限設定機能（日時指定）

- **フィルタリング機能**
  - すべてのタスク
  - 未完了タスク
  - 完了タスク

- **ソート機能**
  - 作成日時（新しい順/古い順）
  - 期限（近い順/遠い順）

- **通知機能**
  - 期限が24時間以内のタスクの通知
  - ブラウザ通知API使用

- **PWA対応**
  - オフライン動作
  - ホーム画面へのインストール可能
  - Service Workerによるキャッシュ

- **レスポンシブデザイン**
  - PC、タブレット、スマートフォン対応

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript（フレームワーク不使用）
- **バックエンド**: Firebase (Firestore, Authentication)
- **PWA**: Service Worker, Web App Manifest
- **デザイン**: カスタムCSS（黒背景 + 赤アクセント）

## セットアップ

### 1. Firebase設定

このアプリは既にFirebase設定済みですが、メール/パスワード認証を有効化する必要があります：

1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. プロジェクト `sandbox-35d1d` を選択
3. **Authentication** → **Sign-in method** に移動
4. **メール/パスワード** を有効化

### 2. Firestore セキュリティルール

Firestoreのセキュリティルールは以下のように設定してください：

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /ccbotDev/nekokazu/apps/ab22e138/tasks/{taskId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
  }
}
```

### 3. アプリの起動

1. ブラウザで `https://vps.nekodigi.com/ccbot/projects/ab22e138/v1/` にアクセス
2. 新規登録またはログイン
3. タスクを追加して管理開始

## 使い方

### タスクの追加

1. 上部のテキストボックスにタスク名を入力
2. （オプション）期限を設定
3. 「追加」ボタンをクリック

### タスクの編集

1. 各タスクの「編集」ボタンをクリック
2. モーダルで内容を変更
3. 「保存」ボタンをクリック

### タスクの完了

- タスクの左側のチェックボックスをクリック

### タスクの削除

1. 各タスクの「削除」ボタンをクリック
2. 確認ダイアログで「OK」を選択

### フィルタリング

- 画面中央のボタン（すべて/未完了/完了）で表示を切り替え

### ソート

- 右側のドロップダウンメニューで並び順を変更

## デザイン仕様

### カラーパレット

- **背景**: `#000000` (黒)
- **プライマリカラー**: `#dc2626` (赤)
- **カード背景**: `#111827` (ダークグレー)
- **テキスト**: `#ffffff` (白)
- **テキスト（淡色）**: `#9ca3af` (グレー)

### タイポグラフィ

- フォント: Helvetica Neue, Segoe UI, Hiragino Sans
- 日本のビジネスシーンに適した洗練されたフォント選択

## ファイル構成

```
v1/
├── index.html          # メインHTMLファイル
├── styles.css          # スタイルシート
├── app.js             # アプリケーションロジック
├── manifest.json      # PWA マニフェスト
├── sw.js              # Service Worker
├── icon-192.png       # アプリアイコン (192x192)
├── icon-512.png       # アプリアイコン (512x512)
└── README.md          # このファイル
```

## ブラウザ対応

- Chrome/Edge: 最新版
- Firefox: 最新版
- Safari: 最新版（iOS含む）

## 注意事項

1. **Firebase認証の設定**: Firebaseコンソールでメール/パスワード認証を有効化する必要があります
2. **通知機能**: ブラウザの通知許可が必要です
3. **オフライン機能**: 初回アクセス後、Service Workerがインストールされます
4. **データ保存**: Firestoreパス `/ccbotDev/nekokazu/apps/ab22e138/tasks` にユーザーごとのタスクが保存されます

## ライセンス

このプロジェクトは教育目的で作成されました。

## クレジット

- 開発者: Nekokazu (@nekokazu)
- プロジェクトURL: https://vps.nekodigi.com/ccbot/projects/ab22e138/v1/
- 作成日: 2025年10月17日
