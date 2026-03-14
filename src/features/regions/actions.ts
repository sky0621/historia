"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseRegionFormData } from "@/features/regions/schema";
import {
  createRegionFromInput,
  deleteRegionById,
  updateRegionFromInput
} from "@/server/services/regions";

export async function createRegionAction(formData: FormData) {
  const input = parseRegionFormData(formData);
  const regionId = createRegionFromInput(input);

  revalidatePath("/regions");
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
