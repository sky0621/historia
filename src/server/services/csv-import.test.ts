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
  getRoleAssignmentsByPersonIds: vi.fn(),
  getEventRelationsByEventIds: vi.fn(),
  getConflictParticipantsByEventIds: vi.fn(),
  getConflictOutcomesByEventIds: vi.fn(),
  createEventFromInput: vi.fn(),
  createPersonFromInput: vi.fn(),
  appendRoleAssignmentsToPerson: vi.fn(),
  appendEventRelationsToEvent: vi.fn(),
  appendConflictParticipantsToEvent: vi.fn(),
  appendConflictOutcomeToEvent: vi.fn()
}));

vi.mock("@/server/repositories/events", () => ({
  listEvents: repositoryMocks.listEvents,
  getEventRelationsByEventIds: repositoryMocks.getEventRelationsByEventIds,
  getConflictParticipantsByEventIds: repositoryMocks.getConflictParticipantsByEventIds,
  getConflictOutcomesByEventIds: repositoryMocks.getConflictOutcomesByEventIds
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

vi.mock("@/server/repositories/role-assignments", () => ({
  getRoleAssignmentsByPersonIds: repositoryMocks.getRoleAssignmentsByPersonIds
}));

vi.mock("@/server/services/events", () => ({
  createEventFromInput: repositoryMocks.createEventFromInput,
  appendEventRelationsToEvent: repositoryMocks.appendEventRelationsToEvent,
  appendConflictParticipantsToEvent: repositoryMocks.appendConflictParticipantsToEvent,
  appendConflictOutcomeToEvent: repositoryMocks.appendConflictOutcomeToEvent
}));

vi.mock("@/server/services/people", () => ({
  createPersonFromInput: repositoryMocks.createPersonFromInput,
  appendRoleAssignmentsToPerson: repositoryMocks.appendRoleAssignmentsToPerson
}));

import {
  applyConflictOutcomeCsvImport,
  applyConflictParticipantCsvImport,
  applyEventCsvImport,
  applyPersonCsvImport,
  applyEventRelationCsvImport,
  applyRoleAssignmentCsvImport,
  parseCsv,
  previewConflictOutcomeCsvImport,
  previewConflictParticipantCsvImport,
  previewEventCsvImport,
  previewEventRelationCsvImport,
  previewPersonCsvImport,
  previewRoleAssignmentCsvImport
} from "@/server/services/csv-import";

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
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReset();
    repositoryMocks.getEventRelationsByEventIds.mockReset();
    repositoryMocks.getConflictParticipantsByEventIds.mockReset();
    repositoryMocks.getConflictOutcomesByEventIds.mockReset();

    repositoryMocks.listEvents.mockReturnValue([]);
    repositoryMocks.listPeopleDetailed.mockReturnValue([]);
    repositoryMocks.listPolities.mockReturnValue([]);
    repositoryMocks.listDynasties.mockReturnValue([]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([]);
    repositoryMocks.listReligions.mockReturnValue([]);
    repositoryMocks.listSects.mockReturnValue([]);
    repositoryMocks.listRegions.mockReturnValue([]);
    repositoryMocks.getRoleAssignmentsByPersonIds.mockReturnValue([]);
    repositoryMocks.getEventRelationsByEventIds.mockReturnValue([]);
    repositoryMocks.getConflictParticipantsByEventIds.mockReturnValue([]);
    repositoryMocks.getConflictOutcomesByEventIds.mockReturnValue([]);
    repositoryMocks.createEventFromInput.mockReset();
    repositoryMocks.createEventFromInput.mockReturnValue(1);
    repositoryMocks.createPersonFromInput.mockReset();
    repositoryMocks.createPersonFromInput.mockReturnValue(1);
    repositoryMocks.appendRoleAssignmentsToPerson.mockReset();
    repositoryMocks.appendEventRelationsToEvent.mockReset();
    repositoryMocks.appendConflictParticipantsToEvent.mockReset();
    repositoryMocks.appendConflictOutcomeToEvent.mockReset();
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

  it("rejects csv without required headers", () => {
    expect(() => previewEventCsvImport("description,time_start_year\n説明,794")).toThrow(
      "必須ヘッダーが不足しています: title, event_type"
    );
    expect(() => previewPersonCsvImport("aliases,birth_start_year\n伝教大師,767")).toThrow(
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

  it("builds person preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listRegions.mockReturnValue([{ id: 10, name: "近江" }]);
    repositoryMocks.listReligions.mockReturnValue([{ id: 11, name: "仏教" }]);
    repositoryMocks.listSects.mockReturnValue([{ id: 12, name: "天台宗" }]);
    repositoryMocks.listHistoricalPeriods.mockReturnValue([{ id: 13, name: "平安時代" }]);
    repositoryMocks.listPeopleDetailed.mockReturnValue([
      {
        id: 50,
        name: "最澄",
        aliases: "伝教大師",
        note: null,
        birthCalendarEra: "CE",
        birthStartYear: 767,
        birthEndYear: null,
        birthIsApproximate: false,
        birthPrecision: "year",
        birthDisplayLabel: "767年",
        deathCalendarEra: "CE",
        deathStartYear: 822,
        deathEndYear: null,
        deathIsApproximate: false,
        deathPrecision: "year",
        deathDisplayLabel: "822年"
      }
    ]);

    const preview = previewPersonCsvImport(
      "name,aliases,birth_start_year,death_start_year,regions,religions,sects,periods\n最澄,伝教大師,767,822,近江,仏教,天台宗,平安時代"
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
      "name,birth_start_year,regions\n最澄,767,近江\n空海,774,近江"
    );

    expect(result).toEqual({
      kind: "person",
      importedCount: 2
    });
    expect(repositoryMocks.createPersonFromInput).toHaveBeenCalledTimes(2);
    expect(repositoryMocks.createPersonFromInput).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: "最澄",
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

  it("rejects person import when preview contains duplicate candidates", () => {
    repositoryMocks.listPeopleDetailed.mockReturnValue([
      {
        id: 50,
        name: "最澄",
        aliases: "伝教大師",
        note: null,
        birthCalendarEra: "CE",
        birthStartYear: 767,
        birthEndYear: null,
        birthIsApproximate: false,
        birthPrecision: "year",
        birthDisplayLabel: "767年",
        deathCalendarEra: "CE",
        deathStartYear: 822,
        deathEndYear: null,
        deathIsApproximate: false,
        deathPrecision: "year",
        deathDisplayLabel: "822年"
      }
    ]);

    expect(() =>
      applyPersonCsvImport("name,birth_start_year,death_start_year\n最澄,767,822")
    ).toThrow("error または duplicate-candidate を含むため import を実行できません");
    expect(repositoryMocks.createPersonFromInput).not.toHaveBeenCalled();
  });

  it("builds role assignment preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 1, name: "最澄", aliases: null }]);
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
        field: "people",
        message: "未登録の参照名です: 最澄"
      },
      {
        field: "polities",
        message: "未登録の参照名です: 日本"
      }
    ]);
  });

  it("imports clean role assignment rows grouped by person", () => {
    repositoryMocks.listPeopleDetailed.mockReturnValue([
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
      importedCount: 3
    });
    expect(repositoryMocks.appendRoleAssignmentsToPerson).toHaveBeenCalledTimes(2);
    expect(repositoryMocks.appendRoleAssignmentsToPerson).toHaveBeenNthCalledWith(
      1,
      1,
      [
        expect.objectContaining({ title: "天台座主", polityId: 2, dynastyId: 3 }),
        expect.objectContaining({ title: "僧", polityId: 2, dynastyId: null })
      ]
    );
  });

  it("rejects role assignment import when preview contains duplicate candidates", () => {
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 1, name: "最澄", aliases: null }]);
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

    expect(() =>
      applyRoleAssignmentCsvImport("person,title,time_start_year,time_end_year\n最澄,天台座主,804,822")
    ).toThrow("error または duplicate-candidate を含むため import を実行できません");
    expect(repositoryMocks.appendRoleAssignmentsToPerson).not.toHaveBeenCalled();
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
      importedCount: 2
    });
    expect(repositoryMocks.appendEventRelationsToEvent).toHaveBeenCalledTimes(1);
    expect(repositoryMocks.appendEventRelationsToEvent).toHaveBeenCalledWith(1, [
      { toEventId: 2, relationType: "cause" },
      { toEventId: 3, relationType: "before" }
    ]);
  });

  it("rejects event relation import when preview contains duplicate candidates", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "平安京遷都" },
      { id: 2, title: "天台宗の成立" }
    ]);
    repositoryMocks.getEventRelationsByEventIds.mockReturnValue([
      { fromEventId: 1, toEventId: 2, relationType: "cause" }
    ]);

    expect(() =>
      applyEventRelationCsvImport("from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause")
    ).toThrow("error または duplicate-candidate を含むため import を実行できません");
    expect(repositoryMocks.appendEventRelationsToEvent).not.toHaveBeenCalled();
  });

  it("builds conflict participant preview rows with resolved references and duplicate candidates", () => {
    repositoryMocks.listEvents.mockReturnValue([
      { id: 1, title: "第1回十字軍", eventType: "war" }
    ]);
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
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
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 10, name: "桓武天皇", aliases: null }]);

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
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "ローマ教皇庁" }]);

    const result = applyConflictParticipantCsvImport(
      "event,participant_type,participant_name,role\n第1回十字軍,person,教皇ウルバヌス2世,leader\n第1回十字軍,polity,ローマ教皇庁,ally"
    );

    expect(result).toEqual({
      kind: "conflict-participant",
      importedCount: 2
    });
    expect(repositoryMocks.appendConflictParticipantsToEvent).toHaveBeenCalledWith(1, [
      expect.objectContaining({ participantType: "person", participantId: 10, role: "leader" }),
      expect.objectContaining({ participantType: "polity", participantId: 20, role: "ally" })
    ]);
  });

  it("builds conflict outcome preview rows and blocks existing outcomes", () => {
    repositoryMocks.listEvents.mockReturnValue([{ id: 1, title: "第1回十字軍", eventType: "war" }]);
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "セルジューク朝" }]);
    repositoryMocks.getConflictOutcomesByEventIds.mockReturnValue([{ eventId: 1 }]);

    const preview = previewConflictOutcomeCsvImport(
      "event,winner_participants,loser_participants,settlement_summary\n第1回十字軍,person:教皇ウルバヌス2世,polity:セルジューク朝,エルサレム占領"
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
    repositoryMocks.listPeopleDetailed.mockReturnValue([{ id: 10, name: "教皇ウルバヌス2世", aliases: null }]);
    repositoryMocks.listPolities.mockReturnValue([{ id: 20, name: "セルジューク朝" }]);

    const result = applyConflictOutcomeCsvImport(
      "event,winner_participants,loser_participants,settlement_summary\n第1回十字軍,person:教皇ウルバヌス2世,polity:セルジューク朝,エルサレム占領"
    );

    expect(result).toEqual({
      kind: "conflict-outcome",
      importedCount: 1
    });
    expect(repositoryMocks.appendConflictOutcomeToEvent).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        settlementSummary: "エルサレム占領",
        winnerParticipants: [expect.objectContaining({ participantType: "person", participantId: 10, side: "winner" })],
        loserParticipants: [expect.objectContaining({ participantType: "polity", participantId: 20, side: "loser" })]
      })
    );
  });
});
