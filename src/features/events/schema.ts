import { z } from "zod";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

export const eventDraftSchema = z.object({
  title: z.string().min(1, "タイトルは必須です"),
  description: z.string().optional().default(""),
  eventType: z.enum(["general", "war", "rebellion", "civil_war"]),
  timeExpression: timeExpressionSchema
});

export type EventDraftInput = z.infer<typeof eventDraftSchema>;
