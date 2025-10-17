# WordShare - 単語帳SNSアプリ

単語帳を作成・共有できるSNS型学習PWA（Progressive Web Application）

## プロジェクト情報

- **プロジェクトID**: 1deb1b1a
- **URL**: https://vps.nekodigi.com/ccbot/projects/1deb1b1a/
- **作成者**: Nekokazu (@nekokazu)

## 主要機能

### 実装済み機能

1. **ユーザー認証**
   - メールアドレス・パスワードでの登録・ログイン
   - Firebase Authentication使用

2. **単語帳作成・管理**
   - 単語帳の新規作成・編集・削除
   - 単語と意味のペア登録
   - 公開/非公開設定

3. **SNS機能**
   - 公開単語帳のフィード表示
   - いいね機能
   - コメント機能
   - フォロー機能（実装準備済み）

4. **AI機能**
   - Gemini APIを使用した単語推奨機能
   - テーマに基づいた自動単語生成

5. **PWA機能**
   - Service Workerによるオフライン対応
   - キャッシュ戦略（Cache-First / Network-First）
   - マニフェストファイルによるインストール可能化
   - オフライン通知

6. **レスポンシブデザイン**
   - モバイルファーストデザイン
   - タブレット・デスクトップ対応
   - シンプルで洗練されたUI/UX

## 技術スタック

### フロントエンド
- **HTML5** - セマンティックマークアップ
- **CSS3** - カスタムプロパティ、Flexbox、Grid
- **JavaScript (ES6+)** - モジュール、Async/Await

### バックエンド
- **Firebase Authentication** - ユーザー認証
- **Firestore** - NoSQLデータベース
- **Gemini API** - AI機能（Firebase AI Logic SDK経由）

### PWA
- **Service Worker** - オフライン対応、キャッシュ管理
- **Web App Manifest** - アプリインストール

### テスト
- **Playwright** - E2Eテスト

## ファイル構成

```
/opt/bitnami/apache/htdocs/ccbot/projects/1deb1b1a/
├── index.html              # メインHTMLファイル
├── app.js                  # メインアプリケーションロジック
├── styles.css              # スタイルシート
├── sw.js                   # Service Worker
├── manifest.json           # PWAマニフェスト
├── offline.html            # オフライン時表示ページ
├── icon.svg                # アプリアイコン
├── test.spec.js            # Playwrightテストコード
├── package.json            # npm設定
├── generate-icons.html     # アイコン生成ツール
└── README.md               # このファイル
```

## Firestoreデータ構造

```
ccbotDev/
  └── nekokazu/
      └── apps/
          └── 1deb1b1a/
              └── users/
                  └── {userId}/
                      ├── username
                      ├── email
                      ├── createdAt
                      ├── followersCount
                      ├── followingCount
                      └── decks/
                          └── {deckId}/
                              ├── title
                              ├── description
                              ├── isPublic
                              ├── words[]
                              ├── authorId
                              ├── authorName
                              ├── likesCount
                              ├── createdAt
                              ├── updatedAt
                              ├── likes/
                              │   └── {userId}/
                              └── comments/
                                  └── {commentId}/
                                      ├── text
                                      ├── authorId
                                      ├── authorName
                                      └── createdAt
```

## 使用方法

### 1. アプリへのアクセス

ブラウザで以下のURLにアクセス:
```
https://vps.nekodigi.com/ccbot/projects/1deb1b1a/
```

### 2. アカウント作成

1. 「新規登録」タブをクリック
2. ユーザー名、メールアドレス、パスワードを入力
3. 「登録」ボタンをクリック

### 3. 単語帳作成

1. 「単語帳」タブに移動
2. 「新規作成」ボタンをクリック
3. タイトル、説明を入力
4. 単語と意味を追加
5. 「AI推奨」ボタンでAIによる単語提案も可能
6. 公開設定をチェック（オプション）
7. 「保存」ボタンをクリック

### 4. 単語帳の閲覧・操作

- **フィード**: 公開された単語帳を閲覧
- **単語帳詳細**: カードをクリックして詳細表示
- **いいね**: ハートボタンでいいね
- **コメント**: コメント欄に入力して投稿

### 5. PWAとしてインストール

1. ブラウザのメニューから「ホーム画面に追加」または「インストール」を選択
2. アプリとしてホーム画面に追加される
3. オフラインでも利用可能

## テスト

### Playwrightテスト実行

```bash
# 依存パッケージインストール
npm install

# テスト実行
npm test

# ヘッド付きモードでテスト
npm run test:headed

# UIモードでテスト
npm run test:ui
```

### テストカバレッジ

- ユーザー登録・ログイン
- 単語帳CRUD操作
- いいね・コメント機能
- ナビゲーション
- オフライン動作
- ログアウト

## セキュリティ

### Firestore セキュリティルール

プロジェクトでは以下のパスに対してアクセス権限が設定されています:
```
/ccbotDev/nekokazu/apps/1deb1b1a/
```

このパス配下のみ読み書き可能です。

### 認証

- Firebase Authenticationによる安全な認証
- パスワードは最低6文字
- メールアドレス検証

## パフォーマンス最適化

1. **Service Worker キャッシュ戦略**
   - 静的アセット: Cache-First
   - Firebase API: Network-First

2. **遅延読み込み**
   - 画像の遅延読み込み対応可能

3. **最小化**
   - 本番環境では圧縮版の使用を推奨

## ブラウザ対応

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 今後の改善案

1. フォロー機能の完全実装
2. 学習モード（フラッシュカード形式）
3. 学習進捗の記録
4. 単語帳のカテゴリ分類
5. 検索機能の強化
6. 画像添付機能
7. 多言語対応
8. ダークモード

## ライセンス

MIT License

## 作成者

Nekokazu (@nekokazu)

## 更新履歴

- **v1.0.0** (2025-10-17): 初回リリース
  - 基本機能実装完了
  - PWA対応
  - AI機能統合
  - Playwrightテスト実装
