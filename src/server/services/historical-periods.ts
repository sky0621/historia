import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
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
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { getPeriodCategoryOptions } from "@/server/services/period-categories";
import { getHistoricalPeriodRelationView } from "@/server/services/relations";
import { getCitationListForTarget } from "@/server/services/sources";
import { normalizeStoredBoundaryYear, toStoredBoundaryYear } from "@/server/services/time-sentinel";

export function getHistoricalPeriodFormOptions() {
  return {
    categories: getPeriodCategoryOptions(),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name, parentRegionId: item.parentRegionId }))
  };
}

export function getHistoricalPeriodSelectionOptions() {
  const categoryNameById = new Map(getPeriodCategoryOptions().map((item) => [item.id, item.name]));

  return listHistoricalPeriods().map((item) => ({
    id: item.id,
    name: `${categoryNameById.get(item.categoryId) ?? "不明"}: ${item.name}`
  }));
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
        [period.name, period.description, period.note, period.categoryName, period.polityName, period.regionNames.join(", ")],
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
    relatedPerson: [] as Array<{ id: number; name: string }>,
    relatedEvents: getRelatedEvents({ periodId: id }),
    periodRelations: getHistoricalPeriodRelationView(id),
    timeLabel: formatStoredTime("time", period),
    defaultFromTimeExpression: extractBoundaryTime("from", period),
    defaultToTimeExpression: extractBoundaryTime("to", period),
    formOptions: options,
    citations: getCitationListForTarget("historical_period", id),
    changeHistory: getHistoryView("historical_period", id)
  };
}

export function createHistoricalPeriodFromInput(input: HistoricalPeriodInput) {
  const id = createHistoricalPeriod(
    {
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.categoryId,
    input.polityId ?? null,
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
      name: input.name,
      description: nullable(input.description),
      note: nullable(input.note),
      ...toStoredBoundaryTime("from", input.fromTimeExpression),
      ...toStoredBoundaryTime("to", input.toTimeExpression)
    },
    input.categoryId,
    input.polityId ?? null,
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
