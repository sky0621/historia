"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parsePersonFormData } from "@/features/person/schema";
import { listPerson } from "@/server/repositories/person";
import { createPersonFromInput, removePerson, updatePersonFromInput } from "@/server/services/person";

export async function createPersonAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parsePersonFormData(formData);
  if (listPerson().some((person) => person.name === input.name)) {
    return { error: "同じ氏名の人物が登録済みです。" };
  }

  const id = createPersonFromInput(input);
  revalidatePath("/person");
  if (shouldContinueCreating(formData)) {
    redirect("/person/new");
  }
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
