#!/bin/sh

set -eu

if ! command -v sqlite3def >/dev/null 2>&1; then
  echo "sqlite3def is required. Install it first, e.g. on macOS: brew install sqldef/sqldef/sqlite3def" >&2
  exit 1
fi

if ! command -v sqlite3 >/dev/null 2>&1; then
  echo "sqlite3 is required to run schema normalization." >&2
  exit 1
fi

MODE="${1:-apply}"
DATABASE_URL="${DATABASE_URL:-./.data/historia.db}"
SCHEMA_FILE="src/db/schema.sql"

node ./scripts/generate-schema-sql.mjs

mkdir -p "$(dirname "$DATABASE_URL")"

normalize_legacy_import_runs() {
  if [ ! -f "$DATABASE_URL" ]; then
    return
  fi

  CURRENT_SQL="$(sqlite3 "$DATABASE_URL" "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'import_runs';")"

  if [ -z "$CURRENT_SQL" ]; then
    return
  fi

  if printf '%s' "$CURRENT_SQL" | grep -Eq '(^|[[:space:](,])action[[:space:]]+TEXT'; then
    sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE import_runs RENAME TO __legacy_import_runs;
CREATE TABLE `import_runs` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `source_format` text NOT NULL,
  `target_type` text NOT NULL,
  `action` text NOT NULL,
  `file_name` text,
  `status` text NOT NULL,
  `summary_json` text NOT NULL
);
INSERT INTO `import_runs` (`id`, `source_format`, `target_type`, `action`, `file_name`, `status`, `summary_json`)
SELECT `id`, `source_format`, `target_type`, `action`, `file_name`, `status`, `summary_json`
FROM `__legacy_import_runs`;
DROP TABLE `__legacy_import_runs`;
COMMIT;
PRAGMA foreign_keys = ON;
SQL
  fi
}

normalize_legacy_import_runs

ensure_event_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `event_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `event_types` (`code`, `label`, `description`)
VALUES
  ('general', '一般', '通常の出来事'),
  ('war', '戦争', '国家や勢力間の戦争'),
  ('rebellion', '反乱', '支配体制への反乱'),
  ('civil_war', '内戦', '同一国家・勢力内部の武力衝突')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_event_relation_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `event_relation_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `event_relation_types` (`code`, `label`, `description`)
VALUES
  ('before', '先行', '他の出来事より前に起きた関係'),
  ('after', '後続', '他の出来事より後に起きた関係'),
  ('cause', '原因', '他の出来事の原因となる関係'),
  ('related', '関連', '前後や因果に限定しない関連')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_event_conflict_participant_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `event_conflict_participant_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `event_conflict_participant_types` (`code`, `label`, `description`)
VALUES
  ('person', '人物', '人物が参加主体である場合'),
  ('polity', '国家', '国家・政体が参加主体である場合'),
  ('religion', '宗教', '宗教が参加主体である場合'),
  ('sect', '宗派', '宗派が参加主体である場合')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_event_conflict_participant_roles_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `event_conflict_participant_roles` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `event_conflict_participant_roles` (`code`, `label`, `description`)
VALUES
  ('attacker', '攻撃側', '攻撃側として参加した役割'),
  ('defender', '防御側', '防御側として参加した役割'),
  ('leader', '指導者', '参加主体の指導者・中心人物としての役割'),
  ('ally', '同盟者', '同盟・支援主体としての役割'),
  ('other', 'その他', '上記に当てはまらない役割')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_event_conflict_sides_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `event_conflict_sides` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `event_conflict_sides` (`code`, `label`, `description`)
VALUES
  ('winner', '勝者側', '結果として勝利した側'),
  ('loser', '敗者側', '結果として敗北した側')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_historical_period_relation_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `historical_period_relation_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `historical_period_relation_types` (`code`, `label`, `description`)
VALUES
  ('precedes', '先行', '他の時代区分に先行する関係'),
  ('succeeds', '後続', '他の時代区分に後続する関係'),
  ('overlaps', '重複', '他の時代区分と期間が重なる関係'),
  ('includes', '包含', '他の時代区分を含む関係'),
  ('included_in', '被包含', '他の時代区分に含まれる関係')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_region_relation_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `region_relation_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `region_relation_types` (`code`, `label`, `description`)
VALUES
  ('adjacent', '隣接', '地理的に隣接している関係'),
  ('cultural_area', '文化圏', '同じ文化圏として結び付く関係'),
  ('trade_zone', '交易圏', '同じ交易圏として結び付く関係'),
  ('influences', '影響', '一方の地域が他方へ影響を与える関係'),
  ('related', '関連', '上記に限定しない一般的な関連'),
  ('equivalent', '対応', '別名や別区分だが概ね対応する関係')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_polity_transition_types_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `polity_transition_types` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `polity_transition_types` (`code`, `label`, `description`)
VALUES
  ('renamed', '改称', '国家名称の変更による変遷'),
  ('succeeded', '後継', '前身国家の後継国家となる変遷'),
  ('merged', '統合', '複数国家の統合による変遷'),
  ('split', '分裂', '分裂によって生じた変遷'),
  ('annexed', '併合', '他国家への併合による変遷'),
  ('absorbed', '吸収', '他国家に吸収される変遷'),
  ('restored', '復興', '再興・復活による変遷'),
  ('reorganized', '再編', '制度や構造の再編による変遷'),
  ('other', 'その他', '上記に当てはまらない変遷')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_era_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `era` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `era` (`code`, `label`, `description`)
VALUES
  ('BCE', '紀元前', 'Before Common Era'),
  ('CE', '西暦', 'Common Era')
ON CONFLICT(`code`) DO UPDATE SET
  `label` = excluded.`label`,
  `description` = excluded.`description`;
SQL
}

ensure_era_seed_data
ensure_event_types_seed_data
ensure_event_relation_types_seed_data
ensure_event_conflict_participant_types_seed_data
ensure_event_conflict_participant_roles_seed_data
ensure_event_conflict_sides_seed_data
ensure_historical_period_relation_types_seed_data
ensure_region_relation_types_seed_data
ensure_polity_transition_types_seed_data

case "$MODE" in
  dry-run)
    exec sqlite3def --dry-run --enable-drop-table "$DATABASE_URL" --file "$SCHEMA_FILE"
    ;;
  apply)
    exec sqlite3def --enable-drop-table "$DATABASE_URL" --file "$SCHEMA_FILE"
    ;;
  *)
    echo "unknown mode: $MODE" >&2
    echo "usage: ./scripts/sqlite3def.sh [dry-run|apply]" >&2
    exit 1
    ;;
esac
