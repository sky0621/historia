"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseReligionFormData, parseSectFormData } from "@/features/religions/schema";
import { listReligions } from "@/server/repositories/religions";
import { listSects } from "@/server/repositories/sects";
import {
  createReligionFromInput,
  createSectFromInput,
  removeReligion,
  removeSect,
  updateReligionFromInput,
  updateSectFromInput
} from "@/server/services/religions";

export async function createReligionAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseReligionFormData(formData);
  if (listReligions().some((religion) => religion.name === input.name)) {
    return { error: "同じ名称の宗教が登録済みです。" };
  }

  const id = createReligionFromInput(input);
  revalidatePath("/religions");
  if (shouldContinueCreating(formData)) {
    redirect("/religions/new");
  }
  redirect(`/religions/${id}`);
}

export async function updateReligionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateReligionFromInput(id, parseReligionFormData(formData));
  revalidatePath("/religions");
  revalidatePath(`/religions/${id}`);
  redirect(`/religions/${id}`);
}

export async function deleteReligionAction(formData: FormData) {
  removeReligion(Number(formData.get("id")));
  revalidatePath("/religions");
  revalidatePath("/sects");
  redirect("/religions");
}

export async function createSectAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseSectFormData(formData);
  if (listSects().some((sect) => sect.name === input.name)) {
    return { error: "同じ名称の宗派が登録済みです。" };
  }

  const id = createSectFromInput(input);
  revalidatePath("/sects");
  if (shouldContinueCreating(formData)) {
    redirect("/sects/new");
  }
  redirect(`/sects/${id}`);
}

export async function updateSectAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateSectFromInput(id, parseSectFormData(formData));
  revalidatePath("/sects");
  revalidatePath(`/sects/${id}`);
  redirect(`/sects/${id}`);
}

export async function deleteSectAction(formData: FormData) {
  removeSect(Number(formData.get("id")));
  revalidatePath("/sects");
  redirect("/sects");
}
