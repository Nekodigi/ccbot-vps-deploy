# チケットアプリ

イベントチケットを簡単に購入・管理できるPWA (Progressive Web App) アプリケーションです。

## プロジェクト情報

- **プロジェクトID**: f1282b85
- **プロジェクトURL**: https://vps.nekodigi.com/ccbot/projects/f1282b85
- **作成者**: Nekokazu (@nekokazu)

## 主要機能

### 1. ユーザー認証
- Firebase Authenticationによるメールアドレス・パスワード認証
- 新規登録、ログイン、ログアウト機能

### 2. チケット検索
- キーワード、カテゴリー、日付によるイベント検索
- 検索結果の一覧表示

### 3. チケット購入
- イベント詳細ページからの直接購入
- 在庫管理とトランザクション処理

### 4. チケット管理
- 購入したチケットの一覧表示
- QRコード生成機能
- チケットのキャンセル・使用済み処理

### 5. イベント通知
- Service Workerによるプッシュ通知対応
- イベント開始前の通知スケジュール機能

### 6. AI推奨機能
- Firebase AI Logic SDK (Gemini) による個別化された推奨
- 購入履歴に基づくパーソナライズ

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript
- **バックエンド**: Firebase Firestore
- **認証**: Firebase Authentication
- **PWA**: Service Worker, Web App Manifest
- **AI**: Firebase AI Logic SDK (Gemini 1.5 Flash)
- **QRコード**: qrcode.js library
- **テスト**: Playwright

## ファイル構造

```
/
├── index.html              # ホームページ
├── login.html              # ログイン/新規登録ページ
├── search.html             # イベント検索ページ
├── detail.html             # イベント詳細ページ
├── mytickets.html          # マイチケットページ
├── manifest.json           # PWA Manifest
├── sw.js                   # Service Worker
├── css/
│   └── style.css          # スタイルシート
├── js/
│   ├── config.js          # Firebase設定
│   ├── auth.js            # 認証機能
│   ├── search.js          # 検索機能
│   ├── purchase.js        # 購入機能
│   ├── tickets.js         # チケット管理
│   └── recommendations.js # AI推奨機能
├── tests/
│   └── e2e.spec.js        # E2Eテスト
├── package.json           # npm設定
└── playwright.config.js   # Playwright設定
```

## セットアップ

### 依存関係のインストール

```bash
npm install
```

### Playwrightブラウザのインストール

```bash
npx playwright install chromium
```

## テスト実行

### 基本テスト

```bash
npm test
```

### 特定のテストのみ実行

```bash
npx playwright test --grep "PWA|Service|CSS"
```

### ヘッドレスモードでのテスト

```bash
npm run test:headed
```

### デバッグモード

```bash
npm run test:debug
```

## テスト結果

以下のテストが正常に完了することを確認済み:

- ✓ PWA manifest が正しく設定されている
- ✓ Service Worker ファイルが存在する
- ✓ CSSファイルが読み込まれる
- ✓ 全HTMLページが正常にアクセスできる
- ✓ 全JavaScriptファイルが存在する

## Firestore データ構造

### イベント
パス: `ccbotDev/nekokazu/apps/f1282b85/events/{eventId}`

```json
{
  "title": "イベント名",
  "description": "説明",
  "category": "music",
  "date": "2025-11-15T19:00:00",
  "location": "会場名",
  "price": 8500,
  "availableTickets": 500,
  "createdAt": "Timestamp"
}
```

### ユーザープロフィール
パス: `ccbotDev/nekokazu/apps/f1282b85/users/{userId}/profile/data`

```json
{
  "email": "user@example.com",
  "createdAt": "Timestamp",
  "purchaseHistory": []
}
```

### チケット
パス: `ccbotDev/nekokazu/apps/f1282b85/users/{userId}/tickets/{ticketId}`

```json
{
  "eventId": "eventId",
  "eventTitle": "イベント名",
  "eventDate": "2025-11-15T19:00:00",
  "eventLocation": "会場名",
  "category": "music",
  "price": 8500,
  "quantity": 1,
  "totalPrice": 8500,
  "purchasedAt": "Timestamp",
  "status": "active",
  "qrCode": "TICKET-CODE"
}
```

## UI/UXデザイン

- **フォント**: Noto Sans JP (日本語対応)
- **カラースキーム**:
  - プライマリー: #1a73e8 (青)
  - セカンダリー: #34a853 (緑)
  - アクセント: #fbbc04 (黄)
  - エラー: #ea4335 (赤)
- **デザイン原則**: シンプルで洗練されたビジネスデザイン
- **レスポンシブ**: モバイルファーストアプローチ

## 使用方法

1. **アカウント作成**
   - ログインページにアクセス
   - 「新規登録」をクリック
   - メールアドレスとパスワードを入力

2. **イベント検索**
   - ホームページから「検索」をクリック
   - キーワードやカテゴリーで絞り込み

3. **チケット購入**
   - イベント詳細ページで購入枚数を選択
   - 「チケットを購入」をクリック

4. **チケット確認**
   - 「マイチケット」からチケット一覧を表示
   - チケットをクリックしてQRコードを表示

## セキュリティ

- Firebase Authenticationによる認証
- Firestoreセキュリティルールによるアクセス制御
- HTTPS必須 (PWA要件)
- トランザクション処理による在庫管理

## ライセンス

MIT License

## 更新履歴

- **2025-10-17**: 初版リリース
  - 全機能実装完了
  - Playwrightテスト実装
  - PWA対応完了
