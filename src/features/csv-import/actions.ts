"use server";

import { revalidatePath } from "next/cache";
import { recordImportRun } from "@/server/services/import-runs";
import {
  applyCitationCsvImport,
  applyConflictOutcomeCsvImport,
  applyConflictParticipantCsvImport,
  applyDynastyCsvImport,
  applyDynastySuccessionCsvImport,
  applyEventRelationCsvImport,
  applyHistoricalPeriodCsvImport,
  applyHistoricalPeriodRelationCsvImport,
  applyPeriodCategoryCsvImport,
  applyPolityCsvImport,
  applyPolityTransitionCsvImport,
  applyRegionRelationCsvImport,
  applyRegionCsvImport,
  applyReligionCsvImport,
  applyRoleAssignmentCsvImport,
  applySectCsvImport,
  applySourceCsvImport,
  applyTagCsvImport,
  previewCitationCsvImport,
  applyEventCsvImport,
  applyPersonCsvImport,
  previewConflictOutcomeCsvImport,
  previewConflictParticipantCsvImport,
  previewDynastyCsvImport,
  previewDynastySuccessionCsvImport,
  previewEventRelationCsvImport,
  previewHistoricalPeriodCsvImport,
  previewHistoricalPeriodRelationCsvImport,
  previewPeriodCategoryCsvImport,
  previewPolityCsvImport,
  previewPolityTransitionCsvImport,
  previewRegionRelationCsvImport,
  previewRegionCsvImport,
  previewReligionCsvImport,
  previewRoleAssignmentCsvImport,
  previewSectCsvImport,
  previewSourceCsvImport,
  previewTagCsvImport,
  previewEventCsvImport,
  previewPersonCsvImport,
  type CitationCsvInput,
  type ConflictOutcomeCsvInput,
  type ConflictParticipantCsvInput,
  type DynastyCsvInput,
  type DynastySuccessionCsvInput,
  type EventRelationCsvInput,
  type HistoricalPeriodCsvInput,
  type HistoricalPeriodRelationCsvInput,
  type PeriodCategoryCsvInput,
  type PolityCsvInput,
  type PolityTransitionCsvInput,
  type RegionCsvInput,
  type RegionRelationCsvInput,
  type ReligionCsvInput,
  type RoleAssignmentCsvInput,
  type SectCsvInput,
  type CsvImportResult,
  type CsvPreviewResult,
  type SourceCsvInput,
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
    | "tag"
    | "source"
    | "citation"
    | "polity-transition"
    | "dynasty-succession"
    | "region-relation"
    | "historical-period-relation";
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
    | CsvPreviewResult<TagCsvInput>
    | CsvPreviewResult<SourceCsvInput>
    | CsvPreviewResult<CitationCsvInput>
    | CsvPreviewResult<PolityTransitionCsvInput>
    | CsvPreviewResult<DynastySuccessionCsvInput>
    | CsvPreviewResult<RegionRelationCsvInput>
    | CsvPreviewResult<HistoricalPeriodRelationCsvInput>;
  result?: CsvImportResult;
};

export async function importCsvAction(previousState: CsvImportState, formData: FormData): Promise<CsvImportState> {
  const rawCsv = String(formData.get("payload") ?? "");
  const intent = String(formData.get("intent") ?? "preview");
  const fileName = String(formData.get("fileName") ?? "").trim() || undefined;
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
    targetTypeValue === "tag" ||
    targetTypeValue === "source" ||
    targetTypeValue === "citation" ||
    targetTypeValue === "polity-transition" ||
    targetTypeValue === "dynasty-succession" ||
    targetTypeValue === "region-relation" ||
    targetTypeValue === "historical-period-relation"
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
                                  : targetType === "source"
                                    ? previewSourceCsvImport(rawCsv)
                                    : targetType === "citation"
                                      ? previewCitationCsvImport(rawCsv)
                                      : targetType === "polity-transition"
                                        ? previewPolityTransitionCsvImport(rawCsv)
                                        : targetType === "dynasty-succession"
                                          ? previewDynastySuccessionCsvImport(rawCsv)
                                          : targetType === "region-relation"
                                            ? previewRegionRelationCsvImport(rawCsv)
                                            : targetType === "historical-period-relation"
                                              ? previewHistoricalPeriodRelationCsvImport(rawCsv)
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
                                  : targetType === "source"
                                    ? applySourceCsvImport(rawCsv)
                                    : targetType === "citation"
                                      ? applyCitationCsvImport(rawCsv)
                                      : targetType === "polity-transition"
                                        ? applyPolityTransitionCsvImport(rawCsv)
                                        : targetType === "dynasty-succession"
                                          ? applyDynastySuccessionCsvImport(rawCsv)
                                          : targetType === "region-relation"
                                            ? applyRegionRelationCsvImport(rawCsv)
                                            : targetType === "historical-period-relation"
                                              ? applyHistoricalPeriodRelationCsvImport(rawCsv)
            : applyEventCsvImport(rawCsv);
      recordImportRun({
        sourceFormat: "csv",
        targetType,
        action: "import",
        fileName,
        status: "ok",
        summary: {
          preview: preview.summary,
          importedCount: result.importedCount,
          mergedCount: result.mergedCount,
          unknownHeaders: preview.unknownHeaders
        }
      });
      revalidatePath("/events");
      revalidatePath("/people");
      revalidatePath("/polities");
      revalidatePath("/dynasties");
      revalidatePath("/regions");
      revalidatePath("/period-categories");
      revalidatePath("/periods");
      revalidatePath("/religions");
      revalidatePath("/sects");
      revalidatePath("/sources");
      revalidatePath("/tags");
      revalidatePath("/polity-transitions/new");
      revalidatePath("/dynasty-successions/new");
      revalidatePath("/region-relations/new");
      revalidatePath("/period-relations/new");
      revalidatePath("/manage/data");
      revalidatePath("/graph/events");
      revalidatePath("/timeline");

      return {
        targetType,
        preview,
        result
      };
    }

    recordImportRun({
      sourceFormat: "csv",
      targetType,
      action: "preview",
      fileName,
      status: "ok",
      summary: {
        preview: preview.summary,
        unknownHeaders: preview.unknownHeaders
      }
    });

    return { targetType, preview };
  } catch (error) {
    recordImportRun({
      sourceFormat: "csv",
      targetType,
      action: intent === "import" ? "import" : "preview",
      fileName,
      status: "error",
      summary: {
        message: error instanceof Error ? error.message : "CSV import に失敗しました"
      }
    });
    return {
      targetType,
      error: error instanceof Error ? error.message : "CSV import に失敗しました"
    };
  }
}
