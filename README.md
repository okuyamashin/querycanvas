# QueryCanvas - AI-Powered Database Client

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue)](https://code.visualstudio.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)
[![VS Code Marketplace](https://img.shields.io/vscode-marketplace/v/okuyamashin.querycanvas)](https://marketplace.visualstudio.com/items?itemName=okuyamashin.querycanvas)

A Cursor-integrated database client extension for VS Code. Supports MySQL/PostgreSQL with AI-powered schema documentation and query management features designed for seamless integration with Cursor AI.

## 📦 Installation

Install from VS Code Marketplace:

1. Open VS Code/Cursor
2. Open Extensions view (`Cmd+Shift+X` / `Ctrl+Shift+X`)
3. Search for "QueryCanvas"
4. Click "Install"

Or install directly from Marketplace:
- **[Install QueryCanvas from VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=okuyamashin.querycanvas)**

Quick install via Command Palette:
1. Press `Cmd+P` / `Ctrl+P`
2. Type: `ext install okuyamashin.querycanvas`
3. Press Enter

## Features

### 🤖 Cursor AI Integration ⭐
- **Edit SQL via AI**: Cursor can modify `.vscode/querycanvas-session.json` to update SQL in real-time
- **Automatic sync**: File watcher detects changes and updates UI immediately
- **AI-powered query generation**: Ask Cursor to write SQL with display options
- **Smart formatting**: Cursor knows the display options syntax and can apply it
- **One-click setup** 🆕: "📝 Cursor AI設定" button adds QueryCanvas rules to `.cursorrules`

### 🗄️ Database Connection
- **Multiple Connections**: Manage connections for development, staging, production environments
- **MySQL Support**: Supports MySQL 5.7+, 8.0+
- **PostgreSQL Support**: Supports PostgreSQL 12+
- **Secure Authentication**: Passwords securely stored in VS Code Secret Storage

### 📊 SQL Query Execution
- **Intuitive UI**: SQL input area and result display table
- **Performance Measurement**: Monitor query performance
- **Error Handling**: Clear error messages
- **🔒 Read-Only Mode**: Only SELECT, SHOW, DESC, EXPLAIN queries allowed (prevents accidental data modification)
- **✨ SQL Formatter**: One-click SQL formatting for better readability
- **🎨 Display Options**: Customize result display via SQL comments (alignment, number format, datetime format, colors)
- **🎯 Conditional Styling** 🆕: Dynamic cell styling based on values (e.g., negative numbers in red, values over threshold in bold)
- **📈 Graph Visualization** 🆕: Interactive charts (line, bar, pie, area, scatter) using Chart.js
- **📋 Clipboard Copy** 🆕: Copy results as TSV or HTML (paste directly into PowerPoint/Excel/Word)

### 📋 Automated Schema Documentation ⭐
- Automatically extract table structures
- Generate documentation in Markdown format (`querycanvas-schema/tables/`)
- Add logical names and descriptions with Cursor AI
- Preserves your additions during re-extraction
- Auto-extracts foreign keys and indexes

### 💾 Query Result Saving ⭐
- Export in **TSV/JSON** format
- Manage with names and comments (`querycanvas-results/`)
- Automatically records metadata (SQL, timestamp, row count)
- Analyze saved data with Cursor AI

### 💾 Saved Query Library ⭐
- Save frequently-used queries with names
- Categorize and search with tags
- Cache query results
- Instant display next time (no database connection needed)

### 🔄 Session Persistence ⭐
- Auto-save SQL input
- Continue work even after closing panel
- Cursor can edit session file
- Real-time SQL sync (Cursor ↔ UI)

### 🌍 Multilingual Support
- **English** (Default)
- **Japanese**
- Automatically adapts to VS Code language settings

## Screenshot

### Database Client Panel
```
┌─────────────────────────────────────────┐
│ Connection: [Dev DB ▼] Status: ●Connected│
│ [⚙️ Manage] [📋 Schema] [💾 Saved]       │
├─────────────────────────────────────────┤
│ SQL Input Area                          │
│ SELECT * FROM users;                    │
│                                         │
│ [Execute ▶]  [Clear]  [💾 Save Result]  │
├─────────────────────────────────────────┤
│ Result Table                            │
│ ┌────┬────────┬─────────┐              │
│ │ id │ name   │ email   │              │
│ ├────┼────────┼─────────┤              │
│ │ 1  │ Alice  │ a@ex.com│              │
│ │ 2  │ Bob    │ b@ex.com│              │
│ └────┴────────┴─────────┘              │
│                                         │
│ Execution time: 0.123s | Rows: 2        │
└─────────────────────────────────────────┘
```

## Usage

### 0. Installation

If you haven't installed QueryCanvas yet, see the [Installation](#-installation) section above.

### 1. Open Database Client

1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "**Database Client: Open**" and execute
3. Database client panel will open

### 2. Connect to Database

1. Click "⚙️ Manage Connections" button
2. Click "+ Add New Connection"
3. Enter connection information and save
4. Select connection from dropdown
5. Click "Connect" button

### 3. Execute SQL Query

1. Enter query in SQL input area
2. Click "▶ Execute" button
3. Results will be displayed in the table

**Tip: Use display options for better presentation:**
```sql
/**
 * @column amount type=int align=right format=number comma=true if<0:color=red if>1000:bold=true
 * @column created_at format=datetime pattern=yyyy/MM/dd_HH:mm
 */
SELECT amount, created_at FROM orders LIMIT 10;
```

### 3.5. Copy Results to PowerPoint/Excel 📋

After executing a query, you can copy the results to clipboard:

1. **TSV Copy**: Click "📋 TSVコピー" button
   - Simple tab-separated format
   - Works everywhere (PowerPoint, Excel, Word)
   - No styling preserved

2. **HTML Copy**: Click "📋 HTMLコピー" button
   - Rich HTML format with styles
   - Colors, bold, number formatting preserved
   - Conditional styling (red for negative, etc.) preserved
   - Paste directly into PowerPoint/Excel/Word

**Example workflow:**
```sql
/**
 * @column 売上 type=int align=right format=number comma=true if<0:color=red
 * @column 達成率 type=float if>=100:color=green,bold=true
 */
SELECT 店舗名, 売上, 達成率 FROM sales LIMIT 10;
```
→ Execute → HTMLコピー → Paste in PowerPoint → Beautiful table with colors!

See [PowerPoint Copy Guide](./docs/POWERPOINT-COPY-GUIDE.md) for details.


### 4. Save Query Results

1. After executing a query, click "💾 Save Result" button
2. Enter name, comment, and format (TSV/JSON)
3. Click "💾 Save" to save to `querycanvas-results/`
4. Manage past results via metadata file

### 5. Extract Schema

1. Connect to database
2. Click "📋 Extract Schema" button
3. All table definitions are saved to `querycanvas-schema/tables/` in Markdown format
4. Add logical names and descriptions with Cursor AI
5. Your additions are preserved during re-extraction

### 6. Use with Cursor AI (Advanced) 🤖

You can use Cursor AI to edit SQL queries directly:

#### Quick Setup (Recommended)

1. Open Database Client
2. Click "📝 Cursor AI設定" button
3. Done! QueryCanvas rules are added to `.cursorrules`

Or use Command Palette:
```
Cmd+Shift+P → "QueryCanvas: Setup Cursor AI Rules"
```

#### Manual Usage

1. Open Database Client and connect to database
2. Session file is created at `.vscode/querycanvas-session.json`
3. In Cursor Chat, ask:
   ```
   @Codebase Edit the SQL in querycanvas-session.json to select top 10 orders with amount > 1000,
   and add display options to format the amount with commas
   ```
4. Cursor AI modifies the session file
5. Changes appear in Database Client UI immediately
6. Click Execute to run the query

**Example prompts:**
- "Add a WHERE clause to the current SQL query"
- "Format the price column with 2 decimal places"
- "Add datetime formatting to the created_at column"
- "Rewrite this query to join with users table"

## Implementation Status

### ✅ Completed
- Basic Webview panel
- Database connection layer (MySQL/PostgreSQL)
- Interface-based design
- SSL connection support
- **Connection profile management** (add, edit, delete)
- **Password management** (Secret Storage)
- **Actual query execution**
- **Schema extraction & Markdown documentation generation**
- **Query result saving** (TSV/JSON + metadata)
- **Session persistence** (auto-save, file watching)
- **Saved query library** (with caching)
- **Internationalization** (English/Japanese)

### 📋 Future Plans
- Query history
- Auto-complete (table/column names)
- ER diagram generation
- Dataset diff view

## Advanced Features

### 📈 Graph Visualization

Visualize query results with interactive charts. Use the `@chart` directive in SQL comments:

```sql
/**
 * @chart type=line x=日付 y=小村井店,京成小岩店 title="店舗別売上推移"
 * @row 曜日=="土":bg=#eeeeff
 * @row 曜日=="日":bg=#ffeeee
 * @column 小村井店 type=int align=right format=number comma=true color="#FF0000"
 * @column 京成小岩店 type=int align=right format=number comma=true color="#008800"
 */
SELECT 
  DATE_FORMAT(YMD_CREATED, '%Y/%m/%d') AS '日付',
  CASE DAYOFWEEK(YMD_CREATED)
    WHEN 1 THEN '日' WHEN 2 THEN '月' WHEN 3 THEN '火'
    WHEN 4 THEN '水' WHEN 5 THEN '木' WHEN 6 THEN '金' WHEN 7 THEN '土'
  END AS '曜日',
  SUM(CASE WHEN SHOP_NAME = '小村井店' THEN 1 ELSE 0 END) AS '小村井店',
  SUM(CASE WHEN SHOP_NAME = '京成小岩店' THEN 1 ELSE 0 END) AS '京成小岩店'
FROM sales_data
WHERE YMD_CREATED LIKE '202508%'
GROUP BY YMD_CREATED
ORDER BY YMD_CREATED;
```

**Supported chart types:**
- `line`: Line chart (time-series, trends)
- `bar`: Bar chart (category comparison)
- `pie`: Pie chart (proportions)
- `area`: Area chart (cumulative data)
- `scatter`: Scatter plot (correlations)

**View Toggle:**
When `@chart` is specified, **📊 テーブル** and **📈 グラフ** buttons appear, allowing you to switch between table and chart views.

**Documentation:** See [docs/CHART-VISUALIZATION-GUIDE.md](docs/CHART-VISUALIZATION-GUIDE.md) for complete guide.

## Development

### Setup

**📖 詳細なセットアップ手順は [docs/SETUP.md](./docs/SETUP.md) を参照してください。**

#### Quick Start

1. Install dependencies:
```bash
npm install
```

2. Compile TypeScript:
```bash
npm run compile
```

Or use watch mode for automatic compilation:
```bash
npm run watch
```

3. Debug and Run:
   - Press `F5` (or "Run" → "Start Debugging")
   - A new window (Extension Development Host) will open
   - Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
   - Type "QueryCanvas: Open Database Client" and execute

#### Initial Setup Steps

After starting the extension, complete the initial setup:

1. **Setup Cursor Rules**: Click "📝 Cursor AI設定" button in Database Client panel
2. **Add Database Connection**: Click "⚙️ Manage Connections" → "+ Add New Connection"
3. **Connect to Database**: Select connection from dropdown → Click "Connect"
4. **Extract Schema**: Click "📋 Extract Schema" to generate table definitions

See [docs/SETUP.md](./docs/SETUP.md) for detailed instructions.

### Project Structure

```
querycanvas/
├── src/
│   ├── extension.ts                    # Extension entry point
│   ├── databaseClientPanel.ts          # Webview UI management
│   ├── schemaDocumentGenerator.ts      # Schema document generation
│   ├── queryResultSaver.ts             # Query result saving
│   ├── sessionStateManager.ts          # Session persistence
│   ├── savedQueryManager.ts            # Saved query library
│   ├── i18nManager.ts                  # Internationalization
│   ├── i18n/                           # Translation files
│   │   ├── en.json                     # English
│   │   └── ja.json                     # Japanese
│   └── database/                       # Database connection layer
│       ├── types.ts                    # Type definitions
│       ├── mysqlConnection.ts          # MySQL implementation
│       ├── postgresqlConnection.ts     # PostgreSQL implementation
│       ├── connectionFactory.ts        # Connection factory
│       ├── connectionProfileManager.ts # Profile management
│       └── index.ts
├── docs/                               # Documentation
│   ├── conversations/                  # Development history
│   └── specifications/                 # Specifications
├── querycanvas-schema/                 # Table definitions (auto-generated)
│   └── tables/                         # Markdown per table
├── querycanvas-results/                # Saved query results
│   └── metadata.json                   # Query result metadata
├── out/                                # Compiled JavaScript
├── .vscode/
│   ├── launch.json                     # Debug configuration
│   ├── tasks.json                      # Build task configuration
│   ├── querycanvas-connections.json    # Connection profiles (gitignored)
│   ├── querycanvas-session.json        # Session state (gitignored)
│   └── querycanvas-queries.json        # Saved queries (gitignored)
├── package.json                        # Extension manifest
├── tsconfig.json                       # TypeScript configuration
├── TESTING.md                          # Testing instructions
└── README.md                           # This file
```

## Technology Stack

- **TypeScript 5.3+**: Type-safe development
- **VS Code Extension API**: Extension foundation
- **mysql2**: MySQL Node.js client (Promise-based)
- **pg**: PostgreSQL Node.js client
- **Webview**: Custom UI implementation
- **Chart.js 4.4.1**: Interactive chart visualization 🆕

## Architecture

### Design Patterns
- **Strategy Pattern**: Switch implementations based on database type
- **Factory Pattern**: Generate connection instances
- **Interface Segregation**: Unified common interface

### Security
- Passwords stored in VS Code Secret Storage
- Parameterized queries to prevent SQL injection
- SSL connection support
- **Read-Only Mode**: Prevents accidental data modification (INSERT, UPDATE, DELETE, ALTER, TRUNCATE are blocked)

## Documentation

- [SETUP.md](./docs/SETUP.md) - **Initial setup guide** (Cursor Rules, database connection, schema extraction)
- [TESTING.md](./TESTING.md) - Testing and debugging procedures
- [Specifications](./docs/specifications/) - Feature specifications and architecture
- [Conversation History](./docs/conversations/) - Development process

## Customization

### Adding a New Database Type

1. Add new type to `src/database/types.ts`
2. Create a new class implementing the `IDBConnection` interface
3. Add new case to `ConnectionFactory`

See [Database Connection Layer Specification](./docs/specifications/database-connection-layer.md) for details.

## References

- [VS Code Extension API](https://code.visualstudio.com/api)
- [Extension Guides](https://code.visualstudio.com/api/extension-guides/overview)
- [mysql2 Documentation](https://github.com/sidorares/node-mysql2)
- [node-postgres Documentation](https://node-postgres.com/)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**okuyamashin**

- GitHub: [@okuyamashin](https://github.com/okuyamashin)
- Repository: [querycanvas](https://github.com/okuyamashin/querycanvas)


## Repository

https://github.com/okuyamashin/querycanvas
