# InfoHub - 情報管理アプリ

## 概要

InfoHubは、情報を簡単に管理・共有できるPWA対応のWebアプリケーションです。Firebase Authentication、Firestore、AI Logic SDK (Gemini)を活用し、オフラインでも利用可能な洗練されたビジネス向けアプリケーションです。

## 主要機能

### 1. ユーザー認証
- メールアドレスとパスワードによる新規登録・ログイン
- Firebase Authenticationを使用したセキュアな認証
- エラーハンドリングと日本語メッセージ

### 2. 情報管理
- 情報の追加、閲覧、削除
- リアルタイム更新（Firestore onSnapshot）
- 検索・フィルター機能
- ユーザーごとの独立したデータ管理

### 3. AI機能
- Firebase AI Logic SDK (Gemini)による提案機能
- タイトルからの内容提案
- 内容からのタイトル提案
- 既存情報の改善提案

### 4. 情報共有
- 共有リンクの生成
- URL経由での情報閲覧
- ワンクリックコピー機能

### 5. PWA対応
- オフライン動作
- ホーム画面へのインストール
- Service Workerによるキャッシュ戦略
- プッシュ通知対応（将来実装）

## 技術スタック

- **フロントエンド**: Pure HTML, CSS, JavaScript (ES6 Modules)
- **バックエンド**: Firebase (v10.12.0)
  - Authentication
  - Firestore Database
  - AI Logic SDK (Vertex AI)
- **PWA**: Service Worker, Web App Manifest
- **デザイン**: 赤と黒を基調としたシンプルで洗練されたUI

## セットアップ手順

### 1. Firebase認証の有効化

アプリケーションを使用する前に、Firebaseコンソールで以下の設定を行ってください：

1. [Firebase Console](https://console.firebase.google.com/)にアクセス
2. プロジェクト「sandbox-35d1d」を選択
3. **Authentication** → **Sign-in method**に移動
4. **メール/パスワード**を有効化

### 2. Firestore Rulesの確認

Firestoreのセキュリティルールで以下のパスへのアクセスが許可されていることを確認してください：

```
/ccbotDev/{username}/apps/16ffbf18/information
```

現在の設定では、ユーザーのメールアドレスから抽出したユーザー名を使用してデータを保存します。

### 3. AI Logic SDKの有効化

1. Firebase Consoleで **Vertex AI in Firebase**（AI Logic）を有効化
2. 使用するモデル：`gemini-1.5-flash`
3. APIキーと権限が正しく設定されていることを確認

## プロジェクト構造

```
16ffbf18/
├── index.html              # メインHTMLファイル
├── styles.css              # スタイルシート（赤と黒のデザイン）
├── auth.js                 # 認証モジュール
├── app.js                  # 情報管理モジュール
├── ai-support.js           # AI機能モジュール
├── share.js                # 共有機能モジュール
├── pwa-init.js             # PWA初期化スクリプト
├── service-worker.js       # Service Worker（オフライン対応）
├── manifest.json           # PWA Manifest
├── icons/                  # PWAアイコン
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── generate-icons.py       # アイコン生成スクリプト
└── README.md               # このファイル
```

## 使用方法

### 初回利用

1. アプリケーションにアクセス: https://vps.nekodigi.com/ccbot/projects/16ffbf18/
2. 「新規登録」をクリック
3. メールアドレスとパスワード（6文字以上）を入力して登録
4. 自動的にログインされ、メイン画面に遷移

### 情報の追加

1. 「新しい情報を追加」セクションでタイトルと内容を入力
2. オプション: 「AI提案を取得」ボタンでAIの提案を受ける
3. 「追加」ボタンをクリックして保存

### 情報の検索

- 検索ボックスにキーワードを入力すると、タイトルと内容から該当する情報を絞り込み

### 情報の共有

1. 各情報カードの「共有」ボタンをクリック
2. 共有リンクが生成される
3. 「コピー」ボタンでリンクをクリップボードにコピー
4. リンクを他のユーザーに送信

### PWAとしてインストール

1. ブラウザのアドレスバーまたはメニューから「ホーム画面に追加」を選択
2. インストールプロンプトが表示される場合は「インストール」をクリック
3. アプリアイコンがホーム画面に追加され、スタンドアロンアプリとして起動可能

## デザイン仕様

### カラーパレット

- **プライマリレッド**: #dc3545（ボタン、アクセント）
- **ブラック**: #000000（ヘッダー、背景）
- **ダークグレー**: #1a1a1a, #333333（テキスト）
- **ライトグレー**: #f5f5f5（背景）
- **ホワイト**: #ffffff（カードの背景）

### デザイン原則

- シンプルで洗練されたレイアウト
- 重要な要素を赤色で強調
- 余白を活用した読みやすさ
- レスポンシブデザイン（デスクトップ、タブレット、スマートフォン対応）

## セキュリティ

- Firebase Authenticationによる認証
- Firestoreセキュリティルールによるデータ保護
- HTTPS通信（Firebase Hosting）
- ユーザーごとの独立したデータストレージ

## オフライン機能

### キャッシュ戦略

- **Cache-First**: アプリケーションの静的リソース（HTML, CSS, JS, 画像）
- **Network-Only**: Firebase API、認証、Firestoreリクエスト

### 対応機能

- ログイン後のページ閲覧（キャッシュから）
- オフライン時の通知表示
- オンライン復帰時の自動同期

## 今後の拡張予定

- プッシュ通知機能
- バックグラウンド同期
- オフライン時のデータ保存と後で同期
- 情報のカテゴリ分け
- タグ機能
- より高度な検索機能
- ダークモード対応

## トラブルシューティング

### 「Firebase: Error (auth/requests-to-this-api-identitytoolkit...)」エラー

**原因**: Firebaseコンソールでメール/パスワード認証が有効化されていない

**解決方法**:
1. Firebase Consoleにアクセス
2. Authentication → Sign-in methodに移動
3. メール/パスワードを有効化

### Firestoreへのアクセスエラー

**原因**: Firestoreのセキュリティルールで該当パスへのアクセスが拒否されている

**解決方法**:
1. Firebase Console → Firestoreに移動
2. Rulesタブを開く
3. `/ccbotDev/{username}/apps/16ffbf18/information`へのアクセスを許可

### AI提案が取得できない

**原因**: AI Logic SDKが有効化されていない、またはAPIキーの問題

**解決方法**:
1. Firebase Console → Vertex AI in Firebaseを有効化
2. モデル（gemini-1.5-flash）が利用可能か確認
3. ブラウザのコンソールでエラーメッセージを確認

## ライセンス

© 2025 InfoHub by Nekokazu. All rights reserved.

## サポート

質問や問題がある場合は、プロジェクト作成者（@nekokazu）にお問い合わせください。

---

**プロジェクトURL**: https://vps.nekodigi.com/ccbot/projects/16ffbf18/

**作成日**: 2025年10月17日
