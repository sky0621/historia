import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { dynasties, dynastyPolityLinks, dynastyRegionLinks, role } from "@/db/schema";

export type DynastyRecord = typeof dynasties.$inferSelect & { polityIds: number[] };
export type DynastyInsert = typeof dynasties.$inferInsert;

export function listDynasties() {
  const items = db.select().from(dynasties).orderBy(asc(dynasties.name)).all();
  const polityLinks = getDynastyPolityLinks(items.map((item) => item.id));
  const polityIdsByDynastyId = new Map<number, number[]>();

  for (const link of polityLinks) {
    const ids = polityIdsByDynastyId.get(link.dynastyId) ?? [];
    ids.push(link.polityId);
    polityIdsByDynastyId.set(link.dynastyId, ids);
  }

  return items.map((item) => ({
    ...item,
    polityIds: polityIdsByDynastyId.get(item.id) ?? []
  }));
}

export function getDynastyById(id: number) {
  const dynasty = db.select().from(dynasties).where(eq(dynasties.id, id)).get();
  if (!dynasty) {
    return undefined;
  }

  return {
    ...dynasty,
    polityIds: getDynastyPolityLinks([id]).map((link) => link.polityId)
  };
}

export function createDynasty(input: DynastyInsert, polityIds: number[], regionIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(dynasties).values(input).run();
    const dynastyId = Number(result.lastInsertRowid);

    if (polityIds.length > 0) {
      tx.insert(dynastyPolityLinks).values(polityIds.map((polityId) => ({ dynastyId, polityId }))).run();
    }

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId, regionId }))).run();
    }

    return dynastyId;
  });
}

export function updateDynasty(id: number, input: Omit<DynastyInsert, "id">, polityIds: number[], regionIds: number[]) {
  db.transaction((tx) => {
    tx.update(dynasties).set(input).where(eq(dynasties.id, id)).run();
    tx.delete(dynastyPolityLinks).where(eq(dynastyPolityLinks.dynastyId, id)).run();
    tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();
    if (polityIds.length > 0) {
      tx.insert(dynastyPolityLinks).values(polityIds.map((polityId) => ({ dynastyId: id, polityId }))).run();
    }

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId: id, regionId }))).run();
    }
  });
}

export function deleteDynasty(id: number) {
  db.transaction((tx) => {
    tx.update(role).set({ dynastyId: null }).where(eq(role.dynastyId, id)).run();
    tx.delete(dynastyPolityLinks).where(eq(dynastyPolityLinks.dynastyId, id)).run();
    tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();
    tx.delete(dynasties).where(eq(dynasties.id, id)).run();
  });
}

export function getDynastyPolityLinks(dynastyIds: number[]) {
  if (dynastyIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(dynastyPolityLinks)
    .where(inArray(dynastyPolityLinks.dynastyId, dynastyIds))
    .all();
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
