-- 国家: 国家・政体の基本情報
CREATE TABLE `polities` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 国家ID
  `name` text NOT NULL, -- 国家名
  `reading` text, -- 読み方
  `description` text, -- 国家の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` integer DEFAULT false, -- 成立年の紀元区分: false=CE / true=BCE
  `from_year` integer, -- 成立年
  `from_is_approximate` integer DEFAULT false, -- 成立年がおおよそか
  `to_calendar_era` integer DEFAULT false, -- 終了年の紀元区分: false=CE / true=BCE
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 国家変遷: 前身国家と後継国家の関係
CREATE TABLE `polity_transitions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 国家変遷ID
  `predecessor_polity_id` integer NOT NULL, -- 前身国家ID
  `successor_polity_id` integer NOT NULL, -- 後継国家ID
  `transition_type` text NOT NULL, -- 変遷種別
  `description` text, -- 変遷の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text, -- 変遷開始年の紀元区分: BCE / CE
  `from_year` integer, -- 変遷開始年
  `from_is_approximate` integer DEFAULT false, -- 変遷開始年がおおよそか
  `to_calendar_era` text, -- 変遷終了年の紀元区分: BCE / CE
  `to_year` integer, -- 変遷終了年
  `to_is_approximate` integer DEFAULT false -- 変遷終了年がおおよそか
);

-- 王朝: 国家に属する王朝の基本情報
CREATE TABLE `dynasties` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 王朝ID
  `name` text NOT NULL, -- 王朝名
  `reading` text, -- 読み方
  `description` text, -- 王朝の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text, -- 開始年の紀元区分: BCE / CE
  `from_year` integer, -- 開始年
  `from_is_approximate` integer DEFAULT false, -- 開始年がおおよそか
  `to_calendar_era` text, -- 終了年の紀元区分: BCE / CE
  `to_year` integer, -- 終了年
  `to_is_approximate` integer DEFAULT false -- 終了年がおおよそか
);

-- 王朝継承: 同一国家内での王朝交代
CREATE TABLE `dynasty_successions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL, -- 王朝継承ID
  `polity_id` integer NOT NULL, -- 対象国家ID
  `predecessor_dynasty_id` integer NOT NULL, -- 先行王朝ID
  `successor_dynasty_id` integer NOT NULL, -- 後継王朝ID
  `description` text, -- 継承の説明
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text, -- 継承開始年の紀元区分: BCE / CE
  `from_year` integer, -- 継承開始年
  `from_is_approximate` integer DEFAULT false, -- 継承開始年がおおよそか
  `to_calendar_era` text, -- 継承終了年の紀元区分: BCE / CE
  `to_year` integer, -- 継承終了年
  `to_is_approximate` integer DEFAULT false -- 継承終了年がおおよそか
);

