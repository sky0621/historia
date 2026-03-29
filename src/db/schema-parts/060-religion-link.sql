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
