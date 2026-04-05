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

normalize_legacy_religion_sect_links() {
  if [ ! -f "$DATABASE_URL" ]; then
    return
  fi

  HAS_SECTS_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'sects';")"
  HAS_LINK_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'religion_sect_links';")"

  if [ "$HAS_SECTS_TABLE" != "1" ] || [ "$HAS_LINK_TABLE" != "1" ]; then
    return
  fi

  HAS_RELIGION_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('sects') WHERE name = 'religion_id';")"

  if [ "$HAS_RELIGION_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE sects ADD COLUMN religion_id integer REFERENCES religions(id);"
  fi

  sqlite3 "$DATABASE_URL" <<'SQL'
UPDATE `sects`
SET `religion_id` = (
  SELECT `religion_id`
  FROM `religion_sect_links`
  WHERE `religion_sect_links`.`sect_id` = `sects`.`id`
  LIMIT 1
)
WHERE `religion_id` IS NULL;
DROP TABLE `religion_sect_links`;
SQL
}

normalize_legacy_religion_sect_links

normalize_legacy_roles_table_name() {
  if [ ! -f "$DATABASE_URL" ]; then
    return
  fi

  HAS_OLD_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'role';")"
  HAS_NEW_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'roles';")"

  if [ "$HAS_OLD_TABLE" = "1" ] && [ "$HAS_NEW_TABLE" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE role RENAME TO roles;"
  fi
}

normalize_legacy_roles_table_name

normalize_legacy_person_role_links() {
  if [ ! -f "$DATABASE_URL" ]; then
    return
  fi

  HAS_OLD_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'role_person_links';")"
  HAS_NEW_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'person_role_links';")"

  if [ "$HAS_OLD_TABLE" != "1" ] || [ "$HAS_NEW_TABLE" = "1" ]; then
    :
  else
    sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
CREATE TABLE `person_role_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) ON DELETE CASCADE,
  `role_id` integer NOT NULL REFERENCES `roles`(`id`),
  `description` text,
  `note` text,
  `from_calendar_era` text REFERENCES `era`(`code`),
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text REFERENCES `era`(`code`),
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);
INSERT INTO `person_role_links` (`person_id`, `role_id`)
SELECT `person_id`, `role_id`
FROM `role_person_links`;
DROP TABLE `role_person_links`;
CREATE INDEX `idx_person_role_links_person_id` ON `person_role_links` (`person_id`);
CREATE INDEX `idx_person_role_links_role_id` ON `person_role_links` (`role_id`);
COMMIT;
PRAGMA foreign_keys = ON;
SQL
  fi

  CURRENT_SQL="$(sqlite3 "$DATABASE_URL" "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'person_role_links';")"
  HAS_PERSON_DELETE_CASCADE="0"
  if printf '%s' "$CURRENT_SQL" | grep -Eq 'person_id[^,]*REFERENCES[[:space:]]+`?persons`?\(`?id`?\)[[:space:]]+ON[[:space:]]+DELETE[[:space:]]+CASCADE'; then
    HAS_PERSON_DELETE_CASCADE="1"
  fi

  if [ "$HAS_PERSON_DELETE_CASCADE" = "0" ] && [ -n "$CURRENT_SQL" ]; then
    sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE `person_role_links` RENAME TO `__legacy_person_role_links`;
CREATE TABLE `person_role_links` (
  `person_id` integer NOT NULL REFERENCES `persons`(`id`) ON DELETE CASCADE,
  `role_id` integer NOT NULL REFERENCES `roles`(`id`),
  `description` text,
  `note` text,
  `from_calendar_era` text REFERENCES `era`(`code`),
  `from_year` integer,
  `from_is_approximate` integer DEFAULT false,
  `to_calendar_era` text REFERENCES `era`(`code`),
  `to_year` integer,
  `to_is_approximate` integer DEFAULT false
);
INSERT INTO `person_role_links` (
  `person_id`,
  `role_id`,
  `description`,
  `note`,
  `from_calendar_era`,
  `from_year`,
  `from_is_approximate`,
  `to_calendar_era`,
  `to_year`,
  `to_is_approximate`
)
SELECT
  `person_id`,
  `role_id`,
  `description`,
  `note`,
  `from_calendar_era`,
  `from_year`,
  COALESCE(`from_is_approximate`, false),
  `to_calendar_era`,
  `to_year`,
  COALESCE(`to_is_approximate`, false)
FROM `__legacy_person_role_links`;
DROP TABLE `__legacy_person_role_links`;
CREATE INDEX `idx_person_role_links_person_id` ON `person_role_links` (`person_id`);
CREATE INDEX `idx_person_role_links_role_id` ON `person_role_links` (`role_id`);
COMMIT;
PRAGMA foreign_keys = ON;
SQL
  fi

  HAS_DESCRIPTION_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'description';")"
  HAS_NOTE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'note';")"
  HAS_FROM_CALENDAR_ERA_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'from_calendar_era';")"
  HAS_FROM_YEAR_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'from_year';")"
  HAS_FROM_IS_APPROXIMATE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'from_is_approximate';")"
  HAS_TO_CALENDAR_ERA_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'to_calendar_era';")"
  HAS_TO_YEAR_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'to_year';")"
  HAS_TO_IS_APPROXIMATE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('person_role_links') WHERE name = 'to_is_approximate';")"
  HAS_ROLE_DESCRIPTION_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'description';")"
  HAS_ROLE_NOTE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'note';")"
  HAS_ROLE_FROM_CALENDAR_ERA_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'from_calendar_era';")"
  HAS_ROLE_FROM_YEAR_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'from_year';")"
  HAS_ROLE_FROM_IS_APPROXIMATE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'from_is_approximate';")"
  HAS_ROLE_TO_CALENDAR_ERA_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'to_calendar_era';")"
  HAS_ROLE_TO_YEAR_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'to_year';")"
  HAS_ROLE_TO_IS_APPROXIMATE_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'to_is_approximate';")"

  if [ "$HAS_DESCRIPTION_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN description text;"
    if [ "$HAS_ROLE_DESCRIPTION_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET description = (SELECT description FROM roles WHERE roles.id = person_role_links.role_id) WHERE description IS NULL;"
    fi
  fi

  if [ "$HAS_NOTE_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN note text;"
    if [ "$HAS_ROLE_NOTE_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET note = (SELECT note FROM roles WHERE roles.id = person_role_links.role_id) WHERE note IS NULL;"
    fi
  fi

  if [ "$HAS_FROM_CALENDAR_ERA_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN from_calendar_era text REFERENCES era(code);"
    if [ "$HAS_ROLE_FROM_CALENDAR_ERA_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET from_calendar_era = (SELECT from_calendar_era FROM roles WHERE roles.id = person_role_links.role_id) WHERE from_calendar_era IS NULL;"
    fi
  fi

  if [ "$HAS_FROM_YEAR_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN from_year integer;"
    if [ "$HAS_ROLE_FROM_YEAR_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET from_year = (SELECT from_year FROM roles WHERE roles.id = person_role_links.role_id) WHERE from_year IS NULL;"
    fi
  fi

  if [ "$HAS_FROM_IS_APPROXIMATE_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN from_is_approximate integer DEFAULT false;"
    if [ "$HAS_ROLE_FROM_IS_APPROXIMATE_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET from_is_approximate = COALESCE((SELECT from_is_approximate FROM roles WHERE roles.id = person_role_links.role_id), false) WHERE from_is_approximate IS NULL;"
    fi
  fi

  if [ "$HAS_TO_CALENDAR_ERA_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN to_calendar_era text REFERENCES era(code);"
    if [ "$HAS_ROLE_TO_CALENDAR_ERA_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET to_calendar_era = (SELECT to_calendar_era FROM roles WHERE roles.id = person_role_links.role_id) WHERE to_calendar_era IS NULL;"
    fi
  fi

  if [ "$HAS_TO_YEAR_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN to_year integer;"
    if [ "$HAS_ROLE_TO_YEAR_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET to_year = (SELECT to_year FROM roles WHERE roles.id = person_role_links.role_id) WHERE to_year IS NULL;"
    fi
  fi

  if [ "$HAS_TO_IS_APPROXIMATE_COLUMN" = "0" ]; then
    sqlite3 "$DATABASE_URL" "ALTER TABLE person_role_links ADD COLUMN to_is_approximate integer DEFAULT false;"
    if [ "$HAS_ROLE_TO_IS_APPROXIMATE_COLUMN" = "1" ]; then
      sqlite3 "$DATABASE_URL" "UPDATE person_role_links SET to_is_approximate = COALESCE((SELECT to_is_approximate FROM roles WHERE roles.id = person_role_links.role_id), false) WHERE to_is_approximate IS NULL;"
    fi
  fi
}

normalize_legacy_person_role_links

normalize_legacy_role_links() {
  if [ ! -f "$DATABASE_URL" ]; then
    return
  fi

  HAS_ROLE_TABLE="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'roles';")"

  if [ "$HAS_ROLE_TABLE" != "1" ]; then
    return
  fi

  HAS_ROLE_POLITY_LINKS="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'role_polity_links';")"
  HAS_ROLE_DYNASTY_LINKS="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'role_dynasty_links';")"
  HAS_POLITY_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'polity_id';")"
  HAS_DYNASTY_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'dynasty_id';")"
  HAS_IS_INCUMBENT_COLUMN="$(sqlite3 "$DATABASE_URL" "SELECT COUNT(*) FROM pragma_table_info('roles') WHERE name = 'is_incumbent';")"

  if [ "$HAS_ROLE_POLITY_LINKS" = "1" ] || [ "$HAS_ROLE_DYNASTY_LINKS" = "1" ] || [ "$HAS_DYNASTY_COLUMN" = "1" ] || [ "$HAS_IS_INCUMBENT_COLUMN" = "1" ]; then
    if [ "$HAS_POLITY_COLUMN" = "1" ]; then
      if [ "$HAS_ROLE_POLITY_LINKS" = "1" ]; then
        sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE `roles` RENAME TO `__legacy_role`;
CREATE TABLE `roles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text,
  `description` text,
  `note` text,
  `polity_id` integer REFERENCES `polities`(`id`)
);
INSERT INTO `roles` (
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`,
  `polity_id`
)
SELECT
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`,
  `polity_id`
FROM `__legacy_role`;
UPDATE `roles`
SET `polity_id` = (
  SELECT `polity_id`
  FROM `role_polity_links`
  WHERE `role_polity_links`.`role_id` = `roles`.`id`
  LIMIT 1
)
WHERE `polity_id` IS NULL;
DROP TABLE `__legacy_role`;
DROP TABLE IF EXISTS `role_polity_links`;
DROP TABLE IF EXISTS `role_dynasty_links`;
COMMIT;
PRAGMA foreign_keys = ON;
SQL
      else
        sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE `roles` RENAME TO `__legacy_role`;
CREATE TABLE `roles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text,
  `description` text,
  `note` text,
  `polity_id` integer REFERENCES `polities`(`id`)
);
INSERT INTO `roles` (
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`,
  `polity_id`
)
SELECT
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`,
  `polity_id`
FROM `__legacy_role`;
DROP TABLE `__legacy_role`;
DROP TABLE IF EXISTS `role_polity_links`;
DROP TABLE IF EXISTS `role_dynasty_links`;
COMMIT;
PRAGMA foreign_keys = ON;
SQL
      fi
    else
      if [ "$HAS_ROLE_POLITY_LINKS" = "1" ]; then
        sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE `roles` RENAME TO `__legacy_role`;
CREATE TABLE `roles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text,
  `description` text,
  `note` text,
  `polity_id` integer REFERENCES `polities`(`id`)
);
INSERT INTO `roles` (
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`
)
SELECT
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`
FROM `__legacy_role`;
UPDATE `roles`
SET `polity_id` = (
  SELECT `polity_id`
  FROM `role_polity_links`
  WHERE `role_polity_links`.`role_id` = `roles`.`id`
  LIMIT 1
)
WHERE `polity_id` IS NULL;
DROP TABLE `__legacy_role`;
DROP TABLE IF EXISTS `role_polity_links`;
DROP TABLE IF EXISTS `role_dynasty_links`;
COMMIT;
PRAGMA foreign_keys = ON;
SQL
      else
        sqlite3 "$DATABASE_URL" <<'SQL'
PRAGMA foreign_keys = OFF;
BEGIN TRANSACTION;
ALTER TABLE `roles` RENAME TO `__legacy_role`;
CREATE TABLE `roles` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `title` text NOT NULL,
  `reading` text,
  `description` text,
  `note` text,
  `polity_id` integer REFERENCES `polities`(`id`)
);
INSERT INTO `roles` (
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`
)
SELECT
  `id`,
  `title`,
  `reading`,
  `description`,
  `note`
FROM `__legacy_role`;
DROP TABLE `__legacy_role`;
DROP TABLE IF EXISTS `role_polity_links`;
DROP TABLE IF EXISTS `role_dynasty_links`;
COMMIT;
PRAGMA foreign_keys = ON;
SQL
      fi
    fi
  fi
}

normalize_legacy_role_links

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

ensure_change_history_actions_seed_data() {
  sqlite3 "$DATABASE_URL" <<'SQL'
CREATE TABLE IF NOT EXISTS `change_history_actions` (
  `code` text PRIMARY KEY NOT NULL,
  `label` text NOT NULL,
  `description` text
);
INSERT INTO `change_history_actions` (`code`, `label`, `description`)
VALUES
  ('create', '作成', '新規作成による変更履歴'),
  ('update', '更新', '更新による変更履歴'),
  ('delete', '削除', '削除による変更履歴'),
  ('import', 'インポート', 'インポート処理による変更履歴')
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
ensure_polity_transition_types_seed_data
ensure_change_history_actions_seed_data

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
