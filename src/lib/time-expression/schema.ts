import { z } from "zod";

export const timeExpressionSchema = z.object({
  calendarEra: z.enum(["BCE", "CE"]).default("CE"),
  startYear: z
    .union([z.number().int(), z.nan(), z.string()])
    .optional()
    .transform((value) => normalizeYear(value)),
  startMonth: z
    .union([z.number().int(), z.nan(), z.string()])
    .optional()
    .transform((value) => normalizeMonth(value)),
  endYear: z
    .union([z.number().int(), z.nan(), z.string()])
    .optional()
    .transform((value) => normalizeYear(value)),
  isApproximate: z.boolean().default(false),
  precision: z.string().default("year"),
  displayLabel: z.string().optional().default("")
});

function normalizeYear(value: number | string | undefined) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function normalizeMonth(value: number | string | undefined) {
  if (value === undefined || value === "") {
    return undefined;
  }

  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed)) {
    return undefined;
  }

  return parsed >= 1 && parsed <= 12 ? parsed : undefined;
}

export type TimeExpressionInput = z.infer<typeof timeExpressionSchema>;
