import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  roleAssignmentDynastyLinks,
  roleAssignmentPersonLinks,
  roleAssignmentPolityLinks,
  roleAssignments
} from "@/db/schema";

export type RoleAssignmentInsert = typeof roleAssignments.$inferInsert;
export type RoleAssignmentRecord = typeof roleAssignments.$inferSelect & {
  personId: number;
  polityId: number | null;
  dynastyId: number | null;
};

export function getRoleAssignmentsByPersonIds(personIds: number[]) {
  if (personIds.length === 0) {
    return [];
  }

  const personLinks = db
    .select()
    .from(roleAssignmentPersonLinks)
    .where(inArray(roleAssignmentPersonLinks.personId, personIds))
    .all();

  const roleAssignmentIds = personLinks.map((link) => link.roleAssignmentId);
  if (roleAssignmentIds.length === 0) {
    return [];
  }

  const items = db.select().from(roleAssignments).where(inArray(roleAssignments.id, roleAssignmentIds)).all();
  const polityLinks = db
    .select()
    .from(roleAssignmentPolityLinks)
    .where(inArray(roleAssignmentPolityLinks.roleAssignmentId, roleAssignmentIds))
    .all();
  const dynastyLinks = db
    .select()
    .from(roleAssignmentDynastyLinks)
    .where(inArray(roleAssignmentDynastyLinks.roleAssignmentId, roleAssignmentIds))
    .all();
  const personByRoleId = new Map(personLinks.map((link) => [link.roleAssignmentId, link.personId]));
  const polityByRoleId = new Map(polityLinks.map((link) => [link.roleAssignmentId, link.polityId]));
  const dynastyByRoleId = new Map(dynastyLinks.map((link) => [link.roleAssignmentId, link.dynastyId]));

  return items
    .map((item) => {
      const personId = personByRoleId.get(item.id);
      if (!personId) {
        return null;
      }

      return {
        ...item,
        personId,
        polityId: polityByRoleId.get(item.id) ?? null,
        dynastyId: dynastyByRoleId.get(item.id) ?? null
      };
    })
    .filter((item): item is RoleAssignmentRecord => Boolean(item));
}

export function deleteRoleAssignmentsByPersonId(personId: number) {
  const links = db.select().from(roleAssignmentPersonLinks).where(eq(roleAssignmentPersonLinks.personId, personId)).all();
  const roleAssignmentIds = links.map((link) => link.roleAssignmentId);
  if (roleAssignmentIds.length === 0) {
    return;
  }

  db.delete(roleAssignmentPersonLinks).where(eq(roleAssignmentPersonLinks.personId, personId)).run();
  db.delete(roleAssignmentPolityLinks).where(inArray(roleAssignmentPolityLinks.roleAssignmentId, roleAssignmentIds)).run();
  db.delete(roleAssignmentDynastyLinks).where(inArray(roleAssignmentDynastyLinks.roleAssignmentId, roleAssignmentIds)).run();
  db.delete(roleAssignments).where(inArray(roleAssignments.id, roleAssignmentIds)).run();
}
