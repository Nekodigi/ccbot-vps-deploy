# AI画像質問アプリ

カメラで撮影した画像に関する質問をAIに尋ねることができるプログレッシブウェブアプリケーション（PWA）です。

## 主要機能

### 1. カメラ機能
- デバイスのカメラを起動してリアルタイムで画像を取得
- 背面カメラを優先的に使用（スマートフォンに最適）
- 高解像度での画像キャプチャ（最大1280x720）

### 2. 画像認識質問機能
- 撮影した画像に基づいて自由に質問を入力
- Firebase AI Logic SDK（Gemini 2.5 Flash）を使用してAIが回答を生成
- マルチモーダルAI（テキスト+画像）による高精度な回答

### 3. PWA対応
- オフライン対応（Service Worker使用）
- ホーム画面に追加可能
- ネイティブアプリのようなユーザー体験

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript（フレームワーク不使用）
- **AI/機械学習**: Firebase AI Logic SDK (Gemini 2.5 Flash)
- **データベース**: Firebase Firestore
- **PWA**: Service Worker, Web App Manifest
- **カメラAPI**: MediaDevices getUserMedia API

## ファイル構成

```
/opt/bitnami/apache/htdocs/ccbot/projects/f1aae677/
├── index.html           # メインHTMLファイル（SEOメタタグ含む）
├── styles.css           # スタイルシート（レスポンシブデザイン）
├── app.js              # メインアプリケーションロジック
├── manifest.json       # PWAマニフェストファイル
├── service-worker.js   # Service Worker（オフライン対応）
├── icon-192.png        # PWAアイコン（192x192）
├── icon-512.png        # PWAアイコン（512x512）
├── test.html           # 統合テストページ
└── README.md           # このファイル
```

## セットアップ

### 前提条件

- HTTPS環境（または localhost）
- モダンブラウザ（Chrome, Safari, Firefox, Edgeの最新版）
- カメラ付きデバイス

### インストール手順

1. **ファイルの配置**
   ```bash
   # すべてのファイルが同じディレクトリにあることを確認
   ls -la /opt/bitnami/apache/htdocs/ccbot/projects/f1aae677/
   ```

2. **HTTPSでのアクセス**
   ```
   https://vps.nekodigi.com/ccbot/projects/f1aae677
   ```

3. **カメラ権限の許可**
   - ブラウザがカメラへのアクセスを求めたら「許可」をクリック

## 使い方

### 基本的な使い方

1. **アプリを開く**
   - ブラウザで `https://vps.nekodigi.com/ccbot/projects/f1aae677` にアクセス

2. **カメラを起動**
   - 「カメラを起動」ボタンをクリック
   - カメラへのアクセス許可を求められた場合は「許可」を選択

3. **画像を撮影**
   - カメラプレビューで被写体を確認
   - 「撮影」ボタンをクリックして画像をキャプチャ

4. **質問を入力**
   - テキストエリアに質問を入力（例: 「これは何ですか?」）
   - Enterキーまたは「AIに質問する」ボタンで送信

5. **AIの回答を確認**
   - AIが画像を解析して回答を生成
   - 回答セクションに結果が表示されます

### 撮り直し

- 「撮り直す」ボタンをクリックして新しい画像を撮影できます

## テスト

### テストの実行方法

1. **テストページにアクセス**
   ```
   https://vps.nekodigi.com/ccbot/projects/f1aae677/test.html
   ```

2. **テストを実行**
   - 「全テストを実行」ボタンをクリック
   - すべてのテストが自動的に実行されます

### テストカテゴリ

- **環境チェック**: HTTPS接続、API サポート確認
- **ファイル存在チェック**: 必要なファイルの存在確認
- **HTML構造チェック**: メタタグ、マニフェストリンクの確認
- **CSS機能チェック**: スタイルシートの有効性、レスポンシブ設定
- **JavaScript機能チェック**: Firebase設定、API統合
- **PWA機能チェック**: マニフェスト、Service Workerの検証

## Firebase設定

### Firestore データ保存パス

```
/ccbotDev/nekokazu/apps/f1aae677/questions/
```

### 保存されるデータ

- `question`: ユーザーが入力した質問
- `answer`: AIが生成した回答
- `timestamp`: 質問日時
- `imageDataLength`: 画像データのサイズ

### Firebase設定情報

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

## 主要な実装の詳細

### カメラ機能 (app.js:85-130)

- `getUserMedia` APIを使用してカメラストリームを取得
- 背面カメラを優先（`facingMode: 'environment'`）
- エラーハンドリング（NotFoundError, NotAllowedError等）

### 画像キャプチャ (app.js:135-169)

- HTML5 Canvasを使用して現在のフレームを描画
- JPEG形式でBase64エンコード（圧縮率0.8）
- データURIとして保存

### AI質問機能 (app.js:193-247)

- Gemini 2.5 Flashモデルを使用
- マルチモーダル入力（テキスト + 画像）
- エラーハンドリングとユーザーフィードバック

### PWA機能 (service-worker.js)

- **キャッシュ戦略**: Cache First（ネットワークフォールバック付き）
- **オフライン対応**: 重要なファイルを事前キャッシュ
- **自動更新**: 古いキャッシュを自動削除

## ブラウザサポート

- Chrome 90+ ✓
- Safari 14+ ✓
- Firefox 88+ ✓
- Edge 90+ ✓

## セキュリティ

- HTTPS必須（カメラAPIの要件）
- Firestore セキュリティルールに準拠
- ユーザー権限の明示的な要求

## パフォーマンス最適化

- 画像をJPEG圧縮（0.8品質）
- Service Workerによるキャッシング
- レスポンシブイメージ
- 最小限の依存関係（CDN経由のFirebase SDKのみ）

## トラブルシューティング

### カメラが起動しない

- HTTPSで接続していることを確認
- ブラウザのカメラ権限を確認
- 他のアプリケーションがカメラを使用していないか確認

### AIの回答が生成されない

- インターネット接続を確認
- Firebase APIキーが有効か確認
- ブラウザのコンソールでエラーメッセージを確認

### PWAとしてインストールできない

- HTTPSで接続していることを確認
- manifest.jsonが正しく読み込まれているか確認
- Service Workerが正常に登録されているか確認

## ライセンス

このプロジェクトは、個人利用および教育目的で自由に使用できます。

## 作成者

- **Nekokazu** (@nekokazu)
- プロジェクトURL: https://vps.nekodigi.com/ccbot/projects/f1aae677
- 作成日: 2025年10月18日

## 謝辞

- Firebase AI Logic SDK (Gemini)
- Google Cloud Platform
- MediaDevices getUserMedia API

---

**バージョン**: 1.0.0
**最終更新**: 2025年10月18日
