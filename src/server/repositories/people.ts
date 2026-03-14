import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { people } from "@/db/schema";

export function listPeople() {
  return db.select().from(people).orderBy(asc(people.name)).all();
}
