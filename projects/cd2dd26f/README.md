# タスクマネージャー PWA

ビジネスシーンで活躍する、シンプルで洗練されたタスク管理アプリケーションです。

## 主な機能

### PWA対応
- オフラインで動作
- ホーム画面にインストール可能
- アプリライクな操作感
- 高速な読み込み

### タスク管理
- タスクの追加・完了・削除
- フィルター機能（すべて・進行中・完了）
- リアルタイム統計表示
- LocalStorageによるデータ永続化

### ユーザー体験
- シンプルで洗練されたデザイン
- レスポンシブ対応（スマートフォン・タブレット・PC）
- オンライン/オフライン状態の表示
- トースト通知による操作フィードバック

## 技術スタック

- **HTML5**: セマンティックマークアップ、SEO最適化
- **CSS3**: カスタムプロパティ、Flexbox、Grid、アニメーション
- **Vanilla JavaScript**: クラスベースの状態管理
- **Service Worker**: オフライン対応、キャッシュ戦略
- **Web App Manifest**: PWA設定

## ファイル構成

```
.
├── index.html              # メインHTMLファイル
├── styles.css             # スタイルシート
├── app.js                 # アプリケーションロジック
├── service-worker.js      # Service Worker
├── manifest.json          # PWAマニフェスト
├── icons/                 # アプリアイコン
│   ├── icon.svg          # SVGアイコン
│   ├── generate-icons.html # アイコン生成ツール
│   └── README.md         # アイコン生成ガイド
└── README.md             # このファイル
```

## セットアップ

### 基本的な使用方法

1. Webサーバーでこのディレクトリをホストしてください
2. HTTPSで配信してください（Service Workerの要件）
3. ブラウザで `index.html` にアクセス

### ローカル開発

```bash
# シンプルなHTTPサーバーを起動
python3 -m http.server 8000

# または Node.js の http-server を使用
npx http-server -p 8000
```

開発時はHTTPで動作しますが、本番環境では必ずHTTPSを使用してください。

## アイコンの生成

PWAアイコンを生成するには、以下の方法があります：

### 方法1: ブラウザで生成（推奨）

1. ブラウザで `icons/generate-icons.html` を開く
2. 自動生成されたアイコンを右クリックして保存
3. ファイル名は表示されている通りに保存

### 方法2: オンラインツール

[PWA Image Generator](https://www.pwabuilder.com/imageGenerator) を使用して、
`icons/icon.svg` からすべてのサイズのPNG画像を一括生成できます。

詳細は `icons/README.md` を参照してください。

## PWA機能の検証

### Chrome DevTools で確認

1. Chrome DevTools を開く（F12）
2. **Application** タブを選択
3. 以下を確認：
   - **Manifest**: PWA設定が正しく読み込まれているか
   - **Service Workers**: Service Workerが正常に登録されているか
   - **Storage > Local Storage**: タスクデータが保存されているか
   - **Cache Storage**: キャッシュが正しく作成されているか

### Lighthouse 監査

1. Chrome DevTools の **Lighthouse** タブ
2. **Progressive Web App** にチェック
3. **Analyze page load** を実行
4. PWAの要件を満たしているか確認

## ブラウザ対応

- Chrome / Edge: フル対応
- Firefox: 基本機能対応（インストール機能は制限あり）
- Safari (iOS): 基本機能対応（一部制限あり）

## カスタマイズ

### テーマカラーの変更

`styles.css` の CSS変数を編集：

```css
:root {
    --color-primary: #2c3e50;      /* プライマリカラー */
    --color-accent: #3498db;       /* アクセントカラー */
    /* その他の色設定 */
}
```

### アプリ名の変更

以下のファイルを編集：
- `index.html`: `<title>` タグとヘッダーテキスト
- `manifest.json`: `name` と `short_name`

### SEO / OGP メタタグ

`index.html` の `<head>` セクション内のメタタグを編集：
- `og:url`: 実際のURL
- `og:image`: 実際の画像URL
- `twitter:image`: 実際の画像URL

## デプロイ

### Apache / Nginx

1. ファイルをWebサーバーのドキュメントルートに配置
2. HTTPS証明書を設定
3. `.htaccess` または nginx設定でHTTPSリダイレクトを設定

### GitHub Pages

```bash
# リポジトリをプッシュ
git add .
git commit -m "Initial commit"
git push origin main

# Settings > Pages で main ブランチを公開
```

### Netlify / Vercel

1. リポジトリをプッシュ
2. Netlify / Vercel にインポート
3. 自動でHTTPSが設定されます

## トラブルシューティング

### Service Workerが登録されない

- HTTPSで配信されているか確認
- ブラウザのコンソールでエラーを確認
- Service Workerのスコープが正しいか確認

### アイコンが表示されない

- アイコンファイルが正しく配置されているか確認
- manifest.json のパスが正しいか確認
- `icons/generate-icons.html` でアイコンを生成

### オフラインで動作しない

- Service Workerが正常に登録されているか確認
- キャッシュが作成されているか確認（DevTools > Application > Cache Storage）
- ネットワークタブで「Offline」を選択してテスト

## ライセンス

このプロジェクトは自由に使用・改変できます。

## 今後の拡張案

- ダークモード対応
- タスクの優先度設定
- 期限設定とリマインダー
- カテゴリ機能
- バックエンドAPIとの同期
- プッシュ通知
- タスクの並び替え（ドラッグ&ドロップ）
- タスクの検索機能
- エクスポート/インポート機能（JSON, CSV）

## 参考資料

- [Progressive Web Apps | MDN](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
- [Service Worker API | MDN](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest | MDN](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [PWA Builder](https://www.pwabuilder.com/)
