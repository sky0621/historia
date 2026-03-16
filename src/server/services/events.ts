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
  getConflictOutcomeParticipantsByEventIds,
  getConflictOutcomesByEventIds,
  getConflictParticipantsByEventIds,
  getEventLinks,
  getEventRelationsByEventIds,
  listEvents,
  replaceConflictOutcome,
  replaceConflictOutcomeParticipants,
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
import { createTag, getEventTagLinks, getTagsByIds, getTagsByNames, listTags } from "@/server/repositories/tags";

type EventListFilters = {
  query?: string;
  tagId?: number;
  eventType?: "general" | "war" | "rebellion" | "civil_war";
  personId?: number;
  polityId?: number;
  dynastyId?: number;
  religionId?: number;
  sectId?: number;
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
    tags: listTags().map((item) => ({ id: item.id, name: item.name })),
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
  const dynastiesById = new Map(listDynasties().map((item) => [item.id, item.name]));
  const periodsById = new Map(listHistoricalPeriods().map((item) => [item.id, item.name]));
  const religionsById = new Map(listReligions().map((item) => [item.id, item.name]));
  const sectsById = new Map(listSects().map((item) => [item.id, item.name]));
  const regionsById = new Map(listRegions().map((item) => [item.id, item.name]));
  const tagsById = new Map(listTags().map((item) => [item.id, item.name]));

  return events
    .map((event) => {
      const relationSummaryItems = [
        ...links.personLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "people" as const, id: link.personId, name: peopleById.get(link.personId) }))
          .filter((item): item is { type: "people"; id: number; name: string } => Boolean(item.name)),
        ...links.polityLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "polities" as const, id: link.polityId, name: politiesById.get(link.polityId) }))
          .filter((item): item is { type: "polities"; id: number; name: string } => Boolean(item.name)),
        ...links.dynastyLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "dynasties" as const, id: link.dynastyId, name: dynastiesById.get(link.dynastyId) }))
          .filter((item): item is { type: "dynasties"; id: number; name: string } => Boolean(item.name)),
        ...links.periodLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "periods" as const, id: link.periodId, name: periodsById.get(link.periodId) }))
          .filter((item): item is { type: "periods"; id: number; name: string } => Boolean(item.name)),
        ...links.religionLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "religions" as const, id: link.religionId, name: religionsById.get(link.religionId) }))
          .filter((item): item is { type: "religions"; id: number; name: string } => Boolean(item.name)),
        ...links.sectLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "sects" as const, id: link.sectId, name: sectsById.get(link.sectId) }))
          .filter((item): item is { type: "sects"; id: number; name: string } => Boolean(item.name)),
        ...links.regionLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "regions" as const, id: link.regionId, name: regionsById.get(link.regionId) }))
          .filter((item): item is { type: "regions"; id: number; name: string } => Boolean(item.name)),
        ...links.tagLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "tags" as const, id: link.tagId, name: tagsById.get(link.tagId) }))
          .filter((item): item is { type: "tags"; id: number; name: string } => Boolean(item.name))
      ].slice(0, 4);

      return {
        ...event,
        timeLabel: formatEventTime(event),
        relationSummaryItems,
        relationSummary: relationSummaryItems.map((item) => item.name).join(", "),
        personIds: links.personLinks.filter((link) => link.eventId === event.id).map((link) => link.personId),
        polityIds: links.polityLinks.filter((link) => link.eventId === event.id).map((link) => link.polityId),
        dynastyIds: links.dynastyLinks.filter((link) => link.eventId === event.id).map((link) => link.dynastyId),
        religionIds: links.religionLinks.filter((link) => link.eventId === event.id).map((link) => link.religionId),
        sectIds: links.sectLinks.filter((link) => link.eventId === event.id).map((link) => link.sectId),
        regionIds: links.regionLinks.filter((link) => link.eventId === event.id).map((link) => link.regionId),
        periodIds: links.periodLinks.filter((link) => link.eventId === event.id).map((link) => link.periodId),
        tagIds: links.tagLinks.filter((link) => link.eventId === event.id).map((link) => link.tagId)
      };
    })
    .filter((event) => {
      if (filters.tagId && !event.tagIds.includes(filters.tagId)) {
        return false;
      }

      if (filters.eventType && event.eventType !== filters.eventType) {
        return false;
      }

      if (filters.personId && !event.personIds.includes(filters.personId)) {
        return false;
      }

      if (filters.polityId && !event.polityIds.includes(filters.polityId)) {
        return false;
      }

      if (filters.dynastyId && !event.dynastyIds.includes(filters.dynastyId)) {
        return false;
      }

      if (filters.religionId && !event.religionIds.includes(filters.religionId)) {
        return false;
      }

      if (filters.sectId && !event.sectIds.includes(filters.sectId)) {
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

  const allEvents = listEvents();
  const links = getEventLinks([id]);
  const relations = getEventRelationsByEventIds([id]);
  const participants = getConflictParticipantsByEventIds([id]);
  const outcomes = getConflictOutcomesByEventIds([id]);
  const outcomeParticipants = getConflictOutcomeParticipantsByEventIds([id]);
  const options = getEventFormOptions();
  const tagLinks = getEventTagLinks([id]);
  const linkedTags = getTagsByIds(tagLinks.map((link) => link.tagId));
  const eventById = new Map(allEvents.map((item) => [item.id, item]));
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
    linkedTags,
    outgoingRelations: relations
      .filter((relation) => relation.fromEventId === id)
      .map((relation) => ({
        ...relation,
        eventName: eventById.get(relation.toEventId)?.title ?? `#${relation.toEventId}`,
        relatedEventType: eventById.get(relation.toEventId)?.eventType ?? "general",
        relatedEventTimeLabel: eventById.get(relation.toEventId) ? formatEventTime(eventById.get(relation.toEventId)!) : "年未詳"
      })),
    incomingRelations: relations
      .filter((relation) => relation.toEventId === id)
      .map((relation) => ({
        ...relation,
        eventName: eventById.get(relation.fromEventId)?.title ?? `#${relation.fromEventId}`,
        relatedEventType: eventById.get(relation.fromEventId)?.eventType ?? "general",
        relatedEventTimeLabel: eventById.get(relation.fromEventId) ? formatEventTime(eventById.get(relation.fromEventId)!) : "年未詳"
      })),
    conflictParticipants: participants.map((participant) => ({
      ...participant,
      participantType: participant.participantType as "person" | "polity" | "religion" | "sect",
      participantName:
        participantNameByType[participant.participantType as "person" | "polity" | "religion" | "sect"]?.get(
          participant.participantId
        ) ?? `#${participant.participantId}`
    })),
    conflictOutcome: outcomes[0]
      ? {
          ...outcomes[0],
          winnerParticipants: outcomeParticipants
            .filter((participant) => participant.eventId === id && participant.side === "winner")
            .map((participant) => ({
              ...participant,
              participantType: participant.participantType as "person" | "polity" | "religion" | "sect",
              participantName:
                participantNameByType[participant.participantType as "person" | "polity" | "religion" | "sect"]?.get(
                  participant.participantId
                ) ?? `#${participant.participantId}`
            })),
          loserParticipants: outcomeParticipants
            .filter((participant) => participant.eventId === id && participant.side === "loser")
            .map((participant) => ({
              ...participant,
              participantType: participant.participantType as "person" | "polity" | "religion" | "sect",
              participantName:
                participantNameByType[participant.participantType as "person" | "polity" | "religion" | "sect"]?.get(
                  participant.participantId
                ) ?? `#${participant.participantId}`
            }))
        }
      : null,
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
      regionIds: input.regionIds,
      tagIds: ensureTagIds(input.tags)
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
            winnerSummary: nullable(input.conflictOutcome.winnerSummary),
            loserSummary: nullable(input.conflictOutcome.loserSummary),
            settlementSummary: nullable(input.conflictOutcome.settlementSummary),
            note: nullable(input.conflictOutcome.note)
          }
        : null
    );

    replaceConflictOutcomeParticipants(
      eventId,
      input.conflictOutcome
        ? [...input.conflictOutcome.winnerParticipants, ...input.conflictOutcome.loserParticipants].map((participant) => ({
            eventId,
            side: participant.side,
            participantType: participant.participantType,
            participantId: participant.participantId
          }))
        : []
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
      regionIds: input.regionIds,
      tagIds: ensureTagIds(input.tags)
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
            winnerSummary: nullable(input.conflictOutcome.winnerSummary),
            loserSummary: nullable(input.conflictOutcome.loserSummary),
            settlementSummary: nullable(input.conflictOutcome.settlementSummary),
            note: nullable(input.conflictOutcome.note)
          }
        : null
    );

    replaceConflictOutcomeParticipants(
      id,
      input.conflictOutcome
        ? [...input.conflictOutcome.winnerParticipants, ...input.conflictOutcome.loserParticipants].map((participant) => ({
            eventId: id,
            side: participant.side,
            participantType: participant.participantType,
            participantId: participant.participantId
          }))
        : []
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

function formatEventTime(value: Record<string, unknown>) {
  const conflictRange = toStandaloneYearLabel(
    (value.startCalendarEra as "BCE" | "CE" | null) ?? null,
    (value.startYear as number | null) ?? null,
    (value.endCalendarEra as "BCE" | "CE" | null) ?? null,
    (value.endYear as number | null) ?? null
  );

  if (conflictRange) {
    return conflictRange;
  }

  return formatStoredTime("time", value);
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
  const resolvedEndYear = endYear ?? startYear;
  const resolvedEndEra = endEra ?? startEra;
  const end = `${resolvedEndYear}${resolvedEndEra === "BCE" ? " BCE" : ""}`;

  return start === end ? start : `${start} - ${end}`;
}

function toComparableYear(era: string | null, year: number) {
  return era === "BCE" ? -year : year;
}

function ensureTagIds(tagNames: string[]) {
  if (tagNames.length === 0) {
    return [];
  }

  const existingTags = getTagsByNames(tagNames);
  const existingNameById = new Map(existingTags.map((tag) => [tag.name, tag.id]));
  const ensuredIds = [...existingTags.map((tag) => tag.id)];

  for (const tagName of tagNames) {
    if (existingNameById.has(tagName)) {
      continue;
    }

    const tagId = createTag(tagName);
    existingNameById.set(tagName, tagId);
    ensuredIds.push(tagId);
  }

  return ensuredIds;
}
