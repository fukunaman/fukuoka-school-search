# 福岡市学校区域システム開発ガイド

このプロジェクトは福岡市の学校区域検索システムです。住所から学校を、学校から住所を双方向で検索できます。

## プロジェクト概要
- **目的**: 福岡市の小・中学校校区と高校学区の検索
- **特徴**: 双方向検索（住所⇄学校名）とクリック可能なリンクナビゲーション
- **UI言語**: 日本語
- **データ**: 福岡市の学校区域情報（585区域、74中学校区）
- **デザイン**: 福岡市ブルーを基調とした現代的UI

## 技術スタック
- **言語**: TypeScript（strict mode）
- **ビルドツール**: Vite
- **テストフレームワーク**: Vitest
- **パッケージマネージャー**: pnpm 9.0.0+
- **コードフォーマット**: Prettier
- **スタイル**: CSS3（グラスモーフィズム、レスポンシブデザイン）
- **アーキテクチャ**: クラスベース設計、モジュール分離

## 開発コマンド

### 基本コマンド
```bash
# 開発サーバー起動
pnpm run dev

# 型チェック
pnpm run typecheck

# リント実行
pnpm run lint

# テスト実行
pnpm run test:run

# テスト（ウォッチモード）
pnpm run test:watch

# プロダクションビルド
pnpm run build

# プレビュー
pnpm run preview
```

# コードフォーマット
pnpm run format

# フォーマットチェック
pnpm run format:check
```

### 開発フロー
1. コード変更後、必ず`pnpm run typecheck`を実行
2. コード品質チェック: `pnpm run lint`
3. コードフォーマット: `pnpm run format`
4. テスト実行: `pnpm run test:run`
5. ビルド確認: `pnpm run build`

## アーキテクチャ詳細

### ディレクトリ構成
```
src/
├── managers/               # 機能別Managerクラス
│   ├── addressSearchManager.ts    # 住所検索機能
│   ├── displayManager.ts          # 表示管理（Results, Error, TownArea）
│   ├── schoolSearchManager.ts     # 学校検索機能
│   ├── suggestionsManager.ts      # サジェスト機能（抽象基底クラス含む）
│   └── index.ts                   # エクスポート集約
├── constants.ts           # 定数定義（DOM ID、CSS Class、HTML Template等）
├── data.ts               # 学校区域データと検索ロジック
├── main.ts               # メインアプリケーション（大幅簡略化）
├── readings.ts           # 読み仮名データ
├── state.ts              # アプリケーション状態管理
├── types.ts              # TypeScript型定義
└── utils.ts              # ユーティリティクラス群
```

### 外部ディレクトリ
- `styles/style.css`: モダンなグラスモーフィズムスタイル
- `data/`: CSVデータファイル
- `tests/`: テストファイル（29テスト）

### クラス設計（リファクタリング後）
```typescript
// === 状態管理 ===
class StateManager                    // アプリケーション状態の一元管理

// === managers/ ディレクトリ ===
// 抽象基底クラス
abstract class BaseSuggestionsManager<T>    // サジェスト機能の共通実装

// サジェスト機能（具象クラス）
class TownSuggestionsManager          // 町名サジェスト
class SchoolSuggestionsManager        // 学校名サジェスト

// 検索機能
class AddressSearchManager            // 住所検索（プルダウン）
class SchoolSearchManager            // 学校名検索

// 表示管理
class DisplayManager                  // 表示制御の共通機能
class ResultsManager                  // 検索結果表示
class TownAreaManager                 // エリア一覧表示
class ErrorManager                    // エラー表示

// === ユーティリティクラス ===
class DOMUtils                        // DOM操作、HTML生成
class NavigationUtils                 // ナビゲーション、スクロール
class SearchUtils                     // 検索・フィルタリング
class ErrorUtils                      // エラーハンドリング
```

### 主要機能
1. **町名検索**: フリーテキスト入力でリアルタイムサジェスト
2. **学校名検索**: 小・中学校名からの逆引き検索
3. **双方向リンク**: 検索結果からワンクリックで相互検索
4. **住所選択**: プルダウンによる段階的選択
5. **レスポンシブ**: モバイル対応のテーブル表示

### テスト構成
- **単体テスト**: データ検索機能、逆引き検索、データ整合性
- **統合テスト**: 実際のユースケーステスト、エッジケース、パフォーマンステスト
- **テストフレームワーク**: Vitest
- **テストカバレッジ**: 主要な検索機能と新規追加データを網羅

## 開発時の注意事項

### 言語・表記
- 全てのUI文字列は日本語
- 学校名・住所は正確な日本語表記
- エラーメッセージも日本語で表示

### コード品質
- TypeScript strict modeを維持
- 抽象クラスを活用した設計パターン
- DOM操作の安全性確保
- モバイルファーストなレスポンシブ対応

### リファクタリング改善点
#### 🏗️ アーキテクチャ改善
- **モジュール分離**: managers/ディレクトリで機能を分離（540行→86行のmain.ts）
- **状態管理の集約**: `StateManager`クラスによる一元管理
- **循環参照解決**: 動的import使用で依存関係をクリーンに
- **インスタンス管理**: シングルトンパターンでメモリ効率化

#### 📁 コード整理
- **定数の外部化**: DOM ID、CSS Class、HTML Templateを`constants.ts`に分離
- **ユーティリティの分類**: DOM操作、ナビゲーション、検索、エラー処理を分離
- **型安全性の向上**: 型定義の拡張と厳密な型チェック
- **未使用コード削除**: importの最適化とデッドコード除去

#### 🎨 UI/UX改善
- **福岡市ブルー**: #3b82f6基調の統一カラーテーマ
- **グラスモーフィズム**: 半透明背景とbackdrop-filterによるモダンUI
- **インタラクション**: ホバー効果、フェードイン、スムーズスクロール
- **レスポンシブ**: モバイルファーストデザイン

#### 🧪 品質向上
- **テスト網羅**: 29テストでデータ整合性と機能を検証
- **HTMLエスケープ**: XSS対策の強化
- **エラーハンドリング**: 統一的なエラー処理とユーザビリティ向上