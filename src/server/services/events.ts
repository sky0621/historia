import { db } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import type { EventInput } from "@/features/events/schema";
import {
  createEvent,
  deleteEvent,
  deleteEventLinksAndRelations,
  getEventById,
  getConflictOutcomesByEventIds,
  getConflictParticipantsByEventIds,
  getEventLinks,
  getEventRelationsByEventIds,
  listEvents,
  replaceConflictOutcome,
  replaceConflictParticipants,
  replaceEventLinks,
  replaceEventRelations,
  updateEvent
} from "@/server/repositories/events";
import { listDynasties } from "@/server/repositories/dynasties";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPeopleDetailed } from "@/server/repositories/people-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { listSects } from "@/server/repositories/sects";

type EventListFilters = {
  query?: string;
  eventType?: "general" | "war" | "rebellion" | "civil_war";
  personId?: number;
  polityId?: number;
  regionId?: number;
  periodId?: number;
  fromYear?: number;
  toYear?: number;
};

export function getEventFormOptions() {
  return {
    people: listPeopleDetailed().map((item) => ({ id: item.id, name: item.name })),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    dynasties: listDynasties().map((item) => ({ id: item.id, name: item.name })),
    periods: listHistoricalPeriods().map((item) => ({ id: item.id, name: item.name })),
    religions: listReligions().map((item) => ({ id: item.id, name: item.name })),
    sects: listSects().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name })),
    events: listEvents().map((item) => ({ id: item.id, name: item.title }))
  };
}

export function getEventsListView(filters: EventListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const events = listEvents();
  const links = getEventLinks(events.map((event) => event.id));

  const peopleById = new Map(listPeopleDetailed().map((item) => [item.id, item.name]));
  const politiesById = new Map(listPolities().map((item) => [item.id, item.name]));
  const periodsById = new Map(listHistoricalPeriods().map((item) => [item.id, item.name]));

  return events
    .map((event) => {
      const personNames = links.personLinks
        .filter((link) => link.eventId === event.id)
        .map((link) => peopleById.get(link.personId))
        .filter((name): name is string => Boolean(name));
      const polityNames = links.polityLinks
        .filter((link) => link.eventId === event.id)
        .map((link) => politiesById.get(link.polityId))
        .filter((name): name is string => Boolean(name));
      const periodNames = links.periodLinks
        .filter((link) => link.eventId === event.id)
        .map((link) => periodsById.get(link.periodId))
        .filter((name): name is string => Boolean(name));

      return {
        ...event,
        timeLabel: formatStoredTime("time", event),
        relationSummary: [...personNames, ...polityNames, ...periodNames].slice(0, 4).join(", "),
        personIds: links.personLinks.filter((link) => link.eventId === event.id).map((link) => link.personId),
        polityIds: links.polityLinks.filter((link) => link.eventId === event.id).map((link) => link.polityId),
        regionIds: links.regionLinks.filter((link) => link.eventId === event.id).map((link) => link.regionId),
        periodIds: links.periodLinks.filter((link) => link.eventId === event.id).map((link) => link.periodId)
      };
    })
    .filter((event) => {
      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }

      if (filters.personId && !event.personIds.includes(filters.personId)) {
        return false;
      }

      if (filters.polityId && !event.polityIds.includes(filters.polityId)) {
        return false;
      }

      if (filters.regionId && !event.regionIds.includes(filters.regionId)) {
        return false;
      }

      if (filters.periodId && !event.periodIds.includes(filters.periodId)) {
        return false;
      }

      if (!matchesYearRange(event, filters.fromYear, filters.toYear)) {
        return false;
      }

      return matchesQuery([event.title, event.description, event.relationSummary], normalizedQuery);
    });
}

