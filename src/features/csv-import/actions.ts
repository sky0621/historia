"use server";

import { revalidatePath } from "next/cache";
import {
  applyEventRelationCsvImport,
  applyRoleAssignmentCsvImport,
  applyEventCsvImport,
  applyPersonCsvImport,
  previewEventRelationCsvImport,
  previewRoleAssignmentCsvImport,
  previewEventCsvImport,
  previewPersonCsvImport,
  type EventRelationCsvInput,
  type RoleAssignmentCsvInput,
  type CsvImportResult,
  type CsvPreviewResult
} from "@/server/services/csv-import";
import type { EventInput } from "@/features/events/schema";
import type { PersonInput } from "@/features/people/schema";

export type CsvImportState = {
  error?: string;
  targetType?: "event" | "person" | "role-assignment" | "event-relation";
  preview?:
    | CsvPreviewResult<EventInput>
    | CsvPreviewResult<PersonInput>
    | CsvPreviewResult<RoleAssignmentCsvInput>
    | CsvPreviewResult<EventRelationCsvInput>;
  result?: CsvImportResult;
};

export async function importCsvAction(previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const rawCsv = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");
  const targetTypeValue = String(formData.get("targetType") ?? "event");
  const targetType =
    targetTypeValue === "person" || targetTypeValue === "role-assignment" || targetTypeValue === "event-relation"
      ? targetTypeValue
      : "event";

  try {
    const preview =
      targetType === "person"
          ? previewPersonCsvImport(rawCsv)
          : targetType === "role-assignment"
            ? previewRoleAssignmentCsvImport(rawCsv)
            : targetType === "event-relation"
              ? previewEventRelationCsvImport(rawCsv)
          : previewEventCsvImport(rawCsv);

    if (intent === "import") {
      const result =
        targetType === "person"
          ? applyPersonCsvImport(rawCsv)
          : targetType === "role-assignment"
            ? applyRoleAssignmentCsvImport(rawCsv)
            : targetType === "event-relation"
              ? applyEventRelationCsvImport(rawCsv)
            : applyEventCsvImport(rawCsv);
      revalidatePath("/events");
      revalidatePath("/people");
      revalidatePath("/polities");
      revalidatePath("/dynasties");
      revalidatePath("/manage/data");
      revalidatePath("/graph/events");
      revalidatePath("/timeline");

      return {
        targetType,
        preview,
        result
      };
    }

    return { targetType, preview };
  } catch (error) {
    return {
      targetType,
      error: error instanceof Error ? error.message : "CSV import に失敗しました"
    };
  }
}
