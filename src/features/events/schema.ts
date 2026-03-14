import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const idsSchema = z.array(z.number().int().positive()).default([]);

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
  relations: z.array(eventRelationSchema).default([])
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
    relations: parseRelations(formData)
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
