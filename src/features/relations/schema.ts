import { z } from "zod";

export const polityTransitionSchema = z.object({
  predecessorPolityId: z.number().int().positive(),
  successorPolityId: z.number().int().positive(),
  transitionType: z.enum(["renamed", "succeeded", "merged", "split", "annexed", "absorbed", "restored", "reorganized", "other"])
});

export const dynastySuccessionSchema = z.object({
  polityId: z.number().int().positive(),
  predecessorDynastyId: z.number().int().positive(),
  successorDynastyId: z.number().int().positive()
});

export const historicalPeriodRelationSchema = z.object({
  fromPeriodId: z.number().int().positive(),
  toPeriodId: z.number().int().positive(),
  relationType: z.enum(["precedes", "succeeds", "overlaps", "includes", "included_in"]),
  note: z.string().trim().optional()
});

export type PolityTransitionInput = z.infer<typeof polityTransitionSchema>;
export type DynastySuccessionInput = z.infer<typeof dynastySuccessionSchema>;
export type HistoricalPeriodRelationInput = z.infer<typeof historicalPeriodRelationSchema>;

export function parsePolityTransitionFormData(formData: FormData): PolityTransitionInput {
  return polityTransitionSchema.parse({
    predecessorPolityId: Number(formData.get("predecessorPolityId")),
    successorPolityId: Number(formData.get("successorPolityId")),
    transitionType: formData.get("transitionType")
  });
}

export function parseDynastySuccessionFormData(formData: FormData): DynastySuccessionInput {
  return dynastySuccessionSchema.parse({
    polityId: Number(formData.get("polityId")),
    predecessorDynastyId: Number(formData.get("predecessorDynastyId")),
    successorDynastyId: Number(formData.get("successorDynastyId"))
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
