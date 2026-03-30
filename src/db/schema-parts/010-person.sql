-- 人物: 人物の基本情報
CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 人物ID
  `name` text NOT NULL, -- 人物名
  `reading` text, -- 読み方
  `aliases` text, -- 別名のカンマ区切り文字列
  `description` text, -- 人物の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 生年の紀元区分コード
  `from_year` integer, -- 生年
  `from_is_approximate` integer DEFAULT false, -- 生年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 没年の紀元区分コード
  `to_year` integer, -- 没年
  `to_is_approximate` integer DEFAULT false -- 没年がおおよそか
);

-- 役職: 人物が持った役職・地位の記録
CREATE TABLE `role` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 役職記録ID
  `title` text NOT NULL, -- 役職名
  `reading` text, -- 読み方
  `description` text, -- 役職記録の説明
  `note` text, -- 編集メモ・注釈
  `polity_id` integer REFERENCES `polities`(`id`) -- 国家ID
);
