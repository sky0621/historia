import { z } from "zod";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { timeExpressionSchema } from "@/lib/time-expression/schema";

const idsSchema = z.array(z.number().int().positive()).default([]);

export const roleAssignmentSchema = z.object({
  title: z.string().trim().min(1, "役職名は必須です"),
  polityId: z.number().int().positive().nullable().optional(),
  dynastyId: z.number().int().positive().nullable().optional(),
  note: z.string().trim().optional(),
  isIncumbent: z.boolean().default(false),
  timeExpression: timeExpressionSchema.optional()
});

export const personSchema = z.object({
  name: z.string().trim().min(1, "氏名は必須です"),
  reading: z.string().trim().optional(),
  aliases: z.array(z.string().trim()).default([]),
  note: z.string().trim().optional(),
  birthTimeExpression: timeExpressionSchema.optional(),
  deathTimeExpression: timeExpressionSchema.optional(),
  regionIds: idsSchema,
  religionIds: idsSchema,
  sectIds: idsSchema,
  periodIds: idsSchema,
  roles: z.array(roleAssignmentSchema).default([])
});

export type PersonInput = z.infer<typeof personSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;

export function parsePersonFormData(formData: FormData): PersonInput {
  return personSchema.parse({
    name: formData.get("name"),
    reading: formData.get("reading") ?? undefined,
    aliases: normalizeAliases(formData.get("aliases")),
    note: formData.get("note") ?? undefined,
    birthTimeExpression: parseTimeExpressionFormData(formData, "birthTime"),
    deathTimeExpression: parseTimeExpressionFormData(formData, "deathTime"),
    regionIds: normalizeIds(formData.getAll("regionIds")),
    religionIds: normalizeIds(formData.getAll("religionIds")),
    sectIds: normalizeIds(formData.getAll("sectIds")),
    periodIds: normalizeIds(formData.getAll("periodIds")),
    roles: parseRoles(formData)
  });
}

function parseRoles(formData: FormData) {
  const count = Number(formData.get("roleCount") ?? 0);
  const roles = [];

  for (let index = 0; index < count; index += 1) {
    const title = asString(formData.get(`roles.${index}.title`)).trim();
    const polityId = normalizeId(formData.get(`roles.${index}.polityId`));
    const dynastyId = normalizeId(formData.get(`roles.${index}.dynastyId`));
    const note = asString(formData.get(`roles.${index}.note`)).trim();
    const isIncumbent = formData.get(`roles.${index}.isIncumbent`) === "on";
    const timeExpression = parseTimeExpressionFormData(formData, `roles.${index}.time`);

    if (!title) {
      continue;
    }

    roles.push({
      title,
      polityId,
      dynastyId,
      note,
      isIncumbent,
      timeExpression
    });
  }

  return roles;
}

function normalizeAliases(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return [];
  }

  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

function normalizeIds(values: FormDataEntryValue[]) {
  return values.map((value) => Number(value)).filter((value) => Number.isFinite(value));
}

function normalizeId(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}
