-- 時代区分と地域の関連
CREATE TABLE `historical_period_region_links` (
  `period_id` integer NOT NULL REFERENCES `historical_periods`(`id`), -- 時代区分ID
  `region_id` integer NOT NULL REFERENCES `regions`(`id`) -- 地域ID
);
CREATE INDEX `idx_historical_period_region_links_period_id` ON `historical_period_region_links` (`period_id`);
CREATE INDEX `idx_historical_period_region_links_region_id` ON `historical_period_region_links` (`region_id`);

-- 時代区分とカテゴリの関連
CREATE TABLE `historical_period_category_links` (
  `period_id` integer NOT NULL REFERENCES `historical_periods`(`id`), -- 時代区分ID
  `category_id` integer NOT NULL REFERENCES `period_categories`(`id`) -- カテゴリID
);
CREATE INDEX `idx_historical_period_category_links_period_id` ON `historical_period_category_links` (`period_id`);
CREATE INDEX `idx_historical_period_category_links_category_id` ON `historical_period_category_links` (`category_id`);

-- 時代区分と国家の関連
CREATE TABLE `historical_period_polity_links` (
  `period_id` integer NOT NULL REFERENCES `historical_periods`(`id`), -- 時代区分ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`) -- 国家ID
);
CREATE INDEX `idx_historical_period_polity_links_period_id` ON `historical_period_polity_links` (`period_id`);
CREATE INDEX `idx_historical_period_polity_links_polity_id` ON `historical_period_polity_links` (`polity_id`);
