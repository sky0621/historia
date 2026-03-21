"use server";

import { revalidatePath } from "next/cache";
import {
  applyConflictOutcomeCsvImport,
  applyConflictParticipantCsvImport,
  applyDynastyCsvImport,
  applyEventRelationCsvImport,
  applyHistoricalPeriodCsvImport,
  applyPeriodCategoryCsvImport,
  applyPolityCsvImport,
  applyRegionCsvImport,
  applyReligionCsvImport,
  applyRoleAssignmentCsvImport,
  applySectCsvImport,
  applyTagCsvImport,
  applyEventCsvImport,
  applyPersonCsvImport,
  previewConflictOutcomeCsvImport,
  previewConflictParticipantCsvImport,
  previewDynastyCsvImport,
  previewEventRelationCsvImport,
  previewHistoricalPeriodCsvImport,
  previewPeriodCategoryCsvImport,
  previewPolityCsvImport,
  previewRegionCsvImport,
  previewReligionCsvImport,
  previewRoleAssignmentCsvImport,
  previewSectCsvImport,
  previewTagCsvImport,
  previewEventCsvImport,
  previewPersonCsvImport,
  type ConflictOutcomeCsvInput,
  type ConflictParticipantCsvInput,
  type DynastyCsvInput,
  type EventRelationCsvInput,
  type HistoricalPeriodCsvInput,
  type PeriodCategoryCsvInput,
  type PolityCsvInput,
  type RegionCsvInput,
  type ReligionCsvInput,
  type RoleAssignmentCsvInput,
  type SectCsvInput,
  type CsvImportResult,
  type CsvPreviewResult,
  type TagCsvInput
} from "@/server/services/csv-import";
import type { EventInput } from "@/features/events/schema";
import type { PersonInput } from "@/features/people/schema";

export type CsvImportState = {
  error?: string;
  targetType?:
    | "event"
    | "person"
    | "role-assignment"
    | "event-relation"
    | "conflict-participant"
    | "conflict-outcome"
    | "region"
    | "period-category"
    | "polity"
    | "religion"
    | "dynasty"
    | "historical-period"
    | "sect"
    | "tag";
  preview?:
    | CsvPreviewResult<EventInput>
    | CsvPreviewResult<PersonInput>
    | CsvPreviewResult<RoleAssignmentCsvInput>
    | CsvPreviewResult<EventRelationCsvInput>
    | CsvPreviewResult<ConflictParticipantCsvInput>
    | CsvPreviewResult<ConflictOutcomeCsvInput>
    | CsvPreviewResult<RegionCsvInput>
    | CsvPreviewResult<PeriodCategoryCsvInput>
    | CsvPreviewResult<PolityCsvInput>
    | CsvPreviewResult<ReligionCsvInput>
    | CsvPreviewResult<DynastyCsvInput>
    | CsvPreviewResult<HistoricalPeriodCsvInput>
    | CsvPreviewResult<SectCsvInput>
    | CsvPreviewResult<TagCsvInput>;
  result?: CsvImportResult;
};

export async function importCsvAction(previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const rawCsv = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");
  const targetTypeValue = String(formData.get("targetType") ?? "event");
  const targetType =
    targetTypeValue === "person" ||
    targetTypeValue === "role-assignment" ||
    targetTypeValue === "event-relation" ||
    targetTypeValue === "conflict-participant" ||
    targetTypeValue === "conflict-outcome" ||
    targetTypeValue === "region" ||
    targetTypeValue === "period-category" ||
    targetTypeValue === "polity" ||
    targetTypeValue === "religion" ||
    targetTypeValue === "dynasty" ||
    targetTypeValue === "historical-period" ||
    targetTypeValue === "sect" ||
    targetTypeValue === "tag"
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
              : targetType === "conflict-participant"
                ? previewConflictParticipantCsvImport(rawCsv)
                : targetType === "conflict-outcome"
                  ? previewConflictOutcomeCsvImport(rawCsv)
                  : targetType === "region"
                    ? previewRegionCsvImport(rawCsv)
                    : targetType === "period-category"
                      ? previewPeriodCategoryCsvImport(rawCsv)
                      : targetType === "polity"
                        ? previewPolityCsvImport(rawCsv)
                        : targetType === "religion"
                          ? previewReligionCsvImport(rawCsv)
                          : targetType === "dynasty"
                            ? previewDynastyCsvImport(rawCsv)
                            : targetType === "historical-period"
                              ? previewHistoricalPeriodCsvImport(rawCsv)
                              : targetType === "sect"
                                ? previewSectCsvImport(rawCsv)
                                : targetType === "tag"
                                  ? previewTagCsvImport(rawCsv)
          : previewEventCsvImport(rawCsv);

    if (intent === "import") {
      const result =
        targetType === "person"
          ? applyPersonCsvImport(rawCsv)
          : targetType === "role-assignment"
            ? applyRoleAssignmentCsvImport(rawCsv)
            : targetType === "event-relation"
              ? applyEventRelationCsvImport(rawCsv)
              : targetType === "conflict-participant"
                ? applyConflictParticipantCsvImport(rawCsv)
                : targetType === "conflict-outcome"
                  ? applyConflictOutcomeCsvImport(rawCsv)
                  : targetType === "region"
                    ? applyRegionCsvImport(rawCsv)
                    : targetType === "period-category"
                      ? applyPeriodCategoryCsvImport(rawCsv)
                      : targetType === "polity"
                        ? applyPolityCsvImport(rawCsv)
                        : targetType === "religion"
                          ? applyReligionCsvImport(rawCsv)
                          : targetType === "dynasty"
                            ? applyDynastyCsvImport(rawCsv)
                            : targetType === "historical-period"
                              ? applyHistoricalPeriodCsvImport(rawCsv)
                              : targetType === "sect"
                                ? applySectCsvImport(rawCsv)
                                : targetType === "tag"
                                  ? applyTagCsvImport(rawCsv)
            : applyEventCsvImport(rawCsv);
      revalidatePath("/events");
      revalidatePath("/people");
      revalidatePath("/polities");
      revalidatePath("/dynasties");
      revalidatePath("/regions");
      revalidatePath("/period-categories");
      revalidatePath("/periods");
      revalidatePath("/religions");
      revalidatePath("/sects");
      revalidatePath("/tags");
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
