import { describe, expect, it } from "vitest";
import { parseEventFormData } from "@/features/events/schema";

describe("parseEventFormData", () => {
  it("parses conflict participants and outcome participants from form data", () => {
    const formData = new FormData();
    formData.set("title", "応仁の乱");
    formData.set("description", "京都を主戦場とした内乱");
    formData.set("tags", "内乱, 京都, 内乱");
    formData.set("eventType", "civil_war");
    formData.set("participantCount", "2");
    formData.set("participants.0.participantType", "polity");
    formData.set("participants.0.participantId", "1");
    formData.set("participants.0.role", "defender");
    formData.set("participants.0.note", "幕府側");
    formData.set("participants.1.participantType", "person");
    formData.set("participants.1.participantId", "2");
    formData.set("participants.1.role", "leader");
    formData.set("participants.1.note", "将軍");
    formData.append("conflictOutcome.winnerParticipants", "person:2");
    formData.append("conflictOutcome.loserParticipants", "polity:1");
    formData.set("conflictOutcome.winnerSummary", "将軍家");
    formData.set("conflictOutcome.loserSummary", "幕府秩序");
    formData.set("conflictOutcome.settlementSummary", "権威が低下した");

    const parsed = parseEventFormData(formData);

    expect(parsed.conflictParticipants).toEqual([
      {
        participantType: "polity",
        participantId: 1,
        role: "defender",
        note: "幕府側"
      },
      {
        participantType: "person",
        participantId: 2,
        role: "leader",
        note: "将軍"
      }
    ]);
    expect(parsed.tags).toEqual(["内乱", "京都"]);
    expect(parsed.conflictOutcome).toEqual({
      winnerParticipants: [{ side: "winner", participantType: "person", participantId: 2 }],
      loserParticipants: [{ side: "loser", participantType: "polity", participantId: 1 }],
      winnerSummary: "将軍家",
      loserSummary: "幕府秩序",
      settlementSummary: "権威が低下した",
      note: undefined
    });
  });

  it("ignores invalid outcome participant values", () => {
    const formData = new FormData();
    formData.set("title", "第1回十字軍");
    formData.set("eventType", "war");
    formData.set("participantCount", "0");
    formData.append("conflictOutcome.winnerParticipants", "religion:not-a-number");
    formData.append("conflictOutcome.winnerParticipants", "invalid:5");
    formData.set("conflictOutcome.settlementSummary", "エルサレムを占領");

    const parsed = parseEventFormData(formData);

    expect(parsed.conflictOutcome).toEqual({
      winnerParticipants: [],
      loserParticipants: [],
      winnerSummary: undefined,
      loserSummary: undefined,
      settlementSummary: "エルサレムを占領",
      note: undefined
    });
  });
});
