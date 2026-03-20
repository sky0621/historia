import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import { historicalPeriodRelations } from "@/db/schema";

export type HistoricalPeriodRelationInsert = typeof historicalPeriodRelations.$inferInsert;

export function listHistoricalPeriodRelations() {
  return db.select().from(historicalPeriodRelations).orderBy(asc(historicalPeriodRelations.id)).all();
}

export function getHistoricalPeriodRelationById(id: number) {
  return db.select().from(historicalPeriodRelations).where(eq(historicalPeriodRelations.id, id)).get();
}

export function createHistoricalPeriodRelation(input: HistoricalPeriodRelationInsert) {
  const result = db.insert(historicalPeriodRelations).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateHistoricalPeriodRelation(id: number, input: Omit<HistoricalPeriodRelationInsert, "id">) {
  db.update(historicalPeriodRelations).set(input).where(eq(historicalPeriodRelations.id, id)).run();
}

export function deleteHistoricalPeriodRelation(id: number) {
  db.delete(historicalPeriodRelations).where(eq(historicalPeriodRelations.id, id)).run();
}

export function getHistoricalPeriodRelationsByPeriodIds(periodIds: number[]) {
  if (periodIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(historicalPeriodRelations)
    .where(or(inArray(historicalPeriodRelations.fromPeriodId, periodIds), inArray(historicalPeriodRelations.toPeriodId, periodIds)))
    .all();
}
