-- 人物と地域の関連
CREATE TABLE `person_region_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`), -- 人物ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_person_region_links_person_id` ON `person_region_links` (`person_id`);
CREATE INDEX `idx_person_region_links_region_id` ON `person_region_links` (`region_id`);

-- 人物と時代区分の関連
CREATE TABLE `person_period_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`), -- 人物ID
  `period_id` integer NOT NULL REFERENCES `historical_periods`(`id`) -- 時代区分ID
);
CREATE INDEX `idx_person_period_links_person_id` ON `person_period_links` (`person_id`);
CREATE INDEX `idx_person_period_links_period_id` ON `person_period_links` (`period_id`);

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
