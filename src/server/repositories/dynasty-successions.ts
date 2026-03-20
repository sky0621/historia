import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import { dynastySuccessions } from "@/db/schema";

export type DynastySuccessionInsert = typeof dynastySuccessions.$inferInsert;

export function listDynastySuccessions() {
  return db.select().from(dynastySuccessions).orderBy(asc(dynastySuccessions.id)).all();
}

export function getDynastySuccessionById(id: number) {
  return db.select().from(dynastySuccessions).where(eq(dynastySuccessions.id, id)).get();
}

export function createDynastySuccession(input: DynastySuccessionInsert) {
  const result = db.insert(dynastySuccessions).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateDynastySuccession(id: number, input: Omit<DynastySuccessionInsert, "id">) {
  db.update(dynastySuccessions).set(input).where(eq(dynastySuccessions.id, id)).run();
}

export function deleteDynastySuccession(id: number) {
  db.delete(dynastySuccessions).where(eq(dynastySuccessions.id, id)).run();
}

export function getDynastySuccessionsByDynastyIds(dynastyIds: number[]) {
  if (dynastyIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(dynastySuccessions)
    .where(or(inArray(dynastySuccessions.predecessorDynastyId, dynastyIds), inArray(dynastySuccessions.successorDynastyId, dynastyIds)))
    .all();
}

export function getDynastySuccessionsByPolityIds(polityIds: number[]) {
  if (polityIds.length === 0) {
    return [];
  }

  return db.select().from(dynastySuccessions).where(inArray(dynastySuccessions.polityId, polityIds)).all();
}
