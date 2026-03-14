import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { HistoricalPeriodInput } from "@/features/periods/schema";
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
import { getPeriodCategoryOptions } from "@/server/services/period-categories";

export function getHistoricalPeriodFormOptions() {
  return {
    categories: getPeriodCategoryOptions(),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name }))
  };
}

export function getHistoricalPeriodsListView(query?: string) {
  const normalizedQuery = normalizeQuery(query);
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
      timeLabel: formatStoredTime("time", period)
    }))
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

  return {
    period,
    categoryName: options.categories.find((item) => item.id === period.categoryId)?.name ?? "不明",
    polityName: period.polityId ? options.polities.find((item) => item.id === period.polityId)?.name ?? null : null,
    polity: period.polityId ? options.polities.find((item) => item.id === period.polityId) ?? null : null,
    category: options.categories.find((item) => item.id === period.categoryId) ?? null,
    regions: options.regions.filter((item) => linkedRegionIds.includes(item.id)),
    relatedEvents: getRelatedEvents({ periodId: id }),
    timeLabel: formatStoredTime("time", period),
    defaultTimeExpression: extractTimeExpression("time", period),
    formOptions: options
  };
}

export function createHistoricalPeriodFromInput(input: HistoricalPeriodInput) {
  return createHistoricalPeriod(
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
}

export function updateHistoricalPeriodFromInput(id: number, input: HistoricalPeriodInput) {
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
}

export function removeHistoricalPeriod(id: number) {
  deleteHistoricalPeriod(id);
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