export function getEventDetailView(id: number) {
  const event = getEventById(id);
  if (!event) {
    return null;
  }

  const links = getEventLinks([id]);
  const relations = getEventRelationsByEventIds([id]);
  const participants = getConflictParticipantsByEventIds([id]);
  const outcomes = getConflictOutcomesByEventIds([id]);
  const options = getEventFormOptions();
  const eventNameById = new Map(options.events.map((item) => [item.id, item.name]));
  const participantNameByType = {
    person: new Map(options.people.map((item) => [item.id, item.name])),
    polity: new Map(options.polities.map((item) => [item.id, item.name])),
    religion: new Map(options.religions.map((item) => [item.id, item.name])),
    sect: new Map(options.sects.map((item) => [item.id, item.name]))
  };

  return {
    event,
    linkedPeople: options.people.filter((item) => links.personLinks.some((link) => link.eventId === id && link.personId === item.id)),
    linkedPolities: options.polities.filter((item) => links.polityLinks.some((link) => link.eventId === id && link.polityId === item.id)),
    linkedDynasties: options.dynasties.filter((item) => links.dynastyLinks.some((link) => link.eventId === id && link.dynastyId === item.id)),
    linkedPeriods: options.periods.filter((item) => links.periodLinks.some((link) => link.eventId === id && link.periodId === item.id)),
    linkedReligions: options.religions.filter((item) => links.religionLinks.some((link) => link.eventId === id && link.religionId === item.id)),
    linkedSects: options.sects.filter((item) => links.sectLinks.some((link) => link.eventId === id && link.sectId === item.id)),
    linkedRegions: options.regions.filter((item) => links.regionLinks.some((link) => link.eventId === id && link.regionId === item.id)),
    outgoingRelations: relations
      .filter((relation) => relation.fromEventId === id)
      .map((relation) => ({
        ...relation,
        eventName: eventNameById.get(relation.toEventId) ?? `#${relation.toEventId}`
      })),
    incomingRelations: relations
      .filter((relation) => relation.toEventId === id)
      .map((relation) => ({
        ...relation,
        eventName: eventNameById.get(relation.fromEventId) ?? `#${relation.fromEventId}`
      })),
    conflictParticipants: participants.map((participant) => ({
      ...participant,
      participantType: participant.participantType as "person" | "polity" | "religion" | "sect",
      participantName:
        participantNameByType[participant.participantType as "person" | "polity" | "religion" | "sect"]?.get(
          participant.participantId
        ) ?? `#${participant.participantId}`
    })),
    conflictOutcome: outcomes[0] ?? null,
    defaultTimeExpression: extractTimeExpression("time", event),
    defaultStartTimeExpression: extractStandaloneTime("start", event),
    defaultEndTimeExpression: extractStandaloneTime("end", event),
    formOptions: {
      ...options,
      events: options.events.filter((item) => item.id !== id)
    }
  };
}

export function createEventFromInput(input: EventInput) {
  return db.transaction(() => {
    const now = new Date();
    const eventId = createEvent({
      title: input.title,
      eventType: input.eventType,
      description: nullable(input.description),
      ...toStoredTime("time", input.timeExpression),
      ...toStandaloneTime("start", input.startTimeExpression),
      ...toStandaloneTime("end", input.endTimeExpression),
      createdAt: now,
      updatedAt: now
    });

    replaceEventLinks(eventId, {
      personIds: input.personIds,
      polityIds: input.polityIds,
      dynastyIds: input.dynastyIds,
      periodIds: input.periodIds,
      religionIds: input.religionIds,
      sectIds: input.sectIds,
      regionIds: input.regionIds
    });

    replaceEventRelations(
      eventId,
      input.relations.map((relation) => ({
        fromEventId: eventId,
        toEventId: relation.toEventId,
        relationType: relation.relationType
      }))
    );

    replaceConflictParticipants(
      eventId,
      input.conflictParticipants.map((participant) => ({
        eventId,
        participantType: participant.participantType,
        participantId: participant.participantId,
        role: participant.role,
        note: nullable(participant.note)
      }))
    );

    replaceConflictOutcome(
      eventId,
      input.conflictOutcome
        ? {
            eventId,
            settlementSummary: nullable(input.conflictOutcome.settlementSummary),
            note: nullable(input.conflictOutcome.note)
          }
        : null
    );

    return eventId;
  });
}

export function updateEventFromInput(id: number, input: EventInput) {
  db.transaction(() => {
    updateEvent(id, {
      title: input.title,
      eventType: input.eventType,
      description: nullable(input.description),
      ...toStoredTime("time", input.timeExpression),
      ...toStandaloneTime("start", input.startTimeExpression),
      ...toStandaloneTime("end", input.endTimeExpression),
      updatedAt: new Date()
    });

    replaceEventLinks(id, {
      personIds: input.personIds,
      polityIds: input.polityIds,
      dynastyIds: input.dynastyIds,
      periodIds: input.periodIds,
      religionIds: input.religionIds,
      sectIds: input.sectIds,
      regionIds: input.regionIds
    });

    replaceEventRelations(
      id,
      input.relations.map((relation) => ({
        fromEventId: id,
        toEventId: relation.toEventId,
        relationType: relation.relationType
      }))
    );

    replaceConflictParticipants(
      id,
      input.conflictParticipants.map((participant) => ({
        eventId: id,
        participantType: participant.participantType,
        participantId: participant.participantId,
        role: participant.role,
        note: nullable(participant.note)
      }))
    );

    replaceConflictOutcome(
      id,
      input.conflictOutcome
        ? {
            eventId: id,
            settlementSummary: nullable(input.conflictOutcome.settlementSummary),
            note: nullable(input.conflictOutcome.note)
          }
        : null
    );
  });
}

