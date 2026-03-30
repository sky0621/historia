import { db } from "@/db/client";
import { formatYearWithEra } from "@/lib/time-expression/format";
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
  insertConflictOutcome,
  insertConflictOutcomeParticipants,
  insertConflictParticipants,
  insertEventRelations,
  listEvents,
  replaceConflictOutcome,
  replaceConflictOutcomeParticipants,
  replaceConflictParticipants,
  replaceEventLinks,
  replaceEventRelations,
  updateEvent
} from "@/server/repositories/events";
import { listDynasties } from "@/server/repositories/dynasties";
import { listPersonDetailed } from "@/server/repositories/person-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { listSects } from "@/server/repositories/sects";
import { createTag, getEventTagLinks, getTagsByIds, getTagsByNames, listTags } from "@/server/repositories/tags";
import { getHistoryView, recordChangeHistory } from "@/server/services/history";
import { getCitationListForTarget } from "@/server/services/sources";
import { formatStoredBoundaryRangeForOption, normalizeStoredBoundaryYear, toStoredBoundaryYear } from "@/server/services/time-sentinel";

type EventListFilters = {
  query?: string;
  tagId?: number;
  eventType?: "general" | "war" | "rebellion" | "civil_war";
  relationType?: "before" | "after" | "cause" | "related";
  sortBy?: "timeAsc" | "timeDesc" | "titleAsc" | "updatedDesc";
  personId?: number;
  polityId?: number;
  dynastyId?: number;
  religionId?: number;
  sectId?: number;
  regionId?: number;
  fromYear?: number;
  toYear?: number;
};

export function getEventFormOptions() {
  return {
    person: listPersonDetailed().map((item) => ({ id: item.id, name: item.name })),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name, timeLabel: formatPolityOptionTime(item) })),
    dynasties: listDynasties().map((item) => ({ id: item.id, name: item.name })),
    religions: listReligions().map((item) => ({ id: item.id, name: item.name })),
    sects: listSects().map((item) => ({ id: item.id, name: item.name, religionId: item.religionId })),
    tags: listTags().map((item) => ({ id: item.id, name: item.name })),
    regions: listRegions().map((item) => ({ id: item.id, name: item.name, parentRegionId: item.parentRegionId })),
    events: listEvents().map((item) => ({ id: item.id, name: item.title }))
  };
}

