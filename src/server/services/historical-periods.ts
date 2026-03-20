import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { HistoricalPeriodInput } from "@/features/periods/schema";
import { getPersonPeriodLinks, listPeopleDetailed } from "@/server/repositories/people-detail";
import {
  createHistoricalPeriod,
  deleteHistoricalPeriod,
  getHistoricalPeriodById,
  getHistoricalPeriodRegionIds,
  listHistoricalPeriods,
  updateHistoricalPeriod
} from "@/server/repositories/historical-periods";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { getRelatedEvents } from "@/server/services/event-references";
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { getPeriodCategoryOptions } from "@/server/services/period-categories";
import { getCitationListForTarget } from "@/server/services/sources";

export function getHistoricalPeriodFormOptions() {
  return {
    categories: getPeriodCategoryOptions(),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name }))
  };
}

type HistoricalPeriodsListFilters = {
  query?: string;
  categoryId?: number;
  polityId?: number;
  regionId?: number;
};

export function getHistoricalPeriodsListView(filters: HistoricalPeriodsListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const periods = listHistoricalPeriods();
  const categories = new Map(getPeriodCategoryOptions().map((item) => [item.id, item.name]));
  const polities = new Map(listPolities().map((item) => [item.id, item.name]));
  const regions = new Map(listRegions().map((item) => [item.id, item.name]));
  const regionLinks = getHistoricalPeriodRegionIds(periods.map((period) => period.id));

  return periods
    .map((period) => ({
      ...period,
      categoryName: categories.get(period.categoryId) ?? "不明",
      polityName: period.polityId ? polities.get(period.polityId) ?? null : null,
      regionNames: regionLinks
        .filter((link) => link.periodId === period.id)
        .map((link) => regions.get(link.regionId))
        .filter((name): name is string => Boolean(name)),
      regionIds: regionLinks.filter((link) => link.periodId === period.id).map((link) => link.regionId),
      timeLabel: formatStoredTime("time", period)
    }))
    .filter((period) => {
      if (filters.categoryId && period.categoryId !== filters.categoryId) {
        return false;
      }

      if (filters.polityId && period.polityId !== filters.polityId) {
        return false;
      }

      if (filters.regionId && !period.regionIds.includes(filters.regionId)) {
        return false;
      }

      return true;
    })
    .filter((period) =>
      matchesQuery(
        [period.name, period.aliases, period.description, period.note, period.categoryName, period.polityName, period.regionLabel, period.regionNames.join(", ")],
        normalizedQuery
      )
    );
}

export function getHistoricalPeriodDetailView(id: number) {
  const period = getHistoricalPeriodById(id);
  if (!period) {
    return null;
  }

  const options = getHistoricalPeriodFormOptions();
  const linkedRegionIds = getHistoricalPeriodRegionIds([id]).map((link) => link.regionId);
  const people = listPeopleDetailed();
  const relatedPeople = getPersonPeriodLinks(people.map((person) => person.id))
    .filter((link) => link.periodId === id)
    .map((link) => people.find((person) => person.id === link.personId))
    .filter((person): person is NonNullable<typeof person> => Boolean(person));

  return {
    period,
    categoryName: options.categories.find((item) => item.id === period.categoryId)?.name ?? "不明",
    polityName: period.polityId ? options.polities.find((item) => item.id === period.polityId)?.name ?? null : null,
    polity: period.polityId ? options.polities.find((item) => item.id === period.polityId) ?? null : null,
    category: options.categories.find((item) => item.id === period.categoryId) ?? null,
    regions: options.regions.filter((item) => linkedRegionIds.includes(item.id)),
    relatedPeople: dedupePeople(relatedPeople),
    relatedEvents: getRelatedEvents({ periodId: id }),
    timeLabel: formatStoredTime("time", period),
    defaultTimeExpression: extractTimeExpression("time", period),
    formOptions: options,
    citations: getCitationListForTarget("historical_period", id),
    changeHistory: getHistoryView("historical_period", id)
  };
}

export function createHistoricalPeriodFromInput(input: HistoricalPeriodInput) {
  const id = createHistoricalPeriod(
    {
      categoryId: input.categoryId,
      polityId: input.polityId ?? null,
      name: input.name,
      regionLabel: nullable(input.regionLabel),
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
  recordChangeHistory({
    targetType: "historical_period",
    targetId: id,
    action: "create",
    snapshot: buildHistoricalPeriodHistorySnapshot(id)
  });
  return id;
}

export function updateHistoricalPeriodFromInput(id: number, input: HistoricalPeriodInput) {
  const before = buildHistoricalPeriodHistorySnapshot(id);
  updateHistoricalPeriod(
    id,
    {
      categoryId: input.categoryId,
      polityId: input.polityId ?? null,
      name: input.name,
      regionLabel: nullable(input.regionLabel),
      aliases: joinAliases(input.aliases),
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredTime("time", input.timeExpression)
    },
    input.regionIds
  );
  recordChangeHistory({
    targetType: "historical_period",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function removeHistoricalPeriod(id: number) {
  const snapshot = buildHistoricalPeriodHistorySnapshot(id);
  deleteHistoricalPeriod(id);
  recordChangeHistory({
    targetType: "historical_period",
    targetId: id,
    action: "delete",
    snapshot
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

function buildHistoricalPeriodHistorySnapshot(id: number) {
  const period = getHistoricalPeriodById(id);
  if (!period) {
    return { id };
  }

  return {
    ...period,
    regionIds: getHistoricalPeriodRegionIds([id]).map((link) => link.regionId)
  };
}
