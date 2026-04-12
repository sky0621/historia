-- 人物と地域の関連
CREATE TABLE `person_region_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`), -- 人物ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_person_region_links_person_id` ON `person_region_links` (`person_id`);
CREATE INDEX `idx_person_region_links_region_id` ON `person_region_links` (`region_id`);

-- 人物と宗教の関連
CREATE TABLE `person_religion_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`), -- 人物ID
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`) -- 宗教ID
);
CREATE INDEX `idx_person_religion_links_person_id` ON `person_religion_links` (`person_id`);
CREATE INDEX `idx_person_religion_links_religion_id` ON `person_religion_links` (`religion_id`);

-- 人物と宗派の関連
CREATE TABLE `person_sect_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`), -- 人物ID
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`) -- 宗派ID
);
CREATE INDEX `idx_person_sect_links_person_id` ON `person_sect_links` (`person_id`);
CREATE INDEX `idx_person_sect_links_sect_id` ON `person_sect_links` (`sect_id`);

-- 人物と役職の関連
CREATE TABLE `role_polity_links` (
  `role_id` integer NOT NULL REFERENCES `roles`(`id`) ON DELETE CASCADE, -- 役職記録ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) ON DELETE CASCADE -- 国家ID
);
CREATE INDEX `idx_role_polity_links_role_id` ON `role_polity_links` (`role_id`);
CREATE INDEX `idx_role_polity_links_polity_id` ON `role_polity_links` (`polity_id`);

-- 役職とタグの関連
CREATE TABLE `role_tag_links` (
  `role_id` integer NOT NULL REFERENCES `roles`(`id`) ON DELETE CASCADE, -- 役職記録ID
  `tag_id` integer NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE -- タグID
);
CREATE INDEX `idx_role_tag_links_role_id` ON `role_tag_links` (`role_id`);
CREATE INDEX `idx_role_tag_links_tag_id` ON `role_tag_links` (`tag_id`);

-- 人物と役職の関連
CREATE TABLE `person_role_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) ON DELETE CASCADE, -- 人物ID
  `role_id` integer NOT NULL REFERENCES `roles`(`id`), -- 役職記録ID
  `description` text, -- 人物ごとの役職説明
  `note` text, -- 人物ごとの役職メモ
  `from_calendar_era` text REFERENCES `era`(`code`), -- 開始年の紀元区分コード
  `from_year` integer, -- 開始年
  `from_is_approximate` integer DEFAULT false, -- 開始年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 終了年の紀元区分コード
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);
CREATE INDEX `idx_person_role_links_person_id` ON `person_role_links` (`person_id`);
CREATE INDEX `idx_person_role_links_role_id` ON `person_role_links` (`role_id`);

-- 人物とタグの関連
CREATE TABLE `person_tag_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) ON DELETE CASCADE, -- 人物ID
  `tag_id` integer NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE -- タグID
);
CREATE INDEX `idx_person_tag_links_person_id` ON `person_tag_links` (`person_id`);
CREATE INDEX `idx_person_tag_links_tag_id` ON `person_tag_links` (`tag_id`);
