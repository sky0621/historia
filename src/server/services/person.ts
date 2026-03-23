import { db } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { PersonInput, RoleAssignmentInput } from "@/features/person/schema";
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
  listPersonDetailed,
  replacePersonPeriodLinks,
  replacePersonRegionLinks,
  replacePersonReligionLinks,
  replacePersonSectLinks,
  replaceRoleAssignments,
  updatePerson
} from "@/server/repositories/person-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listSects } from "@/server/repositories/sects";
import { getRelatedEvents } from "@/server/services/event-references";
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { getCitationListForTarget } from "@/server/services/sources";

export function getPersonOptions() {
  return listPersonDetailed().map((person) => ({ id: person.id, name: person.name }));
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

type PersonListFilters = {
  query?: string;
  regionId?: number;
  religionId?: number;
  sectId?: number;
  periodId?: number;
  polityId?: number;
  dynastyId?: number;
  hasRoles?: boolean;
};

export function getPersonListView(filters: PersonListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const person = listPersonDetailed();
  const regions = listRegions();
  const regionById = new Map(regions.map((region) => [region.id, region.name]));
  const regionLinks = getPersonRegionLinks(person.map((person) => person.id));
  const religionLinks = getPersonReligionLinks(person.map((person) => person.id));
  const sectLinks = getPersonSectLinks(person.map((person) => person.id));
  const periodLinks = getPersonPeriodLinks(person.map((person) => person.id));
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));
  const polities = listPolities();
  const dynasties = listDynasties();
  const religions = listReligions();
  const sects = listSects();
  const periods = listHistoricalPeriods();
  const polityById = new Map(polities.map((polity) => [polity.id, polity.name]));
  const dynastyById = new Map(dynasties.map((dynasty) => [dynasty.id, dynasty.name]));
  const religionById = new Map(religions.map((religion) => [religion.id, religion.name]));
  const sectById = new Map(sects.map((sect) => [sect.id, sect.name]));
  const periodById = new Map(periods.map((period) => [period.id, period.name]));

  return person
    .map((person) => ({
      ...person,
      birthLabel: formatStoredTime("birth", person),
      deathLabel: formatStoredTime("death", person),
      lifeLabel: [formatStoredTime("birth", person), formatStoredTime("death", person)].join(" - "),
      regionNames: regionLinks
        .filter((link) => link.personId === person.id)
        .map((link) => regionById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: regionLinks.filter((link) => link.personId === person.id).map((link) => link.regionId),
      religionNames: religionLinks
        .filter((link) => link.personId === person.id)
        .map((link) => religionById.get(link.religionId))
        .filter((name): name is string => Boolean(name)),
      religionIds: religionLinks.filter((link) => link.personId === person.id).map((link) => link.religionId),
      sectNames: sectLinks
        .filter((link) => link.personId === person.id)
        .map((link) => sectById.get(link.sectId))
        .filter((name): name is string => Boolean(name)),
      sectIds: sectLinks.filter((link) => link.personId === person.id).map((link) => link.sectId),
      periodNames: periodLinks
        .filter((link) => link.personId === person.id)
        .map((link) => periodById.get(link.periodId))
        .filter((name): name is string => Boolean(name)),
      periodIds: periodLinks.filter((link) => link.personId === person.id).map((link) => link.periodId),
      roles: roles.filter((role) => role.personId === person.id).map((role) => ({
        ...role,
        affiliationName:
          (role.dynastyId ? dynastyById.get(role.dynastyId) : undefined) ??
          (role.polityId ? polityById.get(role.polityId) : undefined) ??
          ""
      }))
    }))
    .filter((person) =>
      matchesPersonFilters(person, normalizedQuery, filters)
    );
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
    relatedEvents: getRelatedEvents({ personId: id }),
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
    formOptions: options,
    citations: getCitationListForTarget("person", id),
    changeHistory: getHistoryView("person", id)
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

    recordChangeHistory({
      targetType: "person",
      targetId: personId,
      action: "create",
      snapshot: buildPersonHistorySnapshot(personId)
    });

    return personId;
  });
}

export function updatePersonFromInput(id: number, input: PersonInput) {
  db.transaction(() => {
    const before = buildPersonHistorySnapshot(id);
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

    recordChangeHistory({
      targetType: "person",
      targetId: id,
      action: "update",
      snapshot: before
    });
  });
}

