# SQLコメントベース表示オプション仕様書

## 概要

SQLクエリ内のコメントを使用して、結果テーブルの表示方法をカスタマイズできる機能。

## 目的

- データベースの生データを見やすく整形
- プレゼンテーション用のフォーマット
- レポート作成の効率化
- SQLクエリと表示設定を一体化して管理

## 基本構文

### コメント形式

```sql
/**
 * @column <列名> <オプション>=<値> <オプション>=<値> ...
 * @column <列名> <オプション>=<値> ...
 */
SELECT ...
```

- `/**` で始まり `*/` で終わるコメント
- `@column` ディレクティブで列ごとの設定を指定
- SQLの最初または最後に配置可能
- 複数の列に対して設定可能

## サポートされるオプション

### 1. テキスト配置 (align)

**構文:** `align=<left|center|right>`

**説明:** セル内のテキスト配置を指定

**例:**
```sql
@column 商品名 align=left
@column 売上 align=right
@column タイトル align=center
```

### 2. 数値フォーマット (format=number)

#### 基本的な数値フォーマット
**構文:** `format=number`

**説明:** 値を数値として扱う

#### カンマ区切り (comma)
**構文:** `comma=true|false`

**説明:** 3桁ごとにカンマを挿入

**例:**
```sql
@column 売上 format=number comma=true
-- 1234567 → 1,234,567
```

#### 小数点以下の桁数 (decimal)
**構文:** `decimal=<数値>`

**説明:** 小数点以下の桁数を固定

**例:**
```sql
@column 価格 format=number decimal=2
-- 123.456 → 123.46

@column 金額 format=number comma=true decimal=2
-- 1234567.89 → 1,234,567.89
```

### 3. 日時フォーマット (format=datetime)

**構文:** `format=datetime pattern=<パターン>`

**説明:** 日時データを指定したフォーマットで表示

**パターン文字列:**
- `yyyy` = 4桁の年 (2025)
- `MM` = 2桁の月 (01-12)
- `dd` = 2桁の日 (01-31)
- `HH` = 2桁の時 (00-23)
- `mm` = 2桁の分 (00-59)
- `ss` = 2桁の秒 (00-59)

**例:**
```sql
@column 作成日時 format=datetime pattern=yyyy/MM/dd
-- 2025-12-28T14:30:00 → 2025/12/28

@column 更新時刻 format=datetime pattern=yyyy/MM/dd_HH:mm:ss
-- 2025-12-28T14:30:45 → 2025/12/28 14:30:45

@column 日付 format=datetime pattern=MM/dd
-- 2025-12-28T14:30:00 → 12/28
```

### 4. 列幅 (width)

**構文:** `width=<サイズ>`

**説明:** 列の幅を固定

**例:**
```sql
@column 商品名 width=200px
@column 説明 width=300px
@column ID width=80px
```

### 5. 背景色 (bg / backgroundColor)

**構文:** `bg=<色>` または `backgroundColor=<色>`

**説明:** セルの背景色を指定

**色の指定方法:**
- 16進数: `#ff0000`, `#00ff00`, `#0000ff`
- 色名: `red`, `green`, `blue` (VS Code変数も可)

**例:**
```sql
@column ステータス bg=#ffff00
@column 警告 backgroundColor=#ff6b6b
```

### 6. 文字色 (color)

**構文:** `color=<色>`

**説明:** テキストの色を指定

**例:**
```sql
@column エラー color=#ff0000
@column 成功 color=#00ff00
@column 注意 color=#ffa500
```

### 7. 太字 (bold)

**構文:** `bold=true`

**説明:** テキストを太字にする

**例:**
```sql
@column 重要度 bold=true
@column タイトル bold=true color=#ff0000
```

### 8. データ型指定 (type) 🆕

**構文:** `type=<int|float|decimal|text>`

**説明:** カラムのデータ型を明示的に指定（条件付きスタイルで使用）

**例:**
```sql
@column 金額 type=int
@column 割合 type=float
@column 価格 type=decimal
```

### 9. 条件付きスタイル (if演算子) 🆕

**構文:** `if<演算子><値>:<スタイル>=<値>,<スタイル>=<値>...`

**演算子:**
- `<` : より小さい
- `>` : より大きい
- `<=` : 以下
- `>=` : 以上
- `==` : 等しい
- `!=` : 等しくない

**適用可能なスタイル:**
- `color=<色>` : 文字色
- `bg=<色>` or `backgroundColor=<色>` : 背景色
- `bold=true` : 太字
- `fontWeight=<値>` : フォントウェイト

**例:**
```sql
-- マイナスの値を赤字で表示
@column 損益 type=int if<0:color=red

-- 1000を超える値を太字で表示
@column 売上 type=int if>1000:bold=true

-- 0以下をグレー、10000以上を赤字+太字で表示（複数条件）
@column 在庫 type=int if<=0:color=#999999 if>=10000:color=#ff0000,bold=true

-- 100%を超えたら緑背景
@column 達成率 type=float if>100:bg=#90ee90,color=#006400

-- 特定の値を強調
@column ステータスコード type=int if==200:color=green if!=200:color=red,bold=true
```

