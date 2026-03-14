import {
  createPeriodCategory,
  deletePeriodCategory,
  getPeriodCategoryById,
  listPeriodCategories,
  updatePeriodCategory
} from "@/server/repositories/period-categories";
import type { PeriodCategoryInput } from "@/features/periods/schema";

export function getPeriodCategoryOptions() {
  return listPeriodCategories().map((category) => ({ id: category.id, name: category.name }));
}

export function getPeriodCategoryView(id: number) {
  return getPeriodCategoryById(id);
}

export function getPeriodCategoryList() {
  return listPeriodCategories();
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
