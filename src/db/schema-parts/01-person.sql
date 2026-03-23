-- 人物
CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` integer DEFAULT false,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` integer DEFAULT false,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

-- 役職
CREATE TABLE `role` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text, -- 読み方
  `description` text,
  `note` text, -- 編集メモ・注釈
  `is_incumbent` integer DEFAULT false,
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);
