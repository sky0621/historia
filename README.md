# historia

ローカル利用前提の歴史年表システムです。`Sprint 1` では Next.js、SQLite、Drizzle を使った基盤整備と共通 UI の骨格を構築します。

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
- `pnpm db:seed` で、地域、国家、王朝、人物、時代区分、宗教、宗派、イベント、戦争・乱の最小サンプルデータを再投入できます。
- Seed は対象テーブルを初期化してから投入するため、既存データは上書きされます。
