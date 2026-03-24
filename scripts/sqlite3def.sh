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
  `summary_json` text NOT NULL,
  `created_at` integer NOT NULL
);
INSERT INTO `import_runs` (`id`, `source_format`, `target_type`, `action`, `file_name`, `status`, `summary_json`, `created_at`)
SELECT `id`, `source_format`, `target_type`, `action`, `file_name`, `status`, `summary_json`, `created_at`
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

ensure_event_types_seed_data

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
