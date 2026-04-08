import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const regionIdsSchema = z.array(z.number().int().positive()).default([]);
const tagIdsSchema = z.array(z.number().int().positive()).default([]);

export const politySchema = z.object({
  name: z.string().trim().min(1, "名称は必須です"),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  fromTimeExpression: timeExpressionSchema.optional(),
  toTimeExpression: timeExpressionSchema.optional(),
  regionIds: regionIdsSchema,
  tagIds: tagIdsSchema
});

export const dynastySchema = z.object({
  polityIds: regionIdsSchema,
  name: z.string().trim().min(1, "名称は必須です"),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  fromTimeExpression: timeExpressionSchema.optional(),
  toTimeExpression: timeExpressionSchema.optional(),
  regionIds: regionIdsSchema
});

export type PolityInput = z.infer<typeof politySchema>;
export type DynastyInput = z.infer<typeof dynastySchema>;

export function parsePolityFormData(formData: FormData): PolityInput {
  return politySchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    tagIds: normalizeIds(formData.getAll("tagIds"))
  });
}

export function parseDynastyFormData(formData: FormData): DynastyInput {
  return dynastySchema.parse({
    polityIds: normalizeIds(formData.getAll("polityIds")),
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    regionIds: normalizeIds(formData.getAll("regionIds"))
  });
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}
