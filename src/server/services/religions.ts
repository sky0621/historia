import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { formatTimeExpression } from "@/lib/time-expression/format";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { ReligionInput, SectInput } from "@/features/religions/schema";
import { listPerson } from "@/server/repositories/person";
import {
  getPersonReligionLinks,
  getPersonSectLinks,
  listPersonDetailed
} from "@/server/repositories/person-detail";
import { listRegions } from "@/server/repositories/regions";
import {
  createReligion,
  deleteReligion,
  getReligionById,
  getReligionFounderIds,
  getReligionRegionIds,
  listReligions,
  updateReligion
} from "@/server/repositories/religions";
import {
  createSect,
  deleteSect,
  getSectById,
  getSectFounderIds,
  getSectRegionIds,
  listSects,
  updateSect
} from "@/server/repositories/sects";
import { getRelatedEvents } from "@/server/services/event-references";
import { getCitationListForTarget } from "@/server/services/sources";
import { getSectHierarchyView } from "@/server/services/relations";

export function getReligionOptions() {
  return listReligions().map((religion) => ({ id: religion.id, name: religion.name }));
}

export function getRegionOptions() {
  return listRegions().map((region) => ({ id: region.id, name: region.name }));
}

export function getFounderOptions() {
  return listPerson().map((person) => ({ id: person.id, name: person.name }));
}

export function getParentSectOptions(excludeId?: number) {
  return listSects().filter((sect) => sect.id !== excludeId).map((sect) => ({ id: sect.id, name: sect.name }));
}

type ReligionListFilters = {
  query?: string;
  regionId?: number;
  hasFounders?: boolean;
};

type SectListFilters = {
  query?: string;
  religionId?: number;
  regionId?: number;
  hasFounders?: boolean;
};

