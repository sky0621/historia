"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseHistoricalPeriodFormData, parsePeriodCategoryFormData } from "@/features/periods/schema";
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

export async function createPeriodCategoryAction(formData: FormData) {
  const id = createPeriodCategoryFromInput(parsePeriodCategoryFormData(formData));
  revalidatePath("/period-categories");
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

export async function createHistoricalPeriodAction(formData: FormData) {
  const id = createHistoricalPeriodFromInput(parseHistoricalPeriodFormData(formData));
  revalidatePath("/periods");
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
