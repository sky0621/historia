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
    "event_conflict_outcome_participants",
    "event_conflict_outcomes",
    "event_conflict_participants",
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
    "event_types",
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
    "role",
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
  const existingTables = new Set(
    sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((row) => row.name)
  );

  for (const table of tables) {
    if (!existingTables.has(table)) {
      continue;
    }

    sqlite.prepare(`DELETE FROM ${table}`).run();
  }

  if (existingTables.has("sqlite_sequence")) {
    sqlite.prepare("DELETE FROM sqlite_sequence").run();
  }
}

clearTables();

sqlite
  .prepare(
    `INSERT INTO event_types (code, label, description) VALUES
      ('general', '一般', '通常の出来事'),
      ('war', '戦争', '国家や勢力間の戦争'),
      ('rebellion', '反乱', '支配体制への反乱'),
      ('civil_war', '内戦', '同一国家・勢力内部の武力衝突'),
      ('treaty', '条約', '条約締結、講和、同盟などの外交的決着'),
      ('battle', '戦闘', '戦争を構成する個別の戦闘'),
      ('coup', 'クーデター', '武力や政治的圧力による政権奪取'),
      ('revolution', '革命', '既存体制を大きく転換する政治・社会変動'),
      ('founding', '成立', '国家、組織、制度などの創設・成立'),
      ('collapse', '崩壊', '国家、政権、体制などの滅亡・崩壊'),
      ('succession', '継承', '即位、相続、王朝交代などの継承'),
      ('reform', '改革', '制度、政治、宗教などの改革'),
      ('law', '法令', '法令の制定、公布、改廃'),
      ('migration', '移動', '移住、遷都、民族移動など'),
      ('religious_event', '宗教', '開宗、改宗、宗教会議、宗教弾圧など'),
      ('cultural_event', '文化', '建立、著作完成、文化事業など'),
      ('disaster', '災害', '地震、疫病、飢饉などの災害'),
      ('discovery', '発見', '発見、探検、到達など'),
      ('diplomatic_event', '外交', '使節派遣、国交樹立、朝貢開始など'),
      ('economic_event', '経済', '貨幣、税制、交易制度などの経済的変化')`
  )
  .run();

console.log(`Cleared historia database: ${resolvedDatabasePath}`);
