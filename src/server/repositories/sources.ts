import { asc, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { sources } from "@/db/schema";

export type SourceInsert = typeof sources.$inferInsert;

export function listSources() {
  return db.select().from(sources).orderBy(asc(sources.title)).all();
}

export function getSourceById(id: number) {
  return db.select().from(sources).where(eq(sources.id, id)).get();
}

export function getSourcesByIds(ids: number[]) {
  if (ids.length === 0) {
    return [];
  }

  return db.select().from(sources).where(inArray(sources.id, ids)).all();
}

export function createSource(input: SourceInsert) {
  const result = db.insert(sources).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateSource(id: number, input: Partial<Omit<SourceInsert, "id">>) {
  db.update(sources).set(input).where(eq(sources.id, id)).run();
}

export function deleteSource(id: number) {
  db.delete(sources).where(eq(sources.id, id)).run();
}

export function listRecentSources(limit = 20) {
  return db.select().from(sources).orderBy(desc(sources.updatedAt)).limit(limit).all();
}
