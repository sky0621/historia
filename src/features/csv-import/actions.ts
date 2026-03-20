"use server";

import { revalidatePath } from "next/cache";
import { applyEventCsvImport, previewEventCsvImport } from "@/server/services/csv-import";

export type CsvImportState = {
  error?: string;
  preview?: ReturnType<typeof previewEventCsvImport>;
  result?: ReturnType<typeof applyEventCsvImport>;
};

export async function importEventCsvAction(previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const rawCsv = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");

  try {
    const preview = previewEventCsvImport(rawCsv);

    if (intent === "import") {
      const result = applyEventCsvImport(rawCsv);
      revalidatePath("/events");
      revalidatePath("/manage/data");
      revalidatePath("/graph/events");
      revalidatePath("/timeline");

      return {
        preview,
        result
      };
    }

    return { preview };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "CSV import に失敗しました"
    };
  }
}
