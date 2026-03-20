import { z } from "zod";

export const sourceSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  author: z.string().trim().optional(),
  publisher: z.string().trim().optional(),
  publishedAtLabel: z.string().trim().optional(),
  url: z.string().trim().optional(),
  note: z.string().trim().optional()
});

export const citationSchema = z.object({
  sourceId: z.number().int().positive(),
  targetType: z.enum(["event", "person", "polity", "historical_period", "religion"]),
  targetId: z.number().int().positive(),
  locator: z.string().trim().optional(),
  quote: z.string().trim().optional(),
  note: z.string().trim().optional()
});

export type SourceInput = z.infer<typeof sourceSchema>;
export type CitationInput = z.infer<typeof citationSchema>;

export function parseSourceFormData(formData: FormData): SourceInput {
  return sourceSchema.parse({
    title: formData.get("title"),
    author: formData.get("author") ?? undefined,
    publisher: formData.get("publisher") ?? undefined,
    publishedAtLabel: formData.get("publishedAtLabel") ?? undefined,
    url: formData.get("url") ?? undefined,
    note: formData.get("note") ?? undefined
  });
}

export function parseCitationFormData(formData: FormData): CitationInput {
  return citationSchema.parse({
    sourceId: Number(formData.get("sourceId")),
    targetType: formData.get("targetType"),
    targetId: Number(formData.get("targetId")),
    locator: formData.get("locator") ?? undefined,
    quote: formData.get("quote") ?? undefined,
    note: formData.get("note") ?? undefined
  });
}
