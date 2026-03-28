"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseDynastyFormData, parsePolityFormData } from "@/features/polities/schema";
import { listDynasties } from "@/server/repositories/dynasties";
import { listPolities } from "@/server/repositories/polities";
import {
  createDynastyFromInput,
  createPolityFromInput,
  removeDynasty,
  removePolity,
  updateDynastyFromInput,
  updatePolityFromInput
} from "@/server/services/polities";

export async function createPolityAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parsePolityFormData(formData);
  if (listPolities().some((polity) => polity.name === input.name)) {
    return { error: "同じ名称の国家が登録済みです。" };
  }

  const id = createPolityFromInput(input);
  revalidatePath("/polities");
  if (shouldContinueCreating(formData)) {
    redirect("/polities/new");
  }
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

export async function createDynastyAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseDynastyFormData(formData);
  if (listDynasties().some((dynasty) => dynasty.name === input.name)) {
    return { error: "同じ名称の王朝が登録済みです。" };
  }

  const id = createDynastyFromInput(input);
  revalidatePath("/dynasties");
  if (shouldContinueCreating(formData)) {
    redirect("/dynasties/new");
  }
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
