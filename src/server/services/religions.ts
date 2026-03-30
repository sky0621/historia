import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { formatTimeExpression } from "@/lib/time-expression/format";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { ReligionInput, SectInput } from "@/features/religions/schema";
import { listPerson } from "@/server/repositories/person";
import {
  getPersonReligionLinks,
  getPersonSectLinks,
  listPersonDetailed
} from "@/server/repositories/person-detail";
import {
  createReligion,
  deleteReligion,
  getReligionById,
  getReligionFounderIds,
  listReligions,
  updateReligion
} from "@/server/repositories/religions";
import {
  createSect,
  deleteSect,
  getSectById,
  getSectFounderIds,
  listSects,
  updateSect
} from "@/server/repositories/sects";
import { getRelatedEvents } from "@/server/services/event-references";
import { getCitationListForTarget } from "@/server/services/sources";
import { normalizeStoredBoundaryYear, toStoredBoundaryYear } from "@/server/services/time-sentinel";

export function getReligionOptions() {
  return listReligions().map((religion) => ({ id: religion.id, name: religion.name }));
}

export function getFounderOptions() {
  return listPerson().map((person) => ({ id: person.id, name: person.name }));
}

type ReligionListFilters = {
  query?: string;
  hasFounders?: boolean;
};

type SectListFilters = {
  query?: string;
  religionId?: number;
  hasFounders?: boolean;
};

export function getReligionListView(filters: ReligionListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const religions = listReligions();
  const person = listPerson();
  const founderLinks = getReligionFounderIds(religions.map((religion) => religion.id));
  const personNameById = new Map(person.map((person) => [person.id, person.name]));

  return religions
    .map((religion) => ({
      ...religion,
      timeLabel: formatStoredTime("time", religion),
      founderNames: founderLinks
        .filter((link) => link.religionId === religion.id)
        .map((link) => personNameById.get(link.personId))
        .filter((name): name is string => Boolean(name)),
      founderIds: founderLinks.filter((link) => link.religionId === religion.id).map((link) => link.personId)
    }))
    .filter((religion) => {
      if (filters.hasFounders && religion.founderIds.length === 0) {
        return false;
      }

      return true;
    })
    .filter((religion) =>
      matchesQuery(
        [religion.name, religion.description, religion.note, religion.founderNames.join(", ")],
        normalizedQuery
      )
    );
}

export function getSectListView(filters: SectListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const sects = listSects();
  const religions = listReligions();
  const person = listPerson();
  const founderLinks = getSectFounderIds(sects.map((sect) => sect.id));
  const religionNameById = new Map(religions.map((religion) => [religion.id, religion.name]));
  const personNameById = new Map(person.map((person) => [person.id, person.name]));

  return sects
    .map((sect) => ({
      ...sect,
      religionName: religionNameById.get(sect.religionId) ?? "不明",
      timeLabel: formatStoredTime("time", sect),
      religionId: sect.religionId,
      founderNames: founderLinks
        .filter((link) => link.sectId === sect.id)
        .map((link) => personNameById.get(link.personId))
        .filter((name): name is string => Boolean(name)),
      founderIds: founderLinks.filter((link) => link.sectId === sect.id).map((link) => link.personId)
    }))
    .filter((sect) => {
      if (filters.religionId && sect.religionId !== filters.religionId) {
        return false;
      }

      if (filters.hasFounders && sect.founderIds.length === 0) {
        return false;
      }

      return true;
    })
    .filter((sect) =>
      matchesQuery(
        [sect.name, sect.description, sect.note, sect.religionName, sect.founderNames.join(", ")],
        normalizedQuery
      )
    );
}

export function getReligionDetailView(id: number) {
  const religion = getReligionById(id);
  if (!religion) {
    return null;
  }

  const sects = listSects().filter((sect) => sect.religionId === id);
  const person = listPerson();
  const detailedPerson = listPersonDetailed();
  const founderIds = getReligionFounderIds([id]).map((link) => link.personId);
  const religionPerson = getPersonReligionLinks(detailedPerson.map((person) => person.id))
    .filter((link) => link.religionId === id)
    .map((link) => detailedPerson.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  return {
    religion,
    sects,
    founders: person.filter((person) => founderIds.includes(person.id)),
    relatedPerson: dedupePerson(religionPerson),
    relatedEvents: getRelatedEvents({ religionId: id }),
    timeLabel: formatStoredTime("time", religion),
    defaultFromTimeExpression: extractBoundaryTime("from", religion),
    defaultToTimeExpression: extractBoundaryTime("to", religion),
    citations: getCitationListForTarget("religion", id)
  };
}

export function getSectDetailView(id: number) {
  const sect = getSectById(id);
  if (!sect) {
    return null;
  }

  const religion = getReligionById(sect.religionId);
  const person = listPerson();
  const detailedPerson = listPersonDetailed();
  const founderIds = getSectFounderIds([id]).map((link) => link.personId);
  const sectPerson = getPersonSectLinks(detailedPerson.map((person) => person.id))
    .filter((link) => link.sectId === id)
    .map((link) => detailedPerson.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));
  return {
    sect,
    religion,
    founders: person.filter((person) => founderIds.includes(person.id)),
    relatedPerson: dedupePerson(sectPerson),
    relatedEvents: getRelatedEvents({ sectId: id }),
    timeLabel: formatStoredTime("time", sect),
    defaultFromTimeExpression: extractBoundaryTime("from", sect),
    defaultToTimeExpression: extractBoundaryTime("to", sect)
  };
}

export function createReligionFromInput(input: ReligionInput) {
  return createReligion(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.founderIds
  );
}

export function updateReligionFromInput(id: number, input: ReligionInput) {
  updateReligion(
    id,
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.founderIds
  );
}

export function removeReligion(id: number) {
  deleteReligion(id);
}

export function createSectFromInput(input: SectInput) {
  return createSect(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.religionId,
    input.founderIds
  );
}

export function updateSectFromInput(id: number, input: SectInput) {
  updateSect(
    id,
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.religionId,
    input.founderIds
  );
}

export function removeSect(id: number) {
  deleteSect(id);
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredBoundaryTime(prefix: "from" | "to", value: TimeExpressionInput | undefined) {
  const calendarEraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";

  return {
    [calendarEraKey]: value?.calendarEra ?? null,
    [yearKey]: toStoredBoundaryYear(prefix, value?.startYear),
    [approximateKey]: value?.isApproximate ?? false
  };
}

function extractTimeExpression(_prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value.fromCalendarEra as "BCE" | "CE" | null) ?? "CE",
    startYear: normalizeStoredBoundaryYear("from", value.fromYear as number | null | undefined),
    endYear: normalizeStoredBoundaryYear("to", value.toYear as number | null | undefined),
    isApproximate: Boolean(value.fromIsApproximate || value.toIsApproximate),
    precision: "year",
    displayLabel: null
  });
}

function extractBoundaryTime(prefix: "from" | "to", value: Record<string, unknown>) {
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

function dedupePerson(person: Array<{ id: number; name: string }>) {
  const seen = new Set<number>();

  return person.filter((person) => {
    if (seen.has(person.id)) {
      return false;
    }

    seen.add(person.id);
    return true;
  });
}
