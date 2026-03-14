"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseDynastyFormData, parsePolityFormData } from "@/features/polities/schema";
import {
  createDynastyFromInput,
  createPolityFromInput,
  removeDynasty,
  removePolity,
  updateDynastyFromInput,
  updatePolityFromInput
} from "@/server/services/polities";

export async function createPolityAction(formData: FormData) {
  const id = createPolityFromInput(parsePolityFormData(formData));
  revalidatePath("/polities");
  redirect(`/polities/${id}`);
}

export async function updatePolityAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updatePolityFromInput(id, parsePolityFormData(formData));
  revalidatePath("/polities");
  revalidatePath(`/polities/${id}`);
  redirect(`/polities/${id}`);
}

export async function deletePolityAction(formData: FormData) {
  removePolity(Number(formData.get("id")));
  revalidatePath("/polities");
  revalidatePath("/dynasties");
  redirect("/polities");
}

export async function createDynastyAction(formData: FormData) {
  const id = createDynastyFromInput(parseDynastyFormData(formData));
  revalidatePath("/dynasties");
  redirect(`/dynasties/${id}`);
}

export async function updateDynastyAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateDynastyFromInput(id, parseDynastyFormData(formData));
  revalidatePath("/dynasties");
  revalidatePath(`/dynasties/${id}`);
  redirect(`/dynasties/${id}`);
}

export async function deleteDynastyAction(formData: FormData) {
  removeDynasty(Number(formData.get("id")));
  revalidatePath("/dynasties");
  redirect("/dynasties");
}
