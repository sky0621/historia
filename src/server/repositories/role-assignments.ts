import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  personRoleLinks,
  role
} from "@/db/schema";

export type RoleAssignmentInsert = typeof role.$inferInsert;
export type RoleAssignmentRecord = Omit<typeof role.$inferSelect, "description" | "note" | "fromCalendarEra" | "fromYear" | "fromIsApproximate" | "toCalendarEra" | "toYear" | "toIsApproximate"> & {
  personId: number;
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
  const linkByRoleId = new Map(personLinks.map((link) => [link.roleId, link]));

  return items
    .map((item) => {
      const link = linkByRoleId.get(item.id);
      if (!link) {
        return null;
      }

      return {
        ...item,
        personId: link.personId,
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
