import { eq, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import {
  persons,
  personPeriodLinks,
  personRegionLinks,
  personReligionLinks,
  personSectLinks,
  roleAssignmentDynastyLinks,
  roleAssignmentPersonLinks,
  roleAssignmentPolityLinks,
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

export function replacePersonPeriodLinks(personId: number, periodIds: number[]) {
  db.delete(personPeriodLinks).where(eq(personPeriodLinks.personId, personId)).run();
  if (periodIds.length > 0) {
    db.insert(personPeriodLinks).values(periodIds.map((periodId) => ({ personId, periodId }))).run();
  }
}

export function replaceRoleAssignments(
  personId: number,
  roles: Array<(typeof role.$inferInsert) & { personId: number; polityId: number | null; dynastyId: number | null }>
) {
  const existingRoleAssignmentIds = db
    .select()
    .from(roleAssignmentPersonLinks)
    .where(eq(roleAssignmentPersonLinks.personId, personId))
    .all()
    .map((link) => link.roleAssignmentId);

  db.delete(roleAssignmentPersonLinks).where(eq(roleAssignmentPersonLinks.personId, personId)).run();
  if (existingRoleAssignmentIds.length > 0) {
    db.delete(roleAssignmentPolityLinks).where(inArray(roleAssignmentPolityLinks.roleAssignmentId, existingRoleAssignmentIds)).run();
    db.delete(roleAssignmentDynastyLinks).where(inArray(roleAssignmentDynastyLinks.roleAssignmentId, existingRoleAssignmentIds)).run();
    db.delete(role).where(inArray(role.id, existingRoleAssignmentIds)).run();
  }

  if (roles.length === 0) {
    return;
  }

  for (const roleItem of roles) {
    const { personId: rolePersonId, polityId, dynastyId, ...roleInput } = roleItem;
    const result = db.insert(role).values(roleInput).run();
    const roleAssignmentId = Number(result.lastInsertRowid);
    db.insert(roleAssignmentPersonLinks).values({ roleAssignmentId, personId: rolePersonId }).run();

    if (polityId != null) {
      db.insert(roleAssignmentPolityLinks).values({ roleAssignmentId, polityId }).run();
    }

    if (dynastyId != null) {
      db.insert(roleAssignmentDynastyLinks).values({ roleAssignmentId, dynastyId }).run();
    }
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

export function getPersonPeriodLinks(personIds: number[]) {
  if (personIds.length === 0) return [];
  return db.select().from(personPeriodLinks).where(inArray(personPeriodLinks.personId, personIds)).all();
}
