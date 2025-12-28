-- ==========================================
-- グラフ表示機能のサンプルSQL集
-- ==========================================

-- 例1: 折れ線グラフ（店舗別売上推移）
/**
 * @chart type=line x=日付 y=小村井店,京成小岩店 title="店舗別売上推移"
 * @row 曜日=="土":bg=#eeeeff
 * @row 曜日=="日":bg=#ffeeee
 * @column 小村井店 type=int align=right format=number comma=true color="#FF0000"
 * @column 京成小岩店 type=int align=right format=number comma=true color="#008800"
 */
SELECT 
  DATE_FORMAT(STR_TO_DATE(YMD_CREATED, '%Y%m%d'), '%Y/%m/%d') AS '日付',
  CASE DAYOFWEEK(STR_TO_DATE(YMD_CREATED, '%Y%m%d'))
    WHEN 1 THEN '日'
    WHEN 2 THEN '月'
    WHEN 3 THEN '火'
    WHEN 4 THEN '水'
    WHEN 5 THEN '木'
    WHEN 6 THEN '金'
    WHEN 7 THEN '土'
  END AS '曜日',
  SUM(CASE WHEN s.SHOP_NAME = '小村井店' THEN 1 ELSE 0 END) AS '小村井店',
  SUM(CASE WHEN s.SHOP_NAME = '京成小岩店' THEN 1 ELSE 0 END) AS '京成小岩店'
FROM BR_ITEM_YMD iym
INNER JOIN BR_SHOP s ON iym.SHOP_ID = s.ID
WHERE iym.YMD_CREATED LIKE '202508%'
  AND iym.DELETED IS NULL
  AND s.DELETED IS NULL
  AND s.SHOP_NAME IN ('小村井店', '京成小岩店')
GROUP BY YMD_CREATED
ORDER BY YMD_CREATED;


-- 例2: 棒グラフ（カテゴリ別売上）
/**
 * @chart type=bar x=カテゴリ y=売上 title="カテゴリ別売上"
 * @column 売上 type=int align=right format=number comma=true if<1000000:color=red if>5000000:color=green,bold=true
 */
SELECT 
  category AS 'カテゴリ',
  SUM(amount) AS '売上'
FROM sales
GROUP BY category
ORDER BY 売上 DESC
LIMIT 10;


-- 例3: 積み上げ棒グラフ（商品別売上）
/**
 * @chart type=bar x=月 y=商品A,商品B,商品C stacked=true title="商品別月次売上"
 * @column 商品A type=int align=right format=number comma=true color="#FF6384"
 * @column 商品B type=int align=right format=number comma=true color="#36A2EB"
 * @column 商品C type=int align=right format=number comma=true color="#FFCE56"
 */
SELECT 
  DATE_FORMAT(order_date, '%Y-%m') AS '月',
  SUM(CASE WHEN product = 'A' THEN amount ELSE 0 END) AS '商品A',
  SUM(CASE WHEN product = 'B' THEN amount ELSE 0 END) AS '商品B',
  SUM(CASE WHEN product = 'C' THEN amount ELSE 0 END) AS '商品C'
FROM sales
WHERE order_date >= '2025-01-01'
GROUP BY DATE_FORMAT(order_date, '%Y-%m')
ORDER BY 月;


-- 例4: 面グラフ（顧客区分別売上推移）
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


-- 例5: 円グラフ（市場シェア）
/**
 * @chart type=pie x=地域 y=売上高 title="地域別売上構成比"
 * @column 売上高 type=int align=right format=number comma=true
 */
SELECT 
  region AS '地域',
  SUM(amount) AS '売上高'
FROM sales
GROUP BY region
ORDER BY 売上高 DESC;


-- 例6: 散布図（価格と数量の相関）
/**
 * @chart type=scatter x=価格 y=販売数量 title="価格と販売数量の関係"
 * @column 価格 type=int align=right format=number comma=true
 * @column 販売数量 type=int align=right format=number comma=true
 */
SELECT 
  price AS '価格',
  quantity AS '販売数量'
FROM products
WHERE stock > 0;


-- 例7: 滑らかな折れ線グラフ
/**
 * @chart type=line x=日 y=訪問者数 curve=smooth title="ウェブサイト訪問者数"
 * @column 訪問者数 type=int align=right format=number comma=true color="#9966FF"
 */
SELECT 
  DATE_FORMAT(visit_date, '%Y-%m-%d') AS '日',
  COUNT(*) AS '訪問者数'
FROM website_visits
WHERE visit_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
GROUP BY visit_date
ORDER BY visit_date;


-- 例8: 直線の折れ線グラフ（グリッド非表示）
/**
 * @chart type=line x=時刻 y=気温 curve=straight grid=false title="時刻別気温"
 * @column 気温 type=float align=right format=number decimal=1 color="#FF9F40"
 */
SELECT 
  DATE_FORMAT(measured_at, '%H:%M') AS '時刻',
  AVG(temperature) AS '気温'
FROM weather_data
WHERE DATE(measured_at) = CURDATE()
GROUP BY DATE_FORMAT(measured_at, '%H:%M')
ORDER BY 時刻;


-- 例9: 複数系列の折れ線グラフ（凡例なし）
/**
 * @chart type=line x=週 y=店舗A,店舗B,店舗C legend=false title="店舗別週次売上"
 * @column 店舗A type=int align=right format=number comma=true color="#FF6384"
 * @column 店舗B type=int align=right format=number comma=true color="#36A2EB"
 * @column 店舗C type=int align=right format=number comma=true color="#FFCE56"
 */
SELECT 
  YEARWEEK(order_date) AS '週',
  SUM(CASE WHEN shop = 'A' THEN amount ELSE 0 END) AS '店舗A',
  SUM(CASE WHEN shop = 'B' THEN amount ELSE 0 END) AS '店舗B',
  SUM(CASE WHEN shop = 'C' THEN amount ELSE 0 END) AS '店舗C'
FROM sales
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 12 WEEK)
GROUP BY YEARWEEK(order_date)
ORDER BY 週;


-- 例10: 行スタイルとグラフの組み合わせ
/**
 * @chart type=bar x=担当者 y=売上 title="担当者別売上"
 * @row 売上>5000000:bg=#ccffcc,bold=true
 * @row 売上<1000000:bg=#ffcccc
 * @column 売上 type=int align=right format=number comma=true if<1000000:color=red if>5000000:color=green,bold=true
 */
SELECT 
  salesperson AS '担当者',
  SUM(amount) AS '売上'
FROM sales
WHERE order_date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
GROUP BY salesperson
ORDER BY 売上 DESC;

