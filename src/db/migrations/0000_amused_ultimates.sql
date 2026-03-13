CREATE TABLE `conflict_outcomes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`settlement_summary` text,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `conflict_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`participant_type` text NOT NULL,
	`participant_id` integer NOT NULL,
	`role` text NOT NULL,
	`note` text
);
--> statement-breakpoint
CREATE TABLE `event_relations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_event_id` integer NOT NULL,
	`to_event_id` integer NOT NULL,
	`relation_type` text NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `dynasty_region_links` (
	`dynasty_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_dynasty_links` (
	`event_id` integer NOT NULL,
	`dynasty_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_period_links` (
	`event_id` integer NOT NULL,
	`period_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_person_links` (
	`event_id` integer NOT NULL,
	`person_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_polity_links` (
	`event_id` integer NOT NULL,
	`polity_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_region_links` (
	`event_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_religion_links` (
	`event_id` integer NOT NULL,
	`religion_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_sect_links` (
	`event_id` integer NOT NULL,
	`sect_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `period_region_links` (
	`period_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person_period_links` (
	`person_id` integer NOT NULL,
	`period_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person_region_links` (
	`person_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person_religion_links` (
	`person_id` integer NOT NULL,
	`religion_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `person_sect_links` (
	`person_id` integer NOT NULL,
	`sect_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `polity_region_links` (
	`polity_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `religion_founder_links` (
	`religion_id` integer NOT NULL,
	`person_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `religion_region_links` (
	`religion_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sect_founder_links` (
	`sect_id` integer NOT NULL,
	`person_id` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `sect_region_links` (
	`sect_id` integer NOT NULL,
	`region_id` integer NOT NULL
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `people` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
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
--> statement-breakpoint
CREATE TABLE `period_categories` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `regions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`parent_region_id` integer,
	`aliases` text,
	`description` text,
	`note` text
);
--> statement-breakpoint
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
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `sects` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`religion_id` integer NOT NULL,
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
