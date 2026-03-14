"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseTagFormData } from "@/features/tags/schema";
import { createTagFromInput, deleteTagById, updateTagFromInput } from "@/server/services/tags";

export async function createTagAction(formData: FormData) {
  const id = createTagFromInput(parseTagFormData(formData));
  revalidatePath("/tags");
  revalidatePath("/events");
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
