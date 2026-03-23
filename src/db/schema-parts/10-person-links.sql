CREATE TABLE `event_person_links` (
  `event_id` integer NOT NULL,
  `person_id` integer NOT NULL
);

CREATE TABLE `region_parent_links` (
  `region_id` integer NOT NULL,
  `parent_region_id` integer NOT NULL
);

CREATE TABLE `dynasty_polity_links` (
  `dynasty_id` integer NOT NULL,
  `polity_id` integer NOT NULL
);

CREATE TABLE `role_assignment_person_links` (
  `role_assignment_id` integer NOT NULL,
  `person_id` integer NOT NULL
);

CREATE TABLE `role_assignment_polity_links` (
  `role_assignment_id` integer NOT NULL,
  `polity_id` integer NOT NULL
);

CREATE TABLE `role_assignment_dynasty_links` (
  `role_assignment_id` integer NOT NULL,
  `dynasty_id` integer NOT NULL
);

CREATE TABLE `historical_period_category_links` (
  `period_id` integer NOT NULL,
  `category_id` integer NOT NULL
);

CREATE TABLE `historical_period_polity_links` (
  `period_id` integer NOT NULL,
  `polity_id` integer NOT NULL
);

CREATE TABLE `sect_religion_links` (
  `sect_id` integer NOT NULL,
  `religion_id` integer NOT NULL
);

CREATE TABLE `sect_parent_links` (
  `sect_id` integer NOT NULL,
  `parent_sect_id` integer NOT NULL
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
