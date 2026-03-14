"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parsePersonFormData } from "@/features/people/schema";
import { createPersonFromInput, removePerson, updatePersonFromInput } from "@/server/services/people";

export async function createPersonAction(formData: FormData) {
  const id = createPersonFromInput(parsePersonFormData(formData));
  revalidatePath("/people");
  redirect(`/people/${id}`);
}

export async function updatePersonAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updatePersonFromInput(id, parsePersonFormData(formData));
  revalidatePath("/people");
  revalidatePath(`/people/${id}`);
  redirect(`/people/${id}`);
}

export async function deletePersonAction(formData: FormData) {
  removePerson(Number(formData.get("id")));
  revalidatePath("/people");
  redirect("/people");
}
