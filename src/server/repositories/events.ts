import { asc, eq, inArray, or } from "drizzle-orm";
import { db } from "@/db/client";
import {
  conflictOutcomeParticipants,
  conflictOutcomes,
  conflictParticipants,
  eventDynastyLinks,
  eventPeriodLinks,
  eventPersonLinks,
  eventPolityLinks,
  eventRegionLinks,
  eventReligionLinks,
  eventRelations,
  eventSectLinks,
  eventTagLinks,
  events
} from "@/db/schema";

export type EventInsert = typeof events.$inferInsert;
export type EventRelationInsert = typeof eventRelations.$inferInsert;
export type ConflictParticipantInsert = typeof conflictParticipants.$inferInsert;
export type ConflictOutcomeInsert = typeof conflictOutcomes.$inferInsert;
export type ConflictOutcomeParticipantInsert = typeof conflictOutcomeParticipants.$inferInsert;

export function listEvents() {
  return db.select().from(events).orderBy(asc(events.title)).all();
}

export function getEventById(id: number) {
  return db.select().from(events).where(eq(events.id, id)).get();
}

export function createEvent(input: EventInsert) {
  const result = db.insert(events).values(input).run();
  return Number(result.lastInsertRowid);
}

export function updateEvent(id: number, input: Partial<Omit<EventInsert, "id">>) {
  db.update(events).set(input).where(eq(events.id, id)).run();
}

export function deleteEvent(id: number) {
  db.delete(events).where(eq(events.id, id)).run();
}

export function replaceEventLinks(
  eventId: number,
  links: {
    personIds: number[];
    polityIds: number[];
    dynastyIds: number[];
    periodIds: number[];
    religionIds: number[];
    sectIds: number[];
    regionIds: number[];
    tagIds: number[];
  }
) {
  db.delete(eventPersonLinks).where(eq(eventPersonLinks.eventId, eventId)).run();
  db.delete(eventPolityLinks).where(eq(eventPolityLinks.eventId, eventId)).run();
  db.delete(eventDynastyLinks).where(eq(eventDynastyLinks.eventId, eventId)).run();
  db.delete(eventPeriodLinks).where(eq(eventPeriodLinks.eventId, eventId)).run();
  db.delete(eventReligionLinks).where(eq(eventReligionLinks.eventId, eventId)).run();
  db.delete(eventSectLinks).where(eq(eventSectLinks.eventId, eventId)).run();
  db.delete(eventRegionLinks).where(eq(eventRegionLinks.eventId, eventId)).run();
  db.delete(eventTagLinks).where(eq(eventTagLinks.eventId, eventId)).run();

  if (links.personIds.length > 0) {
    db.insert(eventPersonLinks).values(links.personIds.map((personId) => ({ eventId, personId }))).run();
  }
  if (links.polityIds.length > 0) {
    db.insert(eventPolityLinks).values(links.polityIds.map((polityId) => ({ eventId, polityId }))).run();
  }
  if (links.dynastyIds.length > 0) {
    db.insert(eventDynastyLinks).values(links.dynastyIds.map((dynastyId) => ({ eventId, dynastyId }))).run();
  }
  if (links.periodIds.length > 0) {
    db.insert(eventPeriodLinks).values(links.periodIds.map((periodId) => ({ eventId, periodId }))).run();
  }
  if (links.religionIds.length > 0) {
    db.insert(eventReligionLinks).values(links.religionIds.map((religionId) => ({ eventId, religionId }))).run();
  }
  if (links.sectIds.length > 0) {
    db.insert(eventSectLinks).values(links.sectIds.map((sectId) => ({ eventId, sectId }))).run();
  }
  if (links.regionIds.length > 0) {
    db.insert(eventRegionLinks).values(links.regionIds.map((regionId) => ({ eventId, regionId }))).run();
  }
  if (links.tagIds.length > 0) {
    db.insert(eventTagLinks).values(links.tagIds.map((tagId) => ({ eventId, tagId }))).run();
  }
}

export function replaceEventRelations(eventId: number, relations: EventRelationInsert[]) {
  db.delete(eventRelations).where(eq(eventRelations.fromEventId, eventId)).run();

  if (relations.length > 0) {
    db.insert(eventRelations).values(relations).run();
  }
}

export function replaceConflictParticipants(eventId: number, participants: ConflictParticipantInsert[]) {
  db.delete(conflictParticipants).where(eq(conflictParticipants.eventId, eventId)).run();

  if (participants.length > 0) {
    db.insert(conflictParticipants).values(participants).run();
  }
}

