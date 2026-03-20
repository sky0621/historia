import { beforeEach, describe, expect, it, vi } from "vitest";

const repositoryMocks = vi.hoisted(() => ({
  listEvents: vi.fn(),
  listPeopleDetailed: vi.fn(),
  listPolities: vi.fn(),
  listDynasties: vi.fn(),
  listHistoricalPeriods: vi.fn(),
  listReligions: vi.fn(),
  listSects: vi.fn(),
  listRegions: vi.fn(),
  createEventFromInput: vi.fn()
}));

vi.mock("@/server/repositories/events", () => ({
  listEvents: repositoryMocks.listEvents
}));

vi.mock("@/server/repositories/people-detail", () => ({
  listPeopleDetailed: repositoryMocks.listPeopleDetailed
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

vi.mock("@/server/repositories/religions", () => ({
  listReligions: repositoryMocks.listReligions
}));

vi.mock("@/server/repositories/sects", () => ({
  listSects: repositoryMocks.listSects
}));

vi.mock("@/server/repositories/regions", () => ({
  listRegions: repositoryMocks.listRegions
}));

vi.mock("@/server/services/events", () => ({
  createEventFromInput: repositoryMocks.createEventFromInput
}));

import { applyEventCsvImport, parseCsv, previewEventCsvImport } from "@/server/services/csv-import";

describe("csv import service", () => {
  beforeEach(() => {
    repositoryMocks.listEvents.mockReset();
    repositoryMocks.listPeopleDetailed.mockReset();
    repositoryMocks.listPolities.mockReset();
    repositoryMocks.listDynasties.mockReset();
    repositoryMocks.listHistoricalPeriods.mockReset();
    repositoryMocks.listReligions.mockReset();
    repositoryMocks.listSects.mockReset();
    repositoryMocks.listRegions.mockReset();

    repositoryMocks.listEvents.mockReturnValue([]);
    repositoryMocks.listPeopleDetailed.mockReturnValue([]);
    repositoryMocks.listPolities.mockReturnValue([]);
    repositoryMocks.listDynasties.mockReturnValue([]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([]);
    repositoryMocks.listReligions.mockReturnValue([]);
    repositoryMocks.listSects.mockReturnValue([]);
    repositoryMocks.listRegions.mockReturnValue([]);
    repositoryMocks.createEventFromInput.mockReset();
    repositoryMocks.createEventFromInput.mockReturnValue(1);
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
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 1, name: "桓武天皇" }]);
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
      "title,event_type,time_start_year,people,polities,periods,regions,tags\n平安京遷都,general,794,桓武天皇,日本,平安時代,京都,都城|日本史"
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
      "title,event_type,time_start_year,people\n第1回十字軍,war,not-a-year,教皇ウルバヌス2世"
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
        field: "people",
        message: "未登録の参照名です: 教皇ウルバヌス2世"
      }
    ]);
    expect(preview.rows[0].input).toBeUndefined();
  });

  it("imports only clean event rows", () => {
    repositoryMocks.listPolities.mockReturnValue([{ id: 2, name: "日本" }]);

    const result = applyEventCsvImport(
      "title,event_type,time_start_year,polities\n平安京遷都,general,794,日本\n鎌倉幕府成立,general,1185,日本"
    );

    expect(result).toEqual({
      kind: "event",
      importedCount: 2
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

  it("rejects import when preview contains duplicate candidates", () => {
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

    expect(() =>
      applyEventCsvImport("title,event_type,time_start_year\n平安京遷都,general,794")
    ).toThrow("error または duplicate-candidate を含むため import を実行できません");
    expect(repositoryMocks.createEventFromInput).not.toHaveBeenCalled();
  });
});
