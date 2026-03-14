"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parsePeriodCategoryFormData } from "@/features/periods/schema";
import {
  createPeriodCategoryFromInput,
  deletePeriodCategoryById,
  updatePeriodCategoryFromInput
} from "@/server/services/period-categories";

export async function createPeriodCategoryAction(formData: FormData) {
  const input = parsePeriodCategoryFormData(formData);
  const id = createPeriodCategoryFromInput(input);

  revalidatePath("/period-categories");
  redirect(`/period-categories/${id}`);
}

export async function updatePeriodCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parsePeriodCategoryFormData(formData);

  updatePeriodCategoryFromInput(id, input);
  revalidatePath("/period-categories");
  revalidatePath(`/period-categories/${id}`);
  redirect(`/period-categories/${id}`);
}

export async function deletePeriodCategoryAction(formData: FormData) {
  const id = Number(formData.get("id"));

  deletePeriodCategoryById(id);
  revalidatePath("/period-categories");
  redirect("/period-categories");
}
