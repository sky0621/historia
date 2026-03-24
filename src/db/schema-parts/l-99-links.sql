-- 王朝と国家の所属関係
CREATE TABLE `dynasty_polity_links` (
  `dynasty_id` integer NOT NULL, -- 王朝ID
  `polity_id` integer NOT NULL -- 国家ID
);

-- 役職と人物の関連
CREATE TABLE `role_assignment_person_links` (
  `role_assignment_id` integer NOT NULL, -- 役職記録ID
  `person_id` integer NOT NULL -- 人物ID
);

-- 役職と国家の関連
CREATE TABLE `role_assignment_polity_links` (
  `role_assignment_id` integer NOT NULL, -- 役職記録ID
  `polity_id` integer NOT NULL -- 国家ID
);

-- 役職と王朝の関連
CREATE TABLE `role_assignment_dynasty_links` (
  `role_assignment_id` integer NOT NULL, -- 役職記録ID
  `dynasty_id` integer NOT NULL -- 王朝ID
);

-- 時代区分とカテゴリの関連
CREATE TABLE `historical_period_category_links` (
  `period_id` integer NOT NULL, -- 時代区分ID
  `category_id` integer NOT NULL -- カテゴリID
);

-- 時代区分と国家の関連
CREATE TABLE `historical_period_polity_links` (
  `period_id` integer NOT NULL, -- 時代区分ID
  `polity_id` integer NOT NULL -- 国家ID
);

-- 宗派と宗教の所属関係
CREATE TABLE `sect_religion_links` (
  `sect_id` integer NOT NULL, -- 宗派ID
  `religion_id` integer NOT NULL -- 宗教ID
);

-- 宗派の親子関係
CREATE TABLE `sect_parent_links` (
  `sect_id` integer NOT NULL, -- 子宗派ID
  `parent_sect_id` integer NOT NULL -- 親宗派ID
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

-- 国家と地域の関連
CREATE TABLE `polity_region_links` (
  `polity_id` integer NOT NULL, -- 国家ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 王朝と地域の関連
CREATE TABLE `dynasty_region_links` (
  `dynasty_id` integer NOT NULL, -- 王朝ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 時代区分と地域の関連
CREATE TABLE `period_region_links` (
  `period_id` integer NOT NULL, -- 時代区分ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 宗教と地域の関連
CREATE TABLE `religion_region_links` (
  `religion_id` integer NOT NULL, -- 宗教ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 宗派と地域の関連
CREATE TABLE `sect_region_links` (
  `sect_id` integer NOT NULL, -- 宗派ID
  `region_id` integer NOT NULL -- 地域ID
);

-- 宗教と開祖人物の関連
CREATE TABLE `religion_founder_links` (
  `religion_id` integer NOT NULL, -- 宗教ID
  `person_id` integer NOT NULL -- 開祖人物ID
);

-- 宗派と開祖人物の関連
CREATE TABLE `sect_founder_links` (
  `sect_id` integer NOT NULL, -- 宗派ID
  `person_id` integer NOT NULL -- 開祖人物ID
);
