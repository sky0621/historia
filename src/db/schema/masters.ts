import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

function timeColumns(prefix: string) {
  return {
    [`${prefix}CalendarEra`]: text(`${prefix}_calendar_era`),
    [`${prefix}StartYear`]: integer(`${prefix}_start_year`),
    [`${prefix}EndYear`]: integer(`${prefix}_end_year`),
    [`${prefix}IsApproximate`]: integer(`${prefix}_is_approximate`, { mode: "boolean" }).default(false),
    [`${prefix}Precision`]: text(`${prefix}_precision`),
    [`${prefix}DisplayLabel`]: text(`${prefix}_display_label`)
  };
}

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentRegionId: integer("parent_region_id"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note")
});

export const periodCategories = sqliteTable("period_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description")
});

export const polities = sqliteTable("polities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  aliases: text("aliases"),
  note: text("note"),
  ...timeColumns("time")
});

export const dynasties = sqliteTable("dynasties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  polityId: integer("polity_id").notNull(),
  name: text("name").notNull(),
  aliases: text("aliases"),
  note: text("note"),
  ...timeColumns("time")
});

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  aliases: text("aliases"),
  note: text("note"),
  ...timeColumns("birth"),
  ...timeColumns("death")
});

export const roleAssignments = sqliteTable("role_assignments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  personId: integer("person_id").notNull(),
  title: text("title").notNull(),
  polityId: integer("polity_id"),
  dynastyId: integer("dynasty_id"),
  note: text("note"),
  isIncumbent: integer("is_incumbent", { mode: "boolean" }).default(false),
  ...timeColumns("time")
});

export const historicalPeriods = sqliteTable("historical_periods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  categoryId: integer("category_id").notNull(),
  polityId: integer("polity_id"),
  name: text("name").notNull(),
  regionLabel: text("region_label"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...timeColumns("time")
});

export const religions = sqliteTable("religions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...timeColumns("time")
});

export const sects = sqliteTable("sects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  religionId: integer("religion_id").notNull(),
  name: text("name").notNull(),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...timeColumns("time")
});
