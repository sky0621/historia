import { db } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { PersonInput } from "@/features/people/schema";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listDynasties } from "@/server/repositories/dynasties";
import {
  createPerson,
  deletePerson,
  getPersonById,
  getPersonPeriodLinks,
  getPersonRegionLinks,
  getPersonReligionLinks,
  getPersonSectLinks,
  listPeopleDetailed,
  replacePersonPeriodLinks,
  replacePersonRegionLinks,
  replacePersonReligionLinks,
  replacePersonSectLinks,
  replaceRoleAssignments,
  updatePerson
} from "@/server/repositories/people-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listSects } from "@/server/repositories/sects";

export function getPersonOptions() {
  return listPeopleDetailed().map((person) => ({ id: person.id, name: person.name }));
}

export function getPersonFormOptions() {
  return {
    regions: listRegions().map((item) => ({ id: item.id, name: item.name })),
    religions: listReligions().map((item) => ({ id: item.id, name: item.name })),
    sects: listSects().map((item) => ({ id: item.id, name: item.name })),
    periods: listHistoricalPeriods().map((item) => ({ id: item.id, name: item.name })),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    dynasties: listDynasties().map((item) => ({ id: item.id, name: item.name }))
  };
}

export function getPeopleListView() {
  const people = listPeopleDetailed();
  const regions = listRegions();
  const regionById = new Map(regions.map((region) => [region.id, region.name]));
  const regionLinks = getPersonRegionLinks(people.map((person) => person.id));
  const roles = getRoleAssignmentsByPersonIds(people.map((person) => person.id));
  const polities = listPolities();
  const dynasties = listDynasties();
  const polityById = new Map(polities.map((polity) => [polity.id, polity.name]));
  const dynastyById = new Map(dynasties.map((dynasty) => [dynasty.id, dynasty.name]));

  return people.map((person) => ({
    ...person,
    birthLabel: formatStoredTime("birth", person),
    deathLabel: formatStoredTime("death", person),
    lifeLabel: [formatStoredTime("birth", person), formatStoredTime("death", person)].join(" - "),
    regionNames: regionLinks
      .filter((link) => link.personId === person.id)
      .map((link) => regionById.get(link.regionId))
      .filter((name): name is string => Boolean(name)),
    roles: roles.filter((role) => role.personId === person.id).map((role) => ({
      ...role,
      affiliationName:
        (role.dynastyId ? dynastyById.get(role.dynastyId) : undefined) ??
        (role.polityId ? polityById.get(role.polityId) : undefined) ??
        ""
    }))
  }));
}

export function getPersonDetailView(id: number) {
  const person = getPersonById(id);
  if (!person) {
    return null;
  }

  const options = getPersonFormOptions();
  const regionLinks = getPersonRegionLinks([id]).map((link) => link.regionId);
  const religionLinks = getPersonReligionLinks([id]).map((link) => link.religionId);
  const sectLinks = getPersonSectLinks([id]).map((link) => link.sectId);
  const periodLinks = getPersonPeriodLinks([id]).map((link) => link.periodId);
  const roles = getRoleAssignmentsByPersonIds([id]);

  return {
    person,
    regions: options.regions.filter((item) => regionLinks.includes(item.id)),
    religions: options.religions.filter((item) => religionLinks.includes(item.id)),
    sects: options.sects.filter((item) => sectLinks.includes(item.id)),
    periods: options.periods.filter((item) => periodLinks.includes(item.id)),
    roles: roles.map((role) => ({
      ...role,
      polityName: options.polities.find((item) => item.id === role.polityId)?.name ?? null,
      dynastyName: options.dynasties.find((item) => item.id === role.dynastyId)?.name ?? null,
      timeLabel: formatStoredTime("time", role),
      defaultTimeExpression: extractTimeExpression("time", role)
    })),
    defaultBirthTimeExpression: extractTimeExpression("birth", person),
    defaultDeathTimeExpression: extractTimeExpression("death", person),
    lifeLabel: [formatStoredTime("birth", person), formatStoredTime("death", person)].join(" - "),
    formOptions: options
  };
}

export function createPersonFromInput(input: PersonInput) {
  return db.transaction(() => {
    const personId = createPerson({
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("birth", input.birthTimeExpression),
      ...toStoredTime("death", input.deathTimeExpression)
    });

    replacePersonRegionLinks(personId, input.regionIds);
    replacePersonReligionLinks(personId, input.religionIds);
    replacePersonSectLinks(personId, input.sectIds);
    replacePersonPeriodLinks(personId, input.periodIds);
    replaceRoleAssignments(personId, input.roles.map((role) => ({
      personId,
      title: role.title,
      polityId: role.polityId ?? null,
      dynastyId: role.dynastyId ?? null,
      note: nullable(role.note),
      isIncumbent: role.isIncumbent,
      ...toStoredTime("time", role.timeExpression)
    })));

    return personId;
  });
}

export function updatePersonFromInput(id: number, input: PersonInput) {
  db.transaction(() => {
    updatePerson(id, {
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("birth", input.birthTimeExpression),
      ...toStoredTime("death", input.deathTimeExpression)
    });

    replacePersonRegionLinks(id, input.regionIds);
    replacePersonReligionLinks(id, input.religionIds);
    replacePersonSectLinks(id, input.sectIds);
    replacePersonPeriodLinks(id, input.periodIds);
    replaceRoleAssignments(id, input.roles.map((role) => ({
      personId: id,
      title: role.title,
      polityId: role.polityId ?? null,
      dynastyId: role.dynastyId ?? null,
      note: nullable(role.note),
      isIncumbent: role.isIncumbent,
      ...toStoredTime("time", role.timeExpression)
    })));
  });
}

export function removePerson(id: number) {
  db.transaction(() => {
    replacePersonRegionLinks(id, []);
    replacePersonReligionLinks(id, []);
    replacePersonSectLinks(id, []);
    replacePersonPeriodLinks(id, []);
    replaceRoleAssignments(id, []);
    deletePerson(id);
  });
}

function joinAliases(aliases: string[]) {
  return aliases.length > 0 ? aliases.join(", ") : null;
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredTime(prefix: string, value: TimeExpressionInput | undefined) {
  const record = toTimeExpressionRecord(value);

  return {
    [`${prefix}CalendarEra`]: record?.calendarEra ?? null,
    [`${prefix}StartYear`]: record?.startYear ?? null,
    [`${prefix}EndYear`]: record?.endYear ?? null,
    [`${prefix}IsApproximate`]: record?.isApproximate ?? false,
    [`${prefix}Precision`]: record?.precision ?? null,
    [`${prefix}DisplayLabel`]: record?.displayLabel ?? null
  };
}

function extractTimeExpression(prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value[`${prefix}CalendarEra`] as "BCE" | "CE" | null) ?? "CE",
    startYear: (value[`${prefix}StartYear`] as number | null) ?? null,
    endYear: (value[`${prefix}EndYear`] as number | null) ?? null,
    isApproximate: Boolean(value[`${prefix}IsApproximate`]),
    precision: (value[`${prefix}Precision`] as string | null) ?? "year",
    displayLabel: (value[`${prefix}DisplayLabel`] as string | null) ?? null
  });
}

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = extractTimeExpression(prefix, value);
  return extracted ? formatTimeExpression(extracted) : "年未詳";
}
