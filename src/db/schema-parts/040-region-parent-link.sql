-- 地域の親子関係
CREATE TABLE `region_parent_links` (
  `region_id` integer NOT NULL REFERENCES `regions`(`id`), -- 子地域ID
  `parent_region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 親地域ID
);
CREATE INDEX `idx_region_parent_links_region_id` ON `region_parent_links` (`region_id`);
CREATE INDEX `idx_region_parent_links_parent_region_id` ON `region_parent_links` (`parent_region_id`);
