import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { dynasties, dynastyRegionLinks } from "@/db/schema";

export type DynastyRecord = typeof dynasties.$inferSelect;
export type DynastyInsert = typeof dynasties.$inferInsert;

export function listDynasties() {
  return db.select().from(dynasties).orderBy(asc(dynasties.name)).all();
}

export function getDynastyById(id: number) {
  return db.select().from(dynasties).where(eq(dynasties.id, id)).get();
}

export function createDynasty(input: DynastyInsert, regionIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(dynasties).values(input).run();
    const dynastyId = Number(result.lastInsertRowid);

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId, regionId }))).run();
    }

    return dynastyId;
  });
}

export function updateDynasty(id: number, input: Omit<DynastyInsert, "id">, regionIds: number[]) {
  db.transaction((tx) => {
    tx.update(dynasties).set(input).where(eq(dynasties.id, id)).run();
    tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId: id, regionId }))).run();
    }
  });
}

export function deleteDynasty(id: number) {
  db.transaction((tx) => {
    tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();
    tx.delete(dynasties).where(eq(dynasties.id, id)).run();
  });
}

export function getDynastyRegionIds(dynastyIds: number[]) {
  if (dynastyIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(dynastyRegionLinks)
    .where(inArray(dynastyRegionLinks.dynastyId, dynastyIds))
    .all();
}