**複雑な例:**
```sql
/**
 * @column 金額 type=decimal align=right format=number comma=true decimal=2 if<0:color=red,bold=true if>=1000000:color=blue,bold=true
 */
SELECT 金額 FROM transactions;
```

**動作:**
1. 各セルの値を数値に変換
2. 条件を順番に評価
3. 条件が満たされた場合、指定されたスタイルを適用
4. 複数の条件が満たされた場合、後の条件のスタイルが優先される

## 実用例

### 例1: 売上レポート

```sql
/**
 * @column 店舗名 width=150px
 * @column 売上 align=right format=number comma=true
 * @column 前年比 align=right format=number decimal=1
 * @column 前月比 align=right format=number decimal=1
 * @column 更新日時 format=datetime pattern=yyyy/MM/dd_HH:mm
 */
SELECT 
    店舗名,
    売上,
    前年比,
    前月比,
    更新日時
FROM sales_report
WHERE 年月 = '2025-12'
ORDER BY 売上 DESC;
```

### 例2: ユーザー一覧

```sql
/**
 * @column ID align=right width=80px
 * @column ユーザー名 width=200px
 * @column ステータス align=center color=#00ff00 bold=true
 * @column 登録日 format=datetime pattern=yyyy/MM/dd
 * @column 最終ログイン format=datetime pattern=yyyy/MM/dd_HH:mm
 */
SELECT 
    ID,
    ユーザー名,
    ステータス,
    登録日,
    最終ログイン
FROM users
WHERE 削除フラグ = 0
ORDER BY ID;
```

### 例3: 財務データ

```sql
/**
 * @column 勘定科目 width=180px
 * @column 借方 align=right format=number comma=true decimal=0
 * @column 貸方 align=right format=number comma=true decimal=0
 * @column 残高 align=right format=number comma=true decimal=0 bold=true
 * @column 更新者 width=120px
 */
SELECT 
    勘定科目,
    借方,
    貸方,
    残高,
    更新者
FROM financial_ledger
WHERE 年度 = 2025;
```

### 例4: ステータス監視

```sql
/**
 * @column サーバー名 width=150px
 * @column CPU使用率 align=right format=number decimal=1
 * @column メモリ使用率 align=right format=number decimal=1
 * @column ステータス align=center bg=#90ee90 color=#006400 bold=true
 * @column 最終確認 format=datetime pattern=HH:mm:ss
 */
SELECT 
    サーバー名,
    CPU使用率,
    メモリ使用率,
    ステータス,
    最終確認
FROM server_status
WHERE ステータス = '稼働中';
```

### 例5: 条件付きスタイリング - 損益レポート 🆕

```sql
/**
 * @column 部門 width=150px
 * @column 売上 type=int align=right format=number comma=true
 * @column 費用 type=int align=right format=number comma=true
 * @column 利益 type=int align=right format=number comma=true if<0:color=red,bold=true if>1000000:color=blue,bold=true
 * @column 利益率 type=float align=right format=number decimal=1 if<0:color=red if>15:color=green,bold=true
 */
SELECT 
    部門,
    売上,
    費用,
    利益,
    利益率
FROM department_performance
WHERE 年月 = '2025-12'
ORDER BY 利益 DESC;
```

### 例6: 条件付きスタイリング - 在庫アラート 🆕

```sql
/**
 * @column 商品コード width=100px
 * @column 商品名 width=200px
 * @column 在庫数 type=int align=right format=number comma=true if<=0:color=red,bold=true if<=10:color=orange if>100:color=green
 * @column 安全在庫 type=int align=right format=number comma=true
 * @column 発注推奨 type=int align=right if>0:bold=true
 * @column 最終更新 format=datetime pattern=MM/dd_HH:mm
 */
SELECT 
    商品コード,
    商品名,
    在庫数,
    安全在庫,
    CASE WHEN 在庫数 <= 安全在庫 THEN 安全在庫 - 在庫数 ELSE 0 END AS 発注推奨,
    最終更新
FROM inventory
WHERE カテゴリ = '重要商品'
ORDER BY 在庫数 ASC;
```

### 例7: 条件付きスタイリング - KPI達成状況 🆕

```sql
/**
 * @column 営業担当 width=120px
 * @column 目標 type=int align=right format=number comma=true
 * @column 実績 type=int align=right format=number comma=true
 * @column 達成率 type=float align=right format=number decimal=1 if<80:color=red,bg=#ffe6e6 if>=80:color=orange if>=100:color=green,bold=true if>=120:color=blue,bg=#e6f3ff,bold=true
 * @column 評価 align=center
 */
SELECT 
    営業担当,
    目標,
    実績,
    (実績 * 100.0 / 目標) AS 達成率,
    CASE 
        WHEN 実績 >= 目標 * 1.2 THEN 'S'
        WHEN 実績 >= 目標 THEN 'A'
        WHEN 実績 >= 目標 * 0.8 THEN 'B'
        ELSE 'C'
    END AS 評価
FROM sales_performance
WHERE 年月 = '2025-12'
ORDER BY 達成率 DESC;
```

