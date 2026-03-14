"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseReligionFormData, parseSectFormData } from "@/features/religions/schema";
import {
  createReligionFromInput,
  createSectFromInput,
  removeReligion,
  removeSect,
  updateReligionFromInput,
  updateSectFromInput
} from "@/server/services/religions";

export async function createReligionAction(formData: FormData) {
  const id = createReligionFromInput(parseReligionFormData(formData));
  revalidatePath("/religions");
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

export async function createSectAction(formData: FormData) {
  const id = createSectFromInput(parseSectFormData(formData));
  revalidatePath("/sects");
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
