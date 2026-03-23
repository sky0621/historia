import { integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const regionParentLinks = sqliteTable("region_parent_links", {
  regionId: integer("region_id").notNull(),
  parentRegionId: integer("parent_region_id").notNull()
});

export const dynastyPolityLinks = sqliteTable("dynasty_polity_links", {
  dynastyId: integer("dynasty_id").notNull(),
  polityId: integer("polity_id").notNull()
});

export const roleAssignmentPersonLinks = sqliteTable("role_assignment_person_links", {
  roleAssignmentId: integer("role_assignment_id").notNull(),
  personId: integer("person_id").notNull()
});

export const roleAssignmentPolityLinks = sqliteTable("role_assignment_polity_links", {
  roleAssignmentId: integer("role_assignment_id").notNull(),
  polityId: integer("polity_id").notNull()
});

export const roleAssignmentDynastyLinks = sqliteTable("role_assignment_dynasty_links", {
  roleAssignmentId: integer("role_assignment_id").notNull(),
  dynastyId: integer("dynasty_id").notNull()
});

export const historicalPeriodCategoryLinks = sqliteTable("historical_period_category_links", {
  periodId: integer("period_id").notNull(),
  categoryId: integer("category_id").notNull()
});

export const historicalPeriodPolityLinks = sqliteTable("historical_period_polity_links", {
  periodId: integer("period_id").notNull(),
  polityId: integer("polity_id").notNull()
});

export const sectReligionLinks = sqliteTable("sect_religion_links", {
  sectId: integer("sect_id").notNull(),
  religionId: integer("religion_id").notNull()
});

export const sectParentLinks = sqliteTable("sect_parent_links", {
  sectId: integer("sect_id").notNull(),
  parentSectId: integer("parent_sect_id").notNull()
});

export const eventPersonLinks = sqliteTable("event_person_links", {
  eventId: integer("event_id").notNull(),
  personId: integer("person_id").notNull()
});

export const eventPolityLinks = sqliteTable("event_polity_links", {
  eventId: integer("event_id").notNull(),
  polityId: integer("polity_id").notNull()
});

export const eventDynastyLinks = sqliteTable("event_dynasty_links", {
  eventId: integer("event_id").notNull(),
  dynastyId: integer("dynasty_id").notNull()
});

export const eventPeriodLinks = sqliteTable("event_period_links", {
  eventId: integer("event_id").notNull(),
  periodId: integer("period_id").notNull()
});

export const eventReligionLinks = sqliteTable("event_religion_links", {
  eventId: integer("event_id").notNull(),
  religionId: integer("religion_id").notNull()
});

export const eventSectLinks = sqliteTable("event_sect_links", {
  eventId: integer("event_id").notNull(),
  sectId: integer("sect_id").notNull()
});

export const eventRegionLinks = sqliteTable("event_region_links", {
  eventId: integer("event_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const eventTagLinks = sqliteTable("event_tag_links", {
  eventId: integer("event_id").notNull(),
  tagId: integer("tag_id").notNull()
});

export const personRegionLinks = sqliteTable("person_region_links", {
  personId: integer("person_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const polityRegionLinks = sqliteTable("polity_region_links", {
  polityId: integer("polity_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const dynastyRegionLinks = sqliteTable("dynasty_region_links", {
  dynastyId: integer("dynasty_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const periodRegionLinks = sqliteTable("period_region_links", {
  periodId: integer("period_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const religionRegionLinks = sqliteTable("religion_region_links", {
  religionId: integer("religion_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const sectRegionLinks = sqliteTable("sect_region_links", {
  sectId: integer("sect_id").notNull(),
  regionId: integer("region_id").notNull()
});

export const personReligionLinks = sqliteTable("person_religion_links", {
  personId: integer("person_id").notNull(),
  religionId: integer("religion_id").notNull()
});

export const personSectLinks = sqliteTable("person_sect_links", {
  personId: integer("person_id").notNull(),
  sectId: integer("sect_id").notNull()
});

export const personPeriodLinks = sqliteTable("person_period_links", {
  personId: integer("person_id").notNull(),
  periodId: integer("period_id").notNull()
});

export const religionFounderLinks = sqliteTable("religion_founder_links", {
  religionId: integer("religion_id").notNull(),
  personId: integer("person_id").notNull()
});

export const sectFounderLinks = sqliteTable("sect_founder_links", {
  sectId: integer("sect_id").notNull(),
  personId: integer("person_id").notNull()
});
