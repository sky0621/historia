"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseCitationFormData, parseSourceFormData } from "@/features/sources/schema";
import { applyImportPayload, previewImportPayload } from "@/server/services/import-export";
import { recordImportRun } from "@/server/services/import-runs";
import {
  createCitationFromInput,
  createSourceFromInput,
  removeCitation,
  removeSource,
  updateCitationFromInput,
  updateSourceFromInput
} from "@/server/services/sources";

export async function createSourceAction(formData: FormData) {
  const id = createSourceFromInput(parseSourceFormData(formData));
  revalidatePath("/sources");
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

type ImportState = {
  error?: string;
  preview?: ReturnType<typeof previewImportPayload>;
  result?: ReturnType<typeof applyImportPayload>;
};

export async function importWorkspaceAction(previousState: ImportState, formData: FormData): Promise<ImportState> {
  const rawJson = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");
  const fileName = String(formData.get("fileName") ?? "").trim() || undefined;

  try {
    if (intent === "import") {
      const result = applyImportPayload(rawJson);
      const preview = previewImportPayload(rawJson);
      recordImportRun({
        sourceFormat: "json",
        targetType: "workspace",
        action: "import",
        fileName,
        status: "ok",
        summary: {
          duplicateCount: preview.duplicateCount,
          tableCounts: preview.tableCounts,
          importedCounts: result.importedCounts
        }
      });
      revalidatePath("/events");
      revalidatePath("/people");
      revalidatePath("/polities");
      revalidatePath("/periods");
      revalidatePath("/religions");
      revalidatePath("/regions");
      revalidatePath("/sources");
      revalidatePath("/manage/data");
      return { result, preview };
    }

    const preview = previewImportPayload(rawJson);
    recordImportRun({
      sourceFormat: "json",
      targetType: "workspace",
      action: "preview",
      fileName,
      status: "ok",
      summary: {
        duplicateCount: preview.duplicateCount,
        tableCounts: preview.tableCounts
      }
    });
    return { preview };
  } catch (error) {
    recordImportRun({
      sourceFormat: "json",
      targetType: "workspace",
      action: intent === "import" ? "import" : "preview",
      fileName,
      status: "error",
      summary: {
        message: error instanceof Error ? error.message : "import に失敗しました"
      }
    });
    return { error: error instanceof Error ? error.message : "import に失敗しました" };
  }
}

function targetPath(targetType: string, targetId: number) {
  switch (targetType) {
    case "event":
      return `/events/${targetId}`;
    case "person":
      return `/people/${targetId}`;
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
