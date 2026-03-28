# AGENTS.md

## Overview
- This repository is `historia`, a local-first history timeline system built with Next.js 15, TypeScript, Tailwind CSS 4, Drizzle ORM, SQLite, Zod, react-hook-form, and Vitest.
- Prefer small, targeted changes that match the existing app structure and naming.
- Keep responses and code changes concise and practical.

## Project Structure
- `src/` contains the application code.
- `src/db/schema/*.ts` contains Drizzle schema definitions.
- `src/db/schema.sql` is the canonical SQL schema file for migrations.
- `scripts/` contains helper scripts, including schema and migration helpers.
- `examples/` contains sample CSV files.
- `design/`, `csv/`, and `plan/` contain project reference material; inspect before changing related behavior.

## Working Rules
- Use `pnpm` for package management and scripts.
- Before changing database structure, inspect both Drizzle schema files and `src/db/schema.sql`.
- Do not hand-edit generated or build output unless the task explicitly requires it.
- Avoid broad refactors unless the user asks for them.
- Keep Japanese documentation and labels intact unless the task is specifically about rewriting them.

## Common Commands
- Install dependencies: `pnpm install`
- Start dev server: `pnpm dev`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Generate schema SQL: `pnpm db:schema:generate`
- Dry-run DB migration: `pnpm db:dry-run`
- Apply DB migration: `pnpm db:migrate`
- Seed DB: `pnpm db:seed`

## Database Notes
- Treat `src/db/schema.sql` as the migration source of truth.
- If schema changes are needed, keep ORM definitions and SQL schema aligned.
- `DATABASE_URL` defaults to `./.data/historia.db`.
- `db:seed` clears target tables before inserting seed data behavior; check existing seed logic before modifying it.

## Validation
- For code changes, prefer targeted validation first, then broader checks if needed.
- Typical validation order:
  1. `pnpm lint`
  2. `pnpm typecheck`
  3. `pnpm test`
- For DB-related changes, also run the relevant schema or migration command.

## Safety
- Do not delete user data in `.data/` or modify `.env` unless the user explicitly requests it.
- Do not commit, push, or rewrite git history unless asked.
- If a task may affect import/export behavior, sources, or change history, inspect the related flows before editing.
