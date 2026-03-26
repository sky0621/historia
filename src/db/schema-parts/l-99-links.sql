-- 王朝と国家の所属関係
CREATE TABLE `dynasty_polity_links` (
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 王朝ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_dynasty_polity_links_dynasty_id` ON `dynasty_polity_links` (`dynasty_id`);
CREATE INDEX `idx_dynasty_polity_links_polity_id` ON `dynasty_polity_links` (`polity_id`);

-- 役職と人物の関連
CREATE TABLE `role_assignment_person_links` (
  `role_assignment_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 人物ID
);
CREATE INDEX `idx_role_assignment_person_links_role_assignment_id` ON `role_assignment_person_links` (`role_assignment_id`);
CREATE INDEX `idx_role_assignment_person_links_person_id` ON `role_assignment_person_links` (`person_id`);

-- 役職と国家の関連
CREATE TABLE `role_assignment_polity_links` (
  `role_assignment_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_role_assignment_polity_links_role_assignment_id` ON `role_assignment_polity_links` (`role_assignment_id`);
CREATE INDEX `idx_role_assignment_polity_links_polity_id` ON `role_assignment_polity_links` (`polity_id`);

-- 役職と王朝の関連
CREATE TABLE `role_assignment_dynasty_links` (
  `role_assignment_id` integer NOT NULL REFERENCES `role`(`id`), -- 役職記録ID
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`) -- 王朝ID
);
CREATE INDEX `idx_role_assignment_dynasty_links_role_assignment_id` ON `role_assignment_dynasty_links` (`role_assignment_id`);
CREATE INDEX `idx_role_assignment_dynasty_links_dynasty_id` ON `role_assignment_dynasty_links` (`dynasty_id`);

-- 宗派と宗教の所属関係
CREATE TABLE `sect_religion_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 宗派ID
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`) -- 宗教ID
);
CREATE INDEX `idx_sect_religion_links_sect_id` ON `sect_religion_links` (`sect_id`);
CREATE INDEX `idx_sect_religion_links_religion_id` ON `sect_religion_links` (`religion_id`);

-- 宗派の親子関係
CREATE TABLE `sect_parent_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 子宗派ID
  `parent_sect_id` integer NOT NULL REFERENCES `sects`(`id`) -- 親宗派ID
);
CREATE INDEX `idx_sect_parent_links_sect_id` ON `sect_parent_links` (`sect_id`);
CREATE INDEX `idx_sect_parent_links_parent_sect_id` ON `sect_parent_links` (`parent_sect_id`);

-- 国家と地域の関連
CREATE TABLE `polity_region_links` (
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`), -- 国家ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_polity_region_links_polity_id` ON `polity_region_links` (`polity_id`);
CREATE INDEX `idx_polity_region_links_region_id` ON `polity_region_links` (`region_id`);

-- 王朝と地域の関連
CREATE TABLE `dynasty_region_links` (
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 王朝ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_dynasty_region_links_dynasty_id` ON `dynasty_region_links` (`dynasty_id`);
CREATE INDEX `idx_dynasty_region_links_region_id` ON `dynasty_region_links` (`region_id`);

-- 宗教と地域の関連
CREATE TABLE `religion_region_links` (
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`), -- 宗教ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_religion_region_links_religion_id` ON `religion_region_links` (`religion_id`);
CREATE INDEX `idx_religion_region_links_region_id` ON `religion_region_links` (`region_id`);

-- 宗派と地域の関連
CREATE TABLE `sect_region_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 宗派ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_sect_region_links_sect_id` ON `sect_region_links` (`sect_id`);
CREATE INDEX `idx_sect_region_links_region_id` ON `sect_region_links` (`region_id`);

-- 宗教と開祖人物の関連
CREATE TABLE `religion_founder_links` (
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`), -- 宗教ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 開祖人物ID
);
CREATE INDEX `idx_religion_founder_links_religion_id` ON `religion_founder_links` (`religion_id`);
CREATE INDEX `idx_religion_founder_links_person_id` ON `religion_founder_links` (`person_id`);

-- 宗派と開祖人物の関連
CREATE TABLE `sect_founder_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 宗派ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 開祖人物ID
);
CREATE INDEX `idx_sect_founder_links_sect_id` ON `sect_founder_links` (`sect_id`);
CREATE INDEX `idx_sect_founder_links_person_id` ON `sect_founder_links` (`person_id`);
