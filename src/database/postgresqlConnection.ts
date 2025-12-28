import { Client } from 'pg';
import { IDBConnection, ConnectionProfile, QueryResult, TableInfo, ColumnInfo } from './types';

/**
 * PostgreSQL接続の実装
 */
export class PostgreSQLConnection implements IDBConnection {
    private client: Client | null = null;
    private profile: ConnectionProfile;
    private password: string;

    constructor(profile: ConnectionProfile, password: string) {
        this.profile = profile;
        this.password = password;
    }

    async connect(): Promise<void> {
        try {
            this.client = new Client({
                host: this.profile.host,
                port: this.profile.port,
                user: this.profile.username,
                password: this.password,
                database: this.profile.database,
                ssl: this.profile.ssl ? { rejectUnauthorized: false } : undefined
            });
            await this.client.connect();
        } catch (error) {
            throw new Error(`PostgreSQL接続エラー: ${error instanceof Error ? error.message : String(error)}`);
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
        if (this.client) {
            await this.client.end();
            this.client = null;
        }
    }

    isConnected(): boolean {
        return this.client !== null;
    }

    async executeQuery(query: string): Promise<QueryResult> {
        if (!this.client) {
            throw new Error('データベースに接続されていません');
        }

        const startTime = Date.now();
        
        try {
            const result = await this.client.query(query);
            const executionTime = (Date.now() - startTime) / 1000;

            if (result.rows && result.fields) {
                // SELECT クエリ
                const columns = result.fields.map(f => f.name);
                return {
                    columns,
                    rows: result.rows,
                    rowCount: result.rows.length,
                    executionTime
                };
            } else {
                // INSERT, UPDATE, DELETE クエリ
                return {
                    columns: ['rowCount'],
                    rows: [{ rowCount: result.rowCount }],
                    rowCount: result.rowCount || 0,
                    executionTime
                };
            }
        } catch (error) {
            throw new Error(`クエリ実行エラー: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async getTables(): Promise<TableInfo[]> {
        if (!this.client) {
            throw new Error('データベースに接続されていません');
        }

        const result = await this.client.query(
            `SELECT table_schema, table_name 
             FROM information_schema.tables 
             WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
             ORDER BY table_schema, table_name`
        );

        return result.rows.map(row => ({
            name: row.table_name,
            schema: row.table_schema
        }));
    }

    async getTableColumns(tableName: string): Promise<ColumnInfo[]> {
        if (!this.client) {
            throw new Error('データベースに接続されていません');
        }

        const result = await this.client.query(
            `SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length
             FROM information_schema.columns
             WHERE table_name = $1
             ORDER BY ordinal_position`,
            [tableName]
        );

        return result.rows.map(row => ({
            name: row.column_name,
            type: row.character_maximum_length 
                ? `${row.data_type}(${row.character_maximum_length})`
                : row.data_type,
            nullable: row.is_nullable === 'YES',
            key: '', // PostgreSQLでは別クエリで取得
            default: row.column_default,
            extra: ''
        }));
    }

    async getTableIndexes(tableName: string): Promise<any[]> {
        if (!this.client) {
            throw new Error('データベースに接続されていません');
        }

        const result = await this.client.query(
            `SELECT
                indexname,
                indexdef
             FROM pg_indexes
             WHERE tablename = $1`,
            [tableName]
        );

        return result.rows;
    }

    async getTableForeignKeys(tableName: string): Promise<any[]> {
        if (!this.client) {
            throw new Error('データベースに接続されていません');
        }

        const result = await this.client.query(
            `SELECT
                tc.constraint_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name,
                ccu.column_name AS foreign_column_name
             FROM information_schema.table_constraints AS tc
             JOIN information_schema.key_column_usage AS kcu
               ON tc.constraint_name = kcu.constraint_name
             JOIN information_schema.constraint_column_usage AS ccu
               ON ccu.constraint_name = tc.constraint_name
             WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_name = $1`,
            [tableName]
        );

        return result.rows;
    }
}

