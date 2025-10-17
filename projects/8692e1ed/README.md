# InfoCollector - 情報収集・整理PWAアプリ

情報収集・整理を簡単にするシンプルなPWA（プログレッシブWebアプリケーション）です。AIアシスタント機能により、収集した情報について質問すると、AIが回答してくれます。

## 🌐 デモURL

https://vps.nekodigi.com/ccbot/projects/8692e1ed

## ✨ 主要機能

### 1. ユーザー認証
- Firebase Authenticationによるメール/パスワード認証
- セキュアなログイン・ログアウト機能

### 2. 情報収集機能
- タイトル、内容、URL、タグを登録
- リアルタイムでFirestoreに保存
- タグによる分類管理

### 3. 情報整理機能
- 収集した情報を一覧表示
- タイトル/内容/メモでの検索
- タグによるフィルタリング
- 各情報にメモを追加可能
- 情報の削除機能

### 4. AIアシスタント機能
- Google Gemini APIを使用
- 収集した情報をコンテキストとして利用
- 質問に対してAIが回答

### 5. PWA機能
- Service Workerによるオフライン対応
- キャッシュ戦略による高速表示
- ホーム画面へのインストール対応
- プッシュ通知対応（manifest設定済み）

### 6. レスポンシブデザイン
- モバイル/タブレット/デスクトップに対応
- モバイルファーストデザイン

### 7. SEO対応
- OGP（Open Graph Protocol）メタタグ
- Twitter Cardメタタグ
- 適切なメタディスクリプション

## 🛠 技術スタック

### フロントエンド
- Pure HTML5/CSS3/JavaScript (ES6 Modules)
- レスポンシブデザイン
- モノトーンベースの洗練されたUI

### バックエンド
- Firebase Authentication（ユーザー認証）
- Cloud Firestore（データベース）
- Google Gemini API（AI機能）

### PWA
- Service Worker（キャッシュ制御）
- Web App Manifest
- オフライン機能

### テスト
- Playwright（E2Eテスト）

## 📁 ファイル構成

```
8692e1ed/
├── index.html           # メインHTMLファイル
├── styles.css           # スタイルシート
├── app.js              # メインJavaScriptファイル
├── sw.js               # Service Worker
├── manifest.json       # PWA Manifest
├── offline.html        # オフライン時表示ページ
├── icon-192.png        # アプリアイコン（192x192）
├── icon-512.png        # アプリアイコン（512x512）
├── test.spec.js        # Playwrightテストスイート
├── playwright.config.js # Playwright設定
├── package.json        # npm設定
└── README.md           # このファイル
```

## 🚀 セットアップ

### 必要な環境
- モダンブラウザ（Chrome, Firefox, Safari, Edge最新版）
- HTTPS環境（Service Worker要件）

### ローカル開発
1. HTTPSで提供されるWebサーバーを起動
2. ブラウザでindex.htmlにアクセス

### Firebase設定
アプリケーションは以下のFirebase設定を使用しています：

```javascript
const firebaseConfig = {
    apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
    authDomain: "sandbox-35d1d.firebaseapp.com",
    projectId: "sandbox-35d1d",
    storageBucket: "sandbox-35d1d.appspot.com",
    messagingSenderId: "906287459396",
    appId: "1:906287459396:web:c931c95d943157cae36011",
    measurementId: "G-LE2Q0XC7B6"
};
```

### Firestoreセキュリティルール
データは以下のパスに保存されます：
```
/ccbotDev/{username}/apps/8692e1ed/items/{itemId}
```

## 🧪 テスト

### Playwrightテスト実行

```bash
# テストの実行
npm test

# ブラウザ表示でテスト
npm run test:headed

# UIモードでテスト
npm run test:ui

# テストレポート表示
npm run test:report
```

### テストカバレッジ
- 基本機能テスト（ページ読み込み、PWA manifest、Service Worker）
- 認証テスト（ログイン、新規登録、エラーハンドリング）
- 情報収集テスト（追加、バリデーション、タブ切り替え）
- 情報整理テスト（表示、検索、フィルター、削除、メモ更新）
- AIアシスタントテスト（チャット送信、応答受信）
- レスポンシブデザインテスト（モバイル、タブレット、デスクトップ）
- SEOテスト（メタタグ検証）

## 📱 PWAインストール

### デスクトップ
1. ブラウザでアプリにアクセス
2. アドレスバーの右側のインストールアイコンをクリック
3. 「インストール」をクリック

### モバイル（Android）
1. ブラウザでアプリにアクセス
2. メニューから「ホーム画面に追加」を選択
3. アプリ名を確認して「追加」をタップ

### モバイル（iOS）
1. Safariでアプリにアクセス
2. 共有ボタンをタップ
3. 「ホーム画面に追加」を選択

## 🎨 デザイン原則

### カラーパレット
- **背景**: ホワイト (#FFFFFF)
- **セカンダリ背景**: ライトグレー (#F8F9FA)
- **テキスト**: ダークグレー (#1A1A1A)
- **プライマリ**: ブルー (#2563EB)
- **アクセント**: アンバー (#F59E0B)

### UIガイドライン
- シンプルで洗練されたインターフェース
- 重要な情報は色で強調
- 不要な情報は非表示
- 直感的な操作性
- 一貫性のあるスペーシング

## 🔐 セキュリティ

- HTTPS必須（Service Worker要件）
- Firebase Authenticationによるセキュアなユーザー認証
- Firestore Security Rulesによるデータアクセス制御
- XSS対策（HTMLサニタイゼーション実装）
- CORS対応

## 📊 パフォーマンス

### キャッシュ戦略
- **静的アセット**: Cache-First戦略
- **動的コンテンツ**: Network-First戦略
- **オフライン対応**: カスタムオフラインページ表示

### 最適化
- 最小限のJavaScript使用
- CSS最適化
- 画像最適化
- 遅延読み込み

## 🐛 既知の問題

### Firebase Authentication
- 現在のFirebaseプロジェクト設定では、新規ユーザー登録APIがブロックされている可能性があります
- 既存ユーザーでのログインは正常に動作します

### 対処方法
1. Firebaseコンソールで認証設定を確認
2. メール/パスワード認証が有効化されていることを確認
3. APIキーの制限設定を確認

## 📝 ライセンス

MIT License

## 👤 作成者

Nekokazu (@nekokazu)

## 🔗 関連リンク

- [プロジェクトURL](https://vps.nekodigi.com/ccbot/projects/8692e1ed)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Playwright Documentation](https://playwright.dev/)
