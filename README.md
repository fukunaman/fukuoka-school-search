# 福岡市学校区域検索システム

福岡市の住所から通学する小学校・中学校・高校学区を検索できるWebアプリケーションです。

## 🌟 主な機能

- **町名フリーテキスト検索**: 町名を直接入力して候補から選択
- **学校名逆引き検索**: 小・中学校名から該当住所を検索
- **双方向リンク**: 検索結果からワンクリックで相互検索
- **住所選択式検索**: 区→町→丁目の順に選択
- **高校学区対応**: 中学校区に応じた高校学区も表示
- **詳細番地対応**: 複雑な区域も番地レベルで正確に判定
- **除外パターン対応**: 「〜を除く」記載を適切に処理
- **レスポンシブデザイン**: スマートフォンでも使いやすい

## 🚀 デモサイト

[https://fukunaman.github.io/fukuoka-school-search/](https://fukunaman.github.io/fukuoka-school-search/)

## 📌 URLパラメータによる検索

直接URLで検索を実行できます：

```
# 住所から検索（自動実行）
https://fukunaman.github.io/fukuoka-school-search/?q=天神

# 学校名から検索（自動実行）  
https://fukunaman.github.io/fukuoka-school-search/?school=百道浜小

# 検索のみ（手動選択）
https://fukunaman.github.io/fukuoka-school-search/?q=博多&auto=false
```

## 🛠️ 技術スタック

- **フロントエンド**: TypeScript, HTML5, CSS3
- **ビルドツール**: Vite
- **テスト**: Vitest
- **パッケージマネージャー**: pnpm
- **CI/CD**: GitHub Actions
- **ホスティング**: GitHub Pages / Cloudflare Pages
- **コード品質**: TypeScript strict mode, ESLint, Prettier
- **アーキテクチャ**: クラスベース設計、モジュール分離

## 📊 データ仕様

- **対象区域**: 福岡市全7区
- **登録データ**: 585の詳細住所区域
- **高校学区**: 74中学校区の学区情報
- **特別対応**: 長丘中学校区の住所別学区判定
- **データ更新**: 2025年時点の情報

## 🏃‍♂️ ローカル開発

### 必要要件

- Node.js 20以上
- pnpm 9.0.0以上

### セットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd fukuoka-city-school-area

# 依存関係のインストール
pnpm install

# 開発サーバー起動
pnpm run dev
```

### 利用可能なコマンド

```bash
# 開発サーバー起動
pnpm run dev

# 本番ビルド
pnpm run build

# プレビューサーバー起動
pnpm run preview

# 型チェック
pnpm run typecheck

# テスト実行
pnpm test

# テスト実行（ウォッチモード）
pnpm test:watch

# コード品質チェック
pnpm run lint

# コードフォーマット
pnpm run format

# フォーマットチェック
pnpm run format:check
```

## 📁 プロジェクト構造

```
fukuoka-city-school-area/
├── src/
│   ├── managers/        # 機能別Managerクラス
│   │   ├── addressSearchManager.ts    # 住所検索機能
│   │   ├── displayManager.ts          # 表示管理機能
│   │   ├── schoolSearchManager.ts     # 学校検索機能
│   │   ├── suggestionsManager.ts      # サジェスト機能
│   │   └── index.ts                   # エクスポート集約
│   ├── constants.ts     # 定数定義
│   ├── data.ts          # 学校区域データ・検索ロジック
│   ├── main.ts          # メインアプリケーション
│   ├── readings.ts      # 読み仮名データ
│   ├── state.ts         # 状態管理
│   ├── types.ts         # TypeScript型定義
│   └── utils.ts         # ユーティリティ関数
├── styles/
│   └── style.css        # スタイルシート
├── data/
│   ├── data.csv         # 元データCSV
│   ├── high_school_data.csv  # 高校学区データ
│   └── kana.csv         # 読み仮名データCSV
├── tests/
│   ├── data.test.ts     # データ機能テスト
│   └── integration.test.ts   # 統合テスト
├── public/              # 静的ファイル
├── index.html           # メインHTML
├── vite.config.ts       # Vite設定
├── vitest.config.ts     # テスト設定
├── CLAUDE.md           # 開発ガイド（Claude Code用）
└── package.json         # プロジェクト設定
```

## 🔄 データについて

- **学校区域データ**: `src/data.ts`に直接組み込み
- **高校学区データ**: 74中学校区の学区情報を収録
- **データ精度**: 番地レベルまで対応した585の詳細区域

## 🚀 アーキテクチャ

### フロントエンド構成
- **検索機能**: 双方向検索（住所⇄学校名）
- **サジェスト機能**: リアルタイム候補表示
- **ナビゲーション**: クリック可能なリンクで相互遷移
- **レスポンシブ**: モバイルファーストデザイン

### コード構成
- **クラスベース設計**: 機能ごとにManagerクラスを分離
- **抽象基底クラス**: BaseSuggestionsManagerでサジェスト機能を共通化
- **モジュール分離**: managers/ディレクトリで責務を分離
- **状態管理**: StateManagerクラスで一元管理
- **ユーティリティ分離**: DOM操作、ナビゲーション、検索処理
- **型安全**: TypeScript strict modeで完全な型チェック
- **テスト網羅**: 29のテストで機能を検証

## 📝 注意事項

- このデータは参考情報です
- 正確な情報は福岡市教育委員会にお問い合わせください
- 学校の新設・統廃合により情報が変更される場合があります

## 👤 作成者

**ふくなまん**
- X: [@fukunaman](https://x.com/fukunaman)
- note: [fukunaman](http://note.com/fukunaman)

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

Issue報告やプルリクエストを歓迎します。

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成
