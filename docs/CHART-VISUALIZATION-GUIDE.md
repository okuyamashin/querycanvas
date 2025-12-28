# グラフ表示機能ガイド

QueryCanvasでは、SQLクエリ結果をグラフで視覚化できます。

## 基本的な使い方

SQLコメントに `@chart` ディレクティブを追加するだけで、クエリ結果をグラフ表示できます。

```sql
/**
 * @chart type=line x=日付 y=小村井店,京成小岩店
 */
SELECT 
  DATE_FORMAT(YMD_CREATED, '%Y/%m/%d') AS '日付',
  SUM(CASE WHEN SHOP_NAME = '小村井店' THEN 1 ELSE 0 END) AS '小村井店',
  SUM(CASE WHEN SHOP_NAME = '京成小岩店' THEN 1 ELSE 0 END) AS '京成小岩店'
FROM sales_data
GROUP BY YMD_CREATED
ORDER BY YMD_CREATED;
```

## @chart ディレクティブの構文

```
@chart type=<グラフ種類> x=<X軸列名> y=<Y軸列名1>,<Y軸列名2>,... [オプション]
```

### 必須パラメータ

| パラメータ | 説明 | 例 |
|----------|------|------|
| `type` | グラフの種類 | `type=line` |
| `x` または `xAxis` | X軸に使用する列名 | `x=日付` |
| `y` または `yAxis` | Y軸に使用する列名（カンマ区切りで複数指定可） | `y=売上,利益` |

### オプションパラメータ

| パラメータ | 説明 | デフォルト値 | 例 |
|----------|------|------------|------|
| `title` | グラフタイトル | なし | `title="月次売上推移"` |
| `legend` / `showLegend` | 凡例の表示/非表示 | `true` | `legend=false` |
| `grid` / `showGrid` | グリッド線の表示/非表示 | `true` | `grid=false` |
| `stacked` | 積み上げ表示（棒グラフ用） | `false` | `stacked=true` |
| `curve` | 線の種類（折れ線グラフ用） | `smooth` | `curve=straight` |

### サポートされているグラフタイプ

| タイプ | 説明 | 適した用途 |
|--------|------|----------|
| `line` | 折れ線グラフ | 時系列データ、トレンド分析 |
| `bar` | 棒グラフ | カテゴリ別比較、ランキング |
| `area` | 面グラフ | 累積データ、構成比の推移 |
| `pie` | 円グラフ | 構成比、割合の可視化 |
| `scatter` | 散布図 | 相関関係、分布の可視化 |

## 実例集

### 1. 折れ線グラフ（複数系列）

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

### 2. 棒グラフ（積み上げ）

```sql
/**
 * @chart type=bar x=カテゴリ y=商品A,商品B,商品C stacked=true
 * @column 商品A type=int align=right format=number comma=true
 * @column 商品B type=int align=right format=number comma=true
 * @column 商品C type=int align=right format=number comma=true
 */
SELECT 
  category AS 'カテゴリ',
  SUM(CASE WHEN product = 'A' THEN amount ELSE 0 END) AS '商品A',
  SUM(CASE WHEN product = 'B' THEN amount ELSE 0 END) AS '商品B',
  SUM(CASE WHEN product = 'C' THEN amount ELSE 0 END) AS '商品C'
FROM sales
GROUP BY category
ORDER BY category;
```

### 3. 円グラフ

```sql
/**
 * @chart type=pie x=カテゴリ y=売上
 * @column 売上 type=int align=right format=number comma=true
 */
SELECT 
  category AS 'カテゴリ',
  SUM(amount) AS '売上'
FROM sales
GROUP BY category
ORDER BY 売上 DESC
LIMIT 10;
```

### 4. 面グラフ

```sql
/**
 * @chart type=area x=月 y=新規,既存,休眠 title="顧客区分別売上推移"
 * @column 新規 type=int align=right format=number comma=true color="#4BC0C0"
 * @column 既存 type=int align=right format=number comma=true color="#36A2EB"
 * @column 休眠 type=int align=right format=number comma=true color="#FF6384"
 */
SELECT 
  DATE_FORMAT(order_date, '%Y-%m') AS '月',
  SUM(CASE WHEN customer_type = '新規' THEN amount ELSE 0 END) AS '新規',
  SUM(CASE WHEN customer_type = '既存' THEN amount ELSE 0 END) AS '既存',
  SUM(CASE WHEN customer_type = '休眠' THEN amount ELSE 0 END) AS '休眠'
FROM orders
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY 月;
```

## カラーパレットの活用

`@column` ディレクティブで指定した `color` 属性がグラフの系列色として使用されます。

```sql
/**
 * @chart type=line x=日付 y=売上,利益
 * @column 売上 color="#FF6384"
 * @column 利益 color="#36A2EB"
 */
```

色を指定しない場合は、以下のデフォルトカラーパレットが自動的に適用されます：

1. #FF6384 (赤)
2. #36A2EB (青)
3. #FFCE56 (黄)
4. #4BC0C0 (シアン)
5. #9966FF (紫)
6. #FF9F40 (オレンジ)

## 表示の切り替え

グラフオプションが指定されたクエリを実行すると、結果エリアに **📊 テーブル** と **📈 グラフ** の切り替えボタンが表示されます。

- **テーブルビュー**: 従来のテーブル形式で詳細データを確認
- **グラフビュー**: ビジュアルでトレンドやパターンを把握

両方の表示を切り替えながら、データを多角的に分析できます。

## PowerPoint/Excelへの活用

1. クエリを実行してグラフを表示
2. ブラウザの機能でグラフを画像として保存
3. PowerPointやExcelに貼り付け

または、テーブルビューに戻って **📋 HTMLコピー** を使用すれば、スタイル付きの表をOfficeアプリに貼り付けることもできます。

## よくある質問

### Q: グラフが表示されない

- `@chart` ディレクティブが正しく記述されているか確認してください
- `x` と `y` パラメータが必須です
- `y` に指定した列名がクエリ結果に含まれているか確認してください

### Q: 複数の系列を表示するには？

`y` パラメータにカンマ区切りで複数の列名を指定してください。

```sql
@chart type=line x=日付 y=店舗A,店舗B,店舗C
```

### Q: グラフの色を変更するには？

`@column` ディレクティブで `color` 属性を指定してください。

```sql
@column 売上 color="#FF0000"
```

### Q: グリッド線を消すには？

`grid=false` オプションを追加してください。

```sql
@chart type=line x=日付 y=売上 grid=false
```

## テクニカルノート

- グラフ描画には **Chart.js v4.4.1** を使用しています
- グラフはレスポンシブ対応で、ウィンドウサイズに応じて自動調整されます
- VS Codeのテーマカラーに合わせてグラフの配色が自動調整されます

## 関連ドキュメント

- [Display Options Guide](./specifications/display-options.md) - テーブルスタイリング
- [Row Styling Guide](./ROW-STYLING-GUIDE.md) - 行の条件付きスタイリング
- [PowerPoint Copy Guide](./POWERPOINT-COPY-GUIDE.md) - Office連携

