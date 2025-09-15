# 福岡市学校区域検索

福岡市の住所から通学する小学校・中学校・高校学区を検索できるWebアプリです。

**🌟 デモサイト**: [https://fukunaman.github.io/fukuoka-school-search/](https://fukunaman.github.io/fukuoka-school-search/)

## 主な機能
- 町名フリーテキスト検索・学校名逆引き検索
- 双方向リンクで相互検索
- URLパラメータ検索（`?q=天神` `?school=百道浜小`）
- 585区域・74中学校区対応

## 技術スタック
- TypeScript, Vite, Vitest, pnpm
- 静的サイト生成（SSG）対応
- クラスベース設計、モジュール分離

## 開発
```bash
pnpm install
pnpm run dev       # 開発サーバー
pnpm run build     # ビルド
pnpm run test:run  # テスト
```

## 注意事項
参考情報です。正確な情報は福岡市にお問い合わせください。

## 作成者
**ふくなまん** - [X](https://x.com/fukunaman) / [note](http://note.com/fukunaman)

## コントリビューション
Issue報告やプルリクエストを歓迎します。
