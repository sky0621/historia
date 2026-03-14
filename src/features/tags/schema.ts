import { z } from "zod";

export const tagSchema = z.object({
  name: z.string().trim().min(1, "名称は必須です")
});

export type TagInput = z.infer<typeof tagSchema>;

export function parseTagFormData(formData: FormData): TagInput {
  return tagSchema.parse({
    name: formData.get("name")
  });
}
