-- 宗派の親子関係
CREATE TABLE `sect_parent_links` (
  `sect_id` integer NOT NULL REFERENCES `sects`(`id`), -- 子宗派ID
  `parent_sect_id` integer NOT NULL REFERENCES `sects`(`id`) -- 親宗派ID
);
CREATE INDEX `idx_sect_parent_links_sect_id` ON `sect_parent_links` (`sect_id`);
CREATE INDEX `idx_sect_parent_links_parent_sect_id` ON `sect_parent_links` (`parent_sect_id`);