export function replaceConflictOutcome(eventId: number, outcome: ConflictOutcomeInsert | null) {
  db.delete(conflictOutcomes).where(eq(conflictOutcomes.eventId, eventId)).run();

  if (outcome) {
    db.insert(conflictOutcomes).values(outcome).run();
  }
}

export function replaceConflictOutcomeParticipants(eventId: number, participants: ConflictOutcomeParticipantInsert[]) {
  db.delete(conflictOutcomeParticipants).where(eq(conflictOutcomeParticipants.eventId, eventId)).run();

  if (participants.length > 0) {
    db.insert(conflictOutcomeParticipants).values(participants).run();
  }
}

export function getEventLinks(eventIds: number[]) {
  if (eventIds.length === 0) {
    return {
      personLinks: [],
      polityLinks: [],
      dynastyLinks: [],
      periodLinks: [],
      religionLinks: [],
      sectLinks: [],
      regionLinks: [],
      tagLinks: []
    };
  }

  return {
    personLinks: db.select().from(eventPersonLinks).where(inArray(eventPersonLinks.eventId, eventIds)).all(),
    polityLinks: db.select().from(eventPolityLinks).where(inArray(eventPolityLinks.eventId, eventIds)).all(),
    dynastyLinks: db.select().from(eventDynastyLinks).where(inArray(eventDynastyLinks.eventId, eventIds)).all(),
    periodLinks: db.select().from(eventPeriodLinks).where(inArray(eventPeriodLinks.eventId, eventIds)).all(),
    religionLinks: db.select().from(eventReligionLinks).where(inArray(eventReligionLinks.eventId, eventIds)).all(),
    sectLinks: db.select().from(eventSectLinks).where(inArray(eventSectLinks.eventId, eventIds)).all(),
    regionLinks: db.select().from(eventRegionLinks).where(inArray(eventRegionLinks.eventId, eventIds)).all(),
    tagLinks: db.select().from(eventTagLinks).where(inArray(eventTagLinks.eventId, eventIds)).all()
  };
}

export function getEventRelationsByEventIds(eventIds: number[]) {
  if (eventIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(eventRelations)
    .where(
      or(
        inArray(eventRelations.fromEventId, eventIds),
        inArray(eventRelations.toEventId, eventIds)
      )
    )
    .all();
}

export function getConflictParticipantsByEventIds(eventIds: number[]) {
  if (eventIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(conflictParticipants)
    .where(inArray(conflictParticipants.eventId, eventIds))
    .all();
}

export function getConflictOutcomesByEventIds(eventIds: number[]) {
  if (eventIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(conflictOutcomes)
    .where(inArray(conflictOutcomes.eventId, eventIds))
    .all();
}

export function getConflictOutcomeParticipantsByEventIds(eventIds: number[]) {
  if (eventIds.length === 0) {
    return [];
  }

  return db
    .select()
    .from(conflictOutcomeParticipants)
    .where(inArray(conflictOutcomeParticipants.eventId, eventIds))
    .all();
}

export function deleteEventLinksAndRelations(eventId: number) {
  db.delete(eventPersonLinks).where(eq(eventPersonLinks.eventId, eventId)).run();
  db.delete(eventPolityLinks).where(eq(eventPolityLinks.eventId, eventId)).run();
  db.delete(eventDynastyLinks).where(eq(eventDynastyLinks.eventId, eventId)).run();
  db.delete(eventPeriodLinks).where(eq(eventPeriodLinks.eventId, eventId)).run();
  db.delete(eventReligionLinks).where(eq(eventReligionLinks.eventId, eventId)).run();
  db.delete(eventSectLinks).where(eq(eventSectLinks.eventId, eventId)).run();
  db.delete(eventRegionLinks).where(eq(eventRegionLinks.eventId, eventId)).run();
  db.delete(eventTagLinks).where(eq(eventTagLinks.eventId, eventId)).run();
  db.delete(eventRelations).where(or(eq(eventRelations.fromEventId, eventId), eq(eventRelations.toEventId, eventId))).run();
  db.delete(conflictParticipants).where(eq(conflictParticipants.eventId, eventId)).run();
  db.delete(conflictOutcomes).where(eq(conflictOutcomes.eventId, eventId)).run();
  db.delete(conflictOutcomeParticipants).where(eq(conflictOutcomeParticipants.eventId, eventId)).run();
}
