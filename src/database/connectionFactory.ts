import { IDBConnection, ConnectionProfile } from './types';
import { MySQLConnection } from './mysqlConnection';
import { PostgreSQLConnection } from './postgresqlConnection';

/**
 * データベース接続のファクトリークラス
 * 接続タイプに応じて適切な接続インスタンスを生成
 */
export class ConnectionFactory {
    /**
     * 接続プロファイルとパスワードから接続インスタンスを生成
     */
    static createConnection(profile: ConnectionProfile, password: string): IDBConnection {
        switch (profile.type) {
            case 'mysql':
                return new MySQLConnection(profile, password);
            case 'postgresql':
                return new PostgreSQLConnection(profile, password);
            default:
                throw new Error(`サポートされていないデータベースタイプ: ${profile.type}`);
        }
    }
}

