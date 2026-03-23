-- タグ
CREATE TABLE `tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text -- 読み方
);

-- 出来事
CREATE TABLE `events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `event_type` text NOT NULL, -- war / rebellion / civil_war
  `description` text,
  `note` text, -- 編集メモ・注釈
  `from_calendar_era` text,
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text,
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false,
  `created_at` integer NOT NULL,
  `updated_at` integer NOT NULL
);

-- 出来事間の関連
CREATE TABLE `event_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_event_id` integer NOT NULL,
  `to_event_id` integer NOT NULL,
  `relation_type` text NOT NULL
);

-- 戦争や反乱の参加者
CREATE TABLE `conflict_participants` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `participant_type` text NOT NULL, -- 参加主体の種別: person / polity / religion / sect
  `participant_id` integer NOT NULL,
  `role` text NOT NULL,
  `description` text,
  `note` text -- 編集メモ・注釈
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
