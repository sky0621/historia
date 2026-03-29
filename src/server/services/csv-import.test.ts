import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  listEvents: vi.fn(),
  listPersonDetailed: vi.fn(),
  listPolities: vi.fn(),
  listDynasties: vi.fn(),
  listHistoricalPeriods: vi.fn(),
  listPeriodCategories: vi.fn(),
  listReligions: vi.fn(),
  listSects: vi.fn(),
  listRegions: vi.fn(),
  listTags: vi.fn(),
  listSources: vi.fn(),
  listCitations: vi.fn(),
  listPolityTransitions: vi.fn(),
  listDynastySuccessions: vi.fn(),
  listHistoricalPeriodRelations: vi.fn(),
  getRoleAssignmentsByPersonIds: vi.fn(),
  getEventRelationsByEventIds: vi.fn(),
  getConflictParticipantsByEventIds: vi.fn(),
  getConflictOutcomesByEventIds: vi.fn(),
  createEventFromInput: vi.fn(),
  updateEventFromInput: vi.fn(),
  removeEvent: vi.fn(),
  replaceEventRelationsOnEvent: vi.fn(),
  replaceConflictParticipantsOnEvent: vi.fn(),
  createPersonFromInput: vi.fn(),
  updatePersonFromInput: vi.fn(),
  removePerson: vi.fn(),
  replaceRoleAssignmentsOnPerson: vi.fn(),
  appendConflictOutcomeToEvent: vi.fn(),
  replaceConflictOutcomeOnEvent: vi.fn(),
  createRegionFromInput: vi.fn(),
  updateRegionFromInput: vi.fn(),
  deleteRegionById: vi.fn(),
  createPeriodCategoryFromInput: vi.fn(),
  updatePeriodCategoryFromInput: vi.fn(),
  deletePeriodCategoryById: vi.fn(),
  createPolityFromInput: vi.fn(),
  updatePolityFromInput: vi.fn(),
  removePolity: vi.fn(),
  createReligionFromInput: vi.fn(),
  updateReligionFromInput: vi.fn(),
  removeReligion: vi.fn(),
  createDynastyFromInput: vi.fn(),
  updateDynastyFromInput: vi.fn(),
  removeDynasty: vi.fn(),
  createHistoricalPeriodFromInput: vi.fn(),
  updateHistoricalPeriodFromInput: vi.fn(),
  removeHistoricalPeriod: vi.fn(),
  createSectFromInput: vi.fn(),
  updateSectFromInput: vi.fn(),
  removeSect: vi.fn(),
  createTagFromInput: vi.fn(),
  updateTagFromInput: vi.fn(),
  deleteTagById: vi.fn(),
  createSourceFromInput: vi.fn(),
  updateSourceFromInput: vi.fn(),
  removeSource: vi.fn(),
  createCitationFromInput: vi.fn(),
  updateCitationFromInput: vi.fn(),
  removeCitation: vi.fn(),
  createPolityTransitionFromInput: vi.fn(),
  updatePolityTransitionFromInput: vi.fn(),
  deletePolityTransitionById: vi.fn(),
  createDynastySuccessionFromInput: vi.fn(),
  updateDynastySuccessionFromInput: vi.fn(),
  deleteDynastySuccessionById: vi.fn(),
  createHistoricalPeriodRelationFromInput: vi.fn(),
  updateHistoricalPeriodRelationFromInput: vi.fn(),
  deleteHistoricalPeriodRelationById: vi.fn()
}));

vi.mock("@/server/repositories/events", () => ({
  listEvents: repositoryMocks.listEvents,
  getEventRelationsByEventIds: repositoryMocks.getEventRelationsByEventIds,
  getConflictParticipantsByEventIds: repositoryMocks.getConflictParticipantsByEventIds,
  getConflictOutcomesByEventIds: repositoryMocks.getConflictOutcomesByEventIds
}));

vi.mock("@/server/repositories/person-detail", () => ({
  listPersonDetailed: repositoryMocks.listPersonDetailed
}));

vi.mock("@/server/repositories/polities", () => ({
  listPolities: repositoryMocks.listPolities
}));

vi.mock("@/server/repositories/dynasties", () => ({
  listDynasties: repositoryMocks.listDynasties
}));

vi.mock("@/server/repositories/historical-periods", () => ({
  listHistoricalPeriods: repositoryMocks.listHistoricalPeriods
}));

vi.mock("@/server/repositories/period-categories", () => ({
  listPeriodCategories: repositoryMocks.listPeriodCategories
}));

vi.mock("@/server/repositories/religions", () => ({
  listReligions: repositoryMocks.listReligions
}));

vi.mock("@/server/repositories/sects", () => ({
  listSects: repositoryMocks.listSects
}));

vi.mock("@/server/repositories/regions", () => ({
  listRegions: repositoryMocks.listRegions
}));

vi.mock("@/server/repositories/tags", () => ({
  listTags: repositoryMocks.listTags
}));

vi.mock("@/server/repositories/sources", () => ({
  listSources: repositoryMocks.listSources
}));

vi.mock("@/server/repositories/citations", () => ({
  listCitations: repositoryMocks.listCitations
}));

vi.mock("@/server/repositories/polity-transitions", () => ({
  listPolityTransitions: repositoryMocks.listPolityTransitions
}));

vi.mock("@/server/repositories/dynasty-successions", () => ({
  listDynastySuccessions: repositoryMocks.listDynastySuccessions
}));

vi.mock("@/server/repositories/historical-period-relations", () => ({
  listHistoricalPeriodRelations: repositoryMocks.listHistoricalPeriodRelations
}));

