import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  personRoleLinks,
  role,
  rolePolityLinks
} from "@/db/schema";

export type RoleAssignmentInsert = typeof role.$inferInsert;
export type RoleAssignmentRecord = Omit<typeof role.$inferSelect, "description" | "note" | "fromCalendarEra" | "fromYear" | "fromIsApproximate" | "toCalendarEra" | "toYear" | "toIsApproximate"> & {
  personId: number;
  polityIds: number[];
  description: string | null;
  note: string | null;
  fromCalendarEra: string | null;
  fromYear: number | null;
  fromIsApproximate: boolean;
  toCalendarEra: string | null;
  toYear: number | null;
  toIsApproximate: boolean;
};

export function getRoleAssignmentsByPersonIds(personIds: number[]) {
  if (personIds.length === 0) {
    return [];
  }

  const personLinks = db
    .select()
    .from(personRoleLinks)
    .where(inArray(personRoleLinks.personId, personIds))
    .all();

  const roleIds = personLinks.map((link) => link.roleId);
  if (roleIds.length === 0) {
    return [];
  }

  const items = db.select().from(role).where(inArray(role.id, roleIds)).all();
  const rolePolities = db.select().from(rolePolityLinks).where(inArray(rolePolityLinks.roleId, roleIds)).all();
  const roleById = new Map(items.map((item) => [item.id, item]));
  const polityIdsByRoleId = new Map<number, number[]>();

  for (const rolePolity of rolePolities) {
    const current = polityIdsByRoleId.get(rolePolity.roleId) ?? [];
    current.push(rolePolity.polityId);
    polityIdsByRoleId.set(rolePolity.roleId, current);
  }

  return personLinks
    .map((link) => {
      const item = roleById.get(link.roleId);
      if (!item) {
        return null;
      }

      return {
        ...item,
        personId: link.personId,
        polityIds: polityIdsByRoleId.get(item.id) ?? [],
        description: link.description ?? null,
        note: link.note ?? null,
        fromCalendarEra: link.fromCalendarEra ?? null,
        fromYear: link.fromYear ?? null,
        fromIsApproximate: link.fromIsApproximate ?? false,
        toCalendarEra: link.toCalendarEra ?? null,
        toYear: link.toYear ?? null,
        toIsApproximate: link.toIsApproximate ?? false
      };
    })
    .filter((item): item is RoleAssignmentRecord => Boolean(item));
}

export function deleteRoleAssignmentsByPersonId(personId: number) {
  db.delete(personRoleLinks).where(eq(personRoleLinks.personId, personId)).run();
}
