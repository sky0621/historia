import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { regions } from "@/db/schema";

export type RegionRecord = typeof regions.$inferSelect;
export type RegionInsert = typeof regions.$inferInsert;

export function listRegions() {
  return db.select().from(regions).orderBy(asc(regions.name)).all();
}

export function getRegionById(id: number) {
  return db.select().from(regions).where(eq(regions.id, id)).get();
}

export function createRegion(input: RegionInsert) {
  const result = db.insert(regions).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateRegion(id: number, input: Omit<RegionInsert, "id">) {
  db.update(regions).set(input).where(eq(regions.id, id)).run();
}

export function deleteRegion(id: number) {
  db.delete(regions).where(eq(regions.id, id)).run();
}
