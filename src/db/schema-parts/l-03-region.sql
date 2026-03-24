-- 地域の親子関係
CREATE TABLE `region_parent_links` (
  `region_id` integer NOT NULL, -- 子地域ID
  `parent_region_id` integer NOT NULL -- 親地域ID
);
