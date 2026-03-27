import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  roleDynastyLinks,
  rolePersonLinks,
  rolePolityLinks,
  role
} from "@/db/schema";

export type RoleAssignmentInsert = typeof role.$inferInsert;
export type RoleAssignmentRecord = typeof role.$inferSelect & {
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
    .from(rolePersonLinks)
    .where(inArray(rolePersonLinks.personId, personIds))
    .all();

  const roleIds = personLinks.map((link) => link.roleId);
  if (roleIds.length === 0) {
    return [];
  }

  const items = db.select().from(role).where(inArray(role.id, roleIds)).all();
  const polityLinks = db
    .select()
    .from(rolePolityLinks)
    .where(inArray(rolePolityLinks.roleId, roleIds))
    .all();
  const dynastyLinks = db
    .select()
    .from(roleDynastyLinks)
    .where(inArray(roleDynastyLinks.roleId, roleIds))
    .all();
  const personByRoleId = new Map(personLinks.map((link) => [link.roleId, link.personId]));
  const polityByRoleId = new Map(polityLinks.map((link) => [link.roleId, link.polityId]));
  const dynastyByRoleId = new Map(dynastyLinks.map((link) => [link.roleId, link.dynastyId]));

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
  const links = db.select().from(rolePersonLinks).where(eq(rolePersonLinks.personId, personId)).all();
  const roleIds = links.map((link) => link.roleId);
  if (roleIds.length === 0) {
    return;
  }

  db.delete(rolePersonLinks).where(eq(rolePersonLinks.personId, personId)).run();
  db.delete(rolePolityLinks).where(inArray(rolePolityLinks.roleId, roleIds)).run();
  db.delete(roleDynastyLinks).where(inArray(roleDynastyLinks.roleId, roleIds)).run();
  db.delete(role).where(inArray(role.id, roleIds)).run();
}
