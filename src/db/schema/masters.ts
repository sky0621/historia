import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

function rangeTimeColumns() {
  return {
    fromCalendarEra: text("from_calendar_era"),
    fromYear: integer("from_year"),
    fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
    toCalendarEra: text("to_calendar_era"),
    toYear: integer("to_year"),
    toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
  };
}

export const regions = sqliteTable("regions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  aliases: text("aliases"),
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
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  fromCalendarEra: integer("from_calendar_era", { mode: "boolean" }).default(false),
  fromYear: integer("from_year"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: integer("to_calendar_era", { mode: "boolean" }).default(false),
  toYear: integer("to_year"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const dynasties = sqliteTable("dynasties", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  aliases: text("aliases"),
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
  fromCalendarEra: integer("from_calendar_era", { mode: "boolean" }).default(false),
  fromYear: integer("from_year"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: integer("to_calendar_era", { mode: "boolean" }).default(false),
  toYear: integer("to_year"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const role = sqliteTable("role", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  reading: text("reading"),
  description: text("description"),
  note: text("note"),
  isIncumbent: integer("is_incumbent", { mode: "boolean" }).default(false),
  ...rangeTimeColumns()
});

export const historicalPeriods = sqliteTable("historical_periods", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  regionLabel: text("region_label"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const religions = sqliteTable("religions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const sects = sqliteTable("sects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  reading: text("reading"),
  aliases: text("aliases"),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});
