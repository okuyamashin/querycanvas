/**
 * データベース接続の種類
 */
export type DatabaseType = 'mysql' | 'postgresql';

/**
 * データベース接続プロファイル
 */
export interface ConnectionProfile {
    id: string;
    name: string;
    type: DatabaseType;
    host: string;
    port: number;
    database: string;
    username: string;
    ssl: boolean;
}

/**
 * クエリ実行結果
 */
export interface QueryResult {
    columns: string[];
    rows: any[];
    rowCount: number;
    executionTime: number;
}

/**
 * テーブル情報
 */
export interface TableInfo {
    name: string;
    schema?: string;
}

/**
 * カラム情報
 */
export interface ColumnInfo {
    name: string;
    type: string;
    nullable: boolean;
    key: string; // PRI, UNI, MUL, etc.
    default: string | null;
    extra: string;
}

/**
 * データベース接続の抽象インターフェース
 */
export interface IDBConnection {
    /**
     * データベースに接続
     */
    connect(): Promise<void>;

    /**
     * 接続をテスト
     */
    testConnection(): Promise<boolean>;

    /**
     * データベースから切断
     */
    disconnect(): Promise<void>;

    /**
     * 接続状態を確認
     */
    isConnected(): boolean;

    /**
     * SQLクエリを実行
     */
    executeQuery(query: string): Promise<QueryResult>;

    /**
     * 全テーブル一覧を取得
     */
    getTables(): Promise<TableInfo[]>;

    /**
     * テーブルのカラム情報を取得
     */
    getTableColumns(tableName: string): Promise<ColumnInfo[]>;

    /**
     * テーブルのインデックス情報を取得
     */
    getTableIndexes(tableName: string): Promise<any[]>;

    /**
     * テーブルの外部キー情報を取得
     */
    getTableForeignKeys(tableName: string): Promise<any[]>;
}

