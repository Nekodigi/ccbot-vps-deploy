# AR体験アプリ

WebXR APIとGoogle Model Viewerを使用した拡張現実(AR)体験アプリケーションです。

## 特徴

- **最新のWebXR API対応**: 2025年最新のWebXR仕様に準拠
- **PWA対応**: オフラインでも動作し、ホーム画面に追加可能
- **複数の3Dモデル**: キューブ、スフィア、シリンダーの3種類のモデルを切り替え可能
- **直感的な操作**: カメラコントロール、自動回転、タッチ操作対応
- **レスポンシブデザイン**: スマートフォン、タブレット、デスクトップに対応

## 技術スタック

- **HTML5/CSS3/JavaScript**: Pure implementation (フレームワーク不使用)
- **Google Model Viewer 4.1.0**: 3Dモデルの表示とAR機能
- **WebXR Device API**: AR体験の提供
- **Service Worker**: PWA機能とオフライン対応
- **GLB形式**: 3Dモデルフォーマット

## ファイル構成

```
.
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── app.js              # アプリケーションロジック
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── test.html           # テストスイート
├── models/             # 3Dモデルディレクトリ
│   ├── box.glb        # キューブモデル
│   ├── sphere.glb     # スフィアモデル
│   └── cylinder.glb   # シリンダーモデル
├── icon-192.png        # PWAアイコン (192x192)
├── icon-512.png        # PWAアイコン (512x512)
├── loading.png         # ローディング画像
├── og-image.png        # OGP画像
└── screenshot.png      # スクリーンショット
```

## 使い方

### 基本的な使用方法

1. アプリケーションを開く
2. 3Dモデルをマウスまたはタッチで操作
3. 「ARで見る」ボタンをタップしてAR体験を開始
4. カメラを使って実世界にモデルを配置

### AR機能の要件

- **Android**: ARCore対応デバイス + Google Play Services for AR
- **iOS**: iOS 12以上 + ARKit対応デバイス
- **ブラウザ**: Chrome, Edge, Safari (WebXR対応)

### PWAのインストール

1. ブラウザのメニューから「ホーム画面に追加」を選択
2. アプリアイコンからいつでもアクセス可能
3. オフラインでも3Dモデルの閲覧が可能

## 開発情報

### テストの実行

テストスイートにアクセス:
```
test.html
```

テスト項目:
- ファイル構造の検証
- PWA機能のチェック
- AR機能のサポート確認
- パフォーマンス測定

### 3Dモデルの追加

新しいGLBモデルを追加する手順:

1. `models/` ディレクトリにGLBファイルを配置
2. `index.html` のモデルセレクターに項目を追加
3. `app.js` でモデルパスを設定

例:
```html
<button class="model-card" data-model="./models/新モデル.glb" data-name="新モデル">
    <div class="model-preview">
        <div class="preview-icon">🎨</div>
    </div>
    <span class="model-name">新モデル</span>
</button>
```

### カスタマイズ

#### 色の変更
`style.css` の CSS変数を編集:
```css
:root {
    --primary-color: #2196F3;  /* メインカラー */
    --primary-dark: #1976D2;   /* ダークカラー */
    --accent-color: #FF5722;   /* アクセントカラー */
}
```

#### カメラ設定
`app.js` のカメラパラメータを調整:
```javascript
this.modelViewer.cameraOrbit = '45deg 55deg 2.5m';
this.modelViewer.fieldOfView = '45deg';
```

## ブラウザサポート

| ブラウザ | 3D表示 | AR機能 | PWA |
|---------|--------|--------|-----|
| Chrome (Android) | ✓ | ✓ | ✓ |
| Safari (iOS) | ✓ | ✓ | ✓ |
| Edge | ✓ | ✓ | ✓ |
| Firefox | ✓ | 一部 | ✓ |

## パフォーマンス最適化

- Service Workerによるアグレッシブなキャッシュ戦略
- GLBファイルの最適化 (頂点数、テクスチャサイズ)
- 遅延読み込み対応
- プログレッシブエンハンスメント

## セキュリティ

- HTTPS必須 (本番環境)
- コンテンツセキュリティポリシー推奨
- CORS設定の適切な管理

## ライセンス

このプロジェクトは実装例として提供されています。

## 参考リンク

- [WebXR Device API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebXR_Device_API)
- [Google Model Viewer](https://modelviewer.dev/)
- [ARCore Supported Devices](https://developers.google.com/ar/devices)
- [PWA Documentation](https://web.dev/progressive-web-apps/)

## トラブルシューティング

### ARボタンが表示されない
- デバイスがAR対応か確認
- Google Play Services for ARがインストールされているか確認 (Android)
- ブラウザがWebXRに対応しているか確認

### 3Dモデルが読み込まれない
- ネットワーク接続を確認
- ブラウザのコンソールでエラーを確認
- GLBファイルのパスが正しいか確認

### Service Workerが動作しない
- HTTPS接続を使用しているか確認
- ブラウザのDevToolsでService Workerの状態を確認
- キャッシュをクリアして再読み込み

## 更新履歴

- **v1.0.0** (2025-10-16)
  - 初回リリース
  - WebXR API対応
  - Model Viewer 4.1.0統合
  - PWA対応完了
  - 3種類の基本モデル実装
