from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="FastAPI Demo", version="1.0.0")

# データモデル
class Item(BaseModel):
    id: Optional[int] = None
    name: str
    description: Optional[str] = None
    price: float
    in_stock: bool = True

# インメモリデータベース
items_db: List[Item] = [
    Item(id=1, name="ノートパソコン", description="高性能ノートPC", price=120000, in_stock=True),
    Item(id=2, name="マウス", description="ワイヤレスマウス", price=3000, in_stock=True),
    Item(id=3, name="キーボード", description="メカニカルキーボード", price=15000, in_stock=False),
]

@app.get("/")
async def root():
    """ルートエンドポイント"""
    return {
        "message": "FastAPI デモへようこそ！",
        "endpoints": {
            "GET /": "このメッセージ",
            "GET /items": "全アイテムの取得",
            "GET /items/{item_id}": "特定アイテムの取得",
            "POST /items": "新しいアイテムの作成",
            "PUT /items/{item_id}": "アイテムの更新",
            "DELETE /items/{item_id}": "アイテムの削除",
            "GET /docs": "自動生成されたAPIドキュメント"
        }
    }

@app.get("/items", response_model=List[Item])
async def get_items(in_stock: Optional[bool] = None):
    """全アイテムを取得（オプション: 在庫状況でフィルタリング）"""
    if in_stock is not None:
        return [item for item in items_db if item.in_stock == in_stock]
    return items_db

@app.get("/items/{item_id}", response_model=Item)
async def get_item(item_id: int):
    """特定のアイテムをIDで取得"""
    for item in items_db:
        if item.id == item_id:
            return item
    return {"error": "アイテムが見つかりません"}

@app.post("/items", response_model=Item)
async def create_item(item: Item):
    """新しいアイテムを作成"""
    # 新しいIDを生成
    if items_db:
        new_id = max(item.id for item in items_db if item.id) + 1
    else:
        new_id = 1

    item.id = new_id
    items_db.append(item)
    return item

@app.put("/items/{item_id}", response_model=Item)
async def update_item(item_id: int, item: Item):
    """既存のアイテムを更新"""
    for index, existing_item in enumerate(items_db):
        if existing_item.id == item_id:
            item.id = item_id
            items_db[index] = item
            return item
    return {"error": "アイテムが見つかりません"}

@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    """アイテムを削除"""
    for index, item in enumerate(items_db):
        if item.id == item_id:
            deleted_item = items_db.pop(index)
            return {"message": "削除されました", "item": deleted_item}
    return {"error": "アイテムが見つかりません"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
