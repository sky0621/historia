-- 国家: 国家・政体の基本情報
CREATE TABLE `polities` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 国家ID
  `name` text NOT NULL, -- 国家名
  `reading` text, -- 読み方
  `description` text, -- 国家の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 成立年の紀元区分コード
  `from_year` integer, -- 成立年
  `from_is_approximate` integer DEFAULT false, -- 成立年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 終了年の紀元区分コード
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 国家変遷: 前身国家と後継国家の関係
CREATE TABLE `polity_transitions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 国家変遷ID
  `predecessor_polity_id` integer NOT NULL REFERENCES `polities`(`id`), -- 前身国家ID
  `successor_polity_id` integer NOT NULL REFERENCES `polities`(`id`), -- 後継国家ID
  `transition_type` text NOT NULL REFERENCES `polity_transition_types`(`code`), -- 変遷種別コード
  `description` text, -- 変遷の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 変遷開始年の紀元区分コード
  `from_year` integer, -- 変遷開始年
  `from_is_approximate` integer DEFAULT false, -- 変遷開始年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 変遷終了年の紀元区分コード
  `to_year` integer, -- 変遷終了年
  `to_is_approximate` integer DEFAULT false -- 変遷終了年がおおよそか
);
CREATE INDEX `idx_polity_transitions_predecessor_polity_id` ON `polity_transitions` (`predecessor_polity_id`);
CREATE INDEX `idx_polity_transitions_successor_polity_id` ON `polity_transitions` (`successor_polity_id`);

-- 王朝: 王朝・王家・支配家門の基本情報
CREATE TABLE `dynasties` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 王朝ID
  `name` text NOT NULL, -- 王朝名
  `reading` text, -- 読み方
  `description` text, -- 王朝の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 開始年の紀元区分コード
  `from_year` integer, -- 開始年
  `from_is_approximate` integer DEFAULT false, -- 開始年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 終了年の紀元区分コード
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 王朝継承: 同一国家内での王朝交代
CREATE TABLE `dynasty_successions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 王朝継承ID
  `polity_id` integer NOT NULL REFERENCES `polities`(`id`), -- 対象国家ID
  `predecessor_dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 先行王朝ID
  `successor_dynasty_id` integer NOT NULL REFERENCES `dynasties`(`id`), -- 後継王朝ID
  `description` text, -- 継承の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text REFERENCES `era`(`code`), -- 継承開始年の紀元区分コード
  `from_year` integer, -- 継承開始年
  `from_is_approximate` integer DEFAULT false, -- 継承開始年がおおよそか
  `to_calendar_era` text REFERENCES `era`(`code`), -- 継承終了年の紀元区分コード
  `to_year` integer, -- 継承終了年
  `to_is_approximate` integer DEFAULT false -- 継承終了年がおおよそか
);
CREATE INDEX `idx_dynasty_successions_polity_id` ON `dynasty_successions` (`polity_id`);
CREATE INDEX `idx_dynasty_successions_predecessor_dynasty_id` ON `dynasty_successions` (`predecessor_dynasty_id`);
CREATE INDEX `idx_dynasty_successions_successor_dynasty_id` ON `dynasty_successions` (`successor_dynasty_id`);
