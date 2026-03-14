import { z } from "zod";

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