export function getEventsListView(filters: EventListFilters = {}) {
  const normalizedQuery = normalizeQuery(filters.query);
  const events = listEvents();
  const links = getEventLinks(events.map((event) => event.id));
  const relations = getEventRelationsByEventIds(events.map((event) => event.id));

  const personById = new Map(listPersonDetailed().map((item) => [item.id, item.name]));
  const politiesById = new Map(listPolities().map((item) => [item.id, item.name]));
  const dynastiesById = new Map(listDynasties().map((item) => [item.id, item.name]));
  const religionsById = new Map(listReligions().map((item) => [item.id, item.name]));
  const sectsById = new Map(listSects().map((item) => [item.id, item.name]));
  const regionsById = new Map(listRegions().map((item) => [item.id, item.name]));
  const tagsById = new Map(listTags().map((item) => [item.id, item.name]));

  return events
    .map((event) => {
      const relationSummaryItems = [
        ...links.personLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "person" as const, id: link.personId, name: personById.get(link.personId) }))
          .filter((item): item is { type: "person"; id: number; name: string } => Boolean(item.name)),
        ...links.polityLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "polities" as const, id: link.polityId, name: politiesById.get(link.polityId) }))
          .filter((item): item is { type: "polities"; id: number; name: string } => Boolean(item.name)),
        ...links.dynastyLinks
          .filter((link) => link.eventId === event.id)
          .map((link) => ({ type: "dynasties" as const, id: link.dynastyId, name: dynastiesById.get(link.dynastyId) }))
          .filter((item): item is { type: "dynasties"; id: number; name: string } => Boolean(item.name)),
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
        relationTypes: Array.from(
          new Set(
            relations
              .filter((relation) => relation.fromEventId === event.id || relation.toEventId === event.id)
              .map((relation) => relation.relationType)
          )
        ),
        personIds: links.personLinks.filter((link) => link.eventId === event.id).map((link) => link.personId),
        polityIds: links.polityLinks.filter((link) => link.eventId === event.id).map((link) => link.polityId),
        dynastyIds: links.dynastyLinks.filter((link) => link.eventId === event.id).map((link) => link.dynastyId),
        religionIds: links.religionLinks.filter((link) => link.eventId === event.id).map((link) => link.religionId),
        sectIds: links.sectLinks.filter((link) => link.eventId === event.id).map((link) => link.sectId),
        regionIds: links.regionLinks.filter((link) => link.eventId === event.id).map((link) => link.regionId),
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

      if (filters.relationType && !event.relationTypes.includes(filters.relationType)) {
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

      if (!matchesYearRange(event, filters.fromYear, filters.toYear)) {
        return false;
      }

      return matchesQuery([event.title, event.description, event.relationSummary], normalizedQuery);
    })
    .sort((left, right) => compareEventListItems(left, right, filters.sortBy));
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
    person: new Map(options.person.map((item) => [item.id, item.name])),
    polity: new Map(options.polities.map((item) => [item.id, item.name])),
    religion: new Map(options.religions.map((item) => [item.id, item.name])),
    sect: new Map(options.sects.map((item) => [item.id, item.name]))
  };

  return {
    event,
    linkedPerson: options.person.filter((item) => links.personLinks.some((link) => link.eventId === id && link.personId === item.id)),
    linkedPolities: options.polities.filter((item) => links.polityLinks.some((link) => link.eventId === id && link.polityId === item.id)),
    linkedDynasties: options.dynasties.filter((item) => links.dynastyLinks.some((link) => link.eventId === id && link.dynastyId === item.id)),
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
    citations: getCitationListForTarget("event", id),
    changeHistory: getHistoryView("event", id),
    defaultFromTimeExpression: extractBoundaryTime("from", event),
    defaultToTimeExpression: extractBoundaryTime("to", event),
    formOptions: {
      ...options,
      events: options.events.filter((item) => item.id !== id)
    }
  };
}

