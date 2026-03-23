CREATE TABLE `regions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `parent_region_id` integer,
  `aliases` text,
  `description` text,
  `note` text
);

CREATE TABLE `period_categories` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `description` text
);

CREATE TABLE `tags` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL
);

CREATE TABLE `polities` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `aliases` text,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `dynasties` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `polity_id` integer NOT NULL,
  `name` text NOT NULL,
  `aliases` text,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `persons` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `reading` text,
  `aliases` text,
  `note` text,
  `birth_calendar_era` text,
  `birth_start_year` integer,
  `birth_end_year` integer,
  `birth_is_approximate` integer DEFAULT false,
  `birth_precision` text,
  `birth_display_label` text,
  `death_calendar_era` text,
  `death_start_year` integer,
  `death_end_year` integer,
  `death_is_approximate` integer DEFAULT false,
  `death_precision` text,
  `death_display_label` text
);

CREATE TABLE `role_assignments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `person_id` integer NOT NULL,
  `title` text NOT NULL,
  `polity_id` integer,
  `dynasty_id` integer,
  `note` text,
  `is_incumbent` integer DEFAULT false,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `historical_periods` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `category_id` integer NOT NULL,
  `polity_id` integer,
  `name` text NOT NULL,
  `region_label` text,
  `aliases` text,
  `description` text,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `religions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `name` text NOT NULL,
  `aliases` text,
  `description` text,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `sects` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `religion_id` integer NOT NULL,
  `parent_sect_id` integer,
  `name` text NOT NULL,
  `aliases` text,
  `description` text,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `polity_transitions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `predecessor_polity_id` integer NOT NULL,
  `successor_polity_id` integer NOT NULL,
  `transition_type` text NOT NULL,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `dynasty_successions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `polity_id` integer NOT NULL,
  `predecessor_dynasty_id` integer NOT NULL,
  `successor_dynasty_id` integer NOT NULL,
  `note` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text
);

CREATE TABLE `region_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_region_id` integer NOT NULL,
  `to_region_id` integer NOT NULL,
  `relation_type` text NOT NULL,
  `note` text
);

CREATE TABLE `historical_period_relations` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `from_period_id` integer NOT NULL,
  `to_period_id` integer NOT NULL,
  `relation_type` text NOT NULL,
  `note` text
);

CREATE TABLE `events` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `event_type` text NOT NULL,
  `description` text,
  `time_calendar_era` text,
  `time_start_year` integer,
  `time_end_year` integer,
  `time_is_approximate` integer DEFAULT false,
  `time_precision` text,
  `time_display_label` text,
  `start_calendar_era` text,
  `start_year` integer,
  `end_calendar_era` text,
  `end_year` integer,
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
  `note` text
);

CREATE TABLE `conflict_outcomes` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `event_id` integer NOT NULL,
  `settlement_summary` text,
  `note` text,
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
  `note` text,
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
  `note` text,
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

CREATE TABLE `event_person_links` (
  `event_id` integer NOT NULL,
  `person_id` integer NOT NULL
);

CREATE TABLE `event_polity_links` (
  `event_id` integer NOT NULL,
  `polity_id` integer NOT NULL
);

CREATE TABLE `event_dynasty_links` (
  `event_id` integer NOT NULL,
  `dynasty_id` integer NOT NULL
);

CREATE TABLE `event_period_links` (
  `event_id` integer NOT NULL,
  `period_id` integer NOT NULL
);

CREATE TABLE `event_religion_links` (
  `event_id` integer NOT NULL,
  `religion_id` integer NOT NULL
);

CREATE TABLE `event_sect_links` (
  `event_id` integer NOT NULL,
  `sect_id` integer NOT NULL
);

CREATE TABLE `event_region_links` (
  `event_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `event_tag_links` (
  `event_id` integer NOT NULL,
  `tag_id` integer NOT NULL
);

CREATE TABLE `person_region_links` (
  `person_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `polity_region_links` (
  `polity_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `dynasty_region_links` (
  `dynasty_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `period_region_links` (
  `period_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `religion_region_links` (
  `religion_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `sect_region_links` (
  `sect_id` integer NOT NULL,
  `region_id` integer NOT NULL
);

CREATE TABLE `person_religion_links` (
  `person_id` integer NOT NULL,
  `religion_id` integer NOT NULL
);

CREATE TABLE `person_sect_links` (
  `person_id` integer NOT NULL,
  `sect_id` integer NOT NULL
);

CREATE TABLE `person_period_links` (
  `person_id` integer NOT NULL,
  `period_id` integer NOT NULL
);

CREATE TABLE `religion_founder_links` (
  `religion_id` integer NOT NULL,
  `person_id` integer NOT NULL
);

CREATE TABLE `sect_founder_links` (
  `sect_id` integer NOT NULL,
  `person_id` integer NOT NULL
);
