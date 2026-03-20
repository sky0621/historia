import { and, asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { citations } from "@/db/schema";

export type CitationInsert = typeof citations.$inferInsert;

export function listCitations() {
  return db.select().from(citations).orderBy(asc(citations.id)).all();
}

export function getCitationById(id: number) {
  return db.select().from(citations).where(eq(citations.id, id)).get();
}

export function getCitationsBySourceIds(sourceIds: number[]) {
  if (sourceIds.length === 0) {
    return [];
  }

  return db.select().from(citations).where(inArray(citations.sourceId, sourceIds)).all();
}

export function getCitationsByTarget(targetType: string, targetId: number) {
  return db
    .select()
    .from(citations)
    .where(and(eq(citations.targetType, targetType), eq(citations.targetId, targetId)))
    .orderBy(asc(citations.id))
    .all();
}

export function createCitation(input: CitationInsert) {
  const result = db.insert(citations).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateCitation(id: number, input: Partial<Omit<CitationInsert, "id">>) {
  db.update(citations).set(input).where(eq(citations.id, id)).run();
}

export function deleteCitation(id: number) {
  db.delete(citations).where(eq(citations.id, id)).run();
}

export function deleteCitationsBySourceId(sourceId: number) {
  db.delete(citations).where(eq(citations.sourceId, sourceId)).run();
}
