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

export const polityTransitions = sqliteTable("polity_transitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  predecessorPolityId: integer("predecessor_polity_id").notNull(),
  successorPolityId: integer("successor_polity_id").notNull(),
  transitionType: text("transition_type").notNull(),
  note: text("note"),
  ...timeColumns("time")
});

export const dynastySuccessions = sqliteTable("dynasty_successions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  polityId: integer("polity_id").notNull(),
  predecessorDynastyId: integer("predecessor_dynasty_id").notNull(),
  successorDynastyId: integer("successor_dynasty_id").notNull(),
  note: text("note"),
  ...timeColumns("time")
});

export const regionRelations = sqliteTable("region_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromRegionId: integer("from_region_id").notNull(),
  toRegionId: integer("to_region_id").notNull(),
  relationType: text("relation_type").notNull(),
  note: text("note")
});

export const historicalPeriodRelations = sqliteTable("historical_period_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromPeriodId: integer("from_period_id").notNull(),
  toPeriodId: integer("to_period_id").notNull(),
  relationType: text("relation_type").notNull(),
  note: text("note")
});
