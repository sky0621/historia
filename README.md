# historia

ローカル利用前提の歴史年表システムです。`Sprint 6` まで実装済みで、主要ドメインの CRUD、戦争・乱、グラフ、タイムライン、出典、変更履歴、JSON import/export を含みます。

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- sqldef (`sqlite3def`)
- SQLite
- Zod
- react-hook-form

## Setup
1. `mise install`
2. `pnpm install`
3. `cp .env.example .env`
4. `sqlite3def` をインストールする
5. `pnpm db:migrate`
6. `pnpm db:seed`
7. `pnpm dev`

`DATABASE_URL` の既定値は `./.data/historia.db` です。

`node` と `pnpm` は [mise.toml](/Users/sky0621/work/github.com/sky0621/historia-clean/mise.toml) で管理しています。

macOS では `brew install sqldef/sqldef/sqlite3def` で入れられます。

## Schema Management
- アプリの ORM 定義は `src/db/schema/*.ts` にあります。
- migration の正本は [src/db/schema.sql](/Users/sky0621/work/github.com/sky0621/historia/src/db/schema.sql) です。
- 変更前の確認は `pnpm db:dry-run`、適用は `pnpm db:migrate` を使います。

## Seed Data
- `pnpm db:seed` は対象テーブルを空にします。
- 初期サンプルデータの投入は行いません。

## Data Operations
- `/manage/data` で JSON export/import と `Event` / `Person` CSV export を使えます。
- `/manage/data` で `Event CSV import` と `Person CSV import` を preview/import できます。
- `/sources` で出典を管理できます。
- `Event`、`Person`、`Polity`、`HistoricalPeriod` の詳細では、出典と変更履歴を確認できます。

## CSV Import
- 対象は `Event` と `Person` の 2 種です。
- import は `preview` 必須です。`error` または `duplicate-candidate` を含む CSV は import できません。
- 参照列は名前の完全一致で解決します。
  - `Event`: `people / polities / dynasties / periods / religions / sects / regions`
  - `Person`: `regions / religions / sects / periods`
- `Event` の複数値列は `|` 区切りです。
  - 例: `regions=ヨーロッパ|エルサレム`
- `Person.aliases` は `,` 区切りです。
  - 例: `aliases=最澄,伝教大師`
- `Person CSV v1` では役職履歴は対象外です。

### Event CSV v1
- 必須列:
  - `title`
  - `event_type`
- 任意列:
  - `description`
  - `from_label`
  - `from_calendar_era`
  - `from_year`
  - `from_is_approximate`
  - `to_label`
  - `to_calendar_era`
  - `to_year`
  - `to_is_approximate`
  - `tags`
  - `people`
  - `polities`
  - `dynasties`
  - `periods`
  - `religions`
  - `sects`
  - `regions`

### Person CSV v1
- 必須列:
  - `name`
- 任意列:
  - `reading`
  - `aliases`
  - `note`
  - `from_label`
  - `from_calendar_era`
  - `from_year`
  - `from_is_approximate`
  - `to_label`
  - `to_calendar_era`
  - `to_year`
  - `to_is_approximate`
  - `regions`
  - `religions`
  - `sects`
  - `periods`

### Sample Files
- `Event CSV`: [examples/csv/events-import-sample.csv](/Users/sky0621/work/github.com/sky0621/historia/examples/csv/events-import-sample.csv)
- `Person CSV`: [examples/csv/people-import-sample.csv](/Users/sky0621/work/github.com/sky0621/historia/examples/csv/people-import-sample.csv)
