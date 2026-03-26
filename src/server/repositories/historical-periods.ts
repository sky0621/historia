import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  historicalPeriodCategoryLinks,
  historicalPeriodPolityLinks,
  historicalPeriods,
  historicalPeriodRegionLinks
} from "@/db/schema";

export type HistoricalPeriodRecord = typeof historicalPeriods.$inferSelect & {
  categoryId: number;
  polityId: number | null;
};

export function listHistoricalPeriods() {
  const items = db.select().from(historicalPeriods).orderBy(asc(historicalPeriods.name)).all();
  const categoryLinks = getHistoricalPeriodCategoryLinks(items.map((item) => item.id));
  const polityLinks = getHistoricalPeriodPolityLinks(items.map((item) => item.id));
  const categoryByPeriodId = new Map(categoryLinks.map((link) => [link.periodId, link.categoryId]));
  const polityByPeriodId = new Map(polityLinks.map((link) => [link.periodId, link.polityId]));

  return items
    .map((item) => {
      const categoryId = categoryByPeriodId.get(item.id);
      if (!categoryId) {
        return null;
      }

      return {
        ...item,
        categoryId,
        polityId: polityByPeriodId.get(item.id) ?? null
      };
    })
    .filter((item): item is HistoricalPeriodRecord => Boolean(item));
}

export type HistoricalPeriodInsert = typeof historicalPeriods.$inferInsert;

export function getHistoricalPeriodById(id: number) {
  const period = db.select().from(historicalPeriods).where(eq(historicalPeriods.id, id)).get();
  if (!period) {
    return undefined;
  }

  const categoryId = getHistoricalPeriodCategoryLinks([id])[0]?.categoryId;
  if (!categoryId) {
    return undefined;
  }

  return {
    ...period,
    categoryId,
    polityId: getHistoricalPeriodPolityLinks([id])[0]?.polityId ?? null
  };
}

export function createHistoricalPeriod(
  input: HistoricalPeriodInsert,
  categoryId: number,
  polityId: number | null,
  regionIds: number[]
) {
  return db.transaction((tx) => {
    const result = tx.insert(historicalPeriods).values(input).run();
    const periodId = Number(result.lastInsertRowid);

    tx.insert(historicalPeriodCategoryLinks).values({ periodId, categoryId }).run();
    if (polityId != null) {
      tx.insert(historicalPeriodPolityLinks).values({ periodId, polityId }).run();
    }

    if (regionIds.length > 0) {
      tx.insert(historicalPeriodRegionLinks).values(regionIds.map((regionId) => ({ periodId, regionId }))).run();
    }

    return periodId;
  });
}

export function updateHistoricalPeriod(
  id: number,
  input: Omit<HistoricalPeriodInsert, "id">,
  categoryId: number,
  polityId: number | null,
  regionIds: number[]
) {
  db.transaction((tx) => {
    tx.update(historicalPeriods).set(input).where(eq(historicalPeriods.id, id)).run();
    tx.delete(historicalPeriodCategoryLinks).where(eq(historicalPeriodCategoryLinks.periodId, id)).run();
    tx.delete(historicalPeriodPolityLinks).where(eq(historicalPeriodPolityLinks.periodId, id)).run();
    tx.delete(historicalPeriodRegionLinks).where(eq(historicalPeriodRegionLinks.periodId, id)).run();
    tx.insert(historicalPeriodCategoryLinks).values({ periodId: id, categoryId }).run();
    if (polityId != null) {
      tx.insert(historicalPeriodPolityLinks).values({ periodId: id, polityId }).run();
    }

    if (regionIds.length > 0) {
      tx.insert(historicalPeriodRegionLinks).values(regionIds.map((regionId) => ({ periodId: id, regionId }))).run();
    }
  });
}

export function deleteHistoricalPeriod(id: number) {
  db.transaction((tx) => {
    tx.delete(historicalPeriodCategoryLinks).where(eq(historicalPeriodCategoryLinks.periodId, id)).run();
    tx.delete(historicalPeriodPolityLinks).where(eq(historicalPeriodPolityLinks.periodId, id)).run();
    tx.delete(historicalPeriodRegionLinks).where(eq(historicalPeriodRegionLinks.periodId, id)).run();
    tx.delete(historicalPeriods).where(eq(historicalPeriods.id, id)).run();
  });
}

export function getHistoricalPeriodCategoryLinks(periodIds: number[]) {
  if (periodIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(historicalPeriodCategoryLinks)
    .where(inArray(historicalPeriodCategoryLinks.periodId, periodIds))
    .all();
}

export function getHistoricalPeriodPolityLinks(periodIds: number[]) {
  if (periodIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(historicalPeriodPolityLinks)
    .where(inArray(historicalPeriodPolityLinks.periodId, periodIds))
    .all();
}

export function getHistoricalPeriodRegionIds(periodIds: number[]) {
  if (periodIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(historicalPeriodRegionLinks)
    .where(inArray(historicalPeriodRegionLinks.periodId, periodIds))
    .all();
}
