import { z } from "zod";
export const roleSchema = z.object({
  title: z.string().trim().min(1, "名称は必須です"),
  reading: z.string().trim().optional(),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  polityId: z.number().int().positive().nullable().optional()
});

export type RoleInput = z.infer<typeof roleSchema>;

export function parseRoleFormData(formData: FormData): RoleInput {
  return roleSchema.parse({
    title: formData.get("title"),
    reading: formData.get("reading") ?? undefined,
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    polityId: normalizeId(formData.get("polityId"))
  });
}

function normalizeId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
