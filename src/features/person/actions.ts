"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parsePersonFormData } from "@/features/person/schema";
import { createPersonFromInput, removePerson, updatePersonFromInput } from "@/server/services/person";

export async function createPersonAction(formData: FormData) {
  const id = createPersonFromInput(parsePersonFormData(formData));
  revalidatePath("/person");
  redirect(`/person/${id}`);
}

export async function updatePersonAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updatePersonFromInput(id, parsePersonFormData(formData));
  revalidatePath("/person");
  revalidatePath(`/person/${id}`);
  redirect(`/person/${id}`);
}

export async function deletePersonAction(formData: FormData) {
  removePerson(Number(formData.get("id")));
  revalidatePath("/person");
  redirect("/person");
}
