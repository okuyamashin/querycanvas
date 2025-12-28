# VS Extension 001 - Cursor連携型データベースクライアント

Cursor/VS Code用のデータベースクライアント拡張機能です。MySQL/PostgreSQLに対応し、Cursor AIとの連携を前提とした設計で、データベーススキーマのドキュメント化とデータ分析を支援します。

## 主な機能

### 🗄️ データベース接続
- **複数接続管理**: 開発・ステージング・本番など、複数のデータベース接続を管理
- **MySQL対応**: MySQL 5.7+, 8.0+ をサポート
- **PostgreSQL対応**: PostgreSQL 12+ をサポート
- **セキュアな認証**: パスワードはVS Code Secret Storageに安全に保存

### 📊 SQLクエリ実行
- **直感的なUI**: SQL入力エリアと結果表示テーブル
- **実行時間計測**: クエリのパフォーマンスを確認
- **エラーハンドリング**: わかりやすいエラーメッセージ

### 📋 テーブル定義の自動ドキュメント化（実装予定）
- テーブル構造を自動取得
- Markdown形式でドキュメント生成（`db-schema/tables/`）
- Cursor AIと会話しながらドキュメント改善

### 💾 クエリ結果の保存（実装予定）
- **TSV/JSON形式**でエクスポート
- 名前とコメント付きで管理
- メタデータ（実行SQL、日時、行数）を記録
- 保存したデータをCursor AIで分析

## スクリーンショット

### データベースクライアントパネル
```
┌─────────────────────────────────────────┐
│ 接続: [開発DB ▼] 状態: ●接続中           │
│ [⚙️ 接続管理] [📋 テーブル定義] [📁 データ] │
├─────────────────────────────────────────┤
│ SQL入力エリア                            │
│ SELECT * FROM users;                    │
│                                         │
│ [実行 ▶]  [クリア]  [💾 結果を保存]     │
├─────────────────────────────────────────┤
│ 結果テーブル                             │
│ ┌────┬────────┬─────────┐              │
│ │ id │ name   │ email   │              │
│ ├────┼────────┼─────────┤              │
│ │ 1  │ Alice  │ a@ex.com│              │
│ │ 2  │ Bob    │ b@ex.com│              │
│ └────┴────────┴─────────┘              │
│                                         │
│ 実行時間: 0.123秒 | 行数: 2             │
└─────────────────────────────────────────┘
```

## 使い方

### 1. データベースクライアントを開く

1. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）を開く
2. 「**Database Client: Open**」と入力して実行
3. データベースクライアントパネルが開きます

### 2. データベースに接続（実装予定）

1. 「⚙️ 接続管理」ボタンをクリック
2. 「+ 新しい接続を追加」
3. 接続情報を入力して保存

### 3. SQLクエリを実行

1. SQL入力エリアにクエリを入力
2. 「▶ 実行」ボタンをクリック
3. 結果がテーブルに表示されます

## 実装状況

### ✅ 完了
- 基本的なWebviewパネル
- データベース接続レイヤー（MySQL/PostgreSQL）
- インターフェースベースの設計
- SSL接続サポート

### 🚧 実装中
- 接続プロファイル管理
- 実際のクエリ実行機能
- テーブル定義取得
- クエリ結果の保存

### 📋 今後の予定
- クエリ履歴機能
- お気に入りクエリの保存
- オートコンプリート（テーブル名・カラム名）
- ER図の自動生成
- データセットの差分表示

## 開発方法

### セットアップ

1. 依存関係のインストール:
```bash
npm install
```

2. TypeScriptのコンパイル:
```bash
npm run compile
```

または、ウォッチモードで自動コンパイル:
```bash
npm run watch
```

### デバッグと実行

1. VS Code/Cursorでこのプロジェクトを開く
2. `F5` キーを押す（または「実行」→「デバッグの開始」）
3. 新しいウィンドウ（Extension Development Host）が開きます
4. コマンドパレット（`Cmd+Shift+P` / `Ctrl+Shift+P`）を開く
5. "Hello World" と入力してコマンドを実行

### プロジェクト構造

```
vsex001/
├── src/
│   ├── extension.ts                # 拡張機能のエントリーポイント
│   ├── databaseClientPanel.ts      # Webview UIの管理
│   └── database/                   # データベース接続レイヤー
│       ├── types.ts                # 型定義とインターフェース
│       ├── mysqlConnection.ts      # MySQL実装
│       ├── postgresqlConnection.ts # PostgreSQL実装
│       ├── connectionFactory.ts    # 接続ファクトリー
│       └── index.ts
├── docs/                          # ドキュメント
│   ├── conversations/             # 会話履歴
│   └── specifications/            # 仕様書
├── out/                           # コンパイル済みJavaScript
├── .vscode/
│   ├── launch.json                # デバッグ設定
│   └── tasks.json                 # ビルドタスク設定
├── package.json                   # 拡張機能のマニフェスト
├── tsconfig.json                  # TypeScript設定
├── TESTING.md                     # テスト手順
└── README.md                      # このファイル
```

## 技術スタック

- **TypeScript 5.3+**: 型安全な開発
- **VS Code Extension API**: 拡張機能の基盤
- **mysql2**: MySQL Node.jsクライアント（Promise対応）
- **pg**: PostgreSQL Node.jsクライアント
- **Webview**: カスタムUIの実装

## アーキテクチャ

### デザインパターン
- **Strategy Pattern**: データベースタイプに応じた実装の切り替え
- **Factory Pattern**: 接続インスタンスの生成
- **Interface Segregation**: 共通インターフェースで統一

### セキュリティ
- パスワードはVS Code Secret Storageに保存
- パラメータ化クエリでSQLインジェクション対策
- SSL接続のサポート

## ドキュメント

- [TESTING.md](./TESTING.md) - テスト・デバッグ手順
- [仕様書](./docs/specifications/) - 機能仕様とアーキテクチャ
- [会話履歴](./docs/conversations/) - 開発の経緯

## カスタマイズ

### 新しいデータベースタイプの追加

1. `src/database/types.ts` に新しいタイプを追加
2. `IDBConnection` インターフェースを実装した新しいクラスを作成
3. `ConnectionFactory` に新しいケースを追加

詳細は[データベース接続レイヤー仕様](./docs/specifications/database-connection-layer.md)を参照してください。

## 参考リンク

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [node-postgres Documentation](https://node-postgres.com/)

## ライセンス

このプロジェクトはサンプルプロジェクトです。

## 作者

okuyama

## リポジトリ

https://github.com/okuyamashin/vsex001

