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

export const eventRelationSchema = z.object({
  toEventId: z.number().int().positive(),
  relationType: z.enum(["before", "after", "cause", "related"])
});

export const eventSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  description: z.string().trim().optional(),
  eventType: z.enum(["general", "war", "rebellion", "civil_war"]),
  timeExpression: timeExpressionSchema.optional(),
  startTimeExpression: timeExpressionSchema.optional(),
  endTimeExpression: timeExpressionSchema.optional(),
  personIds: idsSchema,
  polityIds: idsSchema,
  dynastyIds: idsSchema,
  periodIds: idsSchema,
  religionIds: idsSchema,
  sectIds: idsSchema,
  regionIds: idsSchema,
  relations: z.array(eventRelationSchema).default([]),
  conflictParticipants: z.array(conflictParticipantSchema).default([]),
  conflictOutcome: z
    .object({
      winnerSummary: z.string().trim().optional(),
      loserSummary: z.string().trim().optional(),
      settlementSummary: z.string().trim().optional(),
      note: z.string().trim().optional()
    })
    .optional()
});

export type EventInput = z.infer<typeof eventSchema>;

export function parseEventFormData(formData: FormData): EventInput {
  return eventSchema.parse({
    title: formData.get("title"),
    description: formData.get("description") ?? undefined,
    eventType: formData.get("eventType"),
    timeExpression: parseTimeExpressionFormData(formData, "time"),
    startTimeExpression: parseTimeExpressionFormData(formData, "startTime"),
    endTimeExpression: parseTimeExpressionFormData(formData, "endTime"),
    personIds: normalizeIds(formData.getAll("personIds")),
    polityIds: normalizeIds(formData.getAll("polityIds")),
    dynastyIds: normalizeIds(formData.getAll("dynastyIds")),
    periodIds: normalizeIds(formData.getAll("periodIds")),
    religionIds: normalizeIds(formData.getAll("religionIds")),
    sectIds: normalizeIds(formData.getAll("sectIds")),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    relations: parseRelations(formData),
    conflictParticipants: parseConflictParticipants(formData),
    conflictOutcome: parseConflictOutcome(formData)
  });
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
  const settlementSummary = formData.get("conflictOutcome.settlementSummary");
  const winnerSummary = formData.get("conflictOutcome.winnerSummary");
  const loserSummary = formData.get("conflictOutcome.loserSummary");
  const note = formData.get("conflictOutcome.note");
  const normalizedWinner = typeof winnerSummary === "string" ? winnerSummary.trim() : "";
  const normalizedLoser = typeof loserSummary === "string" ? loserSummary.trim() : "";
  const normalizedSettlement = typeof settlementSummary === "string" ? settlementSummary.trim() : "";
  const normalizedNote = typeof note === "string" ? note.trim() : "";

  if (!normalizedWinner && !normalizedLoser && !normalizedSettlement && !normalizedNote) {
    return undefined;
  }

  return {
    winnerSummary: normalizedWinner || undefined,
    loserSummary: normalizedLoser || undefined,
    settlementSummary: normalizedSettlement || undefined,
    note: normalizedNote || undefined
  };
}
