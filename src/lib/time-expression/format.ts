import type { TimeExpressionInput } from "@/lib/time-expression/schema";

export function formatCalendarEraPrefix(era: "BCE" | "CE" | string | null | undefined): string {
  return era === "BCE" ? "前" : "";
}

export function formatYearWithEra(
  era: "BCE" | "CE" | string | null | undefined,
  year: number | null | undefined
): string | null {
  if (year == null) {
    return null;
  }

  return `${formatCalendarEraPrefix(era)}${year}`;
}

export function formatTimeExpression(value: TimeExpressionInput): string {
  if (value.displayLabel) {
    return value.displayLabel;
  }

  const approximate = value.isApproximate ? "ca. " : "";

  if (value.startYear && value.endYear) {
    return `${approximate}${formatCalendarEraPrefix(value.calendarEra)}${value.startYear}-${value.endYear}`;
  }

  if (value.startYear) {
    return `${approximate}${formatYearWithEra(value.calendarEra, value.startYear)}`;
  }

  return "年未詳";
}
