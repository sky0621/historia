import { db } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { PersonInput, RoleAssignmentInput } from "@/features/person/schema";
import {
  createPerson,
  deletePerson,
  getPersonById,
  getPersonRegionLinks,
  getPersonReligionLinks,
  getPersonSectLinks,
  listPersonDetailed,
  replacePersonRegionLinks,
  replacePersonReligionLinks,
  replacePersonRoleLinks,
  replacePersonSectLinks,
  replaceRoleAssignments,
  updatePerson
} from "@/server/repositories/person-detail";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { deleteRoleAssignmentsByPersonId, getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listRoles } from "@/server/repositories/roles";
import { listSects } from "@/server/repositories/sects";
import { getRelatedEvents } from "@/server/services/event-references";
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { getPolityOptions } from "@/server/services/polities";
import { getCitationListForTarget } from "@/server/services/sources";
import {
  compareStoredBoundaryRange,
  formatStoredBoundaryRangeForOption,
  normalizeStoredBoundaryYear,
  normalizeStoredPersonBoundaryYear,
  toStoredBoundaryYear,
  toStoredPersonBoundaryYear
} from "@/server/services/time-sentinel";

export function getPersonOptions() {
  return listPersonDetailed().map((person) => ({ id: person.id, name: person.name }));
}

export function getPersonFormOptions() {
  const roles = listRoles();
  const polities = new Map(getPolityOptions().map((item) => [item.id, item]));

  return {
    regions: listRegions().map((item) => ({ id: item.id, name: item.name, parentRegionId: item.parentRegionId })),
    religions: listReligions().map((item) => ({ id: item.id, name: item.name })),
    sects: listSects().map((item) => ({ id: item.id, name: item.name, religionId: item.religionId })),
    roles: roles.map((item) => ({
      id: item.id,
      title: item.title,
      polityName: item.polityId ? (polities.get(item.polityId)?.name ?? null) : null
    }))
  };
}

type PersonListFilters = {
  query?: string;
  regionId?: number;
  religionId?: number;
  sectId?: number;
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
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));
  const religions = listReligions();
  const sects = listSects();
  const religionById = new Map(religions.map((religion) => [religion.id, religion.name]));
  const sectById = new Map(sects.map((sect) => [sect.id, sect.name]));

  return person
    .map((person) => ({
      ...person,
      birthLabel: formatStoredBoundaryRangeForOption(person.fromCalendarEra, person.fromYear, null, null).split(" - ")[0] ?? "不明",
      deathLabel: formatStoredBoundaryRangeForOption(null, null, person.toCalendarEra, person.toYear).split(" - ")[1] ?? "現在",
      lifeLabel: formatStoredBoundaryRangeForOption(person.fromCalendarEra, person.fromYear, person.toCalendarEra, person.toYear),
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
      roles: roles.filter((role) => role.personId === person.id)
    }))
    .filter((person) =>
      matchesPersonFilters(person, normalizedQuery, filters)
    )
    .sort((left, right) => compareStoredBoundaryRange(left, right) || left.name.localeCompare(right.name, "ja-JP"));
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
  const roles = getRoleAssignmentsByPersonIds([id]);

  return {
    person,
    regions: options.regions.filter((item) => regionLinks.includes(item.id)),
    religions: options.religions.filter((item) => religionLinks.includes(item.id)),
    sects: options.sects.filter((item) => sectLinks.includes(item.id)),
    relatedEvents: getRelatedEvents({ personId: id }),
    roles: roles.map((role) => ({
      ...role,
      timeLabel: formatStoredTime("time", role),
      roleLabel: formatRoleLabel(role.title, role.polityId ? options.roles.find((item) => item.id === role.id)?.polityName ?? null : null),
      defaultFromTimeExpression: extractRoleBoundaryTime("from", role),
      defaultToTimeExpression: extractRoleBoundaryTime("to", role)
    })),
    defaultBirthTimeExpression: extractPersonTimeExpression("birth", person),
    defaultDeathTimeExpression: extractPersonTimeExpression("death", person),
    lifeLabel: [formatStoredPersonTime("birth", person), formatStoredPersonTime("death", person)].join(" - "),
    formOptions: options,
    citations: getCitationListForTarget("person", id),
    changeHistory: getHistoryView("person", id)
  };
}

