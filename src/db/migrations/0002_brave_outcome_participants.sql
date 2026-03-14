CREATE TABLE `conflict_outcome_participants` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`event_id` integer NOT NULL,
	`side` text NOT NULL,
	`participant_type` text NOT NULL,
	`participant_id` integer NOT NULL
);
