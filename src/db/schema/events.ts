import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(),
  description: text("description"),
  timeCalendarEra: text("time_calendar_era"),
  timeStartYear: integer("time_start_year"),
  timeEndYear: integer("time_end_year"),
  timeIsApproximate: integer("time_is_approximate", { mode: "boolean" }).default(false),
  timePrecision: text("time_precision"),
  timeDisplayLabel: text("time_display_label"),
  startCalendarEra: text("start_calendar_era"),
  startYear: integer("start_year"),
  endCalendarEra: text("end_calendar_era"),
  endYear: integer("end_year"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export const eventRelations = sqliteTable("event_relations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fromEventId: integer("from_event_id").notNull(),
  toEventId: integer("to_event_id").notNull(),
  relationType: text("relation_type").notNull()
});

export const conflictParticipants = sqliteTable("conflict_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  participantType: text("participant_type").notNull(),
  participantId: integer("participant_id").notNull(),
  role: text("role").notNull(),
  note: text("note")
});

export const conflictOutcomes = sqliteTable("conflict_outcomes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  winnerSummary: text("winner_summary"),
  loserSummary: text("loser_summary"),
  settlementSummary: text("settlement_summary"),
  note: text("note")
});

export const conflictOutcomeParticipants = sqliteTable("conflict_outcome_participants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  eventId: integer("event_id").notNull(),
  side: text("side").notNull(),
  participantType: text("participant_type").notNull(),
  participantId: integer("participant_id").notNull()
});
