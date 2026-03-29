"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseDynastySuccessionFormData,
  parseHistoricalPeriodRelationFormData,
  parsePolityTransitionFormData
} from "@/features/relations/schema";
import {
  createDynastySuccessionFromInput,
  createHistoricalPeriodRelationFromInput,
  createPolityTransitionFromInput,
  deleteDynastySuccessionById,
  deleteHistoricalPeriodRelationById,
  deletePolityTransitionById,
  updateDynastySuccessionFromInput,
  updateHistoricalPeriodRelationFromInput,
  updatePolityTransitionFromInput
} from "@/server/services/relations";

export async function createPolityTransitionAction(formData: FormData) {
  const input = parsePolityTransitionFormData(formData);
  const id = createPolityTransitionFromInput(input);
  revalidatePath("/polities");
  revalidatePath(`/polities/${input.predecessorPolityId}`);
  revalidatePath(`/polities/${input.successorPolityId}`);
  redirect(`/polity-transitions/${id}/edit`);
}

export async function updatePolityTransitionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parsePolityTransitionFormData(formData);
  updatePolityTransitionFromInput(id, input);
  revalidatePath("/polities");
  revalidatePath(`/polities/${input.predecessorPolityId}`);
  revalidatePath(`/polities/${input.successorPolityId}`);
  redirect(`/polities/${input.successorPolityId}`);
}

export async function deletePolityTransitionAction(formData: FormData) {
  const predecessorPolityId = Number(formData.get("predecessorPolityId"));
  const successorPolityId = Number(formData.get("successorPolityId"));
  deletePolityTransitionById(Number(formData.get("id")));
  revalidatePath("/polities");
  revalidatePath(`/polities/${predecessorPolityId}`);
  revalidatePath(`/polities/${successorPolityId}`);
  redirect(`/polities/${successorPolityId || predecessorPolityId}`);
}

export async function createDynastySuccessionAction(formData: FormData) {
  const input = parseDynastySuccessionFormData(formData);
  const id = createDynastySuccessionFromInput(input);
  revalidatePath(`/polities/${input.polityId}`);
  revalidatePath(`/dynasties/${input.predecessorDynastyId}`);
  revalidatePath(`/dynasties/${input.successorDynastyId}`);
  redirect(`/dynasty-successions/${id}/edit`);
}

export async function updateDynastySuccessionAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parseDynastySuccessionFormData(formData);
  updateDynastySuccessionFromInput(id, input);
  revalidatePath(`/polities/${input.polityId}`);
  revalidatePath(`/dynasties/${input.predecessorDynastyId}`);
  revalidatePath(`/dynasties/${input.successorDynastyId}`);
  redirect(`/polities/${input.polityId}`);
}

export async function deleteDynastySuccessionAction(formData: FormData) {
  const polityId = Number(formData.get("polityId"));
  deleteDynastySuccessionById(Number(formData.get("id")));
  revalidatePath(`/polities/${polityId}`);
  redirect(`/polities/${polityId}`);
}

export async function createHistoricalPeriodRelationAction(formData: FormData) {
  const input = parseHistoricalPeriodRelationFormData(formData);
  const id = createHistoricalPeriodRelationFromInput(input);
  revalidatePath(`/periods/${input.fromPeriodId}`);
  revalidatePath(`/periods/${input.toPeriodId}`);
  redirect(`/period-relations/${id}/edit`);
}

export async function updateHistoricalPeriodRelationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parseHistoricalPeriodRelationFormData(formData);
  updateHistoricalPeriodRelationFromInput(id, input);
  revalidatePath(`/periods/${input.fromPeriodId}`);
  revalidatePath(`/periods/${input.toPeriodId}`);
  redirect(`/periods/${input.fromPeriodId}`);
}

export async function deleteHistoricalPeriodRelationAction(formData: FormData) {
  const fromPeriodId = Number(formData.get("fromPeriodId"));
  const toPeriodId = Number(formData.get("toPeriodId"));
  deleteHistoricalPeriodRelationById(Number(formData.get("id")));
  revalidatePath(`/periods/${fromPeriodId}`);
  revalidatePath(`/periods/${toPeriodId}`);
  redirect(`/periods/${fromPeriodId}`);
}
