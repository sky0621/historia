import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const idsSchema = z.array(z.number().int().positive()).default([]);

export const conflictParticipantSchema = z.object({
  participantType: z.enum(["polity", "person", "religion", "sect"]),
  participantId: z.number().int().positive(),
  role: z.enum(["attacker", "defender", "leader", "ally", "other"]),
  note: z.string().trim().optional()
});

export const conflictOutcomeParticipantSchema = z.object({
  side: z.enum(["winner", "loser"]),
  participantType: z.enum(["polity", "person", "religion", "sect"]),
  participantId: z.number().int().positive()
});

export const eventRelationSchema = z.object({
  toEventId: z.number().int().positive(),
  relationType: z.enum(["before", "after", "cause", "related", "parent", "child"])
});

export const eventSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  description: z.string().trim().optional(),
  tags: z.array(z.string().trim().min(1)).default([]),
  eventType: z.enum(["general", "war", "rebellion", "civil_war"]),
  fromTimeExpression: timeExpressionSchema.optional(),
  toTimeExpression: timeExpressionSchema.optional(),
  personIds: idsSchema,
  polityIds: idsSchema,
  dynastyIds: idsSchema,
  religionIds: idsSchema,
  sectIds: idsSchema,
  regionIds: idsSchema,
  periodIds: idsSchema,
  relations: z.array(eventRelationSchema).default([]),
  conflictParticipants: z.array(conflictParticipantSchema).default([]),
  conflictOutcome: z
    .object({
      winnerParticipants: z.array(conflictOutcomeParticipantSchema).default([]),
      loserParticipants: z.array(conflictOutcomeParticipantSchema).default([]),
      winnerSummary: z.string().trim().optional(),
      loserSummary: z.string().trim().optional(),
      resolutionSummary: z.string().trim().optional(),
      note: z.string().trim().optional()
    })
    .optional()
});

export type EventInput = z.infer<typeof eventSchema>;

export function parseEventFormData(formData: FormData): EventInput {
  return eventSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    tags: parseTagNames(formData.get("tags")),
    eventType: formData.get("eventType"),
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    personIds: normalizeIds(formData.getAll("personIds")),
    polityIds: normalizeIds(formData.getAll("polityIds")),
    dynastyIds: normalizeIds(formData.getAll("dynastyIds")),
    religionIds: normalizeIds(formData.getAll("religionIds")),
    sectIds: normalizeIds(formData.getAll("sectIds")),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    periodIds: normalizeIds(formData.getAll("periodIds")),
    relations: parseRelations(formData),
    conflictParticipants: parseConflictParticipants(formData),
    conflictOutcome: parseConflictOutcome(formData)
  });
}

function parseTagNames(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));
}

function parseRelations(formData: FormData) {
  const count = Number(formData.get("relationCount") ?? 0);
  const relations = [];

  for (let index = 0; index < count; index += 1) {
    const toEventId = Number(formData.get(`relations.${index}.toEventId`) ?? 0);
    const relationType = formData.get(`relations.${index}.relationType`);

    if (!Number.isFinite(toEventId) || toEventId <= 0 || typeof relationType !== "string" || relationType.length === 0) {
      continue;
    }

    relations.push({ toEventId, relationType });
  }

  return relations;
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function parseConflictParticipants(formData: FormData) {
  const count = Number(formData.get("participantCount") ?? 0);
  const participants = [];

  for (let index = 0; index < count; index += 1) {
    const participantType = formData.get(`participants.${index}.participantType`);
    const participantId = Number(formData.get(`participants.${index}.participantId`) ?? 0);
    const role = formData.get(`participants.${index}.role`);
    const note = formData.get(`participants.${index}.note`) ?? undefined;

    if (
      typeof participantType !== "string" ||
      typeof role !== "string" ||
      !Number.isFinite(participantId) ||
      participantId <= 0
    ) {
      continue;
    }

    participants.push({
      participantType,
      participantId,
      role,
      note: typeof note === "string" ? note : undefined
    });
  }

  return participants;
}

function parseConflictOutcome(formData: FormData) {
  const resolutionSummary = formData.get("conflictOutcome.resolutionSummary");
  const winnerSummary = formData.get("conflictOutcome.winnerSummary");
  const loserSummary = formData.get("conflictOutcome.loserSummary");
  const note = formData.get("conflictOutcome.note");
  const winnerParticipants = parseConflictOutcomeParticipants(formData.getAll("conflictOutcome.winnerParticipants"), "winner");
  const loserParticipants = parseConflictOutcomeParticipants(formData.getAll("conflictOutcome.loserParticipants"), "loser");
  const normalizedWinner = typeof winnerSummary === "string" ? winnerSummary.trim() : "";
  const normalizedLoser = typeof loserSummary === "string" ? loserSummary.trim() : "";
  const normalizedResolution = typeof resolutionSummary === "string" ? resolutionSummary.trim() : "";
  const normalizedNote = typeof note === "string" ? note.trim() : "";

  if (
    winnerParticipants.length === 0 &&
    loserParticipants.length === 0 &&
    !normalizedWinner &&
    !normalizedLoser &&
    !normalizedResolution &&
    !normalizedNote
  ) {
    return undefined;
  }

  return {
    winnerParticipants,
    loserParticipants,
    winnerSummary: normalizedWinner || undefined,
    loserSummary: normalizedLoser || undefined,
    resolutionSummary: normalizedResolution || undefined,
    note: normalizedNote || undefined
  };
}

function parseConflictOutcomeParticipants(values: FormDataEntryValue[], side: "winner" | "loser") {
  return values
    .map((value) => {
      if (typeof value !== "string") {
        return null;
      }

      const [participantType, rawParticipantId] = value.split(":");
      const participantId = Number(rawParticipantId);

      if (
        !["polity", "person", "religion", "sect"].includes(participantType) ||
        !Number.isFinite(participantId) ||
        participantId <= 0
      ) {
        return null;
      }

      return {
        side,
        participantType: participantType as "polity" | "person" | "religion" | "sect",
        participantId
      };
    })
    .filter((item): item is z.infer<typeof conflictOutcomeParticipantSchema> => item !== null);
}
