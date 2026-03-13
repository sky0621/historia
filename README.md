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
4. `pnpm dev`

`DATABASE_URL` の既定値は `./.data/historia.db` です。
