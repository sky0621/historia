-- 地域: 地理的な分類単位
CREATE TABLE `regions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 地域ID
  `name` text NOT NULL, -- 地域名
  `reading` text, -- 読み方
  `description` text, -- 地域の説明
  `note` text -- 編集メモ・注釈
);

-- 地域間の関連: 親子関係以外の地域どうしの関係
CREATE TABLE `region_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 地域関係ID
  `from_region_id` integer NOT NULL REFERENCES `regions`(`id`), -- 起点となる地域ID
  `to_region_id` integer NOT NULL REFERENCES `regions`(`id`), -- 終点となる地域ID
  `relation_type` text NOT NULL REFERENCES `region_relation_types`(`code`) -- 関係種別コード
);
CREATE INDEX `idx_region_relations_from_region_id` ON `region_relations` (`from_region_id`);
CREATE INDEX `idx_region_relations_to_region_id` ON `region_relations` (`to_region_id`);
