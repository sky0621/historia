import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { religionSectLinks, sectFounderLinks, sects } from "@/db/schema";

export type SectInsert = typeof sects.$inferInsert;
export type SectRecord = typeof sects.$inferSelect & {
  religionId: number;
};

export function listSects() {
  const items = db.select().from(sects).orderBy(asc(sects.name)).all();
  const religionLinks = getSectReligionLinks(items.map((item) => item.id));
  const religionBySectId = new Map(religionLinks.map((link) => [link.sectId, link.religionId]));

  return items
    .map((item) => {
      const religionId = religionBySectId.get(item.id);
      if (!religionId) {
        return null;
      }

      return {
        ...item,
        religionId
      };
    })
    .filter((item): item is SectRecord => Boolean(item));
}

export function getSectById(id: number) {
  const sect = db.select().from(sects).where(eq(sects.id, id)).get();
  if (!sect) {
    return undefined;
  }

  const religionId = getSectReligionLinks([id])[0]?.religionId;
  if (!religionId) {
    return undefined;
  }

  return {
    ...sect,
    religionId
  };
}

export function createSect(
  input: SectInsert,
  religionId: number,
  founderIds: number[]
) {
  return db.transaction((tx) => {
    const result = tx.insert(sects).values(input).run();
    const sectId = Number(result.lastInsertRowid);

    tx.insert(religionSectLinks).values({ religionId, sectId }).run();

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
    tx.update(sects).set(input).where(eq(sects.id, id)).run();
    tx.delete(religionSectLinks).where(eq(religionSectLinks.sectId, id)).run();
    tx.delete(sectFounderLinks).where(eq(sectFounderLinks.sectId, id)).run();
    tx.insert(religionSectLinks).values({ religionId, sectId: id }).run();

    if (founderIds.length > 0) {
      tx.insert(sectFounderLinks).values(founderIds.map((personId) => ({ sectId: id, personId }))).run();
    }
  });
}

export function deleteSect(id: number) {
  db.transaction((tx) => {
    tx.delete(religionSectLinks).where(eq(religionSectLinks.sectId, id)).run();
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

export function getSectReligionLinks(sectIds: number[]) {
  if (sectIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(religionSectLinks)
    .where(inArray(religionSectLinks.sectId, sectIds))
    .all();
}
