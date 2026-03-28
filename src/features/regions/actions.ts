"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseRegionFormData } from "@/features/regions/schema";
import { listRegions } from "@/server/repositories/regions";
import {
  createRegionFromInput,
  deleteRegionById,
  updateRegionFromInput
} from "@/server/services/regions";

export async function createRegionAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseRegionFormData(formData);
  if (listRegions().some((region) => region.name === input.name)) {
    return { error: "同じ名称の地域が登録済みです。" };
  }
  const regionId = createRegionFromInput(input);

  revalidatePath("/regions");
  if (shouldContinueCreating(formData)) {
    redirect("/regions/new");
  }
  redirect(`/regions/${regionId}`);
}

export async function updateRegionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parseRegionFormData(formData);

  updateRegionFromInput(id, input);
  revalidatePath("/regions");
  revalidatePath(`/regions/${id}`);
  redirect(`/regions/${id}`);
}

export async function deleteRegionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteRegionById(id);
  revalidatePath("/regions");
  redirect("/regions");
}
