import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { formatTimeExpression } from "@/lib/time-expression/format";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { DynastyInput, PolityInput } from "@/features/polities/schema";
import { listRegions } from "@/server/repositories/regions";
import {
  createPolity,
  deletePolity,
  getPolityById,
  getPolityRegionIds,
  listPolities,
  updatePolity
} from "@/server/repositories/polities";
import {
  createDynasty,
  deleteDynasty,
  getDynastyById,
  getDynastyRegionIds,
  listDynasties,
  updateDynasty
} from "@/server/repositories/dynasties";
import { getRelatedEvents } from "@/server/services/event-references";

export function getPolityOptions() {
  return listPolities().map((polity) => ({ id: polity.id, name: polity.name }));
}

export function getRegionOptions() {
  return listRegions().map((region) => ({ id: region.id, name: region.name }));
}

export function getPolityListView(query?: string) {
  const normalizedQuery = normalizeQuery(query);
  const polities = listPolities();
  const regions = listRegions();
  const links = getPolityRegionIds(polities.map((polity) => polity.id));
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));

  return polities
    .map((polity) => ({
      ...polity,
      timeLabel: formatStoredTime("time", polity),
      regionNames: links
        .filter((link) => link.polityId === polity.id)
        .map((link) => regionNameById.get(link.regionId))
        .filter((name): name is string => Boolean(name))
    }))
    .filter((polity) => matchesQuery([polity.name, polity.aliases, polity.note, polity.regionNames.join(", ")], normalizedQuery));
}

export function getDynastyListView() {
  const dynasties = listDynasties();
  const polities = listPolities();
  const polityNameById = new Map(polities.map((polity) => [polity.id, polity.name]));
  const regions = listRegions();
  const regionNameById = new Map(regions.map((region) => [region.id, region.name]));
  const links = getDynastyRegionIds(dynasties.map((dynasty) => dynasty.id));

  return dynasties.map((dynasty) => ({
    ...dynasty,
    polityName: polityNameById.get(dynasty.polityId) ?? "不明",
    timeLabel: formatStoredTime("time", dynasty),
    regionNames: links
      .filter((link) => link.dynastyId === dynasty.id)
      .map((link) => regionNameById.get(link.regionId))
      .filter((name): name is string => Boolean(name))
  }));
}

export function getPolityDetailView(id: number) {
  const polity = getPolityById(id);
  if (!polity) {
    return null;
  }

  const dynasties = listDynasties().filter((dynasty) => dynasty.polityId === polity.id);
  const regions = listRegions();
  const linkedRegionIds = getPolityRegionIds([polity.id]).map((link) => link.regionId);

  return {
    polity,
    dynasties,
    regions: regions.filter((region) => linkedRegionIds.includes(region.id)),
    relatedEvents: getRelatedEvents({ polityId: id }),
    timeLabel: formatStoredTime("time", polity),
    defaultTimeExpression: extractTimeExpression("time", polity)
  };
}

export function getDynastyDetailView(id: number) {
  const dynasty = getDynastyById(id);
  if (!dynasty) {
    return null;
  }

  const polity = getPolityById(dynasty.polityId);
  const regions = listRegions();
  const linkedRegionIds = getDynastyRegionIds([dynasty.id]).map((link) => link.regionId);

  return {
    dynasty,
    polity,
    regions: regions.filter((region) => linkedRegionIds.includes(region.id)),
    relatedEvents: getRelatedEvents({ dynastyId: id }),
    timeLabel: formatStoredTime("time", dynasty),
    defaultTimeExpression: extractTimeExpression("time", dynasty)
  };
}

export function createPolityFromInput(input: PolityInput) {
  return createPolity(
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
}

export function updatePolityFromInput(id: number, input: PolityInput) {
  updatePolity(
    id,
    {
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
}

export function removePolity(id: number) {
  deletePolity(id);
}

export function createDynastyFromInput(input: DynastyInput) {
  return createDynasty(
    {
      polityId: input.polityId,
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
}

export function updateDynastyFromInput(id: number, input: DynastyInput) {
  updateDynasty(
    id,
    {
      polityId: input.polityId,
      name: input.name,
      aliases: joinAliases(input.aliases),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
}

export function removeDynasty(id: number) {
  deleteDynasty(id);
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
