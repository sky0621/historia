-- 人物と地域の関連
CREATE TABLE `person_region_links` (
  `person_id` integer NOT NULL, -- 人物ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 人物と時代区分の関連
CREATE TABLE `person_period_links` (
  `person_id` integer NOT NULL, -- 人物ID
  `period_id` integer NOT NULL -- 時代区分ID
);

-- 人物と宗教の関連
CREATE TABLE `person_religion_links` (
  `person_id` integer NOT NULL, -- 人物ID
  `religion_id` integer NOT NULL -- 宗教ID
);

-- 人物と宗派の関連
CREATE TABLE `person_sect_links` (
  `person_id` integer NOT NULL, -- 人物ID
  `sect_id` integer NOT NULL -- 宗派ID
);
