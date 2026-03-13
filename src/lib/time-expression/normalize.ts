import type { TimeExpressionInput } from "@/lib/time-expression/schema";

export type TimeExpressionRecord = {
  calendarEra: "BCE" | "CE";
  startYear: number | null;
  endYear: number | null;
  isApproximate: boolean;
  precision: string;
  displayLabel: string | null;
};

export function toTimeExpressionRecord(
  value: TimeExpressionInput | undefined
): TimeExpressionRecord | null {
  if (!value) {
    return null;
  }

  return {
    calendarEra: value.calendarEra,
    startYear: value.startYear ?? null,
    endYear: value.endYear ?? null,
    isApproximate: value.isApproximate,
    precision: value.precision,
    displayLabel: value.displayLabel || null
  };
}

export function fromTimeExpressionRecord(
  value: TimeExpressionRecord | null | undefined
): TimeExpressionInput | undefined {
  if (!value) {
    return undefined;
  }

  return {
    calendarEra: value.calendarEra,
    startYear: value.startYear ?? undefined,
    endYear: value.endYear ?? undefined,
    isApproximate: value.isApproximate,
    precision: value.precision,
    displayLabel: value.displayLabel ?? ""
  };
}
