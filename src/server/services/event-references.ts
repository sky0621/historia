import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { getEventLinks, listEvents } from "@/server/repositories/events";

type RelatedEventsFilter = {
  personId?: number;
  polityId?: number;
  dynastyId?: number;
  periodId?: number;
  religionId?: number;
  sectId?: number;
  regionId?: number;
};

export type RelatedEventSummary = {
  id: number;
  title: string;
  eventType: string;
  timeLabel: string;
};

export function getRelatedEvents(filter: RelatedEventsFilter): RelatedEventSummary[] {
  const events = listEvents();
  const eventIds = events.map((event) => event.id);
  const links = getEventLinks(eventIds);

  return events
    .filter((event) => matchesEventFilter(event.id, filter, links))
    .map((event) => ({
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      timeLabel: formatEventTime(event)
    }));
}

function matchesEventFilter(
  eventId: number,
  filter: RelatedEventsFilter,
  links: ReturnType<typeof getEventLinks>
) {
  if (filter.personId && !links.personLinks.some((link) => link.eventId === eventId && link.personId === filter.personId)) {
    return false;
  }

  if (filter.polityId && !links.polityLinks.some((link) => link.eventId === eventId && link.polityId === filter.polityId)) {
    return false;
  }

  if (filter.dynastyId && !links.dynastyLinks.some((link) => link.eventId === eventId && link.dynastyId === filter.dynastyId)) {
    return false;
  }

  if (filter.periodId && !links.periodLinks.some((link) => link.eventId === eventId && link.periodId === filter.periodId)) {
    return false;
  }

  if (filter.religionId && !links.religionLinks.some((link) => link.eventId === eventId && link.religionId === filter.religionId)) {
    return false;
  }

  if (filter.sectId && !links.sectLinks.some((link) => link.eventId === eventId && link.sectId === filter.sectId)) {
    return false;
  }

  if (filter.regionId && !links.regionLinks.some((link) => link.eventId === eventId && link.regionId === filter.regionId)) {
    return false;
  }

  return true;
}

function formatEventTime(event: Record<string, unknown>) {
  const conflictRange =
    toStandaloneYearLabel(
      (event.startCalendarEra as "BCE" | "CE" | null) ?? null,
      (event.startYear as number | null) ?? null,
      (event.endCalendarEra as "BCE" | "CE" | null) ?? null,
      (event.endYear as number | null) ?? null
    ) ?? null;

  if (conflictRange) {
    return conflictRange;
  }

  const timeExpression = fromTimeExpressionRecord({
    calendarEra: (event.timeCalendarEra as "BCE" | "CE" | null) ?? "CE",
    startYear: (event.timeStartYear as number | null) ?? null,
    endYear: (event.timeEndYear as number | null) ?? null,
    isApproximate: Boolean(event.timeIsApproximate),
    precision: (event.timePrecision as string | null) ?? "year",
    displayLabel: (event.timeDisplayLabel as string | null) ?? null
  });

  return timeExpression ? formatTimeExpression(timeExpression) : "年未詳";
}

function toStandaloneYearLabel(
  startEra: "BCE" | "CE" | null,
  startYear: number | null,
  endEra: "BCE" | "CE" | null,
  endYear: number | null
) {
  if (startYear == null) {
    return null;
  }

  const start = `${startYear}${startEra === "BCE" ? " BCE" : ""}`;
  const resolvedEnd = endYear ?? startYear;
  const resolvedEndEra = endEra ?? startEra;
  const end = `${resolvedEnd}${resolvedEndEra === "BCE" ? " BCE" : ""}`;

  return start === end ? start : `${start} - ${end}`;
}
