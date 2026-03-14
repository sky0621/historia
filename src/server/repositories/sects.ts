import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { sectFounderLinks, sectRegionLinks, sects } from "@/db/schema";

export type SectInsert = typeof sects.$inferInsert;

export function listSects() {
  return db.select().from(sects).orderBy(asc(sects.name)).all();
}

export function getSectById(id: number) {
  return db.select().from(sects).where(eq(sects.id, id)).get();
}

export function createSect(input: SectInsert, regionIds: number[], founderIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(sects).values(input).run();
    const sectId = Number(result.lastInsertRowid);

    if (regionIds.length > 0) {
      tx.insert(sectRegionLinks).values(regionIds.map((regionId) => ({ sectId, regionId }))).run();
    }

    if (founderIds.length > 0) {
      tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId, personId }))).run();
    }

    return sectId;
  });
}

export function updateSect(
  id: number,
  input: Omit<SectInsert, "id">,
  regionIds: number[],
  founderIds: number[]
) {
  db.transaction((tx) => {
    tx.update(sects).set(input).where(eq(sects.id, id)).run();
    tx.delete(sectRegionLinks).where(eq(sectRegionLinks.sectId, id)).run();
    tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();

    if (regionIds.length > 0) {
      tx.insert(sectRegionLinks).values(regionIds.map((regionId) => ({ sectId: id, regionId }))).run();
    }

    if (founderIds.length > 0) {
      tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId: id, personId }))).run();
    }
  });
}

export function deleteSect(id: number) {
  db.transaction((tx) => {
    tx.delete(sectRegionLinks).where(eq(sectRegionLinks.sectId, id)).run();
    tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();
    tx.delete(sects).where(eq(sects.id, id)).run();
  });
}

export function getSectRegionIds(sectIds: number[]) {
  if (sectIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(sectRegionLinks)
    .where(inArray(sectRegionLinks.sectId, sectIds))
    .all();
}

export function getSectFounderIds(sectIds: number[]) {
  if (sectIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(sectFounderLinks)
    .where(inArray(sectFounderLinks.sectId, sectIds))
    .all();
}
