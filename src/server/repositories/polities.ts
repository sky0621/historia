import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  dynastyPolityLinks,
  dynastySuccessions,
  eventPolityLinks,
  historicalPeriodPolityLinks,
  polities,
  polityRegionLinks,
  polityTransitions
} from "@/db/schema";

export type PolityRecord = typeof polities.$inferSelect;
export type PolityInsert = typeof polities.$inferInsert;

export function listPolities() {
  return db.select().from(polities).orderBy(asc(polities.name)).all();
}

export function getPolityById(id: number) {
  return db.select().from(polities).where(eq(polities.id, id)).get();
}

export function createPolity(input: PolityInsert, regionIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(polities).values(input).run();
    const polityId = Number(result.lastInsertRowid);

    if (regionIds.length > 0) {
      tx.insert(polityRegionLinks).values(regionIds.map((regionId) => ({ polityId, regionId }))).run();
    }

    return polityId;
  });
}

export function updatePolity(id: number, input: Omit<PolityInsert, "id">, regionIds: number[]) {
  db.transaction((tx) => {
    tx.update(polities).set(input).where(eq(polities.id, id)).run();
    tx.delete(polityRegionLinks).where(eq(polityRegionLinks.polityId, id)).run();

    if (regionIds.length > 0) {
      tx.insert(polityRegionLinks).values(regionIds.map((regionId) => ({ polityId: id, regionId }))).run();
    }
  });
}

export function deletePolity(id: number) {
  db.transaction((tx) => {
    tx.delete(historicalPeriodPolityLinks).where(eq(historicalPeriodPolityLinks.polityId, id)).run();
    tx.delete(eventPolityLinks).where(eq(eventPolityLinks.polityId, id)).run();
    tx.delete(dynastyPolityLinks).where(eq(dynastyPolityLinks.polityId, id)).run();
    tx.delete(dynastySuccessions).where(eq(dynastySuccessions.polityId, id)).run();
    tx.delete(polityTransitions).where(eq(polityTransitions.predecessorPolityId, id)).run();
    tx.delete(polityTransitions).where(eq(polityTransitions.successorPolityId, id)).run();
    tx.delete(polityRegionLinks).where(eq(polityRegionLinks.polityId, id)).run();
    tx.delete(polities).where(eq(polities.id, id)).run();
  });
}

export function getPolityRegionIds(polityIds: number[]) {
  if (polityIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(polityRegionLinks)
    .where(inArray(polityRegionLinks.polityId, polityIds))
    .all();
}
