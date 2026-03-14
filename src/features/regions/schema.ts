import { z } from "zod";

export const regionSchema = z.object({
  name: z.string().trim().min(1, "名称は必須です"),
  parentRegionId: z.number().int().positive().nullable().optional(),
  aliases: z.array(z.string().trim()).default([]),
  description: z.string().trim().optional(),
  note: z.string().trim().optional()
});

export type RegionInput = z.infer<typeof regionSchema>;

export function parseRegionFormData(formData: FormData): RegionInput {
  return regionSchema.parse({
    name: formData.get("name"),
    parentRegionId: normalizeId(formData.get("parentRegionId")),
    aliases: normalizeAliases(formData.get("aliases")),
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined
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

function normalizeId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
