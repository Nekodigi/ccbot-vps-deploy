# 東京都データ視覚化ダッシュボード

東京都の統計データを美しく視覚化するPWAアプリケーション

## 機能

- **6種類のインタラクティブチャート**
  - 人口推移（折れ線グラフ）
  - 年齢層別人口構成（ドーナツチャート）
  - 区別人口分布（横棒グラフ）
  - 産業別就業者数（極座標チャート）
  - 月別観光客数（棒グラフ）
  - 交通機関別利用者数（円グラフ）

- **主要統計カード**
  - 総人口：14,097,120人
  - 特別区数：23区
  - 人口密度：6,402人/km²
  - 都内総生産：107.3兆円

- **PWA対応**
  - オフライン動作対応
  - ホーム画面への追加可能
  - Service Worker実装

- **ライト/ダークテーマ切り替え**
- **データ更新機能**
- **Firebase統合**
- **レスポンシブデザイン**

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript
- **チャートライブラリ**: Chart.js 4.4.1
- **D3.js**: 7.0
- **Firebase**: Firestore, AI Logic SDK対応
- **PWA**: Service Worker, Web App Manifest

## ファイル構成

```
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── app.js             # メインアプリケーションロジック
├── firebase-config.js  # Firebase設定
├── sw.js              # Service Worker
├── manifest.json      # PWAマニフェスト
├── icon-192.png       # PWAアイコン (192x192)
├── icon-512.png       # PWAアイコン (512x512)
├── icon.svg           # SVGアイコン
└── favicon.png        # ファビコン
```

## データソース

東京都の統計データは、実際の公開データおよび統計情報を基に作成されています。

## アクセス

https://vps.nekodigi.com/ccbot/projects/82e6c9a6/

## 開発者

- プロジェクトID: 82e6c9a6
- 作成日: 2025-10-17
