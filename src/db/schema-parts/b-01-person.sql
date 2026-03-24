-- 人物: 人物の基本情報
CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 人物ID
  `name` text NOT NULL, -- 人物名
  `reading` text, -- 読み方
  `aliases` text, -- 別名のカンマ区切り文字列
  `description` text, -- 人物の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` integer DEFAULT false, -- 生年の紀元区分: false=CE / true=BCE
  `from_year` integer, -- 生年
  `from_is_approximate` integer DEFAULT false, -- 生年がおおよそか
  `to_calendar_era` integer DEFAULT false, -- 没年の紀元区分: false=CE / true=BCE
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
  `is_incumbent` integer DEFAULT false, -- 現職かどうか
  `from_calendar_era` text, -- 就任年の紀元区分: BCE / CE
  `from_year` integer, -- 就任年
  `from_is_approximate` integer DEFAULT false, -- 就任年がおおよそか
  `to_calendar_era` text, -- 離任年の紀元区分: BCE / CE
  `to_year` integer, -- 離任年
  `to_is_approximate` integer DEFAULT false -- 離任年がおおよそか
);