## 実装詳細

### パーサー

**ファイル:** `src/sqlCommentParser.ts`

**主要クラス:** `SqlCommentParser`

**主要メソッド:**
- `parseOptions(sql: string)` - SQLからオプションを抽出
- `formatValue(value: any, options: ColumnDisplayOptions)` - 値をフォーマット
- `generateColumnStyle(options: ColumnDisplayOptions)` - CSSスタイルを生成

### 統合箇所

1. **バックエンド (DatabaseClientPanel)**
   - `_handleExecuteQuery()` でオプションをパース
   - クエリ結果と一緒にWebviewに送信

2. **フロントエンド (Webview)**
   - `handleQueryResult()` でオプションを受信
   - `formatValue()` で値を整形
   - `generateColumnStyle()` でスタイルを適用
   - テーブルHTMLに反映

## 制限事項

1. **コメント形式**
   - `/** ... */` 形式のみサポート
   - `--` や `/* */` は非対応

2. **列名**
   - SQLのSELECT句の列名と完全一致が必要
   - エイリアス (`AS`) を使った場合はエイリアス名を指定

3. **値の型**
   - 数値フォーマットは文字列をパースできる場合のみ
   - 日時フォーマットはJavaScriptの`Date()`でパース可能な形式のみ

4. **スタイル**
   - VS Code Webview内のため、一部CSSプロパティが制限される
   - セキュリティ上、外部リソースは参照不可

## ベストプラクティス

### 1. 一貫性のあるフォーマット

同じ種類のデータには同じオプションを使用：

```sql
-- 金額は常に右寄せ、カンマ区切り
@column 売上 align=right format=number comma=true
@column 仕入れ align=right format=number comma=true
@column 利益 align=right format=number comma=true
```

### 2. 可読性を優先

色やスタイルは必要最小限に：

```sql
-- 良い例: 重要な情報のみ強調
@column ステータス color=#ff0000 bold=true

-- 悪い例: すべてに色をつける
@column A color=#ff0000
@column B color=#00ff00
@column C color=#0000ff
```

### 3. パターンの再利用

よく使うパターンは保存済みクエリに：

```sql
-- 「財務レポート」として保存
/**
 * @column 項目 width=200px
 * @column 金額 align=right format=number comma=true decimal=0
 * @column 比率 align=right format=number decimal=1
 */
SELECT ...
```

### 4. ドキュメント化

複雑なクエリにはコメントで説明を追加：

```sql
/**
 * 月次売上レポート
 * @column 店舗名 width=150px
 * @column 売上 align=right format=number comma=true
 * @column 前年比 align=right format=number decimal=1
 * 
 * 注意: 前年比は%表示のため100を掛けた値が入っています
 */
SELECT ...
```

## トラブルシューティング

### オプションが適用されない

**原因:** 列名が一致していない

**解決策:** SQLのSELECT句と`@column`の列名を確認

```sql
-- NG: 列名が異なる
SELECT user_name FROM users;
/**
 * @column ユーザー名 width=200px  -- ← user_name と一致しない
 */

-- OK: 列名が一致
SELECT user_name AS ユーザー名 FROM users;
/**
 * @column ユーザー名 width=200px  -- ← エイリアスと一致
 */
```

### 数値フォーマットが効かない

**原因:** 値が数値としてパースできない

**解決策:** データ型を確認、必要ならCASTする

```sql
-- 文字列として格納されている場合
SELECT CAST(金額 AS DECIMAL) AS 金額 FROM ...
/**
 * @column 金額 format=number comma=true
 */
```

### 日時フォーマットが効かない

**原因:** 日時形式が認識できない

**解決策:** ISO 8601形式またはよく使われる形式に変換

```sql
-- データベース固有の形式を標準形式に
SELECT DATE_FORMAT(作成日時, '%Y-%m-%d %H:%i:%s') AS 作成日時 FROM ...
/**
 * @column 作成日時 format=datetime pattern=yyyy/MM/dd_HH:mm:ss
 */
```

## 将来の拡張案

- [x] **条件付きフォーマット (値によって色を変える)** ✅ 実装済み (2025-12-28)
- [ ] カスタム関数でのフォーマット
- [ ] プリセットパターンの保存
- [ ] UIからのオプション設定
- [ ] エクスポート時のフォーマット保持
- [ ] 文字列の条件付きスタイル (contains, startsWith, endsWith など)
- [ ] 正規表現によるパターンマッチング

## 関連ファイル

- `src/sqlCommentParser.ts` - パーサー実装
- `src/databaseClientPanel.ts` - 統合処理
- `docs/specifications/display-options.md` - この仕様書
- `.cursorrules` - Cursor AIへの説明

## 更新履歴

- 2025-12-28: 条件付きスタイリング機能を追加 (type指定、if演算子による条件付きスタイル)
- 2025-12-28: 初版作成

