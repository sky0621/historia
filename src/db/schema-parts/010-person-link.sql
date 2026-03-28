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

-- 役職と人物の関連
CREATE TABLE `role_person_links` (
  `role_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 人物ID
);
CREATE INDEX `idx_role_person_links_role_id` ON `role_person_links` (`role_id`);
CREATE INDEX `idx_role_person_links_person_id` ON `role_person_links` (`person_id`);

-- 役職と国家の関連
CREATE TABLE `role_polity_links` (
  `role_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_role_polity_links_role_id` ON `role_polity_links` (`role_id`);
CREATE INDEX `idx_role_polity_links_polity_id` ON `role_polity_links` (`polity_id`);

-- 役職と王朝の関連
CREATE TABLE `role_dynasty_links` (
  `role_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`) -- 王朝ID
);
CREATE INDEX `idx_role_dynasty_links_role_id` ON `role_dynasty_links` (`role_id`);
CREATE INDEX `idx_role_dynasty_links_dynasty_id` ON `role_dynasty_links` (`dynasty_id`);
