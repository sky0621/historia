"use server";

import { revalidatePath } from "next/cache";
import { importCsvSync, type CsvSyncImportResult, type CsvSyncImportTarget, csvSyncImportTargets } from "@/server/services/csv-sync-import";
import { recordImportRun } from "@/server/services/import-runs";

export type CsvImportState = {
  error?: string;
  result?: CsvSyncImportResult;
};

export async function importCsvAction(_previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const targetType = String(formData.get("targetType") ?? "") as CsvSyncImportTarget;
  const file = formData.get("file");

  if (!csvSyncImportTargets.includes(targetType)) {
    return { error: "取込対象が不正です。" };
  }

  if (!(file instanceof File) || file.size === 0) {
    return { error: "CSV ファイルを選択してください。" };
  }

  try {
    const rawCsv = await file.text();
    const result = importCsvSync(targetType, rawCsv);

    recordImportRun({
      sourceFormat: "csv",
      targetType,
      action: "import",
      fileName: file.name,
      status: "ok",
      summary: result
    });

    for (const path of revalidationPaths[targetType]) {
      revalidatePath(path);
    }
    revalidatePath("/manage/data");

    return { result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "CSV import に失敗しました。";

    recordImportRun({
      sourceFormat: "csv",
      targetType,
      action: "import",
      fileName: file.name,
      status: "error",
      summary: { message }
    });

    return { error: message };
  }
}

const revalidationPaths: Record<CsvSyncImportTarget, string[]> = {
  persons: ["/person", "/manage/data"],
  regions: ["/regions", "/manage/data"],
  polities: ["/polities", "/manage/data"],
  dynasties: ["/dynasties", "/manage/data"],
  "dynasty-polity-links": ["/dynasties", "/polities", "/manage/data"],
  "role-polity-links": ["/roles", "/polities", "/manage/data"],
  "person-role-links": ["/person", "/roles", "/manage/data"],
  "polity-region-links": ["/polities", "/regions", "/manage/data"],
  "dynasty-region-links": ["/dynasties", "/regions", "/manage/data"],
  roles: ["/roles", "/person", "/manage/data"],
  "period-categories": ["/period-categories", "/periods", "/manage/data"],
  "historical-periods": ["/periods", "/period-categories", "/manage/data"],
  "historical-period-category-links": ["/periods", "/period-categories", "/manage/data"],
  religions: ["/religions", "/manage/data"],
  sects: ["/religions", "/manage/data"]
};
