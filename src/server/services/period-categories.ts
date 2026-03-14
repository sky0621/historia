import {
  createPeriodCategory,
  deletePeriodCategory,
  getPeriodCategoryById,
  listPeriodCategories,
  updatePeriodCategory
} from "@/server/repositories/period-categories";
import type { PeriodCategoryInput } from "@/features/periods/schema";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPolities } from "@/server/repositories/polities";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { getRelatedEvents } from "@/server/services/event-references";

export function getPeriodCategoryOptions() {
  return listPeriodCategories().map((category) => ({ id: category.id, name: category.name }));
}

export function getPeriodCategoryView(id: number) {
  const category = getPeriodCategoryById(id);
  if (!category) {
    return null;
  }

  const polityNames = new Map(listPolities().map((polity) => [polity.id, polity.name]));
  const relatedPeriods = listHistoricalPeriods()
    .filter((period) => period.categoryId === id)
    .map((period) => ({
      ...period,
      polityName: period.polityId ? polityNames.get(period.polityId) ?? null : null,
      timeLabel: formatStoredTime("time", period)
    }));

  const relatedEvents = dedupeRelatedEvents(
    relatedPeriods.flatMap((period) => getRelatedEvents({ periodId: period.id }))
  );

  return {
    category,
    relatedPeriods,
    relatedEvents
  };
}

export function getPeriodCategoryList(query?: string) {
  const normalizedQuery = normalizeQuery(query);
  const periods = listHistoricalPeriods();

  return listPeriodCategories()
    .filter((category) => matchesQuery([category.name, category.description], normalizedQuery))
    .map((category) => ({
      ...category,
      periodCount: periods.filter((period) => period.categoryId === category.id).length
    }));
}

export function createPeriodCategoryFromInput(input: PeriodCategoryInput) {
  return createPeriodCategory({
    name: input.name,
    description: nullable(input.description)
  });
}

export function updatePeriodCategoryFromInput(id: number, input: PeriodCategoryInput) {
  updatePeriodCategory(id, {
    name: input.name,
    description: nullable(input.description)
  });
}

export function deletePeriodCategoryById(id: number) {
  deletePeriodCategory(id);
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
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

function dedupeRelatedEvents(
  events: ReturnType<typeof getRelatedEvents>
) {
  const seen = new Set<number>();

  return events.filter((event) => {
    if (seen.has(event.id)) {
      return false;
    }

    seen.add(event.id);
    return true;
  });
}

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = fromTimeExpressionRecord({
    calendarEra: (value[`${prefix}CalendarEra`] as "BCE" | "CE" | null) ?? "CE",
    startYear: (value[`${prefix}StartYear`] as number | null) ?? null,
    endYear: (value[`${prefix}EndYear`] as number | null) ?? null,
    isApproximate: Boolean(value[`${prefix}IsApproximate`]),
    precision: (value[`${prefix}Precision`] as string | null) ?? "year",
    displayLabel: (value[`${prefix}DisplayLabel`] as string | null) ?? null
  });

  return extracted ? formatTimeExpression(extracted) : "年未詳";
}
