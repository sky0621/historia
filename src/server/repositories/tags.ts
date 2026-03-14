import { asc, eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { eventTagLinks, tags } from "@/db/schema";

export function listTags() {
  return db.select().from(tags).orderBy(asc(tags.name)).all();
}

export function getTagsByIds(tagIds: number[]) {
  if (tagIds.length === 0) {
    return [];
  }

  return db.select().from(tags).where(inArray(tags.id, tagIds)).all();
}

export function getTagsByNames(names: string[]) {
  if (names.length === 0) {
    return [];
  }

  return db.select().from(tags).where(inArray(tags.name, names)).all();
}

export function createTag(name: string) {
  const result = db.insert(tags).values({ name }).run();
  return Number(result.lastInsertRowid);
}

export function getEventTagLinks(eventIds: number[]) {
  if (eventIds.length === 0) {
    return [];
  }

  return db.select().from(eventTagLinks).where(inArray(eventTagLinks.eventId, eventIds)).all();
}

export function replaceEventTagLinks(eventId: number, tagIds: number[]) {
  db.delete(eventTagLinks).where(eq(eventTagLinks.eventId, eventId)).run();

  if (tagIds.length > 0) {
    db.insert(eventTagLinks).values(tagIds.map((tagId) => ({ eventId, tagId }))).run();
  }
}
