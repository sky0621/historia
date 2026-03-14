import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { historicalPeriods } from "@/db/schema";

export function listHistoricalPeriods() {
  return db.select().from(historicalPeriods).orderBy(asc(historicalPeriods.name)).all();
}
