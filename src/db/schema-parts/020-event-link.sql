-- 出来事と人物の関連
CREATE TABLE `event_person_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) -- 人物ID
);
CREATE INDEX `idx_event_person_links_event_id` ON `event_person_links` (`event_id`);
CREATE INDEX `idx_event_person_links_person_id` ON `event_person_links` (`person_id`);

-- 出来事と国家の関連
CREATE TABLE `event_polity_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_event_polity_links_event_id` ON `event_polity_links` (`event_id`);
CREATE INDEX `idx_event_polity_links_polity_id` ON `event_polity_links` (`polity_id`);

-- 出来事と王朝の関連
CREATE TABLE `event_dynasty_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`) -- 王朝ID
);
CREATE INDEX `idx_event_dynasty_links_event_id` ON `event_dynasty_links` (`event_id`);
CREATE INDEX `idx_event_dynasty_links_dynasty_id` ON `event_dynasty_links` (`dynasty_id`);

-- 出来事と宗教の関連
CREATE TABLE `event_religion_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `religion_id` integer NOT NULL REFERENCES `religions`(`id`) -- 宗教ID
);
CREATE INDEX `idx_event_religion_links_event_id` ON `event_religion_links` (`event_id`);
CREATE INDEX `idx_event_religion_links_religion_id` ON `event_religion_links` (`religion_id`);

-- 出来事と宗派の関連
CREATE TABLE `event_sect_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`) -- 宗派ID
);
CREATE INDEX `idx_event_sect_links_event_id` ON `event_sect_links` (`event_id`);
CREATE INDEX `idx_event_sect_links_sect_id` ON `event_sect_links` (`sect_id`);

-- 出来事と地域の関連
CREATE TABLE `event_region_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_event_region_links_event_id` ON `event_region_links` (`event_id`);
CREATE INDEX `idx_event_region_links_region_id` ON `event_region_links` (`region_id`);

-- 出来事とタグの関連
CREATE TABLE `event_tag_links` (
  `event_id` integer NOT NULL REFERENCES `events`(`id`), -- 出来事ID
  `tag_id` integer NOT NULL REFERENCES `tags`(`id`) -- タグID
);
CREATE INDEX `idx_event_tag_links_event_id` ON `event_tag_links` (`event_id`);
CREATE INDEX `idx_event_tag_links_tag_id` ON `event_tag_links` (`tag_id`);
