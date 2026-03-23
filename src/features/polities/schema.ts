import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const aliasesSchema = z.array(z.string().trim()).default([]);
const regionIdsSchema = z.array(z.number().int().positive()).default([]);

export const politySchema = z.object({
  name: z.string().trim().min(1, "名称は必須です"),
  aliases: aliasesSchema,
  note: z.string().trim().optional(),
  fromTimeExpression: timeExpressionSchema.optional(),
  toTimeExpression: timeExpressionSchema.optional(),
  regionIds: regionIdsSchema
});

export const dynastySchema = z.object({
  polityId: z.number().int().positive(),
  name: z.string().trim().min(1, "名称は必須です"),
  aliases: aliasesSchema,
  note: z.string().trim().optional(),
  timeExpression: timeExpressionSchema.optional(),
  regionIds: regionIdsSchema
});

export type PolityInput = z.infer<typeof politySchema>;
export type DynastyInput = z.infer<typeof dynastySchema>;

export function parsePolityFormData(formData: FormData): PolityInput {
  return politySchema.parse({
    name: formData.get("name"),
    aliases: normalizeAliases(formData.get("aliases")),
    note: formData.get("note") ?? undefined,
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    regionIds: normalizeIds(formData.getAll("regionIds"))
  });
}

export function parseDynastyFormData(formData: FormData): DynastyInput {
  return dynastySchema.parse({
    polityId: Number(formData.get("polityId")),
    name: formData.get("name"),
    aliases: normalizeAliases(formData.get("aliases")),
    note: formData.get("note") ?? undefined,
    timeExpression: parseTimeExpressionFormData(formData, "time"),
    regionIds: normalizeIds(formData.getAll("regionIds"))
  });
}

function normalizeAliases(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value));
}
