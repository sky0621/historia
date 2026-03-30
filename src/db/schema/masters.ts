import { integer, sqliteTable, text, type AnySQLiteColumn } from "drizzle-orm/sqlite-core";

export const era = sqliteTable("era", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description")
});

function rangeTimeColumns() {
  return {
    fromCalendarEra: text("from_calendar_era").references(() => era.code),
    fromYear: integer("from_year"),
    fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
    toCalendarEra: text("to_calendar_era").references(() => era.code),
    toYear: integer("to_year"),
    toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
  };
}

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  parentRegionId: integer("parent_region_id").references((): AnySQLiteColumn => regions.id),
  reading: text("reading"),
  description: text("description"),
  note: text("note")
});

export const periodCategories = sqliteTable("period_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  description: text("description")
});

export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading")
});

export const polities = sqliteTable("polities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  fromCalendarEra: text("from_calendar_era").references(() => era.code),
  fromYear: integer("from_year"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: text("to_calendar_era").references(() => era.code),
  toYear: integer("to_year"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const dynasties = sqliteTable("dynasties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const persons = sqliteTable("persons", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  fromCalendarEra: text("from_calendar_era").references(() => era.code),
  fromYear: integer("from_year"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: text("to_calendar_era").references(() => era.code),
  toYear: integer("to_year"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const role = sqliteTable("role", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  polityId: integer("polity_id").references(() => polities.id),
  dynastyId: integer("dynasty_id").references(() => dynasties.id),
  isIncumbent: integer("is_incumbent", { mode: "boolean" }).default(false),
  ...rangeTimeColumns()
});

export const historicalPeriods = sqliteTable("historical_periods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const religions = sqliteTable("religions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const sects = sqliteTable("sects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  religionId: integer("religion_id").references(() => religions.id),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});
