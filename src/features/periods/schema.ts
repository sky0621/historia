import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

export const periodCategorySchema = z.object({
  name: z.string().trim().min(1, "名称は必須です"),
  description: z.string().trim().optional()
});

export type PeriodCategoryInput = z.infer<typeof periodCategorySchema>;

export function parsePeriodCategoryFormData(formData: FormData): PeriodCategoryInput {
  return periodCategorySchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined
  });
}

const idsSchema = z.array(z.number().int().positive()).default([]);

export const historicalPeriodSchema = z.object({
  categoryId: z.number().int().positive(),
  polityId: z.number().int().positive().nullable().optional(),
  name: z.string().trim().min(1, "名称は必須です"),
  regionLabel: z.string().trim().optional(),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  timeExpression: timeExpressionSchema.optional(),
  regionIds: idsSchema
});

export type HistoricalPeriodInput = z.infer<typeof historicalPeriodSchema>;

export function parseHistoricalPeriodFormData(formData: FormData): HistoricalPeriodInput {
  return historicalPeriodSchema.parse({
    categoryId: Number(formData.get("categoryId")),
    polityId: normalizeId(formData.get("polityId")),
    name: formData.get("name"),
    regionLabel: formData.get("regionLabel") ?? undefined,
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    timeExpression: parseTimeExpressionFormData(formData, "time"),
    regionIds: normalizeIds(formData.getAll("regionIds"))
  });
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function normalizeId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
