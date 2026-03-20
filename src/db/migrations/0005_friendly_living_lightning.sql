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
--> statement-breakpoint
CREATE TABLE `historical_period_relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_period_id` integer NOT NULL,
	`to_period_id` integer NOT NULL,
	`relation_type` text NOT NULL,
	`note` text
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `region_relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_region_id` integer NOT NULL,
	`to_region_id` integer NOT NULL,
	`relation_type` text NOT NULL,
	`note` text
);
--> statement-breakpoint
ALTER TABLE `sects` ADD `parent_sect_id` integer;