import { formatYearWithEra } from "@/lib/time-expression/format";

export const EMPTY_START_YEAR = -99999;
export const EMPTY_END_YEAR = 9999;

export function toStoredBoundaryYear(prefix: "from" | "to", year: number | undefined) {
  if (typeof year === "number") {
    return year;
  }

  return prefix === "from" ? EMPTY_START_YEAR : EMPTY_END_YEAR;
}

export function normalizeStoredBoundaryYear(prefix: "from" | "to", year: number | null | undefined) {
  if (year == null) {
    return null;
  }

  if (prefix === "from" && year === EMPTY_START_YEAR) {
    return null;
  }

  if (prefix === "to" && year === EMPTY_END_YEAR) {
    return null;
  }

  return year;
}

export function toStoredPersonBoundaryYear(prefix: "birth" | "death", year: number | undefined) {
  if (typeof year === "number") {
    return year;
  }

  return prefix === "birth" ? EMPTY_START_YEAR : EMPTY_END_YEAR;
}

export function normalizeStoredPersonBoundaryYear(prefix: "birth" | "death", year: number | null | undefined) {
  if (year == null) {
    return null;
  }

  if (prefix === "birth" && year === EMPTY_START_YEAR) {
    return null;
  }

  if (prefix === "death" && year === EMPTY_END_YEAR) {
    return null;
  }

  return year;
}

export function formatStoredBoundaryRangeForOption(
  startEra: string | null | undefined,
  startYear: number | null | undefined,
  endEra: string | null | undefined,
  endYear: number | null | undefined
) {
  const startLabel =
    startYear == null || startYear === EMPTY_START_YEAR ? "不明" : formatYearWithEra(toEra(startEra), startYear) ?? "不明";
  const endLabel =
    endYear == null || endYear === EMPTY_END_YEAR ? "現在" : formatYearWithEra(toEra(endEra) ?? toEra(startEra), endYear) ?? "現在";

  return `${startLabel} - ${endLabel}`;
}

function toEra(value: string | null | undefined): "BCE" | "CE" | null {
  return value === "BCE" || value === "CE" ? value : null;
}
