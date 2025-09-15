# 福岡市学校区域システム開発ガイド

福岡市の学校区域検索システム。住所⇄学校名の双方向検索対応。

## 技術スタック
- TypeScript（strict mode）、Vite、Vitest、pnpm
- 静的サイト生成（SSG）: 609個の静的ページ自動生成
- クラスベース設計、モジュール分離
- 585区域・74中学校区対応

## 開発コマンド
```bash
pnpm run dev        # 開発サーバー
pnpm run typecheck  # 型チェック
pnpm run lint       # リント
pnpm run test:run   # テスト
pnpm run build      # ビルド
pnpm run format     # フォーマット
```

## アーキテクチャ
- `managers/`: 機能別クラス（検索、表示、サジェスト）
- `StateManager`: 状態管理
- `BaseSuggestionsManager<T>`: 抽象基底クラス
- Utils系: DOM操作、ナビゲーション、検索、エラー

## 主要機能
- 町名検索（リアルタイムサジェスト）
- 学校名検索（逆引き）
- 双方向リンク
- URLパラメータ（`?q=天神` `?school=百道浜小`）

## 開発時の注意事項
- TypeScript strict mode維持
- 全UIは日本語
- モバイルファーストデザイン