"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseRoleFormData } from "@/features/roles/schema";
import { listRoles } from "@/server/repositories/roles";
import { createRoleFromInput, removeRole, updateRoleFromInput } from "@/server/services/roles";

export async function createRoleAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseRoleFormData(formData);
  if (listRoles().some((role) => role.title === input.title)) {
    return { error: "同じ名称の役職が登録済みです。" };
  }

  const id = createRoleFromInput(input);
  revalidatePath("/roles");
  revalidatePath("/person");
  if (shouldContinueCreating(formData)) {
    redirect("/roles/new");
  }
  redirect(`/roles/${id}`);
}

export async function updateRoleAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateRoleFromInput(id, parseRoleFormData(formData));
  revalidatePath("/roles");
  revalidatePath("/person");
  revalidatePath(`/roles/${id}`);
  redirect(`/roles/${id}`);
}

export async function deleteRoleAction(formData: FormData) {
  const id = Number(formData.get("id"));
  removeRole(id);
  revalidatePath("/roles");
  revalidatePath("/person");
  redirect("/roles");
}
