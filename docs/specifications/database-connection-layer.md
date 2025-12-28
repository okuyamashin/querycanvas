# データベース接続レイヤー - 実装仕様

## 概要

MySQL と PostgreSQL に対応した統一的なデータベース接続レイヤーの実装。
インターフェースベースの設計により、新しいデータベースタイプの追加が容易。

## アーキテクチャ

### 設計パターン

- **Strategy Pattern**: データベースタイプに応じた接続実装を切り替え
- **Factory Pattern**: 接続インスタンスの生成を抽象化
- **Interface Segregation**: 共通インターフェースで異なるDB実装を統一

### ディレクトリ構造

```
src/database/
├── types.ts                    # 型定義とインターフェース
├── mysqlConnection.ts          # MySQL実装
├── postgresqlConnection.ts     # PostgreSQL実装
├── connectionFactory.ts        # ファクトリークラス
└── index.ts                    # エクスポート
```

## コンポーネント詳細

### 1. types.ts - 型定義とインターフェース

#### DatabaseType
```typescript
type DatabaseType = 'mysql' | 'postgresql';
```

サポートするデータベースタイプの定義。

#### ConnectionProfile
```typescript
interface ConnectionProfile {
    id: string;           // 一意のID
    name: string;         // 表示名（例: "開発DB"）
    type: DatabaseType;   // データベースタイプ
    host: string;         // ホスト名
    port: number;         // ポート番号
    database: string;     // データベース名
    username: string;     // ユーザー名
    ssl: boolean;         // SSL有効化
}
```

接続プロファイルの構造。パスワードは含まず、Secret Storageで別管理。

#### QueryResult
```typescript
interface QueryResult {
    columns: string[];      // カラム名の配列
    rows: any[];           // 行データの配列
    rowCount: number;      // 行数
    executionTime: number; // 実行時間（秒）
}
```

クエリ実行結果の統一フォーマット。

#### TableInfo
```typescript
interface TableInfo {
    name: string;    // テーブル名
    schema?: string; // スキーマ名（PostgreSQLのみ）
}
```

テーブル情報。

#### ColumnInfo
```typescript
interface ColumnInfo {
    name: string;         // カラム名
    type: string;         // データ型
    nullable: boolean;    // NULL許可
    key: string;          // キー種別（PRI, UNI, MULなど）
    default: string | null; // デフォルト値
    extra: string;        // 追加情報（auto_incrementなど）
}
```

カラムの詳細情報。

#### IDBConnection インターフェース

すべてのデータベース接続実装が準拠するインターフェース。

```typescript
interface IDBConnection {
    // 接続管理
    connect(): Promise<void>;
    testConnection(): Promise<boolean>;
    disconnect(): Promise<void>;
    isConnected(): boolean;

    // クエリ実行
    executeQuery(query: string): Promise<QueryResult>;

    // スキーマ情報取得
    getTables(): Promise<TableInfo[]>;
    getTableColumns(tableName: string): Promise<ColumnInfo[]>;
    getTableIndexes(tableName: string): Promise<any[]>;
    getTableForeignKeys(tableName: string): Promise<any[]>;
}
```

### 2. mysqlConnection.ts - MySQL実装

#### 使用ライブラリ
- `mysql2/promise` - Promise対応のMySQL Node.jsクライアント

#### 主な実装内容

**接続管理**
- SSL接続のサポート
- パラメータ化クエリによるSQLインジェクション対策

**クエリ実行**
- SELECTクエリ: カラムと行データを返す
- INSERT/UPDATE/DELETE: 影響を受けた行数を返す
- 実行時間の計測

**スキーマ情報取得**
- `SHOW TABLES` でテーブル一覧
- `SHOW COLUMNS` でカラム情報
- `SHOW INDEX` でインデックス情報
- `INFORMATION_SCHEMA` で外部キー情報

#### エラーハンドリング
- 接続エラー
- クエリ実行エラー
- わかりやすいエラーメッセージ

### 3. postgresqlConnection.ts - PostgreSQL実装

#### 使用ライブラリ
- `pg` - PostgreSQL Node.jsクライアント

#### 主な実装内容

**接続管理**
- SSL接続のサポート
- パラメータ化クエリ（`$1`, `$2`形式）

**クエリ実行**
- SELECTクエリ: `result.rows` と `result.fields` を使用
- INSERT/UPDATE/DELETE: `result.rowCount` を返す
- 実行時間の計測

**スキーマ情報取得**
- `information_schema.tables` でテーブル一覧（スキーマ対応）
- `information_schema.columns` でカラム情報
- `pg_indexes` でインデックス情報
- `information_schema.table_constraints` で外部キー情報

#### PostgreSQL特有の対応
- スキーマのサポート
- システムテーブル（`pg_catalog`, `information_schema`）の除外

