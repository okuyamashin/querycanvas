import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { IDBConnection, TableInfo, ColumnInfo } from './database/types';

/**
 * スキーマをMarkdownドキュメントとして出力するクラス
 */
export class SchemaDocumentGenerator {
    private readonly workspaceRoot: string;
    private readonly schemaDir: string;
    private readonly tablesDir: string;

    constructor() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('ワークスペースが開かれていません');
        }

        this.workspaceRoot = workspaceFolders[0].uri.fsPath;
        this.schemaDir = path.join(this.workspaceRoot, 'db-schema');
        this.tablesDir = path.join(this.schemaDir, 'tables');

        // ディレクトリを作成
        this.ensureDirectories();
    }

    /**
     * 必要なディレクトリを作成
     */
    private ensureDirectories(): void {
        if (!fs.existsSync(this.schemaDir)) {
            fs.mkdirSync(this.schemaDir, { recursive: true });
        }
        if (!fs.existsSync(this.tablesDir)) {
            fs.mkdirSync(this.tablesDir, { recursive: true });
        }
    }

    /**
     * すべてのテーブルのスキーマを抽出してMarkdownで保存
     */
    async extractAllTables(connection: IDBConnection, databaseName: string): Promise<number> {
        // テーブル一覧を取得
        const tables = await connection.getTables();

        let count = 0;
        for (const table of tables) {
            await this.extractTable(connection, table);
            count++;
        }

        // README.mdを生成
        await this.generateReadme(databaseName, tables.length);

        return count;
    }

    /**
     * 個別のテーブルスキーマを抽出
     */
    private async extractTable(connection: IDBConnection, table: TableInfo): Promise<void> {
        const tableName = table.name;
        const filePath = path.join(this.tablesDir, `${tableName}.md`);

        // 既存ファイルがある場合は読み込んで補足情報を保持
        let existingComments = this.extractExistingComments(filePath);

        // カラム情報を取得
        const columns = await connection.getTableColumns(tableName);

        // インデックス情報を取得
        const indexes = await connection.getTableIndexes(tableName);

        // 外部キー情報を取得
        const foreignKeys = await connection.getTableForeignKeys(tableName);

        // Markdownを生成
        const markdown = this.generateTableMarkdown(
            tableName,
            columns,
            indexes,
            foreignKeys,
            existingComments
        );

        // ファイルに書き込み
        fs.writeFileSync(filePath, markdown, 'utf-8');
    }

    /**
     * 既存ファイルから補足コメントを抽出
     */
    private extractExistingComments(filePath: string): Map<string, any> {
        const comments = new Map<string, any>();

        if (!fs.existsSync(filePath)) {
            return comments;
        }

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // テーブル論理名を抽出
            const logicalNameMatch = content.match(/\*\*論理名\*\*: (.+)/);
            if (logicalNameMatch) {
                comments.set('_table_logical_name', logicalNameMatch[1].trim());
            }

            // テーブル説明を抽出
            const descMatch = content.match(/## テーブル説明\n\n([\s\S]*?)\n\n##/);
            if (descMatch && descMatch[1].trim() !== '（Cursorと会話しながらここに説明を追記してください）') {
                comments.set('_table_description', descMatch[1].trim());
            }

            // カラム詳細を抽出
            const detailsMatch = content.match(/## カラム詳細\n\n([\s\S]*?)(?:\n\n##|$)/);
            if (detailsMatch) {
                const columnBlocks = detailsMatch[1].split(/\n- `(.+?)`\n/);
                for (let i = 1; i < columnBlocks.length; i += 2) {
                    const columnName = columnBlocks[i];
                    const details = columnBlocks[i + 1];
                    
                    const logicalMatch = details.match(/\*\*論理名\*\*: (.+)/);
                    const descMatch = details.match(/\*\*説明\*\*: ([\s\S]*?)(?:\n- |$)/);
                    
                    if (logicalMatch || descMatch) {
                        comments.set(columnName, {
                            logicalName: logicalMatch ? logicalMatch[1].trim() : '',
                            description: descMatch ? descMatch[1].trim() : ''
                        });
                    }
                }
            }

            // 備考を抽出
            const notesMatch = content.match(/## 備考\n\n([\s\S]*?)$/);
            if (notesMatch && notesMatch[1].trim() !== '（Cursorと会話しながらここに備考を追記してください）') {
                comments.set('_notes', notesMatch[1].trim());
            }

        } catch (error) {
            console.error(`既存コメントの読み込みエラー: ${error}`);
        }

        return comments;
    }

    /**
     * テーブルのMarkdownドキュメントを生成
     */
    private generateTableMarkdown(
        tableName: string,
        columns: ColumnInfo[],
        indexes: any[],
        foreignKeys: any[],
        existingComments: Map<string, any>
    ): string {
        const now = new Date().toISOString().split('T')[0];
        
        let md = `# ${tableName} テーブル\n\n`;
        md += `**物理名**: ${tableName}\n`;
        
        // 論理名
        const logicalName = existingComments.get('_table_logical_name') || '（Cursorと会話しながらここに論理名を追記してください）';
        md += `**論理名**: ${logicalName}\n`;
        md += `**最終更新**: ${now}\n\n`;

        // テーブル説明
        md += `## テーブル説明\n\n`;
        const tableDesc = existingComments.get('_table_description') || '（Cursorと会話しながらここに説明を追記してください）';
        md += `${tableDesc}\n\n`;

        // カラム定義
        md += `## カラム定義\n\n`;
        md += `| カラム名 | 型 | NULL | キー | デフォルト | 備考 |\n`;
        md += `|---------|-----|------|------|-----------|------|\n`;
        
        for (const col of columns) {
            const nullable = col.nullable ? 'YES' : 'NO';
            const key = col.key || '-';
            const defaultVal = col.default !== null ? col.default : '-';
            const extra = col.extra || '-';
            md += `| ${col.name} | ${col.type} | ${nullable} | ${key} | ${defaultVal} | ${extra} |\n`;
        }
        md += `\n`;

        // カラム詳細（論理名と説明）
        md += `## カラム詳細\n\n`;
        md += `（Cursorと会話しながら、各カラムの論理名と説明を追記してください）\n\n`;
        
        for (const col of columns) {
            const columnInfo = existingComments.get(col.name);
            const logicalName = columnInfo?.logicalName || '';
            const description = columnInfo?.description || '';
            
            md += `- \`${col.name}\`\n`;
            md += `  - **論理名**: ${logicalName}\n`;
            md += `  - **説明**: ${description}\n`;
        }
        md += `\n`;

        // 記入例セクション
        md += `### 記入例\n\n`;
        md += `\`\`\`markdown\n`;
        md += `- \`del_kbn\`\n`;
        md += `  - **論理名**: 削除フラグ\n`;
        md += `  - **説明**: 0=有効, 1=削除済。論理削除に使用\n`;
        md += `- \`user_id\`\n`;
        md += `  - **論理名**: ユーザーID\n`;
        md += `  - **説明**: userテーブルのidを参照する外部キー\n`;
        md += `- \`status\`\n`;
        md += `  - **論理名**: ステータス\n`;
        md += `  - **説明**: 0=無効, 1=有効, 2=保留中\n`;
        md += `\`\`\`\n\n`;

        // インデックス情報
        md += `## インデックス\n\n`;
        if (indexes.length > 0) {
            const indexMap = new Map<string, string[]>();
            for (const idx of indexes) {
                const name = idx.Key_name || idx.indexname;
                const column = idx.Column_name || idx.indkey;
                if (!indexMap.has(name)) {
                    indexMap.set(name, []);
                }
                indexMap.get(name)?.push(column);
            }

            for (const [name, cols] of indexMap) {
                md += `- **${name}**: ${cols.join(', ')}\n`;
            }
        } else {
            md += `（インデックスなし）\n`;
        }
        md += `\n`;

        // 外部キー制約
        md += `## 外部キー制約\n\n`;
        if (foreignKeys.length > 0) {
            for (const fk of foreignKeys) {
                const constraintName = fk.CONSTRAINT_NAME || fk.constraint_name;
                const column = fk.COLUMN_NAME || fk.column_name;
                const refTable = fk.REFERENCED_TABLE_NAME || fk.foreign_table_name;
                const refColumn = fk.REFERENCED_COLUMN_NAME || fk.foreign_column_name;
                md += `- **${constraintName}**: \`${column}\` → \`${refTable}.${refColumn}\`\n`;
            }
        } else {
            md += `（外部キー制約なし）\n`;
        }
        md += `\n`;

        // 備考
        md += `## 備考\n\n`;
        const notes = existingComments.get('_notes') || '（Cursorと会話しながらここに備考を追記してください）';
        md += `${notes}\n`;

        return md;
    }

    /**
     * READMEファイルを生成
     */
    private async generateReadme(databaseName: string, tableCount: number): Promise<void> {
        const filePath = path.join(this.schemaDir, 'README.md');
        const now = new Date().toISOString().split('T')[0];

        let md = `# データベーススキーマ\n\n`;
        md += `**データベース名**: ${databaseName}\n`;
        md += `**最終更新**: ${now}\n`;
        md += `**テーブル数**: ${tableCount}\n\n`;

        md += `## 概要\n\n`;
        md += `このディレクトリには、データベースのテーブル定義が自動生成されています。\n\n`;
        md += `各テーブルのMarkdownファイルには、以下の情報が含まれています：\n\n`;
        md += `- カラム定義（名前、型、NULL可否、キー、デフォルト値）\n`;
        md += `- インデックス情報\n`;
        md += `- 外部キー制約\n`;
        md += `- 補足説明（Cursorと会話しながら追記可能）\n\n`;

        md += `## 使い方\n\n`;
        md += `### 1. テーブル定義の確認\n\n`;
        md += `各テーブルのMarkdownファイルを開いて、スキーマ情報を確認できます。\n\n`;

        md += `### 2. Cursorとの会話で補足情報を追加\n\n`;
        md += `例：\n`;
        md += `- 「usersテーブルのdel_kbnカラムについて、削除フラグで0=有効、1=削除済と追記して」\n`;
        md += `- 「ordersテーブルのuser_idはusersテーブルのidを参照していると説明を追加して」\n`;
        md += `- 「このテーブルの用途を説明に追加して」\n\n`;

        md += `### 3. 補足情報の記入場所\n\n`;
        md += `各テーブルのMarkdownファイルには、以下の追記可能なセクションがあります：\n\n`;
        md += `- **テーブル説明**: テーブルの全体的な用途や役割\n`;
        md += `- **カラム補足説明**: 各カラムの詳細な説明、取りうる値、意味など\n`;
        md += `- **備考**: その他の重要な情報、注意事項など\n\n`;

        md += `## テーブル一覧\n\n`;
        
        // テーブルファイル一覧を取得
        const files = fs.readdirSync(this.tablesDir);
        const tableFiles = files.filter(f => f.endsWith('.md')).sort();
        
        for (const file of tableFiles) {
            const tableName = file.replace('.md', '');
            md += `- [${tableName}](./tables/${file})\n`;
        }

        fs.writeFileSync(filePath, md, 'utf-8');
    }
}

