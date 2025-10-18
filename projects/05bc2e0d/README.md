# Simple PWA App

シンプルで使いやすいPWA（Progressive Web App）アプリケーション

## プロジェクト情報

- **プロジェクトID**: 05bc2e0d
- **プロジェクトURL**: https://vps.nekodigi.com/ccbot/projects/05bc2e0d
- **作成者**: Nekokazu (@nekokazu)
- **作成日**: 2025-10-18

## 概要

本プロジェクトは、日本のビジネスシーンに適したシンプルで洗練されたデザインを持つPWAアプリケーションです。オフライン対応、データ永続化、レスポンシブデザインを備えています。

## 主要機能

- **PWA対応**: オフラインでも動作可能
- **データ管理**: Firebase Firestoreを使用したデータの保存・読み込み・削除
- **レスポンシブデザイン**: モバイルからデスクトップまで対応
- **SEO最適化**: OGPタグ、Twitter Cardタグを含む
- **Service Worker**: Stale-While-Revalidate戦略によるキャッシング
- **リアルタイム状態表示**: オンライン/オフライン状態、Service Workerの状態を表示

## 技術スタック

### フロントエンド
- Pure HTML5
- Pure CSS3（CSS変数を使用したテーマ管理）
- Pure JavaScript（ES6モジュール）

### バックエンド・サービス
- Firebase Firestore（データストレージ）
- Firebase SDK v12.4.0（CDN版、モジュラーAPI）

### PWA関連
- Service Workers
- Web App Manifest
- Cache API

## ファイル構成

```
05bc2e0d/
├── index.html              # メインHTMLファイル
├── manifest.json          # PWAマニフェスト
├── sw.js                  # Service Worker
├── styles.css             # スタイルシート
├── app.js                 # アプリケーションロジック
├── icon-192x192.png       # PWAアイコン（192x192）
├── icon-512x512.png       # PWAアイコン（512x512）
├── test.html              # 統合テストページ
├── create-icons.html      # アイコン生成ツール
├── generate-icons.html    # アイコン生成ツール（代替）
├── generate-png-icons.js  # Node.jsアイコン生成スクリプト
└── README.md              # このファイル
```

## セットアップ

### 1. アクセス

ブラウザで以下のURLにアクセス:
```
https://vps.nekodigi.com/ccbot/projects/05bc2e0d
```

### 2. PWAとしてインストール

#### デスクトップ（Chrome/Edge）
1. アドレスバーの右側にある「インストール」アイコンをクリック
2. 確認ダイアログで「インストール」をクリック

#### モバイル（Chrome/Safari）
1. ブラウザのメニューを開く
2. 「ホーム画面に追加」を選択
3. 名前を確認して「追加」をタップ

### 3. オフライン使用

- 初回アクセス後、ページがキャッシュされます
- インターネット接続がない状態でもアプリを起動できます
- データの保存/削除にはオンライン接続が必要です

## 使用方法

### データの保存

1. 入力フィールドにテキストを入力
2. 「保存」ボタンをクリック、またはEnterキーを押す
3. データがFirestoreに保存され、リストに表示されます

### データの削除

1. 保存されたデータの右側にある「削除」ボタンをクリック
2. 確認ダイアログで「OK」をクリック

### 状態の確認

アプリの状態セクションで以下を確認できます:
- **接続状態**: オンライン/オフライン
- **Service Worker**: 登録済み/未登録

## テスト

### テストの実行

統合テストページにアクセス:
```
https://vps.nekodigi.com/ccbot/projects/05bc2e0d/test.html
```

「すべてのテストを実行」ボタンをクリックしてテストを開始します。

### テスト項目

以下の項目がテストされます:
- PWAマニフェストファイルの存在確認
- Service Workerの登録確認
- 各種ファイルの読み込み確認
- DOM要素の存在確認
- メタタグの確認（viewport, description, OGP, Twitter Card）
- Firebase SDKの読み込み確認
- オフライン機能（Cache API）の確認
- レスポンシブデザイン（CSS変数）の確認

## Firebase設定

### Firestoreパス

```
ccbotDev/nekokazu/apps/05bc2e0d/data
```

### Firebase設定（config）

```javascript
{
  apiKey: "AIzaSyChB7eBjMaX_lRpfIgUxQDi39Qh82R4oyQ",
  authDomain: "sandbox-35d1d.firebaseapp.com",
  projectId: "sandbox-35d1d",
  storageBucket: "sandbox-35d1d.appspot.com",
  messagingSenderId: "906287459396",
  appId: "1:906287459396:web:c931c95d943157cae36011",
  measurementId: "G-LE2Q0XC7B6"
}
```

## キャッシュ戦略

### Service Workerのキャッシュ戦略

1. **manifest.json**: キャッシュしない（常にネットワークから取得）
2. **HTMLファイル**: ネットワーク優先、失敗時はキャッシュから取得
3. **その他のリソース（CSS、JS、画像）**: Stale-While-Revalidate戦略
   - キャッシュがあればすぐに返す
   - バックグラウンドでネットワークから更新

## デザイン原則

### カラーパレット

- **プライマリー**: `#2c3e50` （ダークブルーグレー）
- **セカンダリー**: `#34495e` （ミディアムブルーグレー）
- **アクセント**: `#3498db` （ブライトブルー）
- **成功**: `#27ae60` （グリーン）
- **警告**: `#f39c12` （オレンジ）
- **危険**: `#e74c3c` （レッド）

### タイポグラフィ

- システムフォント優先
- 日本語: Hiragino Sans, Noto Sans JP
- 欧文: -apple-system, Segoe UI

### レスポンシブブレークポイント

- モバイル: 768px以下
- タブレット/デスクトップ: 768px以上

## ブラウザ対応

### 推奨ブラウザ

- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### PWA機能のサポート

- デスクトップ: Chrome, Edge
- iOS: Safari 11.3+
- Android: Chrome 40+

## トラブルシューティング

### Service Workerが登録されない

1. HTTPSまたはlocalhostでアクセスしているか確認
2. ブラウザがService Workerをサポートしているか確認
3. ブラウザのコンソールでエラーを確認

### データが保存されない

1. オンライン接続を確認
2. Firebaseのアクセス権限を確認
3. ブラウザのコンソールでエラーを確認

### アイコンが表示されない

1. icon-192x192.pngとicon-512x512.pngが存在するか確認
2. create-icons.htmlを開いてアイコンを再生成

## 開発者向け情報

### ローカル開発

1. プロジェクトディレクトリに移動
2. HTTPサーバーを起動（例: `python3 -m http.server 8000`）
3. ブラウザで`http://localhost:8000`にアクセス

### デバッグ

1. Chrome DevToolsの「Application」タブでPWA情報を確認
2. 「Service Workers」セクションでService Workerの状態を確認
3. 「Cache Storage」でキャッシュの内容を確認
4. 「Console」でログとエラーを確認

### アイコンの再生成

#### 方法1: ブラウザで生成
```
https://vps.nekodigi.com/ccbot/projects/05bc2e0d/create-icons.html
```

#### 方法2: Node.jsスクリプト
```bash
node generate-png-icons.js
```

## ライセンス

このプロジェクトは個人使用のために作成されました。

## クレジット

- **作成者**: Nekokazu (@nekokazu)
- **プラットフォーム**: CCBot
- **フレームワーク**: なし（Pure HTML/CSS/JS）
- **バックエンド**: Firebase

## 更新履歴

### v1.0.0 (2025-10-18)
- 初回リリース
- PWA対応実装
- Firebase Firestore統合
- オフライン機能実装
- レスポンシブデザイン実装
- 統合テスト作成
