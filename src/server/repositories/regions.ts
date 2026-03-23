import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import { regionParentLinks, regions } from "@/db/schema";

export type RegionRecord = typeof regions.$inferSelect & { parentRegionId: number | null };
export type RegionInsert = typeof regions.$inferInsert;

export function listRegions() {
  const items = db.select().from(regions).orderBy(asc(regions.name)).all();
  const links = getRegionParentLinks(items.map((item) => item.id));
  const parentByRegionId = new Map(links.map((link) => [link.regionId, link.parentRegionId]));

  return items.map((item) => ({
    ...item,
    parentRegionId: parentByRegionId.get(item.id) ?? null
  }));
}

export function getRegionById(id: number) {
  const region = db.select().from(regions).where(eq(regions.id, id)).get();
  if (!region) {
    return undefined;
  }

  return {
    ...region,
    parentRegionId: getRegionParentLinks([id])[0]?.parentRegionId ?? null
  };
}

export function createRegion(input: RegionInsert, parentRegionId: number | null) {
  return db.transaction((tx) => {
    const result = tx.insert(regions).values(input).run();
    const regionId = Number(result.lastInsertRowid);

    if (parentRegionId != null) {
      tx.insert(regionParentLinks).values({ regionId, parentRegionId }).run();
    }

    return regionId;
  });
}

export function updateRegion(id: number, input: Omit<RegionInsert, "id">, parentRegionId: number | null) {
  db.transaction((tx) => {
    tx.update(regions).set(input).where(eq(regions.id, id)).run();
    tx.delete(regionParentLinks).where(eq(regionParentLinks.regionId, id)).run();

    if (parentRegionId != null) {
      tx.insert(regionParentLinks).values({ regionId: id, parentRegionId }).run();
    }
  });
}

export function deleteRegion(id: number) {
  db.transaction((tx) => {
    tx.delete(regionParentLinks).where(or(eq(regionParentLinks.regionId, id), eq(regionParentLinks.parentRegionId, id))).run();
    tx.delete(regions).where(eq(regions.id, id)).run();
  });
}

export function getRegionParentLinks(regionIds: number[]) {
  if (regionIds.length === 0) {
    return [];
  }

  return db.select().from(regionParentLinks).where(inArray(regionParentLinks.regionId, regionIds)).all();
}
