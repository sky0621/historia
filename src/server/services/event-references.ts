import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";
import { listDynasties } from "@/server/repositories/dynasties";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPersonDetailed } from "@/server/repositories/person-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { listSects } from "@/server/repositories/sects";
import { listTags } from "@/server/repositories/tags";
import { getEventLinks, listEvents } from "@/server/repositories/events";

type RelatedEventsFilter = {
  tagId?: number;
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
  relationSummary: string;
};

export function getRelatedEvents(filter: RelatedEventsFilter): RelatedEventSummary[] {
  const events = listEvents();
  const eventIds = events.map((event) => event.id);
  const links = getEventLinks(eventIds);
  const personById = new Map(listPersonDetailed().map((item) => [item.id, item.name]));
  const politiesById = new Map(listPolities().map((item) => [item.id, item.name]));
  const dynastiesById = new Map(listDynasties().map((item) => [item.id, item.name]));
  const periodsById = new Map(listHistoricalPeriods().map((item) => [item.id, item.name]));
  const religionsById = new Map(listReligions().map((item) => [item.id, item.name]));
  const sectsById = new Map(listSects().map((item) => [item.id, item.name]));
  const regionsById = new Map(listRegions().map((item) => [item.id, item.name]));
  const tagsById = new Map(listTags().map((item) => [item.id, item.name]));

  return events
    .filter((event) => matchesEventFilter(event.id, filter, links))
    .map((event) => ({
      id: event.id,
      title: event.title,
      eventType: event.eventType,
      timeLabel: formatEventTime(event),
      relationSummary: summarizeEventLinks(event.id, links, {
        personById,
        politiesById,
        dynastiesById,
        periodsById,
        religionsById,
        sectsById,
        regionsById,
        tagsById
      })
    }));
}

function matchesEventFilter(
  eventId: number,
  filter: RelatedEventsFilter,
  links: ReturnType<typeof getEventLinks>
) {
  if (filter.tagId && !links.tagLinks.some((link) => link.eventId === eventId && link.tagId === filter.tagId)) {
    return false;
  }

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

function summarizeEventLinks(
  eventId: number,
  links: ReturnType<typeof getEventLinks>,
  dictionaries: {
    personById: Map<number, string>;
    politiesById: Map<number, string>;
    dynastiesById: Map<number, string>;
    periodsById: Map<number, string>;
    religionsById: Map<number, string>;
    sectsById: Map<number, string>;
    regionsById: Map<number, string>;
    tagsById: Map<number, string>;
  }
) {
  const names = [
    ...links.personLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.personById.get(link.personId)),
    ...links.polityLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.politiesById.get(link.polityId)),
    ...links.dynastyLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.dynastiesById.get(link.dynastyId)),
    ...links.periodLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.periodsById.get(link.periodId)),
    ...links.religionLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.religionsById.get(link.religionId)),
    ...links.sectLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.sectsById.get(link.sectId)),
    ...links.regionLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.regionsById.get(link.regionId)),
    ...links.tagLinks
      .filter((link) => link.eventId === eventId)
      .map((link) => dictionaries.tagsById.get(link.tagId))
  ].filter((name): name is string => Boolean(name));

  return names.slice(0, 4).join(", ");
}
