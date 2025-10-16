# AI Chat - AIとの対話アプリ

Firebase AI Logic SDKを活用したAIチャットアプリケーション

## 機能

- AIとのリアルタイム対話
- チャット履歴の保持（会話のコンテキスト維持）
- PWA対応（オフライン動作可能）
- レスポンシブデザイン
- タイピングインジケーター
- エラーハンドリング

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript
- **AI**: Firebase AI Logic SDK (Gemini 2.5 Flash)
- **データベース**: Firestore
- **PWA**: Service Worker, Web App Manifest

## セットアップ

このアプリケーションは追加のセットアップなしで動作します。

1. ブラウザでindex.htmlを開く
2. ステータスが「接続完了」になるまで待つ
3. メッセージを入力して対話を開始

## ファイル構成

```
/
├── index.html          # メインHTML
├── style.css           # スタイルシート
├── app.js              # アプリケーションロジック
├── manifest.json       # PWAマニフェスト
├── sw.js               # Service Worker
├── icon-192.png        # PWAアイコン (192x192)
├── icon-512.png        # PWAアイコン (512x512)
├── favicon.ico         # ファビコン
├── test.html           # テストページ
└── README.md           # このファイル
```

## テスト

test.htmlを開くことで、以下の機能をテストできます：

- 基本機能チェック
- PWA機能チェック
- Firebase設定確認
- 自動テスト実行

## 使用方法

### 基本的な対話

1. テキストエリアにメッセージを入力
2. 送信ボタンをクリック、またはEnterキーを押す
3. AIからの応答が表示される

### ショートカット

- **Enter**: メッセージ送信
- **Shift + Enter**: 改行

## PWAとしてインストール

### デスクトップ (Chrome)
1. アドレスバーの右側のインストールアイコンをクリック
2. 「インストール」をクリック

### モバイル (Android/iOS)
1. ブラウザのメニューを開く
2. 「ホーム画面に追加」を選択

## 技術仕様

### Firebase設定

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

### AIモデル

- **モデル**: gemini-2.5-flash
- **バックエンド**: GoogleAIBackend
- **機能**:
  - テキスト生成
  - マルチターン会話
  - コンテキスト保持

### 生成設定

```javascript
{
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048
}
```

## デザイン原則

- シンプルで洗練された日本のビジネスデザイン
- 重要な情報を視覚的に強調
- 不要な装飾を排除
- グラデーションや絵文字を使用しない
- クリアな階層構造

## ブラウザサポート

- Chrome (推奨)
- Firefox
- Safari
- Edge

## ライセンス

このプロジェクトは個人利用のために作成されました。

## プロジェクト情報

- プロジェクトID: e4cc059c
- プロジェクトURL: https://vps.nekodigi.com/ccbot/projects/e4cc059c
- 作成日: 2025-10-16