export function removePerson(id: number) {
  db.transaction(() => {
    const snapshot = buildPersonHistorySnapshot(id);
    replacePersonRegionLinks(id, []);
    replacePersonReligionLinks(id, []);
    replacePersonSectLinks(id, []);
    replacePersonPeriodLinks(id, []);
    replaceRoleAssignments(id, []);
    deletePerson(id);
    recordChangeHistory({
      targetType: "person",
      targetId: id,
      action: "delete",
      snapshot
    });
  });
}

export function appendRoleAssignmentsToPerson(id: number, roles: RoleAssignmentInput[]) {
  const person = getPersonById(id);
  if (!person) {
    throw new Error(`人物が見つかりません: ${id}`);
  }

  const before = buildPersonHistorySnapshot(id);
  const existingRoles = getRoleAssignmentsByPersonIds([id]);

  replaceRoleAssignments(
    id,
    [
      ...existingRoles,
      ...roles.map((role) => ({
        personId: id,
        title: role.title,
        polityId: role.polityId ?? null,
        dynastyId: role.dynastyId ?? null,
        note: nullable(role.note),
        isIncumbent: role.isIncumbent,
        ...toStoredTime("time", role.timeExpression)
      }))
    ]
  );

  recordChangeHistory({
    targetType: "person",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function replaceRoleAssignmentsOnPerson(id: number, roles: RoleAssignmentInput[]) {
  const person = getPersonById(id);
  if (!person) {
    throw new Error(`人物が見つかりません: ${id}`);
  }

  const before = buildPersonHistorySnapshot(id);
  replaceRoleAssignments(
    id,
    roles.map((role) => ({
      personId: id,
      title: role.title,
      polityId: role.polityId ?? null,
      dynastyId: role.dynastyId ?? null,
      note: nullable(role.note),
      isIncumbent: role.isIncumbent,
      ...toStoredTime("time", role.timeExpression)
    }))
  );

  recordChangeHistory({
    targetType: "person",
    targetId: id,
    action: "update",
    snapshot: before
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

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("ja-JP").includes(query));
}

function buildPersonHistorySnapshot(id: number) {
  const person = getPersonById(id);
  if (!person) {
    return { id };
  }

  return {
    ...person,
    regionIds: getPersonRegionLinks([id]).map((link) => link.regionId),
    religionIds: getPersonReligionLinks([id]).map((link) => link.religionId),
    sectIds: getPersonSectLinks([id]).map((link) => link.sectId),
    periodIds: getPersonPeriodLinks([id]).map((link) => link.periodId),
    roles: getRoleAssignmentsByPersonIds([id])
  };
}

function matchesPersonFilters(
  person: {
    name: string;
    aliases: string | null;
    note: string | null;
    regionNames: string[];
    religionNames: string[];
    sectNames: string[];
    periodNames: string[];
    regionIds: number[];
    religionIds: number[];
    sectIds: number[];
    periodIds: number[];
    roles: Array<{ title: string; affiliationName: string; polityId: number | null; dynastyId: number | null }>;
    id: number;
  },
  query: string,
  filters: PersonListFilters
) {
  if (
    !matchesQuery(
      [
        person.name,
        person.aliases,
        person.note,
        person.regionNames.join(", "),
        person.religionNames.join(", "),
        person.sectNames.join(", "),
        person.periodNames.join(", "),
        person.roles.map((role) => `${role.title} ${role.affiliationName}`.trim()).join(", ")
      ],
      query
    )
  ) {
    return false;
  }

  if (filters.hasRoles && person.roles.length === 0) {
    return false;
  }

  if (filters.regionId && !person.regionIds.includes(filters.regionId)) {
    return false;
  }

  if (filters.religionId && !person.religionIds.includes(filters.religionId)) {
    return false;
  }

  if (filters.sectId && !person.sectIds.includes(filters.sectId)) {
    return false;
  }

  if (filters.periodId && !person.periodIds.includes(filters.periodId)) {
    return false;
  }

  if (filters.polityId && !person.roles.some((role) => role.polityId === filters.polityId)) {
    return false;
  }

  if (filters.dynastyId && !person.roles.some((role) => role.dynastyId === filters.dynastyId)) {
    return false;
  }

  return true;
}
