import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { changeHistories } from "@/db/schema";

export type ChangeHistoryInsert = typeof changeHistories.$inferInsert;

export function createChangeHistory(input: ChangeHistoryInsert) {
  const result = db.insert(changeHistories).values(input).run();
  return Number(result.lastInsertRowid);
}

export function getChangeHistoriesByTarget(targetType: string, targetId: number, limit = 10) {
  return db
    .select()
    .from(changeHistories)
    .where(and(eq(changeHistories.targetType, targetType), eq(changeHistories.targetId, targetId)))
    .orderBy(desc(changeHistories.changedAt))
    .limit(limit)
    .all();
}
