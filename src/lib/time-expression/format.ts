import type { TimeExpressionInput } from "@/lib/time-expression/schema";

export function formatTimeExpression(value: TimeExpressionInput): string {
  if (value.displayLabel) {
    return value.displayLabel;
  }

  const prefix = value.calendarEra === "BCE" ? "BCE " : "";
  const approximate = value.isApproximate ? "ca. " : "";

  if (value.startYear && value.endYear) {
    return `${approximate}${prefix}${value.startYear}-${value.endYear}`;
  }

  if (value.startYear) {
    return `${approximate}${prefix}${value.startYear}`;
  }

  return "年未詳";
}
