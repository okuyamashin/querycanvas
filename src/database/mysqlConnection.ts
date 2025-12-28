import * as mysql from 'mysql2/promise';
import { IDBConnection, ConnectionProfile, QueryResult, TableInfo, ColumnInfo } from './types';

/**
 * MySQL接続の実装
 */
export class MySQLConnection implements IDBConnection {
    private connection: mysql.Connection | null = null;
    private profile: ConnectionProfile;
    private password: string;

    constructor(profile: ConnectionProfile, password: string) {
        this.profile = profile;
        this.password = password;
    }

    async connect(): Promise<void> {
        try {
            this.connection = await mysql.createConnection({
                host: this.profile.host,
                port: this.profile.port,
                user: this.profile.username,
                password: this.password,
                database: this.profile.database,
                ssl: this.profile.ssl ? { rejectUnauthorized: false } : undefined
            });
        } catch (error) {
            throw new Error(`MySQL接続エラー: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.connect();
            await this.disconnect();
            return true;
        } catch (error) {
            return false;
        }
    }

    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.end();
            this.connection = null;
        }
    }

    isConnected(): boolean {
        return this.connection !== null;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.connection) {
            throw new Error('データベースに接続されていません');
        }

        const startTime = Date.now();
        
        try {
            const [rows, fields] = await this.connection.query(query);
            const executionTime = (Date.now() - startTime) / 1000;

            if (Array.isArray(rows)) {
                // SELECT クエリ
                const columns = fields?.map(f => f.name) || [];
                return {
                    columns,
                    rows: rows as any[],
                    rowCount: rows.length,
                    executionTime
                };
            } else {
                // INSERT, UPDATE, DELETE クエリ
                const result = rows as mysql.ResultSetHeader;
                return {
                    columns: ['affectedRows', 'insertId'],
                    rows: [{
                        affectedRows: result.affectedRows,
                        insertId: result.insertId
                    }],
                    rowCount: result.affectedRows,
                    executionTime
                };
            }
        } catch (error) {
            throw new Error(`クエリ実行エラー: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.connection) {
            throw new Error('データベースに接続されていません');
        }

        const [rows] = await this.connection.query(
            'SHOW TABLES'
        );

        return (rows as any[]).map(row => ({
            name: Object.values(row)[0] as string
        }));
    }

    async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.connection) {
            throw new Error('データベースに接続されていません');
        }

        const [rows] = await this.connection.query(
            'SHOW COLUMNS FROM ??',
            [tableName]
        );

        return (rows as any[]).map(row => ({
            name: row.Field,
            type: row.Type,
            nullable: row.Null === 'YES',
            key: row.Key,
            default: row.Default,
            extra: row.Extra
        }));
    }

    async getTableIndexes(tableName: string): Promise<any[]> {
        if (!this.connection) {
            throw new Error('データベースに接続されていません');
        }

        const [rows] = await this.connection.query(
            'SHOW INDEX FROM ??',
            [tableName]
        );

        return rows as any[];
    }

    async getTableForeignKeys(tableName: string): Promise<any[]> {
        if (!this.connection) {
            throw new Error('データベースに接続されていません');
        }

        const [rows] = await this.connection.query(
            `SELECT 
                CONSTRAINT_NAME,
                COLUMN_NAME,
                REFERENCED_TABLE_NAME,
                REFERENCED_COLUMN_NAME
             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL`,
            [this.profile.database, tableName]
        );

        return rows as any[];
    }
}

