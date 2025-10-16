# TaskFlow - スマートタスク管理

AI搭載のスマートタスク管理PWAアプリケーション

## 主な機能

### タスク管理
- タスクの追加・編集・削除
- チェックボックスでタスクの完了管理
- リアルタイム同期（Firestore）

### AI機能
- **自動優先度判定**: タスク追加時にAIが内容を分析し、自動的に優先度（高・中・低）を設定
- **タスク提案**: 新規タスクに対して具体的なアクションステップを提案
- **AIアシスタント**: タスクに関する質問や相談ができるチャット機能

### フィルタリング
- すべてのタスク
- 進行中のタスク
- 完了したタスク

### 統計情報
- 合計タスク数
- 進行中タスク数
- 完了タスク数

### PWA対応
- オフライン動作
- ホーム画面に追加可能
- レスポンシブデザイン

## 技術スタック

- **フロントエンド**: Pure HTML/CSS/JavaScript
- **データベース**: Firebase Firestore
- **AI**: Firebase AI Logic SDK (Gemini 1.5 Flash)
- **PWA**: Service Worker、Web App Manifest

## Firebaseパス構造

```
/ccbotDev/nekokazu/apps/645f98fc/tasks/
```

各タスクのデータ構造:
```javascript
{
  title: string,
  completed: boolean,
  priority: 'high' | 'medium' | 'low',
  createdAt: timestamp,
  userId: string
}
```

## デザイン方針

- シンプルかつ洗練されたビジネスデザイン
- 重要な情報を色で強調
- 不要な装飾を排除
- 直感的な操作性

## ファイル構成

```
/
├── index.html          # メインHTMLファイル
├── style.css           # スタイルシート
├── app.js              # アプリケーションロジック
├── sw.js               # Service Worker
├── manifest.json       # PWA Manifest
├── icon-192.png        # PWAアイコン (192x192)
├── icon-512.png        # PWAアイコン (512x512)
└── README.md           # このファイル
```

## 使い方

1. タスク入力欄に新しいタスクを入力
2. 「追加」ボタンをクリック
3. AIが自動的に優先度を判定
4. 具体的なアクションステップの提案を表示
5. チェックボックスでタスクの完了/未完了を切り替え
6. 右上のAIボタンでアシスタントと対話

## アクセス

https://vps.nekodigi.com/ccbot/projects/645f98fc