### 4. connectionFactory.ts - ファクトリークラス

#### 責務
接続プロファイルとパスワードから適切な接続インスタンスを生成。

```typescript
class ConnectionFactory {
    static createConnection(
        profile: ConnectionProfile, 
        password: string
    ): IDBConnection {
        switch (profile.type) {
            case 'mysql':
                return new MySQLConnection(profile, password);
            case 'postgresql':
                return new PostgreSQLConnection(profile, password);
            default:
                throw new Error(`サポートされていないデータベースタイプ`);
        }
    }
}
```

#### 利点
- クライアントコードはデータベースタイプを意識不要
- 新しいデータベースタイプの追加が容易
- テストでのモック化が簡単

## 使用例

### 基本的な使用方法

```typescript
import { ConnectionFactory, ConnectionProfile } from './database';

// 接続プロファイルを定義
const profile: ConnectionProfile = {
    id: 'dev-mysql',
    name: '開発DB',
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    database: 'myapp_development',
    username: 'devuser',
    ssl: false
};

// 接続インスタンスを作成
const connection = ConnectionFactory.createConnection(profile, 'password123');

try {
    // 接続
    await connection.connect();
    console.log('接続成功');

    // クエリ実行
    const result = await connection.executeQuery('SELECT * FROM users LIMIT 10');
    console.log(`取得行数: ${result.rowCount}`);
    console.log(`実行時間: ${result.executionTime}秒`);
    console.log('カラム:', result.columns);
    console.log('データ:', result.rows);

    // テーブル一覧取得
    const tables = await connection.getTables();
    console.log('テーブル:', tables.map(t => t.name));

    // カラム情報取得
    const columns = await connection.getTableColumns('users');
    columns.forEach(col => {
        console.log(`${col.name}: ${col.type} ${col.nullable ? 'NULL' : 'NOT NULL'}`);
    });

} catch (error) {
    console.error('エラー:', error);
} finally {
    // 切断
    await connection.disconnect();
    console.log('切断完了');
}
```

### 接続テスト

```typescript
const success = await connection.testConnection();
if (success) {
    console.log('接続テスト成功');
} else {
    console.log('接続テスト失敗');
}
```

### PostgreSQL接続の例

```typescript
const pgProfile: ConnectionProfile = {
    id: 'prod-postgres',
    name: '本番DB',
    type: 'postgresql',
    host: 'db.example.com',
    port: 5432,
    database: 'myapp_production',
    username: 'readonly_user',
    ssl: true
};

const pgConnection = ConnectionFactory.createConnection(pgProfile, 'secure_password');
await pgConnection.connect();

// PostgreSQLはスキーマ対応
const tables = await pgConnection.getTables();
tables.forEach(table => {
    console.log(`${table.schema}.${table.name}`);
});
```

## セキュリティ考慮事項

### パスワード管理
- ❌ `ConnectionProfile` にパスワードを含めない
- ✅ パスワードは VS Code Secret Storage に保存
- ✅ ファクトリーメソッドでパスワードを渡す

### SQLインジェクション対策
- ✅ パラメータ化クエリを使用
- MySQL: `connection.query('SELECT * FROM ?? WHERE id = ?', [table, id])`
- PostgreSQL: `client.query('SELECT * FROM users WHERE id = $1', [id])`

### SSL接続
- ✅ 本番環境では SSL を有効化
- ✅ 自己署名証明書の場合は `rejectUnauthorized: false` を検討

## 拡張性

### 新しいデータベースタイプの追加

1. `types.ts` に新しいタイプを追加
```typescript
type DatabaseType = 'mysql' | 'postgresql' | 'sqlite';
```

2. 新しい接続クラスを作成
```typescript
// src/database/sqliteConnection.ts
export class SQLiteConnection implements IDBConnection {
    // IDBConnectionの全メソッドを実装
}
```

3. ファクトリーに追加
```typescript
case 'sqlite':
    return new SQLiteConnection(profile, password);
```

## 制限事項

### 現在の制限
- トランザクション管理は未実装
- コネクションプーリングは未実装
- プリペアドステートメントの明示的な管理は未実装
- 大量データのストリーミングは未実装

### 今後の実装予定
- バッチクエリ実行
- トランザクションサポート
- コネクションプールの管理
- クエリタイムアウトの設定
- リトライロジック

## テスト

### 単体テストの方針
- 各接続クラスのモックを作成
- インターフェースに対するテスト
- エラーケースのテスト

### 統合テストの方針
- Docker で MySQL/PostgreSQL を起動
- 実際の接続テスト
- スキーマ情報取得のテスト

## 変更履歴

| 日付 | 変更内容 | 変更者 |
|------|----------|--------|
| 2025-12-28 | 初版作成 - MySQL/PostgreSQL対応 | okuyama |

