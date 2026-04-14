import type { TimeExpressionInput } from "@/lib/time-expression/schema";

export function parseTimeExpressionFormData(
  formData: FormData,
  prefix: string
): TimeExpressionInput | undefined {
  const calendarEra = asString(formData.get(`${prefix}.calendarEra`));
  const startYear = toNumber(formData.get(`${prefix}.startYear`));
  const startMonth = toMonth(formData.get(`${prefix}.startMonth`));
  const endYear = toNumber(formData.get(`${prefix}.endYear`));
  const isApproximate = formData.get(`${prefix}.isApproximate`) === "on";
  const precision = asString(formData.get(`${prefix}.precision`)) || "year";
  const displayLabel = asString(formData.get(`${prefix}.displayLabel`)) || "";

  if (!calendarEra && startYear === undefined && startMonth === undefined && endYear === undefined && !displayLabel && !isApproximate) {
    return undefined;
  }

  return {
    calendarEra: calendarEra === "BCE" ? "BCE" : "CE",
    startYear,
    startMonth,
    endYear,
    isApproximate,
    precision,
    displayLabel
  };
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toMonth(value: FormDataEntryValue | null) {
  const parsed = toNumber(value);
  if (parsed === undefined) {
    return undefined;
  }

  return parsed >= 1 && parsed <= 12 ? parsed : undefined;
}
