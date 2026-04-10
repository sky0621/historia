import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { dynasties, persons, polities, role, tags } from "@/db/schema/masters";

export const dynastyPolityLinks = sqliteTable("dynasty_polity_links", {
  dynastyId: integer("dynasty_id").notNull(),
  polityId: integer("polity_id").notNull()
});

export const rolePolityLinks = sqliteTable("role_polity_links", {
  roleId: integer("role_id").notNull().references(() => role.id, { onDelete: "cascade" }),
  polityId: integer("polity_id").notNull().references(() => polities.id, { onDelete: "cascade" })
});

export const personRoleLinks = sqliteTable("person_role_links", {
  personId: integer("person_id").notNull().references(() => persons.id, { onDelete: "cascade" }),
  roleId: integer("role_id").notNull().references(() => role.id),
  description: text("description"),
  note: text("note"),
  fromCalendarEra: text("from_calendar_era"),
  fromYear: integer("from_year"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: text("to_calendar_era"),
  toYear: integer("to_year"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const historicalPeriodCategoryLinks = sqliteTable("historical_period_category_links", {
  periodId: integer("period_id").notNull(),
  categoryId: integer("category_id").notNull()
});

export const historicalPeriodPolityLinks = sqliteTable("historical_period_polity_links", {
  periodId: integer("period_id").notNull(),
  polityId: integer("polity_id").notNull()
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

export const polityTagLinks = sqliteTable("polity_tag_links", {
  polityId: integer("polity_id").notNull().references(() => polities.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" })
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

export const dynastyTagLinks = sqliteTable("dynasty_tag_links", {
  dynastyId: integer("dynasty_id").notNull().references(() => dynasties.id, { onDelete: "cascade" }),
  tagId: integer("tag_id").notNull().references(() => tags.id, { onDelete: "cascade" })
});

export const historicalPeriodRegionLinks = sqliteTable("historical_period_region_links", {
  periodId: integer("period_id").notNull(),
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

export const religionFounderLinks = sqliteTable("religion_founder_links", {
  religionId: integer("religion_id").notNull(),
  personId: integer("person_id").notNull()
});

export const sectFounderLinks = sqliteTable("sect_founder_links", {
  sectId: integer("sect_id").notNull(),
  personId: integer("person_id").notNull()
});
