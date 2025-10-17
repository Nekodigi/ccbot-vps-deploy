# タスク管理アプリ

シンプルで使いやすいタスク管理アプリです。PWA対応により、オフラインでも動作し、アプリのようにインストールして使用できます。

## 主な機能

- **ユーザー認証**: Firebase Authenticationによる安全なログイン・新規登録
- **リアルタイム同期**: Firestoreを使用し、複数デバイス間でタスクを自動同期
- **オフライン対応**: Service Workerによるオフラインキャッシュ、IndexedDB永続化
- **タスク管理**: タスクの追加、完了/未完了の切り替え、削除
- **フィルター機能**: すべて/未完了/完了でタスクを絞り込み
- **レスポンシブデザイン**: PC・タブレット・スマートフォンに対応
- **PWA対応**: ホーム画面に追加してアプリのように使用可能

## 使い方

1. **アクセス**: https://vps.nekodigi.com/ccbot/projects/9039ae4f/
2. **ログイン/新規登録**: 右上の「ログイン」ボタンをクリック
3. **タスク追加**: 入力欄にタスクを入力して「追加」ボタン
4. **タスク完了**: チェックボックスをクリックして完了/未完了を切り替え
5. **タスク削除**: 「削除」ボタンでタスクを削除
6. **フィルター**: 「すべて」「未完了」「完了」ボタンでタスクを絞り込み

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript (ES6 Modules)
- **バックエンド**: Firebase (Authentication + Firestore)
- **PWA**: Service Worker + Web App Manifest
- **スタイル**: カスタムCSS (グラデーション背景、モダンなUI)

## ファイル構成

```
.
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── app.js              # メインJavaScript (Firebase連携)
├── service-worker.js   # Service Worker (オフライン対応)
├── manifest.json       # Web App Manifest (PWA設定)
├── icon-192.png        # アプリアイコン (192x192)
├── icon-512.png        # アプリアイコン (512x512)
└── favicon.ico         # ファビコン
```

## Firebase設定

プロジェクトは以下のFirebase設定を使用しています:

- **Project ID**: sandbox-35d1d
- **Firestore パス**: `/ccbotDev/nekokazu/apps/9039ae4f/tasks`
- **認証方法**: Email/Password

## オフライン機能

- **Service Worker**: アプリの静的ファイルをキャッシュ
- **IndexedDB永続化**: Firestoreデータをローカルに保存
- **オンライン状態表示**: 画面下部にネットワーク状態を表示

## デザインの特徴

- シンプルで洗練されたビジネスライクなデザイン
- グラデーション背景による視覚的な美しさ
- カードベースのレイアウト
- ホバー効果とトランジションアニメーション
- モバイルフレンドリーなレスポンシブデザイン

## ブラウザ対応

- Chrome (推奨)
- Firefox
- Safari
- Edge

※ PWA機能を最大限に活用するには、最新版のブラウザを推奨します。

## セキュリティ

- XSS対策: HTMLエスケープ処理を実装
- Firebase Security Rules: ユーザーごとのデータアクセス制限
- HTTPS通信: 暗号化された通信

## ライセンス

このプロジェクトは学習・開発目的で作成されました。
