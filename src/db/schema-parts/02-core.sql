-- 人物
CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` integer DEFAULT false,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` integer DEFAULT false,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

-- 国家
CREATE TABLE `polities` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` integer DEFAULT false,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` integer DEFAULT false,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

-- 王朝
CREATE TABLE `dynasties` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

-- 地域
CREATE TABLE `regions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
);

-- 時代区分・カテゴリー
CREATE TABLE `period_categories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `description` text
);

-- タグ
CREATE TABLE `tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text -- 読み方
);

CREATE TABLE `role` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text, -- 読み方
  `description` text,
  `note` text, -- 編集メモ・注釈
  `is_incumbent` integer DEFAULT false,
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `historical_periods` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `region_label` text,
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `religions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `sects` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text, -- 読み方
  `aliases` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `polity_transitions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `predecessor_polity_id` integer NOT NULL,
  `successor_polity_id` integer NOT NULL,
  `transition_type` text NOT NULL,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `dynasty_successions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `polity_id` integer NOT NULL,
  `predecessor_dynasty_id` integer NOT NULL,
  `successor_dynasty_id` integer NOT NULL,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);

CREATE TABLE `region_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_region_id` integer NOT NULL,
  `to_region_id` integer NOT NULL,
  `relation_type` text NOT NULL,
  `description` text,
  `note` text, -- 編集メモ・注釈
);

CREATE TABLE `historical_period_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_period_id` integer NOT NULL,
  `to_period_id` integer NOT NULL,
  `relation_type` text NOT NULL,
  `description` text,
  `note` text, -- 編集メモ・注釈
);

CREATE TABLE `events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `event_type` text NOT NULL,
  `description` text,
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `event_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_event_id` integer NOT NULL,
  `to_event_id` integer NOT NULL,
  `relation_type` text NOT NULL
);

CREATE TABLE `conflict_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `participant_type` text NOT NULL,
  `participant_id` integer NOT NULL,
  `role` text NOT NULL,
  `description` text,
  `note` text, -- 編集メモ・注釈
);

CREATE TABLE `conflict_outcomes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `settlement_summary` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `winner_summary` text,
  `loser_summary` text
);

CREATE TABLE `conflict_outcome_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `side` text NOT NULL,
  `participant_type` text NOT NULL,
  `participant_id` integer NOT NULL
);

CREATE TABLE `sources` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `author` text,
  `publisher` text,
  `published_at_label` text,
  `url` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `citations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source_id` integer NOT NULL,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `locator` text,
  `quote` text,
  `description` text,
  `note` text, -- 編集メモ・注釈
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

CREATE TABLE `change_histories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `target_type` text NOT NULL,
  `target_id` integer NOT NULL,
  `action` text NOT NULL,
  `snapshot_json` text NOT NULL,
  `changed_at` integer NOT NULL
);

CREATE TABLE `import_runs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source_format` text NOT NULL,
  `target_type` text NOT NULL,
  `action` text NOT NULL,
  `file_name` text,
  `status` text NOT NULL,
  `summary_json` text NOT NULL,
  `created_at` integer NOT NULL
);
