import { z } from "zod";
export const roleSchema = z.object({
  title: z.string().trim().min(1, "名称は必須です"),
  reading: z.string().trim().optional(),
  description: z.string().trim().optional(),
  note: z.string().trim().optional(),
  polityIds: z.array(z.number().int().positive()).default([])
});

export type RoleInput = z.infer<typeof roleSchema>;

export function parseRoleFormData(formData: FormData): RoleInput {
  return roleSchema.parse({
    title: formData.get("title"),
    reading: formData.get("reading") ?? undefined,
    description: formData.get("description") ?? undefined,
    note: formData.get("note") ?? undefined,
    polityIds: normalizeIds(formData.getAll("polityIds"))
  });
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value) && value > 0);
}
