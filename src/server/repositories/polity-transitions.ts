import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import { polityTransitions } from "@/db/schema";

export type PolityTransitionInsert = typeof polityTransitions.$inferInsert;

export function listPolityTransitions() {
  return db.select().from(polityTransitions).orderBy(asc(polityTransitions.id)).all();
}

export function getPolityTransitionById(id: number) {
  return db.select().from(polityTransitions).where(eq(polityTransitions.id, id)).get();
}

export function createPolityTransition(input: PolityTransitionInsert) {
  const result = db.insert(polityTransitions).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updatePolityTransition(id: number, input: Omit<PolityTransitionInsert, "id">) {
  db.update(polityTransitions).set(input).where(eq(polityTransitions.id, id)).run();
}

export function deletePolityTransition(id: number) {
  db.delete(polityTransitions).where(eq(polityTransitions.id, id)).run();
}

export function getPolityTransitionsByPolityIds(polityIds: number[]) {
  if (polityIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(polityTransitions)
    .where(or(inArray(polityTransitions.predecessorPolityId, polityIds), inArray(polityTransitions.successorPolityId, polityIds)))
    .all();
}
