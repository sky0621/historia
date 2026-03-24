-- 時代区分カテゴリ: 時代区分の分類軸
CREATE TABLE `period_categories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- カテゴリID
  `name` text NOT NULL, -- カテゴリ名
  `reading` text, -- 読み方
  `description` text -- カテゴリの説明
);

-- 時代区分: 歴史時代・期間の記録
CREATE TABLE `historical_periods` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 時代区分ID
  `name` text NOT NULL, -- 時代区分名
  `reading` text, -- 読み方
  `region_label` text, -- 表示用の地域ラベル
  `aliases` text, -- 別名のカンマ区切り文字列
  `description` text, -- 時代区分の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text, -- 開始年の紀元区分: BCE / CE
  `from_year` integer, -- 開始年
  `from_is_approximate` integer DEFAULT false, -- 開始年がおおよそか
  `to_calendar_era` text, -- 終了年の紀元区分: BCE / CE
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 時代区分間関係: 時代区分どうしの関係
CREATE TABLE `historical_period_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 関係ID
  `from_period_id` integer NOT NULL, -- 起点となる時代区分ID
  `to_period_id` integer NOT NULL, -- 終点となる時代区分ID
  `relation_type` text NOT NULL, -- 関係種別
  `description` text, -- 関係の説明
  `note` text -- 編集メモ・注釈
);