export function getReligionListView(filters: ReligionListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const religions = listReligions();
  const regions = listRegions();
  const person = listPerson();
  const regionLinks = getReligionRegionIds(religions.map((religion) => religion.id));
  const founderLinks = getReligionFounderIds(religions.map((religion) => religion.id));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const personNameById = new Map(person.map((person) => [person.id, person.name]));

  return religions
    .map((religion) => ({
      ...religion,
      timeLabel: formatStoredTime("time", religion),
      regionNames: regionLinks
        .filter((link) => link.religionId === religion.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: regionLinks.filter((link) => link.religionId === religion.id).map((link) => link.regionId),
      founderNames: founderLinks
        .filter((link) => link.religionId === religion.id)
        .map((link) => personNameById.get(link.personId))
        .filter((name): name is string => Boolean(name)),
      founderIds: founderLinks.filter((link) => link.religionId === religion.id).map((link) => link.personId)
    }))
    .filter((religion) => {
      if (filters.regionId && !religion.regionIds.includes(filters.regionId)) {
        return false;
      }

      if (filters.hasFounders && religion.founderIds.length === 0) {
        return false;
      }

      return true;
    })
    .filter((religion) =>
      matchesQuery(
        [religion.name, religion.aliases, religion.description, religion.note, religion.regionNames.join(", "), religion.founderNames.join(", ")],
        normalizedQuery
      )
    );
}

export function getSectListView(filters: SectListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const sects = listSects();
  const religions = listReligions();
  const regions = listRegions();
  const person = listPerson();
  const regionLinks = getSectRegionIds(sects.map((sect) => sect.id));
  const founderLinks = getSectFounderIds(sects.map((sect) => sect.id));
  const religionNameById = new Map(religions.map((religion) => [religion.id, religion.name]));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const personNameById = new Map(person.map((person) => [person.id, person.name]));
  const parentSectNameById = new Map(sects.map((sect) => [sect.id, sect.name]));

  return sects
    .map((sect) => ({
      ...sect,
      religionName: religionNameById.get(sect.religionId) ?? "不明",
      timeLabel: formatStoredTime("time", sect),
      religionId: sect.religionId,
      parentSectId: sect.parentSectId,
      parentSectName: sect.parentSectId ? parentSectNameById.get(sect.parentSectId) ?? null : null,
      regionNames: regionLinks
        .filter((link) => link.sectId === sect.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: regionLinks.filter((link) => link.sectId === sect.id).map((link) => link.regionId),
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

      if (filters.regionId && !sect.regionIds.includes(filters.regionId)) {
        return false;
      }

      if (filters.hasFounders && sect.founderIds.length === 0) {
        return false;
      }

      return true;
    })
    .filter((sect) =>
      matchesQuery(
        [sect.name, sect.aliases, sect.description, sect.note, sect.religionName, sect.parentSectName, sect.regionNames.join(", "), sect.founderNames.join(", ")],
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
  const regions = listRegions();
  const person = listPerson();
  const detailedPerson = listPersonDetailed();
  const regionIds = getReligionRegionIds([id]).map((link) => link.regionId);
  const founderIds = getReligionFounderIds([id]).map((link) => link.personId);
  const religionPerson = getPersonReligionLinks(detailedPerson.map((person) => person.id))
    .filter((link) => link.religionId === id)
    .map((link) => detailedPerson.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  return {
    religion,
    sects,
    regions: regions.filter((region) => regionIds.includes(region.id)),
    founders: person.filter((person) => founderIds.includes(person.id)),
    relatedPerson: dedupePerson(religionPerson),
    relatedEvents: getRelatedEvents({ religionId: id }),
    timeLabel: formatStoredTime("time", religion),
    defaultTimeExpression: extractTimeExpression("time", religion),
    citations: getCitationListForTarget("religion", id)
  };
}

export function getSectDetailView(id: number) {
  const sect = getSectById(id);
  if (!sect) {
    return null;
  }

  const religion = getReligionById(sect.religionId);
  const regions = listRegions();
  const person = listPerson();
  const detailedPerson = listPersonDetailed();
  const regionIds = getSectRegionIds([id]).map((link) => link.regionId);
  const founderIds = getSectFounderIds([id]).map((link) => link.personId);
  const sectPerson = getPersonSectLinks(detailedPerson.map((person) => person.id))
    .filter((link) => link.sectId === id)
    .map((link) => detailedPerson.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  const hierarchy = getSectHierarchyView(id);

  return {
    sect,
    religion,
    parentSect: hierarchy.parent,
    childSects: hierarchy.children,
    regions: regions.filter((region) => regionIds.includes(region.id)),
    founders: person.filter((person) => founderIds.includes(person.id)),
    relatedPerson: dedupePerson(sectPerson),
    relatedEvents: getRelatedEvents({ sectId: id }),
    timeLabel: formatStoredTime("time", sect),
    defaultTimeExpression: extractTimeExpression("time", sect)
  };
}

export function createReligionFromInput(input: ReligionInput) {
  return createReligion(
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime(input.timeExpression)
    },
    input.regionIds,
    input.founderIds
  );
}

export function updateReligionFromInput(id: number, input: ReligionInput) {
  updateReligion(
    id,
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime(input.timeExpression)
    },
    input.regionIds,
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
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime(input.timeExpression)
    },
    input.religionId,
    input.parentSectId ?? null,
    input.regionIds,
    input.founderIds
  );
}

export function updateSectFromInput(id: number, input: SectInput) {
  updateSect(
    id,
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime(input.timeExpression)
    },
    input.religionId,
    input.parentSectId ?? null,
    input.regionIds,
    input.founderIds
  );
}

export function removeSect(id: number) {
  deleteSect(id);
}

function joinAliases(aliases: string[]) {
  return aliases.length > 0 ? aliases.join(", ") : null;
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredTime(value: TimeExpressionInput | undefined) {
  const record = toTimeExpressionRecord(value);

  return {
    fromCalendarEra: record?.calendarEra ?? null,
    fromYear: record?.startYear ?? null,
    fromIsApproximate: record?.isApproximate ?? false,
    toCalendarEra: record?.endYear != null ? (record?.calendarEra ?? null) : null,
    toYear: record?.endYear ?? null,
    toIsApproximate: record?.endYear != null ? (record?.isApproximate ?? false) : false
  };
}

function extractTimeExpression(_prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value.fromCalendarEra as "BCE" | "CE" | null) ?? "CE",
    startYear: (value.fromYear as number | null) ?? null,
    endYear: (value.toYear as number | null) ?? null,
    isApproximate: Boolean(value.fromIsApproximate || value.toIsApproximate),
    precision: "year",
    displayLabel: null
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
