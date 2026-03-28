import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { dynasties, era, historicalPeriods, polities, regions } from "./masters";

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
  predecessorPolityId: integer("predecessor_polity_id")
    .notNull()
    .references(() => polities.id),
  successorPolityId: integer("successor_polity_id")
    .notNull()
    .references(() => polities.id),
  transitionType: text("transition_type")
    .notNull()
    .references(() => polityTransitionTypes.code)
});

export const polityTransitionTypes = sqliteTable("polity_transition_types", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description")
});

export const dynastySuccessions = sqliteTable("dynasty_successions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  polityId: integer("polity_id")
    .notNull()
    .references(() => polities.id),
  predecessorDynastyId: integer("predecessor_dynasty_id")
    .notNull()
    .references(() => dynasties.id),
  successorDynastyId: integer("successor_dynasty_id")
    .notNull()
    .references(() => dynasties.id)
});

export const regionRelations = sqliteTable("region_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromRegionId: integer("from_region_id")
    .notNull()
    .references(() => regions.id),
  toRegionId: integer("to_region_id")
    .notNull()
    .references(() => regions.id),
  relationType: text("relation_type")
    .notNull()
    .references(() => regionRelationTypes.code)
});

export const regionRelationTypes = sqliteTable("region_relation_types", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description")
});

export const historicalPeriodRelationTypes = sqliteTable("historical_period_relation_types", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description")
});

export const historicalPeriodRelations = sqliteTable("historical_period_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromPeriodId: integer("from_period_id")
    .notNull()
    .references(() => historicalPeriods.id),
  toPeriodId: integer("to_period_id")
    .notNull()
    .references(() => historicalPeriods.id),
  relationType: text("relation_type")
    .notNull()
    .references(() => historicalPeriodRelationTypes.code),
  description: text("description"),
  note: text("note")
});
