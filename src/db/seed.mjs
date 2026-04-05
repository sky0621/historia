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
    "dynasty_successions",
    "polity_transitions",
    "event_conflict_outcome_participants",
    "event_conflict_outcomes",
    "event_conflict_participants",
    "event_relations",
    "event_conflict_sides",
    "event_conflict_participant_roles",
    "event_conflict_participant_types",
    "event_relation_types",
    "historical_period_relation_types",
    "polity_transition_types",
    "change_history_actions",
    "person_role_links",
    "historical_period_polity_links",
    "historical_period_category_links",
    "dynasty_polity_links",
    "event_region_links",
    "event_tag_links",
    "event_sect_links",
    "event_religion_links",
    "event_dynasty_links",
    "event_polity_links",
    "event_person_links",
    "events",
    "event_types",
    "era",
    "sect_founder_links",
    "religion_founder_links",
    "person_sect_links",
    "person_religion_links",
    "historical_period_region_links",
    "dynasty_region_links",
    "polity_region_links",
    "person_region_links",
    "roles",
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
    `INSERT INTO era (code, label, description) VALUES
      ('BCE', '紀元前', 'Before Common Era'),
      ('CE', '西暦', 'Common Era')`
  )
  .run();

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

sqlite
  .prepare(
    `INSERT INTO event_relation_types (code, label, description) VALUES
      ('before', '先行', '他の出来事より前に起きた関係'),
      ('after', '後続', '他の出来事より後に起きた関係'),
      ('cause', '原因', '他の出来事の原因となる関係'),
      ('related', '関連', '前後や因果に限定しない関連')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO event_conflict_participant_types (code, label, description) VALUES
      ('person', '人物', '人物が参加主体である場合'),
      ('polity', '国家', '国家・政体が参加主体である場合'),
      ('religion', '宗教', '宗教が参加主体である場合'),
      ('sect', '宗派', '宗派が参加主体である場合')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO event_conflict_participant_roles (code, label, description) VALUES
      ('attacker', '攻撃側', '攻撃側として参加した役割'),
      ('defender', '防御側', '防御側として参加した役割'),
      ('leader', '指導者', '参加主体の指導者・中心人物としての役割'),
      ('ally', '同盟者', '同盟・支援主体としての役割'),
      ('other', 'その他', '上記に当てはまらない役割')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO event_conflict_sides (code, label, description) VALUES
      ('winner', '勝者側', '結果として勝利した側'),
      ('loser', '敗者側', '結果として敗北した側')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO historical_period_relation_types (code, label, description) VALUES
      ('precedes', '先行', '他の時代区分に先行する関係'),
      ('succeeds', '後続', '他の時代区分に後続する関係'),
      ('overlaps', '重複', '他の時代区分と期間が重なる関係'),
      ('includes', '包含', '他の時代区分を含む関係'),
      ('included_in', '被包含', '他の時代区分に含まれる関係')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO polity_transition_types (code, label, description) VALUES
      ('renamed', '改称', '国家名称の変更による変遷'),
      ('succeeded', '後継', '前身国家の後継国家となる変遷'),
      ('merged', '統合', '複数国家の統合による変遷'),
      ('split', '分裂', '分裂によって生じた変遷'),
      ('annexed', '併合', '他国家への併合による変遷'),
      ('absorbed', '吸収', '他国家に吸収される変遷'),
      ('restored', '復興', '再興・復活による変遷'),
      ('reorganized', '再編', '制度や構造の再編による変遷'),
      ('other', 'その他', '上記に当てはまらない変遷')`
  )
  .run();

sqlite
  .prepare(
    `INSERT INTO change_history_actions (code, label, description) VALUES
      ('create', '作成', '新規作成による変更履歴'),
      ('update', '更新', '更新による変更履歴'),
      ('delete', '削除', '削除による変更履歴'),
      ('import', 'インポート', 'インポート処理による変更履歴')`
  )
  .run();

console.log(`Cleared historia database: ${resolvedDatabasePath}`);
