import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { formatTimeExpression } from "@/lib/time-expression/format";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { ReligionInput, SectInput } from "@/features/religions/schema";
import { listPeople } from "@/server/repositories/people";
import {
  getPersonReligionLinks,
  getPersonSectLinks,
  listPeopleDetailed
} from "@/server/repositories/people-detail";
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

export function getReligionOptions() {
  return listReligions().map((religion) => ({ id: religion.id, name: religion.name }));
}

export function getRegionOptions() {
  return listRegions().map((region) => ({ id: region.id, name: region.name }));
}

export function getFounderOptions() {
  return listPeople().map((person) => ({ id: person.id, name: person.name }));
}

type ReligionListFilters = {
  query?: string;
  regionId?: number;
  hasFounders?: boolean;
};

export function getReligionListView(filters: ReligionListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const religions = listReligions();
  const regions = listRegions();
  const people = listPeople();
  const regionLinks = getReligionRegionIds(religions.map((religion) => religion.id));
  const founderLinks = getReligionFounderIds(religions.map((religion) => religion.id));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const personNameById = new Map(people.map((person) => [person.id, person.name]));

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

export function getSectListView(query?: string) {
  const normalizedQuery = normalizeQuery(query);
  const sects = listSects();
  const religions = listReligions();
  const regions = listRegions();
  const people = listPeople();
  const regionLinks = getSectRegionIds(sects.map((sect) => sect.id));
  const founderLinks = getSectFounderIds(sects.map((sect) => sect.id));
  const religionNameById = new Map(religions.map((religion) => [religion.id, religion.name]));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const personNameById = new Map(people.map((person) => [person.id, person.name]));

  return sects
    .map((sect) => ({
      ...sect,
      religionName: religionNameById.get(sect.religionId) ?? "不明",
      timeLabel: formatStoredTime("time", sect),
      regionNames: regionLinks
        .filter((link) => link.sectId === sect.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      founderNames: founderLinks
        .filter((link) => link.sectId === sect.id)
        .map((link) => personNameById.get(link.personId))
        .filter((name): name is string => Boolean(name))
    }))
    .filter((sect) =>
      matchesQuery(
        [sect.name, sect.aliases, sect.description, sect.note, sect.religionName, sect.regionNames.join(", "), sect.founderNames.join(", ")],
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
  const people = listPeople();
  const detailedPeople = listPeopleDetailed();
  const regionIds = getReligionRegionIds([id]).map((link) => link.regionId);
  const founderIds = getReligionFounderIds([id]).map((link) => link.personId);
  const religionPeople = getPersonReligionLinks(detailedPeople.map((person) => person.id))
    .filter((link) => link.religionId === id)
    .map((link) => detailedPeople.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  return {
    religion,
    sects,
    regions: regions.filter((region) => regionIds.includes(region.id)),
    founders: people.filter((person) => founderIds.includes(person.id)),
    relatedPeople: dedupePeople(religionPeople),
    relatedEvents: getRelatedEvents({ religionId: id }),
    timeLabel: formatStoredTime("time", religion),
    defaultTimeExpression: extractTimeExpression("time", religion)
  };
}

export function getSectDetailView(id: number) {
  const sect = getSectById(id);
  if (!sect) {
    return null;
  }

  const religion = getReligionById(sect.religionId);
  const regions = listRegions();
  const people = listPeople();
  const detailedPeople = listPeopleDetailed();
  const regionIds = getSectRegionIds([id]).map((link) => link.regionId);
  const founderIds = getSectFounderIds([id]).map((link) => link.personId);
  const sectPeople = getPersonSectLinks(detailedPeople.map((person) => person.id))
    .filter((link) => link.sectId === id)
    .map((link) => detailedPeople.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  return {
    sect,
    religion,
    regions: regions.filter((region) => regionIds.includes(region.id)),
    founders: people.filter((person) => founderIds.includes(person.id)),
    relatedPeople: dedupePeople(sectPeople),
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
      ...toStoredTime("time", input.timeExpression)
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
      ...toStoredTime("time", input.timeExpression)
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
      religionId: input.religionId,
      name: input.name,
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds,
    input.founderIds
  );
}

export function updateSectFromInput(id: number, input: SectInput) {
  updateSect(
    id,
    {
      religionId: input.religionId,
      name: input.name,
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
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

function dedupePeople(people: Array<{ id: number; name: string }>) {
  const seen = new Set<number>();

  return people.filter((person) => {
    if (seen.has(person.id)) {
      return false;
    }

    seen.add(person.id);
    return true;
  });
}
