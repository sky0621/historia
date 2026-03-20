import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

export const polityTransitionSchema = z.object({
  predecessorPolityId: z.number().int().positive(),
  successorPolityId: z.number().int().positive(),
  transitionType: z.enum(["split", "merge", "rename", "succession", "other"]),
  note: z.string().trim().optional(),
  timeExpression: timeExpressionSchema.optional()
});

export const dynastySuccessionSchema = z.object({
  polityId: z.number().int().positive(),
  predecessorDynastyId: z.number().int().positive(),
  successorDynastyId: z.number().int().positive(),
  note: z.string().trim().optional(),
  timeExpression: timeExpressionSchema.optional()
});

export const regionRelationSchema = z.object({
  fromRegionId: z.number().int().positive(),
  toRegionId: z.number().int().positive(),
  relationType: z.enum(["contains", "adjacent", "cultural_sphere"]),
  note: z.string().trim().optional()
});

export const historicalPeriodRelationSchema = z.object({
  fromPeriodId: z.number().int().positive(),
  toPeriodId: z.number().int().positive(),
  relationType: z.enum(["contains", "overlaps", "succeeds"]),
  note: z.string().trim().optional()
});

export type PolityTransitionInput = z.infer<typeof polityTransitionSchema>;
export type DynastySuccessionInput = z.infer<typeof dynastySuccessionSchema>;
export type RegionRelationInput = z.infer<typeof regionRelationSchema>;
export type HistoricalPeriodRelationInput = z.infer<typeof historicalPeriodRelationSchema>;

export function parsePolityTransitionFormData(formData: FormData): PolityTransitionInput {
  return polityTransitionSchema.parse({
    predecessorPolityId: Number(formData.get("predecessorPolityId")),
    successorPolityId: Number(formData.get("successorPolityId")),
    transitionType: formData.get("transitionType"),
    note: formData.get("note") ?? undefined,
    timeExpression: parseTimeExpressionFormData(formData, "time")
  });
}

export function parseDynastySuccessionFormData(formData: FormData): DynastySuccessionInput {
  return dynastySuccessionSchema.parse({
    polityId: Number(formData.get("polityId")),
    predecessorDynastyId: Number(formData.get("predecessorDynastyId")),
    successorDynastyId: Number(formData.get("successorDynastyId")),
    note: formData.get("note") ?? undefined,
    timeExpression: parseTimeExpressionFormData(formData, "time")
  });
}

export function parseRegionRelationFormData(formData: FormData): RegionRelationInput {
  return regionRelationSchema.parse({
    fromRegionId: Number(formData.get("fromRegionId")),
    toRegionId: Number(formData.get("toRegionId")),
    relationType: formData.get("relationType"),
    note: formData.get("note") ?? undefined
  });
}

export function parseHistoricalPeriodRelationFormData(formData: FormData): HistoricalPeriodRelationInput {
  return historicalPeriodRelationSchema.parse({
    fromPeriodId: Number(formData.get("fromPeriodId")),
    toPeriodId: Number(formData.get("toPeriodId")),
    relationType: formData.get("relationType"),
    note: formData.get("note") ?? undefined
  });
}
