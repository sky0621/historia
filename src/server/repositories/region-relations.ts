import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import { regionRelations } from "@/db/schema";

export type RegionRelationInsert = typeof regionRelations.$inferInsert;

export function listRegionRelations() {
  return db.select().from(regionRelations).orderBy(asc(regionRelations.id)).all();
}

export function getRegionRelationById(id: number) {
  return db.select().from(regionRelations).where(eq(regionRelations.id, id)).get();
}

export function createRegionRelation(input: RegionRelationInsert) {
  const result = db.insert(regionRelations).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateRegionRelation(id: number, input: Omit<RegionRelationInsert, "id">) {
  db.update(regionRelations).set(input).where(eq(regionRelations.id, id)).run();
}

export function deleteRegionRelation(id: number) {
  db.delete(regionRelations).where(eq(regionRelations.id, id)).run();
}

export function getRegionRelationsByRegionIds(regionIds: number[]) {
  if (regionIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(regionRelations)
    .where(or(inArray(regionRelations.fromRegionId, regionIds), inArray(regionRelations.toRegionId, regionIds)))
    .all();
}
