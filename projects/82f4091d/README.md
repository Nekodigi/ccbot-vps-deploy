# FastAPI デモアプリケーション

シンプルな商品管理APIのデモです。

## 機能

- 全アイテムの取得（在庫状況でフィルタリング可能）
- 特定アイテムの取得
- 新しいアイテムの作成
- アイテムの更新
- アイテムの削除

## セットアップ

1. 依存関係のインストール:
```bash
pip install -r requirements.txt
```

2. アプリケーションの起動:
```bash
uvicorn main:app --reload
```

または:
```bash
python main.py
```

## 使用方法

サーバーが起動したら、以下のURLにアクセスできます:

- アプリケーション: http://localhost:8000
- 自動生成されたAPIドキュメント（Swagger UI）: http://localhost:8000/docs
- 代替APIドキュメント（ReDoc）: http://localhost:8000/redoc

## APIエンドポイント

- `GET /` - ウェルカムメッセージとエンドポイント一覧
- `GET /items` - 全アイテムを取得（クエリパラメータ: `in_stock=true/false`）
- `GET /items/{item_id}` - 特定のアイテムを取得
- `POST /items` - 新しいアイテムを作成
- `PUT /items/{item_id}` - アイテムを更新
- `DELETE /items/{item_id}` - アイテムを削除

## 例

### curlでアイテムを作成:
```bash
curl -X POST "http://localhost:8000/items" \
  -H "Content-Type: application/json" \
  -d '{"name":"ヘッドフォン","description":"ノイズキャンセリング","price":25000,"in_stock":true}'
```

### 在庫ありのアイテムのみ取得:
```bash
curl "http://localhost:8000/items?in_stock=true"
```