vi.mock("@/server/repositories/role-assignments", () => ({
  getRoleAssignmentsByPersonIds: repositoryMocks.getRoleAssignmentsByPersonIds
}));

vi.mock("@/server/services/events", () => ({
  createEventFromInput: repositoryMocks.createEventFromInput,
  updateEventFromInput: repositoryMocks.updateEventFromInput,
  removeEvent: repositoryMocks.removeEvent,
  replaceEventRelationsOnEvent: repositoryMocks.replaceEventRelationsOnEvent,
  replaceConflictParticipantsOnEvent: repositoryMocks.replaceConflictParticipantsOnEvent,
  appendConflictOutcomeToEvent: repositoryMocks.appendConflictOutcomeToEvent,
  replaceConflictOutcomeOnEvent: repositoryMocks.replaceConflictOutcomeOnEvent
}));

vi.mock("@/server/services/person", () => ({
  createPersonFromInput: repositoryMocks.createPersonFromInput,
  updatePersonFromInput: repositoryMocks.updatePersonFromInput,
  removePerson: repositoryMocks.removePerson,
  replaceRoleAssignmentsOnPerson: repositoryMocks.replaceRoleAssignmentsOnPerson
}));

vi.mock("@/server/services/regions", () => ({
  createRegionFromInput: repositoryMocks.createRegionFromInput,
  updateRegionFromInput: repositoryMocks.updateRegionFromInput,
  deleteRegionById: repositoryMocks.deleteRegionById
}));

vi.mock("@/server/services/period-categories", () => ({
  createPeriodCategoryFromInput: repositoryMocks.createPeriodCategoryFromInput,
  updatePeriodCategoryFromInput: repositoryMocks.updatePeriodCategoryFromInput,
  deletePeriodCategoryById: repositoryMocks.deletePeriodCategoryById
}));

vi.mock("@/server/services/polities", () => ({
  createPolityFromInput: repositoryMocks.createPolityFromInput,
  updatePolityFromInput: repositoryMocks.updatePolityFromInput,
  removePolity: repositoryMocks.removePolity,
  createDynastyFromInput: repositoryMocks.createDynastyFromInput,
  updateDynastyFromInput: repositoryMocks.updateDynastyFromInput,
  removeDynasty: repositoryMocks.removeDynasty
}));

vi.mock("@/server/services/religions", () => ({
  createReligionFromInput: repositoryMocks.createReligionFromInput,
  updateReligionFromInput: repositoryMocks.updateReligionFromInput,
  removeReligion: repositoryMocks.removeReligion,
  createSectFromInput: repositoryMocks.createSectFromInput,
  updateSectFromInput: repositoryMocks.updateSectFromInput,
  removeSect: repositoryMocks.removeSect
}));

vi.mock("@/server/services/historical-periods", () => ({
  createHistoricalPeriodFromInput: repositoryMocks.createHistoricalPeriodFromInput,
  updateHistoricalPeriodFromInput: repositoryMocks.updateHistoricalPeriodFromInput,
  removeHistoricalPeriod: repositoryMocks.removeHistoricalPeriod
}));

vi.mock("@/server/services/tags", () => ({
  createTagFromInput: repositoryMocks.createTagFromInput,
  updateTagFromInput: repositoryMocks.updateTagFromInput,
  deleteTagById: repositoryMocks.deleteTagById
}));

vi.mock("@/server/services/sources", () => ({
  createSourceFromInput: repositoryMocks.createSourceFromInput,
  updateSourceFromInput: repositoryMocks.updateSourceFromInput,
  removeSource: repositoryMocks.removeSource,
  createCitationFromInput: repositoryMocks.createCitationFromInput,
  updateCitationFromInput: repositoryMocks.updateCitationFromInput,
  removeCitation: repositoryMocks.removeCitation
}));

vi.mock("@/server/services/relations", () => ({
  createPolityTransitionFromInput: repositoryMocks.createPolityTransitionFromInput,
  updatePolityTransitionFromInput: repositoryMocks.updatePolityTransitionFromInput,
  deletePolityTransitionById: repositoryMocks.deletePolityTransitionById,
  createDynastySuccessionFromInput: repositoryMocks.createDynastySuccessionFromInput,
  updateDynastySuccessionFromInput: repositoryMocks.updateDynastySuccessionFromInput,
  deleteDynastySuccessionById: repositoryMocks.deleteDynastySuccessionById,
  createHistoricalPeriodRelationFromInput: repositoryMocks.createHistoricalPeriodRelationFromInput,
  updateHistoricalPeriodRelationFromInput: repositoryMocks.updateHistoricalPeriodRelationFromInput,
  deleteHistoricalPeriodRelationById: repositoryMocks.deleteHistoricalPeriodRelationById
}));

import {
  applyCitationCsvImport,
  applyConflictOutcomeCsvImport,
  applyConflictParticipantCsvImport,
  applyDynastyCsvImport,
  applyDynastySuccessionCsvImport,
  applyEventCsvImport,
  applyEventRelationCsvImport,
  applyHistoricalPeriodCsvImport,
  applyHistoricalPeriodRelationCsvImport,
  applyPeriodCategoryCsvImport,
  applyPersonCsvImport,
  applyPolityCsvImport,
  applyPolityTransitionCsvImport,
  applyRegionCsvImport,
  applyReligionCsvImport,
  applyRoleAssignmentCsvImport,
  applySectCsvImport,
  applySourceCsvImport,
  applyTagCsvImport,
  previewCitationCsvImport,
  parseCsv,
  previewConflictOutcomeCsvImport,
  previewConflictParticipantCsvImport,
  previewDynastyCsvImport,
  previewDynastySuccessionCsvImport,
  previewEventCsvImport,
  previewEventRelationCsvImport,
  previewHistoricalPeriodCsvImport,
  previewHistoricalPeriodRelationCsvImport,
  previewPeriodCategoryCsvImport,
  previewPersonCsvImport,
  previewPolityCsvImport,
  previewPolityTransitionCsvImport,
  previewRegionCsvImport,
  previewReligionCsvImport,
  previewRoleAssignmentCsvImport,
  previewSectCsvImport,
  previewSourceCsvImport,
  previewTagCsvImport
} from "@/server/services/csv-import";

