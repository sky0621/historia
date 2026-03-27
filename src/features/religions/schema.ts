import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const idsSchema = z.array(z.number().int().positive()).default([]);

export const religionSchema = z.object({
  name: z.string().trim().min(1, "名称は必須です"),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  fromTimeExpression: timeExpressionSchema.optional(),
  toTimeExpression: timeExpressionSchema.optional(),
  regionIds: idsSchema,
  founderIds: idsSchema
});

export const sectSchema = religionSchema.extend({
  religionId: z.number().int().positive(),
  parentSectId: z.number().int().positive().nullable().optional()
});

export type ReligionInput = z.infer<typeof religionSchema>;
export type SectInput = z.infer<typeof sectSchema>;

export function parseReligionFormData(formData: FormData): ReligionInput {
  return religionSchema.parse({
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    founderIds: normalizeIds(formData.getAll("founderIds"))
  });
}

export function parseSectFormData(formData: FormData): SectInput {
  return sectSchema.parse({
    religionId: Number(formData.get("religionId")),
    parentSectId: normalizeId(formData.get("parentSectId")),
    name: formData.get("name"),
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    fromTimeExpression: parseTimeExpressionFormData(formData, "fromTime"),
    toTimeExpression: parseTimeExpressionFormData(formData, "toTime"),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    founderIds: normalizeIds(formData.getAll("founderIds"))
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
