import { EMPTY_END_YEAR, EMPTY_START_YEAR } from "@/server/services/time-sentinel";

export type PolityRangeOption = {
  fromCalendarEra?: string | null;
  fromYear?: number | null;
  toCalendarEra?: string | null;
  toYear?: number | null;
};

export function polityContainsRange(
  polity: PolityRangeOption,
  fromCalendarEra: "BCE" | "CE",
  fromYearInput: string,
  toCalendarEra: "BCE" | "CE",
  toYearInput: string
) {
  const filterStart = toComparableInputYear(fromCalendarEra, fromYearInput);
  const filterEnd = toComparableInputYear(toCalendarEra, toYearInput);
  const polityStart = toComparableBoundaryYear(toEra(polity.fromCalendarEra), polity.fromYear ?? null, "from");
  const polityEnd = toComparableBoundaryYear(toEra(polity.toCalendarEra ?? polity.fromCalendarEra), polity.toYear ?? null, "to");

  if (filterStart != null && polityStart > filterStart) {
    return false;
  }

  if (filterEnd != null && polityEnd < filterEnd) {
    return false;
  }

  return true;
}

function toComparableInputYear(calendarEra: "BCE" | "CE", rawYear: string) {
  if (rawYear.trim().length === 0) {
    return null;
  }

  const parsed = Number(rawYear);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return calendarEra === "BCE" ? -parsed : parsed;
}

function toComparableBoundaryYear(era: "BCE" | "CE" | null, year: number | null, boundary: "from" | "to") {
  if (year == null) {
    return boundary === "from" ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
  }

  if (boundary === "from" && year === EMPTY_START_YEAR) {
    return Number.NEGATIVE_INFINITY;
  }

  if (boundary === "to" && year === EMPTY_END_YEAR) {
    return Number.POSITIVE_INFINITY;
  }

  return era === "BCE" ? -year : year;
}

function toEra(value: string | null | undefined): "BCE" | "CE" | null {
  return value === "BCE" || value === "CE" ? value : null;
}