export function createEventFromInput(input: EventInput) {
  return db.transaction(() => {
    const eventId = createEvent({
      title: input.title,
      eventType: input.eventType,
      description: nullable(input.description),
      ...toStoredEventRange(input.fromTimeExpression, input.toTimeExpression)
    });

    replaceEventLinks(eventId, {
      personIds: input.personIds,
      polityIds: input.polityIds,
      dynastyIds: input.dynastyIds,
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
            resolutionSummary: nullable(input.conflictOutcome.resolutionSummary),
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

    recordChangeHistory({
      targetType: "event",
      targetId: eventId,
      action: "create",
      snapshot: buildEventHistorySnapshot(eventId)
    });

    return eventId;
  });
}

export function updateEventFromInput(id: number, input: EventInput) {
  db.transaction(() => {
    const before = buildEventHistorySnapshot(id);
    updateEvent(id, {
      title: input.title,
      eventType: input.eventType,
      description: nullable(input.description),
      ...toStoredEventRange(input.fromTimeExpression, input.toTimeExpression)
    });

    replaceEventLinks(id, {
      personIds: input.personIds,
      polityIds: input.polityIds,
      dynastyIds: input.dynastyIds,
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
            resolutionSummary: nullable(input.conflictOutcome.resolutionSummary),
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

    recordChangeHistory({
      targetType: "event",
      targetId: id,
      action: "update",
      snapshot: before
    });
  });
}

export function removeEvent(id: number) {
  db.transaction(() => {
    const snapshot = buildEventHistorySnapshot(id);
    deleteEventLinksAndRelations(id);
    deleteEvent(id);
    recordChangeHistory({
      targetType: "event",
      targetId: id,
      action: "delete",
      snapshot
    });
  });
}

export function appendEventRelationsToEvent(
  id: number,
  relations: Array<{ toEventId: number; relationType: "before" | "after" | "cause" | "related" }>
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  insertEventRelations(
    relations.map((relation) => ({
      fromEventId: id,
      toEventId: relation.toEventId,
      relationType: relation.relationType
    }))
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function replaceEventRelationsOnEvent(
  id: number,
  relations: Array<{ toEventId: number; relationType: "before" | "after" | "cause" | "related" }>
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  replaceEventRelations(
    id,
    relations.map((relation) => ({
      fromEventId: id,
      toEventId: relation.toEventId,
      relationType: relation.relationType
    }))
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function appendConflictParticipantsToEvent(
  id: number,
  participants: Array<{
    participantType: "polity" | "person" | "religion" | "sect";
    participantId: number;
    role: "attacker" | "defender" | "leader" | "ally" | "other";
    note?: string;
  }>
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  insertConflictParticipants(
    participants.map((participant) => ({
      eventId: id,
      participantType: participant.participantType,
      participantId: participant.participantId,
      role: participant.role,
      note: nullable(participant.note)
    }))
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function replaceConflictParticipantsOnEvent(
  id: number,
  participants: Array<{
    participantType: "polity" | "person" | "religion" | "sect";
    participantId: number;
    role: "attacker" | "defender" | "leader" | "ally" | "other";
    note?: string;
  }>
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  replaceConflictParticipants(
    id,
    participants.map((participant) => ({
      eventId: id,
      participantType: participant.participantType,
      participantId: participant.participantId,
      role: participant.role,
      note: nullable(participant.note)
    }))
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function appendConflictOutcomeToEvent(
  id: number,
  outcome: {
    winnerParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    loserParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    winnerSummary?: string;
    loserSummary?: string;
    resolutionSummary?: string;
    note?: string;
  }
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  insertConflictOutcome({
    eventId: id,
    winnerSummary: nullable(outcome.winnerSummary),
    loserSummary: nullable(outcome.loserSummary),
    resolutionSummary: nullable(outcome.resolutionSummary),
    note: nullable(outcome.note)
  });
  insertConflictOutcomeParticipants(
    [...outcome.winnerParticipants, ...outcome.loserParticipants].map((participant) => ({
      eventId: id,
      side: participant.side,
      participantType: participant.participantType,
      participantId: participant.participantId
    }))
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

export function replaceConflictOutcomeOnEvent(
  id: number,
  outcome: {
    winnerParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    loserParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    winnerSummary?: string;
    loserSummary?: string;
    resolutionSummary?: string;
    note?: string;
  } | null
) {
  const event = getEventById(id);
  if (!event) {
    throw new Error(`イベントが見つかりません: ${id}`);
  }

  const before = buildEventHistorySnapshot(id);
  replaceConflictOutcome(
    id,
    outcome
      ? {
          eventId: id,
          winnerSummary: nullable(outcome.winnerSummary),
          loserSummary: nullable(outcome.loserSummary),
          resolutionSummary: nullable(outcome.resolutionSummary),
          note: nullable(outcome.note)
        }
      : null
  );
  replaceConflictOutcomeParticipants(
    id,
    outcome
      ? [...outcome.winnerParticipants, ...outcome.loserParticipants].map((participant) => ({
          eventId: id,
          side: participant.side,
          participantType: participant.participantType,
          participantId: participant.participantId
        }))
      : []
  );

  recordChangeHistory({
    targetType: "event",
    targetId: id,
    action: "update",
    snapshot: before
  });
}

function nullable(value: string | undefined) {
  return value && value.length > 0 ? value : null;
}

function toStoredEventRange(from: TimeExpressionInput | undefined, to: TimeExpressionInput | undefined) {
  return {
    fromCalendarEra: from?.calendarEra ?? null,
    fromYear: toStoredBoundaryYear("from", from?.startYear),
    fromIsApproximate: from?.isApproximate ?? false,
    toCalendarEra: to?.calendarEra ?? null,
    toYear: toStoredBoundaryYear("to", to?.startYear),
    toIsApproximate: to?.isApproximate ?? false
  };
}

function extractBoundaryTime(prefix: "from" | "to", value: Record<string, unknown>) {
  const yearKey = prefix === "from" ? "fromYear" : "toYear";
  const eraKey = prefix === "from" ? "fromCalendarEra" : "toCalendarEra";
  const approximateKey = prefix === "from" ? "fromIsApproximate" : "toIsApproximate";
  const year = normalizeStoredBoundaryYear(prefix, value[yearKey] as number | null | undefined);
  const era = value[eraKey] as "BCE" | "CE" | null;
  if (year === null || year === undefined) {
    return undefined;
  }

  return {
    calendarEra: era ?? "CE",
    startYear: year,
    isApproximate: Boolean(value[approximateKey]),
    precision: "year",
    displayLabel: ""
  } satisfies TimeExpressionInput;
}

function formatEventTime(value: Record<string, unknown>) {
  const rangeLabel = toStandaloneYearLabel(
    (value.fromCalendarEra as "BCE" | "CE" | null) ?? null,
    normalizeStoredBoundaryYear("from", value.fromYear as number | null | undefined),
    (value.toCalendarEra as "BCE" | "CE" | null) ?? null,
    normalizeStoredBoundaryYear("to", value.toYear as number | null | undefined)
  );

  return rangeLabel ?? "年未詳";
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
    fromCalendarEra: string | null;
    fromYear: number | null;
    toCalendarEra: string | null;
    toYear: number | null;
  },
  fromYear?: number,
  toYear?: number
) {
  if (fromYear === undefined && toYear === undefined) {
    return true;
  }

  const range = getComparableRangeFromStandalone(event.fromCalendarEra, event.fromYear, event.toCalendarEra, event.toYear);
  if (!range) {
    return false;
  }

  const filterStart = fromYear ?? Number.NEGATIVE_INFINITY;
  const filterEnd = toYear ?? Number.POSITIVE_INFINITY;

  return range.start <= filterEnd && range.end >= filterStart;
}

function compareEventListItems(
  left: {
    title: string;
    id: number;
    fromCalendarEra: string | null;
    fromYear: number | null;
    toCalendarEra: string | null;
    toYear: number | null;
  },
  right: {
    title: string;
    id: number;
    fromCalendarEra: string | null;
    fromYear: number | null;
    toCalendarEra: string | null;
    toYear: number | null;
  },
  sortBy: EventListFilters["sortBy"] = "timeAsc"
) {
  if (sortBy === "titleAsc") {
    return left.title.localeCompare(right.title, "ja");
  }

  if (sortBy === "updatedDesc") {
    return right.id - left.id;
  }

  const leftRange = getComparableRangeFromStandalone(left.fromCalendarEra, left.fromYear, left.toCalendarEra, left.toYear);
  const rightRange = getComparableRangeFromStandalone(right.fromCalendarEra, right.fromYear, right.toCalendarEra, right.toYear);

  const leftStart = leftRange?.start ?? Number.POSITIVE_INFINITY;
  const rightStart = rightRange?.start ?? Number.POSITIVE_INFINITY;
  const diff = sortBy === "timeDesc" ? rightStart - leftStart : leftStart - rightStart;

  if (diff !== 0) {
    return diff;
  }

  return left.title.localeCompare(right.title, "ja");
}

function buildEventHistorySnapshot(id: number) {
  const event = getEventById(id);
  if (!event) {
    return { id };
  }

  const links = getEventLinks([id]);

  return {
    ...event,
    personIds: links.personLinks.map((link) => link.personId),
    polityIds: links.polityLinks.map((link) => link.polityId),
    dynastyIds: links.dynastyLinks.map((link) => link.dynastyId),
    religionIds: links.religionLinks.map((link) => link.religionId),
    sectIds: links.sectLinks.map((link) => link.sectId),
    regionIds: links.regionLinks.map((link) => link.regionId),
    tagIds: links.tagLinks.map((link) => link.tagId),
    relations: getEventRelationsByEventIds([id]),
    conflictParticipants: getConflictParticipantsByEventIds([id]),
    conflictOutcome: getConflictOutcomesByEventIds([id])[0] ?? null,
    conflictOutcomeParticipants: getConflictOutcomeParticipantsByEventIds([id])
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

  const start = formatYearWithEra(startEra, startYear);
  const resolvedEndYear = endYear ?? startYear;
  const resolvedEndEra = endEra ?? startEra;
  const end = formatYearWithEra(resolvedEndEra, resolvedEndYear);

  if (!start || !end) {
    return null;
  }

  return start === end ? start : `${start} - ${end}`;
}

function formatPolityOptionTime(value: Record<string, unknown>) {
  return formatStoredBoundaryRangeForOption(
    (value.fromCalendarEra as "BCE" | "CE" | null) ?? null,
    value.fromYear as number | null | undefined,
    (value.toCalendarEra as "BCE" | "CE" | null) ?? null,
    value.toYear as number | null | undefined
  );
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
