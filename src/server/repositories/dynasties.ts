import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { dynasties, dynastyPolityLinks, dynastyRegionLinks } from "@/db/schema";

export type DynastyRecord = typeof dynasties.$inferSelect & { polityId: number };
export type DynastyInsert = typeof dynasties.$inferInsert;

export function listDynasties() {
  const items = db.select().from(dynasties).orderBy(asc(dynasties.name)).all();
  const polityLinks = getDynastyPolityLinks(items.map((item) => item.id));
  const polityByDynastyId = new Map(polityLinks.map((link) => [link.dynastyId, link.polityId]));

  return items
    .map((item) => {
      const polityId = polityByDynastyId.get(item.id);
      if (!polityId) {
        return null;
      }

      return {
        ...item,
        polityId
      };
    })
    .filter((item): item is DynastyRecord => Boolean(item));
}

export function getDynastyById(id: number) {
  const dynasty = db.select().from(dynasties).where(eq(dynasties.id, id)).get();
  if (!dynasty) {
    return undefined;
  }

  const polityId = getDynastyPolityLinks([id])[0]?.polityId;
  if (!polityId) {
    return undefined;
  }

  return {
    ...dynasty,
    polityId
  };
}

export function createDynasty(input: DynastyInsert, polityId: number, regionIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(dynasties).values(input).run();
    const dynastyId = Number(result.lastInsertRowid);

    tx.insert(dynastyPolityLinks).values({ dynastyId, polityId }).run();

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId, regionId }))).run();
    }

    return dynastyId;
  });
}

export function updateDynasty(id: number, input: Omit<DynastyInsert, "id">, polityId: number, regionIds: number[]) {
  db.transaction((tx) => {
    tx.update(dynasties).set(input).where(eq(dynasties.id, id)).run();
    tx.delete(dynastyPolityLinks).where(eq(dynastyPolityLinks.dynastyId, id)).run();
    tx.delete(dynastyRegionLinks).where(eq(dynastyRegionLinks.dynastyId, id)).run();
    tx.insert(dynastyPolityLinks).values({ dynastyId: id, polityId }).run();

    if (regionIds.length > 0) {
      tx.insert(dynastyRegionLinks).values(regionIds.map((regionId) => ({ dynastyId: id, regionId }))).run();
    }
  });
}

export function deleteDynasty(id: number) {
  db.transaction((tx) => {
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
