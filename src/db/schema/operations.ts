import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sources = sqliteTable("sources", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  author: text("author"),
  publisher: text("publisher"),
  publishedAtLabel: text("published_at_label"),
  url: text("url"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export const citations = sqliteTable("citations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sourceId: integer("source_id").notNull(),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  locator: text("locator"),
  quote: text("quote"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" }).notNull()
});

export const changeHistories = sqliteTable("change_histories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  targetType: text("target_type").notNull(),
  targetId: integer("target_id").notNull(),
  action: text("action").notNull(),
  snapshotJson: text("snapshot_json").notNull(),
  changedAt: integer("changed_at", { mode: "timestamp_ms" }).notNull()
});
