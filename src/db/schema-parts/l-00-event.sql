-- 出来事と人物の関連
CREATE TABLE `event_person_links` (
  `event_id` integer NOT NULL, -- 出来事ID
  `person_id` integer NOT NULL -- 人物ID
);
