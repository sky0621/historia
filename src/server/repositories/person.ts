import { and, asc, like, ne } from "drizzle-orm";
import { db } from "@/db/client";
import { persons } from "@/db/schema";

export function listPerson() {
  return db.select().from(persons).orderBy(asc(persons.name)).all();
}

export function searchPersonNamesByLike(name: string, excludeId?: number) {
  const pattern = `%${name}%`;
  const where = excludeId ? and(like(persons.name, pattern), ne(persons.id, excludeId)) : like(persons.name, pattern);
  return db
    .select({ id: persons.id, name: persons.name })
    .from(persons)
    .where(where)
    .orderBy(asc(persons.name))
    .limit(10)
    .all();
}
