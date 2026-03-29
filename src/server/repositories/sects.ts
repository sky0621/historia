import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { sectFounderLinks, sects } from "@/db/schema";

export type SectInsert = typeof sects.$inferInsert;
export type SectRecord = typeof sects.$inferSelect & {
  religionId: number;
};

export function listSects() {
  return db.select().from(sects).orderBy(asc(sects.name)).all().filter((item): item is SectRecord => item.religionId != null);
}

export function getSectById(id: number) {
  const sect = db.select().from(sects).where(eq(sects.id, id)).get();
  if (!sect || sect.religionId == null) {
    return undefined;
  }
  return sect as SectRecord;
}

export function createSect(
  input: SectInsert,
  religionId: number,
  founderIds: number[]
) {
  return db.transaction((tx) => {
    const result = tx.insert(sects).values({ ...input, religionId }).run();
    const sectId = Number(result.lastInsertRowid);

    if (founderIds.length > 0) {
      tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId, personId }))).run();
    }

    return sectId;
  });
}

export function updateSect(
  id: number,
  input: Omit<SectInsert, "id">,
  religionId: number,
  founderIds: number[]
) {
  db.transaction((tx) => {
    tx.update(sects).set({ ...input, religionId }).where(eq(sects.id, id)).run();
    tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();

    if (founderIds.length > 0) {
      tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId: id, personId }))).run();
    }
  });
}

export function deleteSect(id: number) {
  db.transaction((tx) => {
    tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();
    tx.delete(sects).where(eq(sects.id, id)).run();
  });
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
