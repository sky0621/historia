import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { persons } from "@/db/schema";

export function listPerson() {
  return db.select().from(persons).orderBy(asc(persons.name)).all();
}
