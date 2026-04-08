-- 国家と地域の関連
CREATE TABLE `polity_region_links` (
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`), -- 国家ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_polity_region_links_polity_id` ON `polity_region_links` (`polity_id`);
CREATE INDEX `idx_polity_region_links_region_id` ON `polity_region_links` (`region_id`);

-- 国家とタグの関連
CREATE TABLE `polity_tag_links` (
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) ON DELETE CASCADE, -- 国家ID
  `tag_id` integer NOT NULL REFERENCES `tags`(`id`) ON DELETE CASCADE -- タグID
);
CREATE INDEX `idx_polity_tag_links_polity_id` ON `polity_tag_links` (`polity_id`);
CREATE INDEX `idx_polity_tag_links_tag_id` ON `polity_tag_links` (`tag_id`);

-- 王朝と国家の関係
CREATE TABLE `dynasty_polity_links` (
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 王朝ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_dynasty_polity_links_dynasty_id` ON `dynasty_polity_links` (`dynasty_id`);
CREATE INDEX `idx_dynasty_polity_links_polity_id` ON `dynasty_polity_links` (`polity_id`);

-- 王朝と地域の関連
CREATE TABLE `dynasty_region_links` (
  `dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 王朝ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_dynasty_region_links_dynasty_id` ON `dynasty_region_links` (`dynasty_id`);
CREATE INDEX `idx_dynasty_region_links_region_id` ON `dynasty_region_links` (`region_id`);
