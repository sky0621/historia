import {
  createPeriodCategory,
  deletePeriodCategory,
  getPeriodCategoryById,
  listPeriodCategories,
  updatePeriodCategory
} from "@/server/repositories/period-categories";
import type { PeriodCategoryInput } from "@/features/periods/schema";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";

export function getPeriodCategoryOptions() {
  return listPeriodCategories().map((category) => ({ id: category.id, name: category.name }));
}

export function getPeriodCategoryView(id: number) {
  const category = getPeriodCategoryById(id);
  if (!category) {
    return null;
  }

  const relatedPeriods = listHistoricalPeriods().filter((period) => period.categoryId === id);

  return {
    category,
    relatedPeriods
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
