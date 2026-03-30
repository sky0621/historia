import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  persons,
  personRegionLinks,
  personReligionLinks,
  personSectLinks,
  personRoleLinks,
  role
} from "@/db/schema";

export type PersonInsert = typeof persons.$inferInsert;

export function getPersonById(id: number) {
  return db.select().from(persons).where(eq(persons.id, id)).get();
}

export function listPersonDetailed() {
  return db.select().from(persons).all();
}

export function createPerson(input: PersonInsert) {
  const result = db.insert(persons).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updatePerson(id: number, input: Omit<PersonInsert, "id">) {
  db.update(persons).set(input).where(eq(persons.id, id)).run();
}

export function deletePerson(id: number) {
  db.delete(persons).where(eq(persons.id, id)).run();
}

export function replacePersonRegionLinks(personId: number, regionIds: number[]) {
  db.delete(personRegionLinks).where(eq(personRegionLinks.personId, personId)).run();
  if (regionIds.length > 0) {
    db.insert(personRegionLinks).values(regionIds.map((regionId) => ({ personId, regionId }))).run();
  }
}

export function replacePersonReligionLinks(personId: number, religionIds: number[]) {
  db.delete(personReligionLinks).where(eq(personReligionLinks.personId, personId)).run();
  if (religionIds.length > 0) {
    db.insert(personReligionLinks).values(religionIds.map((religionId) => ({ personId, religionId }))).run();
  }
}

export function replacePersonSectLinks(personId: number, sectIds: number[]) {
  db.delete(personSectLinks).where(eq(personSectLinks.personId, personId)).run();
  if (sectIds.length > 0) {
    db.insert(personSectLinks).values(sectIds.map((sectId) => ({ personId, sectId }))).run();
  }
}

export function replaceRoleAssignments(
  personId: number,
  roles: Array<{
    personId: number;
    title: string;
    reading?: string | null;
    description?: string | null;
    note?: string | null;
    fromCalendarEra?: string | null;
    fromYear?: number | null;
    fromIsApproximate?: boolean;
    toCalendarEra?: string | null;
    toYear?: number | null;
    toIsApproximate?: boolean;
  }>
) {
  const existingRoleIds = db
    .select()
    .from(personRoleLinks)
    .where(eq(personRoleLinks.personId, personId))
    .all()
    .map((link) => link.roleId);

  db.delete(personRoleLinks).where(eq(personRoleLinks.personId, personId)).run();
  if (existingRoleIds.length > 0) {
    db.delete(role).where(inArray(role.id, existingRoleIds)).run();
  }

  if (roles.length === 0) {
    return;
  }

  for (const roleItem of roles) {
    const {
      personId: rolePersonId,
      description,
      note,
      fromCalendarEra,
      fromYear,
      fromIsApproximate,
      toCalendarEra,
      toYear,
      toIsApproximate,
      ...roleInput
    } = roleItem;
    const result = db.insert(role).values(roleInput).run();
    const roleId = Number(result.lastInsertRowid);
    db.insert(personRoleLinks).values({
      personId: rolePersonId,
      roleId,
      description: description ?? null,
      note: note ?? null,
      fromCalendarEra: fromCalendarEra ?? null,
      fromYear: fromYear ?? null,
      fromIsApproximate: fromIsApproximate ?? false,
      toCalendarEra: toCalendarEra ?? null,
      toYear: toYear ?? null,
      toIsApproximate: toIsApproximate ?? false
    }).run();
  }
}

export function getPersonRegionLinks(personIds: number[]) {
  if (personIds.length === 0) return [];
  return db.select().from(personRegionLinks).where(inArray(personRegionLinks.personId, personIds)).all();
}

export function getPersonReligionLinks(personIds: number[]) {
  if (personIds.length === 0) return [];
  return db.select().from(personReligionLinks).where(inArray(personReligionLinks.personId, personIds)).all();
}

export function getPersonSectLinks(personIds: number[]) {
  if (personIds.length === 0) return [];
  return db.select().from(personSectLinks).where(inArray(personSectLinks.personId, personIds)).all();
}
