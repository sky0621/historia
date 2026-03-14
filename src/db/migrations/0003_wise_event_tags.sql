CREATE TABLE `tags` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `event_tag_links` (
	`event_id` integer NOT NULL,
	`tag_id` integer NOT NULL
);
