import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { roleAssignments } from "@/db/schema";

export type RoleAssignmentInsert = typeof roleAssignments.$inferInsert;

export function getRoleAssignmentsByPersonIds(personIds: number[]) {
  if (personIds.length === 0) {
    return [];
  }

  return db.select().from(roleAssignments).where(inArray(roleAssignments.personId, personIds)).all();
}

export function deleteRoleAssignmentsByPersonId(personId: number) {
  db.delete(roleAssignments).where(eq(roleAssignments.personId, personId)).run();
}
