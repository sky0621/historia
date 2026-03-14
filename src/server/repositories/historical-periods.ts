import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { historicalPeriods, periodRegionLinks } from "@/db/schema";

export function listHistoricalPeriods() {
  return db.select().from(historicalPeriods).orderBy(asc(historicalPeriods.name)).all();
}

export type HistoricalPeriodInsert = typeof historicalPeriods.$inferInsert;

export function getHistoricalPeriodById(id: number) {
  return db.select().from(historicalPeriods).where(eq(historicalPeriods.id, id)).get();
}

export function createHistoricalPeriod(input: HistoricalPeriodInsert, regionIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(historicalPeriods).values(input).run();
    const periodId = Number(result.lastInsertRowid);

    if (regionIds.length > 0) {
      tx.insert(periodRegionLinks).values(regionIds.map((regionId) => ({ periodId, regionId }))).run();
    }

    return periodId;
  });
}

export function updateHistoricalPeriod(
  id: number,
  input: Omit<HistoricalPeriodInsert, "id">,
  regionIds: number[]
) {
  db.transaction((tx) => {
    tx.update(historicalPeriods).set(input).where(eq(historicalPeriods.id, id)).run();
    tx.delete(periodRegionLinks).where(eq(periodRegionLinks.periodId, id)).run();

    if (regionIds.length > 0) {
      tx.insert(periodRegionLinks).values(regionIds.map((regionId) => ({ periodId: id, regionId }))).run();
    }
  });
}

export function deleteHistoricalPeriod(id: number) {
  db.transaction((tx) => {
    tx.delete(periodRegionLinks).where(eq(periodRegionLinks.periodId, id)).run();
    tx.delete(historicalPeriods).where(eq(historicalPeriods.id, id)).run();
  });
}

export function getHistoricalPeriodRegionIds(periodIds: number[]) {
  if (periodIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(periodRegionLinks)
    .where(inArray(periodRegionLinks.periodId, periodIds))
    .all();
}
