import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { eventTypes } from "@/db/schema";

export function listEventTypes() {
  return db.select().from(eventTypes).orderBy(asc(eventTypes.label)).all();
}
