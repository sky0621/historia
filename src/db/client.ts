import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

const databaseUrl = process.env.DATABASE_URL ?? "./.data/historia.db";

export const sqlite = new Database(databaseUrl);

export const db = drizzle(sqlite);
