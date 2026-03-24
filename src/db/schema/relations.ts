import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { era } from "./masters";

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

export const polityTransitions = sqliteTable("polity_transitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  predecessorPolityId: integer("predecessor_polity_id").notNull(),
  successorPolityId: integer("successor_polity_id").notNull(),
  transitionType: text("transition_type").notNull(),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const dynastySuccessions = sqliteTable("dynasty_successions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  polityId: integer("polity_id").notNull(),
  predecessorDynastyId: integer("predecessor_dynasty_id").notNull(),
  successorDynastyId: integer("successor_dynasty_id").notNull(),
  description: text("description"),
  note: text("note"),
  ...rangeTimeColumns()
});

export const regionRelations = sqliteTable("region_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromRegionId: integer("from_region_id").notNull(),
  toRegionId: integer("to_region_id").notNull(),
  relationType: text("relation_type").notNull(),
  description: text("description"),
  note: text("note")
});

export const historicalPeriodRelations = sqliteTable("historical_period_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromPeriodId: integer("from_period_id").notNull(),
  toPeriodId: integer("to_period_id").notNull(),
  relationType: text("relation_type").notNull(),
  description: text("description"),
  note: text("note")
});
