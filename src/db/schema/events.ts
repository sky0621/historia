import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { era } from "./masters";

export const eventTypes = sqliteTable("event_types", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  description: text("description")
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  eventType: text("event_type")
    .notNull()
    .references(() => eventTypes.code),
  description: text("description"),
  fromCalendarEra: text("from_calendar_era").references(() => era.code),
  fromYear: integer("from_year"),
  fromMonth: integer("from_month"),
  fromIsApproximate: integer("from_is_approximate", { mode: "boolean" }).default(false),
  toCalendarEra: text("to_calendar_era").references(() => era.code),
  toYear: integer("to_year"),
  toMonth: integer("to_month"),
  toIsApproximate: integer("to_is_approximate", { mode: "boolean" }).default(false)
});

export const eventRelations = sqliteTable("event_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromEventId: integer("from_event_id")
    .notNull()
    .references(() => events.id),
  toEventId: integer("to_event_id")
    .notNull()
    .references(() => events.id),
  relationType: text("relation_type").notNull()
});

export const eventConflictParticipants = sqliteTable("event_conflict_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  participantType: text("participant_type").notNull(),
  participantId: integer("participant_id").notNull(),
  role: text("role").notNull(),
  description: text("description"),
  note: text("note")
});

export const eventConflictOutcomes = sqliteTable("event_conflict_outcomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  winnerSummary: text("winner_summary"),
  loserSummary: text("loser_summary"),
  resolutionSummary: text("resolution_summary"),
  note: text("note")
});

export const eventConflictOutcomeParticipants = sqliteTable("event_conflict_outcome_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id),
  side: text("side").notNull(),
  participantType: text("participant_type").notNull(),
  participantId: integer("participant_id").notNull()
});
