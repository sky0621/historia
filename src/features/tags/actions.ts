"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseTagFormData } from "@/features/tags/schema";
import { listTags } from "@/server/repositories/tags";
import { createTagFromInput, deleteTagById, updateTagFromInput } from "@/server/services/tags";

export async function createTagAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseTagFormData(formData);
  if (listTags().some((tag) => tag.name === input.name)) {
    return { error: "同じ名称のタグが登録済みです。" };
  }

  const id = createTagFromInput(input);
  revalidatePath("/tags");
  revalidatePath("/events");
  if (shouldContinueCreating(formData)) {
    redirect("/tags/new");
  }
  redirect(`/tags/${id}`);
}

export async function updateTagAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateTagFromInput(id, parseTagFormData(formData));
  revalidatePath("/tags");
  revalidatePath("/events");
  revalidatePath(`/tags/${id}`);
  redirect(`/tags/${id}`);
}

export async function deleteTagAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteTagById(id);
  revalidatePath("/tags");
  revalidatePath("/events");
  redirect("/tags");
}
