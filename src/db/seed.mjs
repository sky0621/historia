/* global process, console */

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "./.data/historia.db";
const resolvedDatabasePath = path.resolve(process.cwd(), databaseUrl);

fs.mkdirSync(path.dirname(resolvedDatabasePath), { recursive: true });

const sqlite = new Database(resolvedDatabasePath);
sqlite.pragma("foreign_keys = OFF");

function clearTables() {
  const tables = [
    "change_histories",
    "citations",
    "sources",
    "historical_period_relations",
    "region_relations",
    "dynasty_successions",
    "polity_transitions",
    "conflict_outcome_participants",
    "conflict_outcomes",
    "conflict_participants",
    "event_relations",
    "role_assignment_dynasty_links",
    "role_assignment_polity_links",
    "role_assignment_person_links",
    "sect_parent_links",
    "sect_religion_links",
    "historical_period_polity_links",
    "historical_period_category_links",
    "dynasty_polity_links",
    "region_parent_links",
    "event_region_links",
    "event_tag_links",
    "event_sect_links",
    "event_religion_links",
    "event_period_links",
    "event_dynasty_links",
    "event_polity_links",
    "event_person_links",
    "events",
    "sect_founder_links",
    "religion_founder_links",
    "person_period_links",
    "person_sect_links",
    "person_religion_links",
    "sect_region_links",
    "religion_region_links",
    "period_region_links",
    "dynasty_region_links",
    "polity_region_links",
    "person_region_links",
    "role_assignments",
    "sects",
    "religions",
    "historical_periods",
    "persons",
    "dynasties",
    "polities",
    "period_categories",
    "tags",
    "regions",
    "import_runs"
  ];

  for (const table of tables) {
    sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  sqlite.prepare("DELETE FROM sqlite_sequence").run();
}

clearTables();
console.log(`Cleared historia database: ${resolvedDatabasePath}`);