export function createPersonFromInput(input: PersonInput) {
  return db.transaction(() => {
    const personId = createPerson({
      name: input.name,
      description: nullable(input.description),
      reading: nullable(input.reading),
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredPersonTime("birth", input.birthTimeExpression),
      ...toStoredPersonTime("death", input.deathTimeExpression)
    });

    replacePersonRegionLinks(personId, input.regionIds);
    replacePersonReligionLinks(personId, input.religionIds);
    replacePersonSectLinks(personId, input.sectIds);
    replacePersonRoleLinks(personId, input.roles.map((role) => ({
      roleId: role.roleId,
      description: nullable(role.description),
      note: nullable(role.note),
      ...toStoredRoleTime("from", role.fromTimeExpression),
      ...toStoredRoleTime("to", role.toTimeExpression)
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
      description: nullable(input.description),
      reading: nullable(input.reading),
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredPersonTime("birth", input.birthTimeExpression),
      ...toStoredPersonTime("death", input.deathTimeExpression)
    });

    replacePersonRegionLinks(id, input.regionIds);
    replacePersonReligionLinks(id, input.religionIds);
    replacePersonSectLinks(id, input.sectIds);
    replacePersonRoleLinks(id, input.roles.map((role) => ({
      roleId: role.roleId,
      description: nullable(role.description),
      note: nullable(role.note),
      ...toStoredRoleTime("from", role.fromTimeExpression),
      ...toStoredRoleTime("to", role.toTimeExpression)
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
    deleteRoleAssignmentsByPersonId(id);
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
        reading: nullable(role.reading),
        description: nullable(role.description),
        note: nullable(role.note),
        ...toStoredRoleTime("from", role.fromTimeExpression),
        ...toStoredRoleTime("to", role.toTimeExpression)
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
      reading: nullable(role.reading),
      description: nullable(role.description),
      note: nullable(role.note),
      ...toStoredRoleTime("from", role.fromTimeExpression),
      ...toStoredRoleTime("to", role.toTimeExpression)
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

function toStoredRoleTime(prefix: "from" | "to", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value?.calendarEra ?? null,
    [yearKey]: toStoredBoundaryYear(prefix, value?.startYear),
    [approximateKey]: value?.isApproximate ?? false
  };
}

function toStoredPersonTime(prefix: "birth" | "death", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "birth" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "birth" ? "fromYear" : "toYear";
  const approximateKey = prefix === "birth" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value?.calendarEra ?? null,
    [yearKey]: toStoredPersonBoundaryYear(prefix, value?.startYear),
    [approximateKey]: value?.isApproximate ?? false
  };
}

function extractTimeExpression(_prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value.fromCalendarEra as "BCE" | "CE" | null) ?? "CE",
    startYear: normalizeStoredPersonBoundaryYear("birth", value.fromYear as number | null | undefined),
    endYear: normalizeStoredPersonBoundaryYear("death", value.toYear as number | null | undefined),
    isApproximate: Boolean(value.fromIsApproximate || value.toIsApproximate),
    precision: "year",
    displayLabel: null
  });
}

function extractRoleBoundaryTime(prefix: "from" | "to", value: Record<string, unknown>) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";
  const calendarEra = (value[calendarEraKey] as "BCE" | "CE" | null | undefined) ?? null;
  const startYear = normalizeStoredBoundaryYear(prefix, value[yearKey] as number | null | undefined);
  const isApproximate = Boolean(value[approximateKey]);

  if (startYear === null && !isApproximate && calendarEra == null) {
    return undefined;
  }

  return {
    calendarEra: calendarEra ?? "CE",
    startYear: startYear ?? undefined,
    isApproximate,
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function extractPersonTimeExpression(prefix: "birth" | "death", value: Record<string, unknown>) {
  const calendarEraKey = prefix === "birth" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "birth" ? "fromYear" : "toYear";
  const approximateKey = prefix === "birth" ? "fromIsApproximate" : "toIsApproximate";
  const calendarEra = (value[calendarEraKey] as "BCE" | "CE" | null | undefined) ?? null;
  const startYear = normalizeStoredPersonBoundaryYear(prefix, value[yearKey] as number | null | undefined);
  const isApproximate = Boolean(value[approximateKey]);

  if (startYear === null && !isApproximate && calendarEra == null) {
    return undefined;
  }

  return {
    calendarEra: calendarEra ?? "CE",
    startYear: startYear ?? undefined,
    isApproximate,
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = extractTimeExpression(prefix, value);
  return extracted ? formatTimeExpression(extracted) : "年未詳";
}

function formatRoleLabel(title: string, polityName: string | null) {
  return polityName ? `${title}（${polityName}）` : title;
}

function formatStoredPersonTime(prefix: "birth" | "death", value: Record<string, unknown>) {
  const extracted = extractPersonTimeExpression(prefix, value);
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
    roles: getRoleAssignmentsByPersonIds([id])
  };
}

function matchesPersonFilters(
  person: {
    name: string;
    reading: string | null;
    aliases: string | null;
    note: string | null;
    regionNames: string[];
    religionNames: string[];
    sectNames: string[];
    regionIds: number[];
    religionIds: number[];
    sectIds: number[];
    roles: Array<{ title: string }>;
    id: number;
  },
  query: string,
  filters: PersonListFilters
) {
  if (
    !matchesQuery(
      [
        person.name,
        person.reading,
        person.aliases,
        person.note,
        person.regionNames.join(", "),
        person.religionNames.join(", "),
        person.sectNames.join(", "),
        person.roles.map((role) => role.title).join(", ")
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

  return true;
}
