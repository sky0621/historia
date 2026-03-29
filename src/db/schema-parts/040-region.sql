-- 地域: 地理的な分類単位
CREATE TABLE `regions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 地域ID
  `name` text NOT NULL, -- 地域名
  `parent_region_id` integer REFERENCES `regions`(`id`), -- 親地域ID
  `reading` text, -- 読み方
  `description` text, -- 地域の説明
  `note` text -- 編集メモ・注釈
);
