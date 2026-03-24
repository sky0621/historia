-- 出来事と人物の関連
CREATE TABLE `event_person_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `person_id` integer NOT NULL -- 人物ID
);

-- 出来事と国家の関連
CREATE TABLE `event_polity_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `polity_id` integer NOT NULL -- 国家ID
);

-- 出来事と王朝の関連
CREATE TABLE `event_dynasty_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `dynasty_id` integer NOT NULL -- 王朝ID
);

-- 出来事と時代区分の関連
CREATE TABLE `event_period_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `period_id` integer NOT NULL -- 時代区分ID
);

-- 出来事と宗教の関連
CREATE TABLE `event_religion_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `religion_id` integer NOT NULL -- 宗教ID
);

-- 出来事と宗派の関連
CREATE TABLE `event_sect_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `sect_id` integer NOT NULL -- 宗派ID
);

-- 出来事と地域の関連
CREATE TABLE `event_region_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 出来事とタグの関連
CREATE TABLE `event_tag_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `tag_id` integer NOT NULL -- タグID
);

