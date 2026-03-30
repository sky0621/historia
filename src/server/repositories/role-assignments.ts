import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  rolePersonLinks,
  role
} from "@/db/schema";

export type RoleAssignmentInsert = typeof role.$inferInsert;
export type RoleAssignmentRecord = typeof role.$inferSelect & {
  personId: number;
};

export function getRoleAssignmentsByPersonIds(personIds: number[]) {
  if (personIds.length === 0) {
    return [];
  }

  const personLinks = db
    .select()
    .from(rolePersonLinks)
    .where(inArray(rolePersonLinks.personId, personIds))
    .all();

  const roleIds = personLinks.map((link) => link.roleId);
  if (roleIds.length === 0) {
    return [];
  }

  const items = db.select().from(role).where(inArray(role.id, roleIds)).all();
  const personByRoleId = new Map(personLinks.map((link) => [link.roleId, link.personId]));

  return items
    .map((item) => {
      const personId = personByRoleId.get(item.id);
      if (!personId) {
        return null;
      }

      return {
        ...item,
        personId
      };
    })
    .filter((item): item is RoleAssignmentRecord => Boolean(item));
}

export function deleteRoleAssignmentsByPersonId(personId: number) {
  const links = db.select().from(rolePersonLinks).where(eq(rolePersonLinks.personId, personId)).all();
  const roleIds = links.map((link) => link.roleId);
  if (roleIds.length === 0) {
    return;
  }

  db.delete(rolePersonLinks).where(eq(rolePersonLinks.personId, personId)).run();
  db.delete(role).where(inArray(role.id, roleIds)).run();
}
