"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseHistoricalPeriodFormData, parsePeriodCategoryFormData } from "@/features/periods/schema";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPeriodCategories } from "@/server/repositories/period-categories";
import {
  createHistoricalPeriodFromInput,
  removeHistoricalPeriod,
  updateHistoricalPeriodFromInput
} from "@/server/services/historical-periods";
import {
  createPeriodCategoryFromInput,
  deletePeriodCategoryById,
  updatePeriodCategoryFromInput
} from "@/server/services/period-categories";

export async function createPeriodCategoryAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parsePeriodCategoryFormData(formData);
  if (listPeriodCategories().some((category) => category.name === input.name)) {
    return { error: "同じ名称のカテゴリが登録済みです。" };
  }

  const id = createPeriodCategoryFromInput(input);
  revalidatePath("/period-categories");
  if (shouldContinueCreating(formData)) {
    redirect("/period-categories/new");
  }
  redirect(`/period-categories/${id}`);
}

export async function updatePeriodCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updatePeriodCategoryFromInput(id, parsePeriodCategoryFormData(formData));
  revalidatePath("/period-categories");
  revalidatePath(`/period-categories/${id}`);
  redirect(`/period-categories/${id}`);
}

export async function deletePeriodCategoryAction(formData: FormData) {
  deletePeriodCategoryById(Number(formData.get("id")));
  revalidatePath("/period-categories");
  redirect("/period-categories");
}

export async function createHistoricalPeriodAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseHistoricalPeriodFormData(formData);
  if (listHistoricalPeriods().some((period) => period.name === input.name)) {
    return { error: "同じ名称の時代区分が登録済みです。" };
  }

  const id = createHistoricalPeriodFromInput(input);
  revalidatePath("/periods");
  if (shouldContinueCreating(formData)) {
    redirect("/periods/new");
  }
  redirect(`/periods/${id}`);
}

export async function updateHistoricalPeriodAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateHistoricalPeriodFromInput(id, parseHistoricalPeriodFormData(formData));
  revalidatePath("/periods");
  revalidatePath(`/periods/${id}`);
  redirect(`/periods/${id}`);
}

export async function deleteHistoricalPeriodAction(formData: FormData) {
  removeHistoricalPeriod(Number(formData.get("id")));
  revalidatePath("/periods");
  redirect("/periods");
}
