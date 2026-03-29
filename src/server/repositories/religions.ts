import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { religionFounderLinks, religions, sects } from "@/db/schema";

export type ReligionInsert = typeof religions.$inferInsert;

export function listReligions() {
  return db.select().from(religions).orderBy(asc(religions.name)).all();
}

export function getReligionById(id: number) {
  return db.select().from(religions).where(eq(religions.id, id)).get();
}

export function createReligion(input: ReligionInsert, founderIds: number[]) {
  return db.transaction((tx) => {
    const result = tx.insert(religions).values(input).run();
    const religionId = Number(result.lastInsertRowid);

    if (founderIds.length > 0) {
      tx.insert(religionFounderLinks).values(founderIds.map((personId) => ({ religionId, personId }))).run();
    }

    return religionId;
  });
}

export function updateReligion(
  id: number,
  input: Omit<ReligionInsert, "id">,
  founderIds: number[]
) {
  db.transaction((tx) => {
    tx.update(religions).set(input).where(eq(religions.id, id)).run();
    tx.delete(religionFounderLinks).where(eq(religionFounderLinks.religionId, id)).run();

    if (founderIds.length > 0) {
      tx.insert(religionFounderLinks).values(founderIds.map((personId) => ({ religionId: id, personId }))).run();
    }
  });
}

export function deleteReligion(id: number) {
  db.transaction((tx) => {
    tx.update(sects).set({ religionId: null }).where(eq(sects.religionId, id)).run();
    tx.delete(religionFounderLinks).where(eq(religionFounderLinks.religionId, id)).run();
    tx.delete(religions).where(eq(religions.id, id)).run();
  });
}

export function getReligionFounderIds(religionIds: number[]) {
  if (religionIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(religionFounderLinks)
    .where(inArray(religionFounderLinks.religionId, religionIds))
    .all();
}