export function removeEvent(id: number) {
  db.transaction(() => {
    deleteEventLinksAndRelations(id);
    deleteEvent(id);
  });
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredTime(prefix: string, value: TimeExpressionInput | undefined) {
  const record = toTimeExpressionRecord(value);
  return {
    [`${prefix}CalendarEra`]: record?.calendarEra ?? null,
    [`${prefix}StartYear`]: record?.startYear ?? null,
    [`${prefix}EndYear`]: record?.endYear ?? null,
    [`${prefix}IsApproximate`]: record?.isApproximate ?? false,
    [`${prefix}Precision`]: record?.precision ?? null,
    [`${prefix}DisplayLabel`]: record?.displayLabel ?? null
  };
}

function toStandaloneTime(prefix: string, value: TimeExpressionInput | undefined) {
  return {
    [`${prefix}CalendarEra`]: value?.calendarEra ?? null,
    [`${prefix}Year`]: value?.startYear ?? null
  };
}

function extractTimeExpression(prefix: string, value: Record<string, unknown>) {
  return fromTimeExpressionRecord({
    calendarEra: (value[`${prefix}CalendarEra`] as "BCE" | "CE" | null) ?? "CE",
    startYear: (value[`${prefix}StartYear`] as number | null) ?? null,
    endYear: (value[`${prefix}EndYear`] as number | null) ?? null,
    isApproximate: Boolean(value[`${prefix}IsApproximate`]),
    precision: (value[`${prefix}Precision`] as string | null) ?? "year",
    displayLabel: (value[`${prefix}DisplayLabel`] as string | null) ?? null
  });
}

function extractStandaloneTime(prefix: string, value: Record<string, unknown>) {
  const year = value[`${prefix}Year`] as number | null;
  const era = value[`${prefix}CalendarEra`] as "BCE" | "CE" | null;
  if (year === null || year === undefined) {
    return undefined;
  }

  return {
    calendarEra: era ?? "CE",
    startYear: year,
    isApproximate: false,
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function formatStoredTime(prefix: string, value: Record<string, unknown>) {
  const extracted = extractTimeExpression(prefix, value);
  return extracted ? formatTimeExpression(extracted) : "年未詳";
}

function normalizeQuery(value?: string) {
  return value?.trim().toLocaleLowerCase("ja-JP") ?? "";
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  if (query.length === 0) {
    return true;
  }

  return values.some((value) => value?.toLocaleLowerCase("ja-JP").includes(query));
}

function matchesYearRange(
  event: {
    timeCalendarEra: string | null;
    timeStartYear: number | null;
    timeEndYear: number | null;
    startCalendarEra: string | null;
    startYear: number | null;
    endCalendarEra: string | null;
    endYear: number | null;
  },
  fromYear?: number,
  toYear?: number
) {
  if (fromYear === undefined && toYear === undefined) {
    return true;
  }

  const timeRange = getComparableRange(event.timeCalendarEra, event.timeStartYear, event.timeEndYear);
  const conflictRange = getComparableRangeFromStandalone(
    event.startCalendarEra,
    event.startYear,
    event.endCalendarEra,
    event.endYear
  );
  const range = conflictRange ?? timeRange;
  if (!range) {
    return false;
  }

  const filterStart = fromYear ?? Number.NEGATIVE_INFINITY;
  const filterEnd = toYear ?? Number.POSITIVE_INFINITY;

  return range.start <= filterEnd && range.end >= filterStart;
}

function getComparableRange(era: string | null, startYear: number | null, endYear: number | null) {
  if (startYear == null) {
    return null;
  }

  const start = toComparableYear(era, startYear);
  const end = toComparableYear(era, endYear ?? startYear);

  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
}

function getComparableRangeFromStandalone(
  startEra: string | null,
  startYear: number | null,
  endEra: string | null,
  endYear: number | null
) {
  if (startYear == null) {
    return null;
  }

  const start = toComparableYear(startEra, startYear);
  const resolvedEndYear = endYear ?? startYear;
  const end = toComparableYear(endEra ?? startEra, resolvedEndYear);

  return {
    start: Math.min(start, end),
    end: Math.max(start, end)
  };
}

function toComparableYear(era: string | null, year: number) {
  return era === "BCE" ? -year : year;
}
