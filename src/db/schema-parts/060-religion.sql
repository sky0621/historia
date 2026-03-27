-- 宗教: 宗教本体の基本情報
CREATE TABLE `religions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 宗教ID
  `name` text NOT NULL, -- 宗教名
  `reading` text, -- 読み方
  `description` text, -- 宗教の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 成立年の紀元区分コード
  `from_year` integer, -- 成立年
  `from_is_approximate` integer DEFAULT false, -- 成立年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 終了年の紀元区分コード
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 宗派: 宗教に属する宗派・分派の基本情報
CREATE TABLE `sects` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 宗派ID
  `name` text NOT NULL, -- 宗派名
  `reading` text, -- 読み方
  `description` text, -- 宗派の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 成立年の紀元区分コード
  `from_year` integer, -- 成立年
  `from_is_approximate` integer DEFAULT false, -- 成立年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 終了年の紀元区分コード
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);
