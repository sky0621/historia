-- 宗教と地域の関連
CREATE TABLE `religion_region_links` (
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`), -- 宗教ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_religion_region_links_religion_id` ON `religion_region_links` (`religion_id`);
CREATE INDEX `idx_religion_region_links_region_id` ON `religion_region_links` (`region_id`);

-- 宗教と開祖人物の関連
CREATE TABLE `religion_founder_links` (
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`), -- 宗教ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 開祖人物ID
);
CREATE INDEX `idx_religion_founder_links_religion_id` ON `religion_founder_links` (`religion_id`);
CREATE INDEX `idx_religion_founder_links_person_id` ON `religion_founder_links` (`person_id`);

-- 宗派と宗教の所属関係
CREATE TABLE `religion_sect_links` (
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`), -- 宗教ID
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`) -- 宗派ID
);
CREATE INDEX `idx_religion_sect_links_religion_id` ON `religion_sect_links` (`religion_id`);
CREATE INDEX `idx_religion_sect_links_sect_id` ON `religion_sect_links` (`sect_id`);

-- 宗派と地域の関連
CREATE TABLE `sect_region_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 宗派ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_sect_region_links_sect_id` ON `sect_region_links` (`sect_id`);
CREATE INDEX `idx_sect_region_links_region_id` ON `sect_region_links` (`region_id`);

-- 宗派と開祖人物の関連
CREATE TABLE `sect_founder_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 宗派ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 開祖人物ID
);
CREATE INDEX `idx_sect_founder_links_sect_id` ON `sect_founder_links` (`sect_id`);
CREATE INDEX `idx_sect_founder_links_person_id` ON `sect_founder_links` (`person_id`);
