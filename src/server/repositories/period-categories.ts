import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { periodCategories } from "@/db/schema";

export type PeriodCategoryRecord = typeof periodCategories.$inferSelect;
export type PeriodCategoryInsert = typeof periodCategories.$inferInsert;

export function listPeriodCategories() {
  return db.select().from(periodCategories).orderBy(asc(periodCategories.name)).all();
}

export function getPeriodCategoryById(id: number) {
  return db.select().from(periodCategories).where(eq(periodCategories.id, id)).get();
}

export function createPeriodCategory(input: PeriodCategoryInsert) {
  const result = db.insert(periodCategories).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updatePeriodCategory(id: number, input: Omit<PeriodCategoryInsert, "id">) {
  db.update(periodCategories).set(input).where(eq(periodCategories.id, id)).run();
}

export function deletePeriodCategory(id: number) {
  db.delete(periodCategories).where(eq(periodCategories.id, id)).run();
}
