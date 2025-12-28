/**
 * SQLクエリバリデーター
 * 参照系クエリのみを許可し、更新系クエリをブロックする
 */
export class SqlValidator {
    /**
     * 許可されるクエリキーワード（参照系のみ）
     */
    private static readonly ALLOWED_KEYWORDS = [
        'SELECT',
        'SHOW',
        'DESC',
        'DESCRIBE',
        'EXPLAIN',
        'USE',
        'WITH'  // CTEのサポート
    ];

    /**
     * 禁止されるクエリキーワード（更新系）
     */
    private static readonly FORBIDDEN_KEYWORDS = [
        'INSERT',
        'UPDATE',
        'DELETE',
        'DROP',
        'TRUNCATE',
        'ALTER',
        'CREATE',
        'LOAD',
        'REPLACE',
        'GRANT',
        'REVOKE',
        'RENAME',
        'CALL',      // ストアドプロシージャ実行
        'EXECUTE',   // 動的SQL実行
        'EXEC'       // SQL Server用
    ];

    /**
     * SQLクエリが参照系かどうかを検証
     * @param sql 検証するSQLクエリ
     * @returns {isValid: boolean, error?: string}
     */
    static validate(sql: string): { isValid: boolean; error?: string } {
        if (!sql || sql.trim().length === 0) {
            return { isValid: false, error: 'SQL query is empty' };
        }

        // コメントとセミコロンで複数のクエリに分割
        const queries = this.splitQueries(sql);

        for (const query of queries) {
            const trimmed = query.trim();
            if (trimmed.length === 0) {
                continue;
            }

            // 最初のキーワードを抽出
            const firstKeyword = this.extractFirstKeyword(trimmed);

            if (!firstKeyword) {
                continue;
            }

            // 禁止キーワードのチェック
            if (this.FORBIDDEN_KEYWORDS.includes(firstKeyword)) {
                return {
                    isValid: false,
                    error: `Query type "${firstKeyword}" is not allowed. Only read-only queries (SELECT, SHOW, DESC, EXPLAIN) are permitted.`
                };
            }

            // 許可キーワードのチェック（WITHで始まる場合はCTEなので許可）
            if (!this.ALLOWED_KEYWORDS.includes(firstKeyword)) {
                return {
                    isValid: false,
                    error: `Unknown or unsupported query type "${firstKeyword}". Only read-only queries (SELECT, SHOW, DESC, EXPLAIN) are permitted.`
                };
            }
        }

        return { isValid: true };
    }

    /**
     * SQLクエリを複数のステートメントに分割
     * @param sql SQLクエリ文字列
     * @returns クエリの配列
     */
    private static splitQueries(sql: string): string[] {
        // 単純にセミコロンで分割（文字列リテラル内のセミコロンは考慮していない簡易版）
        return sql.split(';').filter(q => q.trim().length > 0);
    }

    /**
     * SQLクエリから最初のキーワードを抽出
     * @param sql SQLクエリ文字列
     * @returns 最初のキーワード（大文字）
     */
    private static extractFirstKeyword(sql: string): string | null {
        // コメントを除去
        let cleaned = sql;

        // 行コメント (-- または #) を除去
        cleaned = cleaned.replace(/--[^\n]*/g, '');
        cleaned = cleaned.replace(/#[^\n]*/g, '');

        // ブロックコメント (/* ... */) を除去
        cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

        // 前後の空白を削除
        cleaned = cleaned.trim();

        // 最初の単語を抽出
        const match = cleaned.match(/^(\w+)/i);
        if (match) {
            return match[1].toUpperCase();
        }

        return null;
    }

    /**
     * エラーメッセージに禁止されたキーワードが含まれているか確認
     * @param keyword キーワード
     * @returns 禁止されている場合はtrue
     */
    static isForbiddenKeyword(keyword: string): boolean {
        return this.FORBIDDEN_KEYWORDS.includes(keyword.toUpperCase());
    }

    /**
     * 許可されているキーワードのリストを取得
     * @returns 許可キーワード配列
     */
    static getAllowedKeywords(): string[] {
        return [...this.ALLOWED_KEYWORDS];
    }

    /**
     * 禁止されているキーワードのリストを取得
     * @returns 禁止キーワード配列
     */
    static getForbiddenKeywords(): string[] {
        return [...this.FORBIDDEN_KEYWORDS];
    }
}