describe("csv import service", () => {
  beforeEach(() => {
    repositoryMocks.listEvents.mockReset();
    repositoryMocks.listPersonDetailed.mockReset();
    repositoryMocks.listPolities.mockReset();
    repositoryMocks.listDynasties.mockReset();
    repositoryMocks.listHistoricalPeriods.mockReset();
    repositoryMocks.listPeriodCategories.mockReset();
    repositoryMocks.listReligions.mockReset();
    repositoryMocks.listSects.mockReset();
    repositoryMocks.listRegions.mockReset();
    repositoryMocks.listTags.mockReset();
    repositoryMocks.listSources.mockReset();
    repositoryMocks.listCitations.mockReset();
    repositoryMocks.listPolityTransitions.mockReset();
    repositoryMocks.listDynastySuccessions.mockReset();
    repositoryMocks.listHistoricalPeriodRelations.mockReset();
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReset();
    repositoryMocks.getEventRelationsByEventIds.mockReset();
    repositoryMocks.getConflictParticipantsByEventIds.mockReset();
    repositoryMocks.getConflictOutcomesByEventIds.mockReset();

    repositoryMocks.listEvents.mockReturnValue([]);
    repositoryMocks.listPersonDetailed.mockReturnValue([]);
    repositoryMocks.listPolities.mockReturnValue([]);
    repositoryMocks.listDynasties.mockReturnValue([]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([]);
    repositoryMocks.listPeriodCategories.mockReturnValue([]);
    repositoryMocks.listReligions.mockReturnValue([]);
    repositoryMocks.listSects.mockReturnValue([]);
    repositoryMocks.listRegions.mockReturnValue([]);
    repositoryMocks.listTags.mockReturnValue([]);
    repositoryMocks.listSources.mockReturnValue([]);
    repositoryMocks.listCitations.mockReturnValue([]);
    repositoryMocks.listPolityTransitions.mockReturnValue([]);
    repositoryMocks.listDynastySuccessions.mockReturnValue([]);
    repositoryMocks.listHistoricalPeriodRelations.mockReturnValue([]);
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReturnValue([]);
    repositoryMocks.getEventRelationsByEventIds.mockReturnValue([]);
    repositoryMocks.getConflictParticipantsByEventIds.mockReturnValue([]);
    repositoryMocks.getConflictOutcomesByEventIds.mockReturnValue([]);
    repositoryMocks.createEventFromInput.mockReset();
    repositoryMocks.createEventFromInput.mockReturnValue(1);
    repositoryMocks.updateEventFromInput.mockReset();
    repositoryMocks.removeEvent.mockReset();
    repositoryMocks.createPersonFromInput.mockReset();
    repositoryMocks.createPersonFromInput.mockReturnValue(1);
    repositoryMocks.updatePersonFromInput.mockReset();
    repositoryMocks.removePerson.mockReset();
    repositoryMocks.replaceRoleAssignmentsOnPerson.mockReset();
    repositoryMocks.replaceEventRelationsOnEvent.mockReset();
    repositoryMocks.replaceConflictParticipantsOnEvent.mockReset();
    repositoryMocks.appendConflictOutcomeToEvent.mockReset();
    repositoryMocks.replaceConflictOutcomeOnEvent.mockReset();
    repositoryMocks.createRegionFromInput.mockReset();
    repositoryMocks.updateRegionFromInput.mockReset();
    repositoryMocks.deleteRegionById.mockReset();
    repositoryMocks.createPeriodCategoryFromInput.mockReset();
    repositoryMocks.updatePeriodCategoryFromInput.mockReset();
    repositoryMocks.deletePeriodCategoryById.mockReset();
    repositoryMocks.createPolityFromInput.mockReset();
    repositoryMocks.updatePolityFromInput.mockReset();
    repositoryMocks.removePolity.mockReset();
    repositoryMocks.createReligionFromInput.mockReset();
    repositoryMocks.updateReligionFromInput.mockReset();
    repositoryMocks.removeReligion.mockReset();
    repositoryMocks.createDynastyFromInput.mockReset();
    repositoryMocks.updateDynastyFromInput.mockReset();
    repositoryMocks.removeDynasty.mockReset();
    repositoryMocks.createHistoricalPeriodFromInput.mockReset();
    repositoryMocks.updateHistoricalPeriodFromInput.mockReset();
    repositoryMocks.removeHistoricalPeriod.mockReset();
    repositoryMocks.createSectFromInput.mockReset();
    repositoryMocks.updateSectFromInput.mockReset();
    repositoryMocks.removeSect.mockReset();
    repositoryMocks.createTagFromInput.mockReset();
    repositoryMocks.updateTagFromInput.mockReset();
    repositoryMocks.deleteTagById.mockReset();
    repositoryMocks.createSourceFromInput.mockReset();
    repositoryMocks.updateSourceFromInput.mockReset();
    repositoryMocks.removeSource.mockReset();
    repositoryMocks.createCitationFromInput.mockReset();
    repositoryMocks.updateCitationFromInput.mockReset();
    repositoryMocks.removeCitation.mockReset();
    repositoryMocks.createPolityTransitionFromInput.mockReset();
    repositoryMocks.updatePolityTransitionFromInput.mockReset();
    repositoryMocks.deletePolityTransitionById.mockReset();
    repositoryMocks.createDynastySuccessionFromInput.mockReset();
    repositoryMocks.updateDynastySuccessionFromInput.mockReset();
    repositoryMocks.deleteDynastySuccessionById.mockReset();
    repositoryMocks.createHistoricalPeriodRelationFromInput.mockReset();
    repositoryMocks.updateHistoricalPeriodRelationFromInput.mockReset();
    repositoryMocks.deleteHistoricalPeriodRelationById.mockReset();
  });

  it("parses quoted csv cells with commas and newlines", () => {
    const parsed = parseCsv('title,description\n"平安京遷都","京都, 長岡京から移転"\n"長文","複数行\nの説明"');

    expect(parsed.headers).toEqual(["title", "description"]);
    expect(parsed.rows).toEqual([
      {
        rowNumber: 2,
        values: ["平安京遷都", "京都, 長岡京から移転"]
      },
      {
        rowNumber: 3,
        values: ["長文", "複数行\nの説明"]
      }
    ]);
  });

  it("builds event preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 1, name: "桓武天皇" }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);
    repositoryMocks.listRegions.mockReturnValue([{ id: 3, name: "京都" }]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([{ id: 4, name: "平安時代" }]);
    repositoryMocks.listEvents.mockReturnValue([
      {
        id: 99,
        title: "平安京遷都",
        eventType: "general",
        description: null,
        timeCalendarEra: "CE",
        timeStartYear: 794,
        timeEndYear: null,
        timeIsApproximate: false,
        timePrecision: "year",
        timeDisplayLabel: "794年",
        startCalendarEra: null,
        startYear: null,
        endCalendarEra: null,
        endYear: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const preview = previewEventCsvImport(
      "title,event_type,time_start_year,person,polities,periods,regions,tags\n平安京遷都,general,794,桓武天皇,日本,平安時代,京都,都城|日本史"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
    expect(preview.rows[0]).toMatchObject({
      rowNumber: 2,
      label: "平安京遷都",
      status: "duplicate-candidate",
      input: {
        title: "平安京遷都",
        eventType: "general",
        personIds: [1],
        polityIds: [2],
        periodIds: [4],
        regionIds: [3],
        tags: ["都城", "日本史"]
      }
    });
    expect(preview.rows[0].duplicateCandidates).toEqual([
      {
        id: 99,
        label: "平安京遷都",
        reason: "タイトルと年代が近接しています"
      }
    ]);
  });

  it("reports row level issues for invalid years and unknown references", () => {
    const preview = previewEventCsvImport(
      "title,event_type,time_start_year,person\n第1回十字軍,war,not-a-year,教皇ウルバヌス2世"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 0,
      errorCount: 1,
      warningCount: 0
    });
    expect(preview.rows[0].status).toBe("error");
    expect(preview.rows[0].issues).toEqual([
      {
        field: "time_start_year",
        message: "整数年を指定してください"
      },
      {
        field: "person",
        message: "未登録の参照名です: 教皇ウルバヌス2世"
      }
    ]);
    expect(preview.rows[0].input).toBeUndefined();
  });

  it("rejects csv without required headers", () => {
    expect(() => previewEventCsvImport("description,time_start_year\n説明,794")).toThrow(
      "必須ヘッダーが不足しています: title, event_type"
    );
    expect(() => previewPersonCsvImport("aliases,from_year\n伝教大師,767")).toThrow(
      "必須ヘッダーが不足しています: name"
    );
  });

  it("keeps unknown headers as warnings", () => {
    const preview = previewEventCsvImport("title,event_type,unknown_column\n平安京遷都,general,ignored");

    expect(preview.unknownHeaders).toEqual(["unknown_column"]);
    expect(preview.rows[0].warnings).toEqual([
      {
        field: "_header",
        message: "未対応列は無視されます: unknown_column"
      }
    ]);
  });

  it("imports only clean event rows", () => {
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);

    const result = applyEventCsvImport(
      "title,event_type,time_start_year,polities\n平安京遷都,general,794,日本\n鎌倉幕府成立,general,1185,日本"
    );

    expect(result).toEqual({
      kind: "event",
      insertedCount: 2,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.createEventFromInput).toHaveBeenCalledTimes(2);
    expect(repositoryMocks.createEventFromInput).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        title: "平安京遷都",
        polityIds: [2]
      })
    );
  });

  it("auto merges event rows when a single duplicate candidate exists", () => {
    repositoryMocks.listEvents.mockReturnValue([
      {
        id: 99,
        title: "平安京遷都",
        eventType: "general",
        description: null,
        timeCalendarEra: "CE",
        timeStartYear: 794,
        timeEndYear: null,
        timeIsApproximate: false,
        timePrecision: "year",
        timeDisplayLabel: "794年",
        startCalendarEra: null,
        startYear: null,
        endCalendarEra: null,
        endYear: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    expect(applyEventCsvImport("title,event_type,time_start_year\n平安京遷都,general,794")).toEqual({
      kind: "event",
      insertedCount: 0,
      updatedCount: 1,
      deletedCount: 0
    });
    expect(repositoryMocks.createEventFromInput).not.toHaveBeenCalled();
    expect(repositoryMocks.updateEventFromInput).toHaveBeenCalledWith(
      99,
      expect.objectContaining({ title: "平安京遷都" })
    );
  });

  it("builds person preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listRegions.mockReturnValue([{ id: 10, name: "近江" }]);
    repositoryMocks.listReligions.mockReturnValue([{ id: 11, name: "仏教" }]);
    repositoryMocks.listSects.mockReturnValue([{ id: 12, name: "天台宗" }]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([{ id: 13, name: "平安時代" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([
      {
        id: 50,
        name: "最澄",
        reading: "さいちょう",
        aliases: "伝教大師",
        note: null,
        fromCalendarEra: "CE",
        fromYear: 767,
        fromIsApproximate: false,
        toCalendarEra: "CE",
        toYear: 822,
        toIsApproximate: false
      }
    ]);

    const preview = previewPersonCsvImport(
      "name,reading,aliases,from_year,to_year,regions,religions,sects,periods\n最澄,さいちょう,伝教大師,767,822,近江,仏教,天台宗,平安時代"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
    expect(preview.rows[0]).toMatchObject({
      label: "最澄",
      status: "duplicate-candidate",
      input: {
        name: "最澄",
        reading: "さいちょう",
        aliases: ["伝教大師"],
        regionIds: [10],
        religionIds: [11],
        sectIds: [12],
        periodIds: [13]
      }
    });
  });

  it("imports only clean person rows", () => {
    repositoryMocks.listRegions.mockReturnValue([{ id: 10, name: "近江" }]);

    const result = applyPersonCsvImport(
      "name,reading,from_year,regions\n最澄,さいちょう,767,近江\n空海,くうかい,774,近江"
    );

    expect(result).toEqual({
      kind: "person",
      insertedCount: 2,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.createPersonFromInput).toHaveBeenCalledTimes(2);
    expect(repositoryMocks.createPersonFromInput).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "最澄",
        reading: "さいちょう",
        regionIds: [10]
      })
    );
  });

  it("reports person preview issues for unknown references", () => {
    const preview = previewPersonCsvImport("name,regions,religions\n最澄,比叡山,仏教");

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 0,
      errorCount: 1,
      warningCount: 0
    });
    expect(preview.rows[0].issues).toEqual([
      {
        field: "regions",
        message: "未登録の参照名です: 比叡山"
      },
      {
        field: "religions",
        message: "未登録の参照名です: 仏教"
      }
    ]);
  });

  it("auto merges person rows when a single duplicate candidate exists", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([
      {
        id: 50,
        name: "最澄",
        reading: "さいちょう",
        aliases: "伝教大師",
        note: null,
        fromCalendarEra: "CE",
        fromYear: 767,
        fromIsApproximate: false,
        toCalendarEra: "CE",
        toYear: 822,
        toIsApproximate: false
      }
    ]);

    expect(applyPersonCsvImport("name,reading,from_year,to_year\n最澄,さいちょう,767,822")).toEqual({
      kind: "person",
      insertedCount: 0,
      updatedCount: 1,
      deletedCount: 0
    });
    expect(repositoryMocks.createPersonFromInput).not.toHaveBeenCalled();
    expect(repositoryMocks.updatePersonFromInput).toHaveBeenCalledWith(
      50,
      expect.objectContaining({ name: "最澄", reading: "さいちょう" })
    );
  });

  it("builds role assignment preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 1, name: "最澄", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);
    repositoryMocks.listDynasties.mockReturnValue([{ id: 3, name: "平安朝" }]);
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReturnValue([
      {
        id: 40,
        personId: 1,
        title: "天台座主",
        polityId: 2,
        dynastyId: 3,
        note: null,
        isIncumbent: false,
        timeCalendarEra: "CE",
        timeStartYear: 804,
        timeEndYear: 822,
        timeIsApproximate: false,
        timePrecision: "year",
        timeDisplayLabel: null
      }
    ]);

    const preview = previewRoleAssignmentCsvImport(
      "person,title,polity,dynasty,time_start_year,time_end_year,is_incumbent\n最澄,天台座主,日本,平安朝,804,822,false"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
    expect(preview.rows[0]).toMatchObject({
      label: "最澄: 天台座主",
      status: "duplicate-candidate",
      input: {
        personId: 1,
        personName: "最澄",
        role: {
          title: "天台座主",
          polityId: 2,
          dynastyId: 3,
          isIncumbent: false,
          timeExpression: {
            calendarEra: "CE",
            startYear: 804,
            endYear: 822,
            isApproximate: false,
            precision: "year",
            displayLabel: ""
          }
        }
      }
    });
  });

  it("reports role assignment preview issues for unknown references", () => {
    const preview = previewRoleAssignmentCsvImport(
      "person,title,polity\n最澄,天台座主,日本"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 0,
      errorCount: 1,
      warningCount: 0
    });
    expect(preview.rows[0].issues).toEqual([
      {
        field: "person",
        message: "未登録の参照名です: 最澄"
      },
      {
        field: "polities",
        message: "未登録の参照名です: 日本"
      }
    ]);
  });

  it("imports clean role assignment rows grouped by person", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([
      { id: 1, name: "最澄", aliases: null },
      { id: 2, name: "空海", aliases: null }
    ]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);
    repositoryMocks.listDynasties.mockReturnValue([{ id: 3, name: "平安朝" }]);

    const result = applyRoleAssignmentCsvImport(
      "person,title,polity,dynasty,time_start_year,time_end_year,is_incumbent\n最澄,天台座主,日本,平安朝,804,822,false\n最澄,僧,日本,,805,,false\n空海,僧都,日本,,810,,false"
    );

    expect(result).toEqual({
      kind: "role-assignment",
      insertedCount: 3,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceRoleAssignmentsOnPerson).toHaveBeenCalledTimes(2);
    expect(repositoryMocks.replaceRoleAssignmentsOnPerson).toHaveBeenNthCalledWith(
      1,
      1,
      [
        expect.objectContaining({ title: "天台座主", polityId: 2, dynastyId: 3 }),
        expect.objectContaining({ title: "僧", polityId: 2, dynastyId: null })
      ]
    );
  });

  it("skips duplicate role assignment rows as merged", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 1, name: "最澄", aliases: null }]);
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReturnValue([
      {
        id: 40,
        personId: 1,
        title: "天台座主",
        polityId: null,
        dynastyId: null,
        note: null,
        isIncumbent: false,
        timeCalendarEra: "CE",
        timeStartYear: 804,
        timeEndYear: 822,
        timeIsApproximate: false,
        timePrecision: "year",
        timeDisplayLabel: null
      }
    ]);

    expect(applyRoleAssignmentCsvImport("person,title,time_start_year,time_end_year\n最澄,天台座主,804,822")).toEqual({
      kind: "role-assignment",
      insertedCount: 0,
      updatedCount: 1,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceRoleAssignmentsOnPerson).toHaveBeenCalledWith(1, [
      expect.objectContaining({ title: "天台座主" })
    ]);
  });

  it("builds event relation preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "平安京遷都" },
      { id: 2, title: "天台宗の成立" }
    ]);
    repositoryMocks.getEventRelationsByEventIds.mockReturnValue([
      { fromEventId: 1, toEventId: 2, relationType: "cause" }
    ]);

    const preview = previewEventRelationCsvImport(
      "from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
    expect(preview.rows[0]).toMatchObject({
      label: "平安京遷都 -> 天台宗の成立",
      status: "duplicate-candidate",
      input: {
        fromEventId: 1,
        fromEventTitle: "平安京遷都",
        relation: {
          toEventId: 2,
          relationType: "cause"
        }
      }
    });
  });

  it("reports event relation preview issues for unknown references and self references", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "平安京遷都" }]);

    const preview = previewEventRelationCsvImport(
      "from_event,to_event,relation_type\n平安京遷都,平安京遷都,cause\n平安京遷都,天台宗の成立,invalid"
    );

    expect(preview.summary).toEqual({
      totalRows: 2,
      okCount: 0,
      duplicateCandidateCount: 0,
      errorCount: 2,
      warningCount: 0
    });
    expect(preview.rows[0].issues).toEqual([
      {
        field: "to_event",
        message: "自己参照は登録できません"
      }
    ]);
    expect(preview.rows[1].issues).toEqual([
      {
        field: "to_event",
        message: "未登録の参照名です: 天台宗の成立"
      },
      {
        field: "relation_type",
        message: "before / after / cause / related のいずれかを指定してください"
      }
    ]);
  });

  it("imports clean event relation rows grouped by source event", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "平安京遷都" },
      { id: 2, title: "天台宗の成立" },
      { id: 3, title: "応仁の乱" }
    ]);

    const result = applyEventRelationCsvImport(
      "from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause\n平安京遷都,応仁の乱,before"
    );

    expect(result).toEqual({
      kind: "event-relation",
      insertedCount: 2,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceEventRelationsOnEvent).toHaveBeenCalledTimes(3);
    expect(repositoryMocks.replaceEventRelationsOnEvent).toHaveBeenCalledWith(1, [
      { toEventId: 2, relationType: "cause" },
      { toEventId: 3, relationType: "before" }
    ]);
  });

  it("skips duplicate event relation rows as merged", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "平安京遷都" },
      { id: 2, title: "天台宗の成立" }
    ]);
    repositoryMocks.getEventRelationsByEventIds.mockReturnValue([
      { fromEventId: 1, toEventId: 2, relationType: "cause" }
    ]);

    expect(applyEventRelationCsvImport("from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause")).toEqual({
      kind: "event-relation",
      insertedCount: 0,
      updatedCount: 1,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceEventRelationsOnEvent).toHaveBeenCalledWith(1, [
      { toEventId: 2, relationType: "cause" }
    ]);
  });

  it("builds conflict participant preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "第1回十字軍", eventType: "war" }
    ]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.getConflictParticipantsByEventIds.mockReturnValue([
      {
        eventId: 1,
        participantType: "person",
        participantId: 10,
        role: "leader",
        note: null
      }
    ]);

    const preview = previewConflictParticipantCsvImport(
      "event,participant_type,participant_name,role\n第1回十字軍,person,教皇ウルバヌス2世,leader"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
  });

  it("rejects non-conflict events in conflict participant preview", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "平安京遷都", eventType: "general" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "桓武天皇", aliases: null }]);

    const preview = previewConflictParticipantCsvImport(
      "event,participant_type,participant_name,role\n平安京遷都,person,桓武天皇,leader"
    );

    expect(preview.rows[0].status).toBe("error");
    expect(preview.rows[0].issues).toEqual([
      {
        field: "event",
        message: "war / rebellion / civil_war のイベントだけ登録できます"
      }
    ]);
  });

  it("imports clean conflict participant rows grouped by event", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "第1回十字軍", eventType: "war" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "ローマ教皇庁" }]);

    const result = applyConflictParticipantCsvImport(
      "event,participant_type,participant_name,role\n第1回十字軍,person,教皇ウルバヌス2世,leader\n第1回十字軍,polity,ローマ教皇庁,ally"
    );

    expect(result).toEqual({
      kind: "conflict-participant",
      insertedCount: 2,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceConflictParticipantsOnEvent).toHaveBeenCalledWith(1, [
      expect.objectContaining({ participantType: "person", participantId: 10, role: "leader" }),
      expect.objectContaining({ participantType: "polity", participantId: 20, role: "ally" })
    ]);
  });

  it("builds conflict outcome preview rows and blocks existing outcomes", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "第1回十字軍", eventType: "war" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "セルジューク朝" }]);
    repositoryMocks.getConflictOutcomesByEventIds.mockReturnValue([{ eventId: 1 }]);

    const preview = previewConflictOutcomeCsvImport(
      "event,winner_participants,loser_participants,resolution_summary\n第1回十字軍,person:教皇ウルバヌス2世,polity:セルジューク朝,エルサレム占領"
    );

    expect(preview.summary).toEqual({
      totalRows: 1,
      okCount: 0,
      duplicateCandidateCount: 1,
      errorCount: 0,
      warningCount: 0
    });
  });

  it("imports clean conflict outcomes", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "第1回十字軍", eventType: "war" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "セルジューク朝" }]);

    const result = applyConflictOutcomeCsvImport(
      "event,winner_participants,loser_participants,resolution_summary\n第1回十字軍,person:教皇ウルバヌス2世,polity:セルジューク朝,エルサレム占領"
    );

    expect(result).toEqual({
      kind: "conflict-outcome",
      insertedCount: 1,
      updatedCount: 0,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceConflictOutcomeOnEvent).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        resolutionSummary: "エルサレム占領",
        winnerParticipants: [expect.objectContaining({ participantType: "person", participantId: 10, side: "winner" })],
        loserParticipants: [expect.objectContaining({ participantType: "polity", participantId: 20, side: "loser" })]
      })
    );
  });

  it("replaces existing conflict outcomes as merged", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "第1回十字軍", eventType: "war" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "セルジューク朝" }]);
    repositoryMocks.getConflictOutcomesByEventIds.mockReturnValue([{ eventId: 1 }]);

    const result = applyConflictOutcomeCsvImport(
      "event,winner_participants,loser_participants,resolution_summary\n第1回十字軍,person:教皇ウルバヌス2世,polity:セルジューク朝,エルサレム占領"
    );

    expect(result).toEqual({
      kind: "conflict-outcome",
      insertedCount: 0,
      updatedCount: 1,
      deletedCount: 0
    });
    expect(repositoryMocks.replaceConflictOutcomeOnEvent).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ resolutionSummary: "エルサレム占領" })
    );
  });

  it("previews and imports regions", () => {
    repositoryMocks.listRegions.mockReturnValue([{ id: 1, name: "日本" }]);
    const preview = previewRegionCsvImport("name,parent_region,description\n近畿,日本,古代からの中核地域");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { name: "近畿", parentRegionId: 1, description: "古代からの中核地域" }
    });

    const result = applyRegionCsvImport("name,parent_region,description\n近畿,日本,古代からの中核地域");
    expect(result).toEqual({ kind: "region", insertedCount: 1, updatedCount: 0, deletedCount: 1 });
    expect(repositoryMocks.createRegionFromInput).toHaveBeenCalledWith(
      expect.objectContaining({ name: "近畿", parentRegionId: 1, description: "古代からの中核地域" })
    );
  });

  it("previews and imports period categories", () => {
    const preview = previewPeriodCategoryCsvImport("name,description\n日本史区分,日本史の区分");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { name: "日本史区分", description: "日本史の区分" }
    });

    const result = applyPeriodCategoryCsvImport("name,description\n日本史区分,日本史の区分");
    expect(result).toEqual({ kind: "period-category", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createPeriodCategoryFromInput).toHaveBeenCalledWith(
      expect.objectContaining({ name: "日本史区分" })
    );
  });

  it("previews and imports polities", () => {
    repositoryMocks.listRegions.mockReturnValue([{ id: 1, name: "東アジア" }]);
    const preview = previewPolityCsvImport("name,from_year,regions\n日本,660,東アジア");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        name: "日本",
        regionIds: [1],
        fromTimeExpression: expect.objectContaining({ startYear: 660 })
      }
    });

    const result = applyPolityCsvImport("name,from_year,regions\n日本,660,東アジア");
    expect(result).toEqual({ kind: "polity", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createPolityFromInput).toHaveBeenCalled();
  });

  it("previews and imports religions", () => {
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "釈迦", aliases: null }]);
    const preview = previewReligionCsvImport("name,time_start_year,founders\n仏教,-566,釈迦");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        name: "仏教",
        founderIds: [10]
      }
    });

    const result = applyReligionCsvImport("name,time_start_year,founders\n仏教,-566,釈迦");
    expect(result).toEqual({ kind: "religion", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createReligionFromInput).toHaveBeenCalled();
  });

  it("previews and imports dynasties", () => {
    repositoryMocks.listPolities.mockReturnValue([{ id: 1, name: "日本" }]);
    repositoryMocks.listRegions.mockReturnValue([{ id: 2, name: "日本" }]);
    const preview = previewDynastyCsvImport("name,polity,time_start_year,regions\n平安朝,日本,794,日本");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        name: "平安朝",
        polityIds: [1],
        regionIds: [2],
        fromTimeExpression: expect.objectContaining({ startYear: 794 })
      }
    });

    const result = applyDynastyCsvImport("name,polity,time_start_year,regions\n平安朝,日本,794,日本");
    expect(result).toEqual({ kind: "dynasty", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createDynastyFromInput).toHaveBeenCalled();
  });

  it("previews and imports historical periods", () => {
    repositoryMocks.listPeriodCategories.mockReturnValue([{ id: 1, name: "日本史区分" }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);
    repositoryMocks.listRegions.mockReturnValue([{ id: 3, name: "日本" }]);
    const preview = previewHistoricalPeriodCsvImport(
      "name,category,polity,time_start_year,regions\n平安時代,日本史区分,日本,794,日本"
    );
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        name: "平安時代",
        categoryId: 1,
        polityId: 2,
        regionIds: [3],
        fromTimeExpression: expect.objectContaining({ startYear: 794 })
      }
    });

    const result = applyHistoricalPeriodCsvImport(
      "name,category,polity,time_start_year,regions\n平安時代,日本史区分,日本,794,日本"
    );
    expect(result).toEqual({ kind: "historical-period", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createHistoricalPeriodFromInput).toHaveBeenCalled();
  });

  it("previews and imports sects", () => {
    repositoryMocks.listReligions.mockReturnValue([{ id: 1, name: "仏教" }]);
    repositoryMocks.listPersonDetailed.mockReturnValue([{ id: 10, name: "最澄", aliases: null }]);
    const preview = previewSectCsvImport("name,religion,time_start_year,founders\n天台宗,仏教,805,最澄");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        name: "天台宗",
        religionId: 1,
        founderIds: [10]
      }
    });

    const result = applySectCsvImport("name,religion,time_start_year,founders\n天台宗,仏教,805,最澄");
    expect(result).toEqual({ kind: "sect", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createSectFromInput).toHaveBeenCalled();
  });

  it("previews and imports tags", () => {
    const preview = previewTagCsvImport("name\n都城");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { name: "都城" }
    });

    const result = applyTagCsvImport("name\n都城");
    expect(result).toEqual({ kind: "tag", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createTagFromInput).toHaveBeenCalledWith(expect.objectContaining({ name: "都城" }));
  });

  it("previews and imports sources", () => {
    const preview = previewSourceCsvImport("title,author,publisher\n日本書紀,舎人親王,朝廷");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { title: "日本書紀", author: "舎人親王", publisher: "朝廷" }
    });

    const result = applySourceCsvImport("title,author,publisher\n日本書紀,舎人親王,朝廷");
    expect(result).toEqual({ kind: "source", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createSourceFromInput).toHaveBeenCalled();
  });

  it("previews and imports citations", () => {
    repositoryMocks.listSources.mockReturnValue([{ id: 1, title: "日本書紀" }]);
    repositoryMocks.listEvents.mockReturnValue([{ id: 2, title: "平安京遷都" }]);
    const preview = previewCitationCsvImport("source,target_type,target_name,locator\n日本書紀,event,平安京遷都,巻第38");
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { sourceId: 1, targetType: "event", targetId: 2, locator: "巻第38" }
    });

    const result = applyCitationCsvImport("source,target_type,target_name,locator\n日本書紀,event,平安京遷都,巻第38");
    expect(result).toEqual({ kind: "citation", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createCitationFromInput).toHaveBeenCalled();
  });

  it("previews and imports polity transitions", () => {
    repositoryMocks.listPolities.mockReturnValue([
      { id: 1, name: "ローマ共和国" },
      { id: 2, name: "ローマ帝国" }
    ]);
    const preview = previewPolityTransitionCsvImport(
      "predecessor_polity,successor_polity,transition_type\nローマ共和国,ローマ帝国,succeeded"
    );
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        predecessorPolityId: 1,
        successorPolityId: 2,
        transitionType: "succeeded"
      }
    });

    const result = applyPolityTransitionCsvImport(
      "predecessor_polity,successor_polity,transition_type\nローマ共和国,ローマ帝国,succeeded"
    );
    expect(result).toEqual({ kind: "polity-transition", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createPolityTransitionFromInput).toHaveBeenCalled();
  });

  it("previews and imports dynasty successions", () => {
    repositoryMocks.listPolities.mockReturnValue([{ id: 1, name: "日本" }]);
    repositoryMocks.listDynasties.mockReturnValue([
      { id: 2, name: "奈良朝" },
      { id: 3, name: "平安朝" }
    ]);
    const preview = previewDynastySuccessionCsvImport(
      "polity,predecessor_dynasty,successor_dynasty\n日本,奈良朝,平安朝"
    );
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: {
        polityId: 1,
        predecessorDynastyId: 2,
        successorDynastyId: 3
      }
    });

    const result = applyDynastySuccessionCsvImport(
      "polity,predecessor_dynasty,successor_dynasty\n日本,奈良朝,平安朝"
    );
    expect(result).toEqual({ kind: "dynasty-succession", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createDynastySuccessionFromInput).toHaveBeenCalled();
  });

  it("previews and imports historical period relations", () => {
    repositoryMocks.listHistoricalPeriods.mockReturnValue([
      { id: 1, name: "奈良時代" },
      { id: 2, name: "平安時代" }
    ]);
    const preview = previewHistoricalPeriodRelationCsvImport(
      "from_period,to_period,relation_type\n奈良時代,平安時代,succeeds"
    );
    expect(preview.rows[0]).toMatchObject({
      status: "ok",
      input: { fromPeriodId: 1, toPeriodId: 2, relationType: "succeeds" }
    });

    const result = applyHistoricalPeriodRelationCsvImport(
      "from_period,to_period,relation_type\n奈良時代,平安時代,succeeds"
    );
    expect(result).toEqual({ kind: "historical-period-relation", insertedCount: 1, updatedCount: 0, deletedCount: 0 });
    expect(repositoryMocks.createHistoricalPeriodRelationFromInput).toHaveBeenCalled();
  });
});
