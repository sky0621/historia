"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseCitationFormData, parseSourceFormData } from "@/features/sources/schema";
import { listSources } from "@/server/repositories/sources";
import {
  createCitationFromInput,
  createSourceFromInput,
  removeCitation,
  removeSource,
  updateCitationFromInput,
  updateSourceFromInput
} from "@/server/services/sources";

export async function createSourceAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseSourceFormData(formData);
  if (listSources().some((source) => source.title === input.title)) {
    return { error: "同じタイトルの出典が登録済みです。" };
  }

  const id = createSourceFromInput(input);
  revalidatePath("/sources");
  if (shouldContinueCreating(formData)) {
    redirect("/sources/new");
  }
  redirect(`/sources/${id}`);
}

export async function updateSourceAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateSourceFromInput(id, parseSourceFormData(formData));
  revalidatePath("/sources");
  revalidatePath(`/sources/${id}`);
  redirect(`/sources/${id}`);
}

export async function deleteSourceAction(formData: FormData) {
  removeSource(Number(formData.get("id")));
  revalidatePath("/sources");
  redirect("/sources");
}

export async function createCitationAction(formData: FormData) {
  const input = parseCitationFormData(formData);
  const id = createCitationFromInput(input);
  revalidatePath("/sources");
  revalidatePath(targetPath(input.targetType, input.targetId));
  if (shouldContinueCreating(formData)) {
    redirect(buildCitationNewPath(input.sourceId, input.targetType, input.targetId));
  }
  redirect(`/citations/${id}/edit`);
}

export async function updateCitationAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const input = parseCitationFormData(formData);
  updateCitationFromInput(id, input);
  revalidatePath("/sources");
  revalidatePath(`/sources/${input.sourceId}`);
  revalidatePath(targetPath(input.targetType, input.targetId));
  redirect(`/sources/${input.sourceId}`);
}

export async function deleteCitationAction(formData: FormData) {
  const sourceId = Number(formData.get("sourceId"));
  const targetType = String(formData.get("targetType"));
  const targetId = Number(formData.get("targetId"));
  removeCitation(Number(formData.get("id")));
  revalidatePath("/sources");
  revalidatePath(`/sources/${sourceId}`);
  if (targetId > 0) {
    revalidatePath(targetPath(targetType, targetId));
  }
  redirect(`/sources/${sourceId}`);
}

function targetPath(targetType: string, targetId: number) {
  switch (targetType) {
    case "event":
      return `/events/${targetId}`;
    case "person":
      return `/person/${targetId}`;
    case "polity":
      return `/polities/${targetId}`;
    case "historical_period":
      return `/periods/${targetId}`;
    case "religion":
      return `/religions/${targetId}`;
    default:
      return "/sources";
  }
}

function buildCitationNewPath(sourceId: number, targetType: string, targetId: number) {
  const params = new URLSearchParams({
    sourceId: String(sourceId),
    targetType,
    targetId: String(targetId)
  });
  return `/citations/new?${params.toString()}`;
}
