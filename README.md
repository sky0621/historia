# historia

ローカル利用前提の歴史年表システムです。`Sprint 6` まで実装済みで、主要ドメインの CRUD、戦争・乱、グラフ、タイムライン、出典、変更履歴、JSON import/export を含みます。

## Stack
- Next.js 15
- TypeScript
- Tailwind CSS 4
- Drizzle ORM
- SQLite
- Zod
- react-hook-form

## Setup
1. `pnpm install`
2. `cp .env.example .env`
3. `pnpm db:generate`
4. `pnpm db:migrate`
5. `pnpm db:seed`
6. `pnpm dev`

`DATABASE_URL` の既定値は `./.data/historia.db` です。

## Seed Data
- `pnpm db:seed` で、地域、国家、王朝、人物、時代区分、宗教、宗派、イベント、戦争・乱、出典、引用、履歴の最小サンプルデータを再投入できます。
- Seed は対象テーブルを初期化してから投入するため、既存データは上書きされます。

## Data Operations
- `/manage/data` で JSON export/import と `Event` / `Person` CSV export を使えます。
- `/sources` で出典を管理できます。
- `Event`、`Person`、`Polity`、`HistoricalPeriod` の詳細では、出典と変更履歴を確認できます。
