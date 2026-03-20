"use server";

import { revalidatePath } from "next/cache";
import {
  applyEventCsvImport,
  applyPersonCsvImport,
  previewEventCsvImport,
  previewPersonCsvImport,
  type CsvImportResult,
  type CsvPreviewResult
} from "@/server/services/csv-import";
import type { EventInput } from "@/features/events/schema";
import type { PersonInput } from "@/features/people/schema";

export type CsvImportState = {
  error?: string;
  targetType?: "event" | "person";
  preview?: CsvPreviewResult<EventInput> | CsvPreviewResult<PersonInput>;
  result?: CsvImportResult;
};

export async function importCsvAction(previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const rawCsv = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");
  const targetType = String(formData.get("targetType") ?? "event") === "person" ? "person" : "event";

  try {
    const preview = targetType === "person" ? previewPersonCsvImport(rawCsv) : previewEventCsvImport(rawCsv);

    if (intent === "import") {
      const result = targetType === "person" ? applyPersonCsvImport(rawCsv) : applyEventCsvImport(rawCsv);
      revalidatePath("/events");
      revalidatePath("/people");
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
