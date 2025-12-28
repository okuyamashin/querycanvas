-- ========================================
-- QueryCanvas 条件付きスタイリング サンプルSQL
-- ========================================

-- 例1: 基本的な条件付きスタイリング（損益レポート）
/**
 * @column 部門 width=150px
 * @column 売上 type=int align=right format=number comma=true
 * @column 費用 type=int align=right format=number comma=true
 * @column 利益 type=int align=right format=number comma=true if<0:color=red,bold=true if>1000000:color=blue,bold=true
 */
SELECT 
    '営業部' AS 部門, 5000000 AS 売上, 4500000 AS 費用, 500000 AS 利益
UNION ALL
SELECT '開発部', 3000000, 3500000, -500000
UNION ALL
SELECT '管理部', 2000000, 1800000, 200000
UNION ALL
SELECT 'マーケ部', 8000000, 6500000, 1500000;

-- 例2: 在庫アラート（複数の条件）
/**
 * @column 商品コード width=100px
 * @column 商品名 width=200px
 * @column 在庫数 type=int align=right format=number comma=true if<=0:color=red,bold=true if<=10:color=orange if>100:color=green
 * @column 安全在庫 type=int align=right format=number comma=true
 */
SELECT 
    'P001' AS 商品コード, 'ノートPC' AS 商品名, 0 AS 在庫数, 10 AS 安全在庫
UNION ALL
SELECT 'P002', 'マウス', 5, 20
UNION ALL
SELECT 'P003', 'キーボード', 15, 10
UNION ALL
SELECT 'P004', 'モニター', 150, 30;

-- 例3: KPI達成率（背景色と複数スタイル）
/**
 * @column 営業担当 width=120px
 * @column 目標 type=int align=right format=number comma=true
 * @column 実績 type=int align=right format=number comma=true
 * @column 達成率 type=float align=right format=number decimal=1 if<80:color=red,bg=#ffe6e6 if>=80:color=orange if>=100:color=green,bold=true if>=120:color=blue,bg=#e6f3ff,bold=true
 */
SELECT 
    '田中' AS 営業担当, 1000000 AS 目標, 1250000 AS 実績, 125.0 AS 達成率
UNION ALL
SELECT '佐藤', 1000000, 1050000, 105.0
UNION ALL
SELECT '鈴木', 1000000, 850000, 85.0
UNION ALL
SELECT '高橋', 1000000, 650000, 65.0;

-- 例4: 温度監視（等値・不等値条件）
/**
 * @column サーバー名 width=150px
 * @column 温度 type=float align=right format=number decimal=1 if>=80:color=red,bold=true if>=60:color=orange if<40:color=blue
 * @column ステータス align=center
 */
SELECT 
    'WEB-01' AS サーバー名, 85.5 AS 温度, '警告' AS ステータス
UNION ALL
SELECT 'WEB-02', 65.2, '注意'
UNION ALL
SELECT 'DB-01', 45.3, '正常'
UNION ALL
SELECT 'DB-02', 35.8, '低温';

-- 例5: 株価変動（プラスマイナスの表示）
/**
 * @column 銘柄コード width=100px
 * @column 銘柄名 width=200px
 * @column 現在値 type=int align=right format=number comma=true
 * @column 前日比 type=int align=right format=number comma=true if<0:color=red,bold=true if>0:color=green,bold=true if==0:color=#999999
 * @column 変動率 type=float align=right format=number decimal=2 if<0:color=red if>0:color=green if==0:color=#999999
 */
SELECT 
    '1001' AS 銘柄コード, 'ABC株式会社' AS 銘柄名, 2500 AS 現在値, 150 AS 前日比, 6.38 AS 変動率
UNION ALL
SELECT '1002', 'XYZ商事', 1800, -50, -2.70
UNION ALL
SELECT '1003', 'DEF製作所', 3200, 0, 0.00
UNION ALL
SELECT '1004', 'GHI電機', 4500, 200, 4.65;

-- 例6: 試験結果（複雑な評価基準）
/**
 * @column 受験番号 width=100px
 * @column 氏名 width=150px
 * @column 数学 type=int align=right if<60:color=red,bold=true if>=80:color=blue,bold=true
 * @column 英語 type=int align=right if<60:color=red,bold=true if>=80:color=blue,bold=true
 * @column 国語 type=int align=right if<60:color=red,bold=true if>=80:color=blue,bold=true
 * @column 合計 type=int align=right format=number if<180:color=red,bg=#ffe6e6 if>=240:color=blue,bg=#e6f3ff,bold=true
 */
SELECT 
    'A001' AS 受験番号, '山田太郎' AS 氏名, 95 AS 数学, 88 AS 英語, 92 AS 国語, 275 AS 合計
UNION ALL
SELECT 'A002', '佐藤花子', 72, 85, 78, 235
UNION ALL
SELECT 'A003', '鈴木一郎', 55, 48, 62, 165
UNION ALL
SELECT 'A004', '田中美咲', 88, 90, 85, 263;

-- 例7: 経費精算（承認ステータス + 金額チェック）
/**
 * @column 申請ID width=80px align=right
 * @column 申請者 width=120px
 * @column 金額 type=int align=right format=number comma=true if<=0:color=#999999 if>=100000:color=orange,bold=true if>=500000:color=red,bold=true
 * @column カテゴリ width=120px
 * @column 日付 format=datetime pattern=yyyy/MM/dd
 */
SELECT 
    1 AS 申請ID, '山田太郎' AS 申請者, 850000 AS 金額, '出張費' AS カテゴリ, '2025-12-15' AS 日付
UNION ALL
SELECT 2, '佐藤花子', 45000, '会議費', '2025-12-18'
UNION ALL
SELECT 3, '鈴木一郎', 150000, '研修費', '2025-12-20'
UNION ALL
SELECT 4, '田中美咲', 8500, '消耗品費', '2025-12-22';

-- 例8: ECサイト - 商品レビュー評価
/**
 * @column 商品ID width=80px
 * @column 商品名 width=200px
 * @column 評価 type=float align=center format=number decimal=1 if<3.0:color=red,bg=#ffe6e6 if>=3.0:color=orange if>=4.0:color=green if>=4.5:color=blue,bold=true
 * @column レビュー数 type=int align=right format=number comma=true
 * @column 販売数 type=int align=right format=number comma=true if>1000:bold=true
 */
SELECT 
    'E001' AS 商品ID, 'ワイヤレスイヤホン' AS 商品名, 4.8 AS 評価, 1250 AS レビュー数, 5800 AS 販売数
UNION ALL
SELECT 'E002', 'スマートウォッチ', 4.2, 890, 3200
UNION ALL
SELECT 'E003', 'モバイルバッテリー', 3.5, 450, 1500
UNION ALL
SELECT 'E004', 'USB充電ケーブル', 2.8, 320, 800;

-- ========================================
-- 使い方のヒント:
-- 1. 上記のクエリをQueryCanvasで実行すると、条件に応じたスタイリングが適用されます
-- 2. 条件は左から順番に評価され、複数の条件が満たされる場合は後の条件が優先されます
-- 3. type指定は条件付きスタイリングに必須です（type=int, type=float, type=decimalなど）
-- 4. 色指定は16進数（#ff0000）または色名（red）が使えます
-- ========================================

