import {
  conflictOutcomeParticipantSchema,
  conflictParticipantSchema,
  eventSchema,
  type EventInput
} from "@/features/events/schema";
import { periodCategorySchema, type PeriodCategoryInput } from "@/features/periods/schema";
import { personSchema, roleAssignmentSchema, type PersonInput, type RoleAssignmentInput } from "@/features/people/schema";
import { politySchema, type PolityInput } from "@/features/polities/schema";
import { regionSchema, type RegionInput } from "@/features/regions/schema";
import { religionSchema, type ReligionInput } from "@/features/religions/schema";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import { sqlite } from "@/db/client";
import { listDynasties } from "@/server/repositories/dynasties";
import {
  getConflictOutcomesByEventIds,
  getConflictParticipantsByEventIds,
  getEventRelationsByEventIds,
  listEvents
} from "@/server/repositories/events";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPeriodCategories } from "@/server/repositories/period-categories";
import { listPeopleDetailed } from "@/server/repositories/people-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listSects } from "@/server/repositories/sects";
import {
  appendConflictOutcomeToEvent,
  appendConflictParticipantsToEvent,
  appendEventRelationsToEvent,
  createEventFromInput
} from "@/server/services/events";
import { appendRoleAssignmentsToPerson, createPersonFromInput } from "@/server/services/people";
import { createPeriodCategoryFromInput } from "@/server/services/period-categories";
import { createPolityFromInput } from "@/server/services/polities";
import { createRegionFromInput } from "@/server/services/regions";
import { createReligionFromInput } from "@/server/services/religions";

const EVENT_HEADERS = [
  "title",
  "event_type",
  "description",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "tags",
  "people",
  "polities",
  "dynasties",
  "periods",
  "religions",
  "sects",
  "regions"
] as const;

const REQUIRED_EVENT_HEADERS = ["title", "event_type"] as const;
const PERSON_HEADERS = [
  "name",
  "aliases",
  "note",
  "birth_label",
  "birth_calendar_era",
  "birth_start_year",
  "birth_end_year",
  "birth_is_approximate",
  "death_label",
  "death_calendar_era",
  "death_start_year",
  "death_end_year",
  "death_is_approximate",
  "regions",
  "religions",
  "sects",
  "periods"
] as const;
const REQUIRED_PERSON_HEADERS = ["name"] as const;
const ROLE_ASSIGNMENT_HEADERS = [
  "person",
  "title",
  "polity",
  "dynasty",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "is_incumbent",
  "note"
] as const;
const REQUIRED_ROLE_ASSIGNMENT_HEADERS = ["person", "title"] as const;
const EVENT_RELATION_HEADERS = ["from_event", "to_event", "relation_type"] as const;
const REQUIRED_EVENT_RELATION_HEADERS = ["from_event", "to_event", "relation_type"] as const;
const CONFLICT_PARTICIPANT_HEADERS = ["event", "participant_type", "participant_name", "role", "note"] as const;
const REQUIRED_CONFLICT_PARTICIPANT_HEADERS = ["event", "participant_type", "participant_name", "role"] as const;
const CONFLICT_OUTCOME_HEADERS = [
  "event",
  "winner_participants",
  "loser_participants",
  "winner_summary",
  "loser_summary",
  "settlement_summary",
  "note"
] as const;
const REQUIRED_CONFLICT_OUTCOME_HEADERS = ["event"] as const;
const REGION_HEADERS = ["name", "parent_region", "aliases", "description", "note"] as const;
const REQUIRED_REGION_HEADERS = ["name"] as const;
const PERIOD_CATEGORY_HEADERS = ["name", "description"] as const;
const REQUIRED_PERIOD_CATEGORY_HEADERS = ["name"] as const;
const POLITY_HEADERS = [
  "name",
  "aliases",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "regions"
] as const;
const REQUIRED_POLITY_HEADERS = ["name"] as const;
const RELIGION_HEADERS = [
  "name",
  "aliases",
  "description",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "regions",
  "founders"
] as const;
const REQUIRED_RELIGION_HEADERS = ["name"] as const;
const MULTI_VALUE_SEPARATOR = "|";

type CsvPreviewStatus = "ok" | "duplicate-candidate" | "error";
type CsvImportKind =
  | "event"
  | "person"
  | "role-assignment"
  | "event-relation"
  | "conflict-participant"
  | "conflict-outcome"
  | "region"
  | "period-category"
  | "polity"
  | "religion";

type CsvPreviewIssue = {
  field: string;
  message: string;
};

type CsvDuplicateCandidate = {
  id: number;
  label: string;
  reason: string;
};

export type CsvPreviewRow<TInput> = {
  rowNumber: number;
  label: string;
  status: CsvPreviewStatus;
  issues: CsvPreviewIssue[];
  warnings: CsvPreviewIssue[];
  duplicateCandidates: CsvDuplicateCandidate[];
  input?: TInput;
};

export type CsvPreviewSummary = {
  totalRows: number;
  okCount: number;
  duplicateCandidateCount: number;
  errorCount: number;
  warningCount: number;
};

export type CsvPreviewResult<TInput> = {
  kind: CsvImportKind;
  headers: string[];
  unknownHeaders: string[];
  summary: CsvPreviewSummary;
  rows: CsvPreviewRow<TInput>[];
};

export type CsvImportResult = {
  kind: CsvImportKind;
  importedCount: number;
};

export type RoleAssignmentCsvInput = {
  personId: number;
  personName: string;
  role: RoleAssignmentInput;
};

export type EventRelationCsvInput = {
  fromEventId: number;
  fromEventTitle: string;
  relation: {
    toEventId: number;
    relationType: "before" | "after" | "cause" | "related";
  };
};

export type ConflictParticipantCsvInput = {
  eventId: number;
  eventTitle: string;
  participant: {
    participantType: "polity" | "person" | "religion" | "sect";
    participantId: number;
    role: "attacker" | "defender" | "leader" | "ally" | "other";
    note?: string;
  };
};

export type ConflictOutcomeCsvInput = {
  eventId: number;
  eventTitle: string;
  outcome: {
    winnerParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    loserParticipants: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }>;
    winnerSummary?: string;
    loserSummary?: string;
    settlementSummary?: string;
    note?: string;
  };
};

export type RegionCsvInput = RegionInput;
export type PeriodCategoryCsvInput = PeriodCategoryInput;
export type PolityCsvInput = PolityInput;
export type ReligionCsvInput = ReligionInput;

type ParsedCsvRow = {
  rowNumber: number;
  values: string[];
};

type ParsedCsvDocument = {
  headers: string[];
  rows: ParsedCsvRow[];
};

type NameReferenceKey = "people" | "polities" | "dynasties" | "periods" | "religions" | "sects" | "regions";

type ReferenceMaps = Record<NameReferenceKey, Map<string, number>>;

export function previewEventCsvImport(rawCsv: string): CsvPreviewResult<EventInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_EVENT_HEADERS);

  const unknownHeaders = parsed.headers.filter((header) => !EVENT_HEADERS.includes(header as (typeof EVENT_HEADERS)[number]));
  const references = buildReferenceMaps();
  const existingEvents = listEvents();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];

    if (row.values.length > parsed.headers.length) {
      issues.push({
        field: "_row",
        message: `列数がヘッダー数を超えています (${row.values.length} > ${parsed.headers.length})`
      });
    }

    const cells = mapRowToCells(parsed.headers, row.values);
    const title = cells.title.trim();
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);
    const inputCandidate = {
      title,
      description: normalizeOptionalString(cells.description),
      tags: parseDelimitedNames(cells.tags),
      eventType: cells.event_type.trim(),
      timeExpression,
      startTimeExpression: undefined,
      endTimeExpression: undefined,
      personIds: resolveReferences("people", cells.people, references.people, issues),
      polityIds: resolveReferences("polities", cells.polities, references.polities, issues),
      dynastyIds: resolveReferences("dynasties", cells.dynasties, references.dynasties, issues),
      periodIds: resolveReferences("periods", cells.periods, references.periods, issues),
      religionIds: resolveReferences("religions", cells.religions, references.religions, issues),
      sectIds: resolveReferences("sects", cells.sects, references.sects, issues),
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues),
      relations: [],
      conflictParticipants: [],
      conflictOutcome: undefined
    };

    const parsedInput = eventSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({
          field: issue.path.join(".") || "_row",
          message: issue.message
        });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const duplicateCandidates =
      issues.length === 0 && parsedInput.success
        ? findEventDuplicateCandidates(existingEvents, parsedInput.data)
        : [];

    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;

    return {
      rowNumber: row.rowNumber,
      label: title || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<EventInput>;
  });

  return {
    kind: "event",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewPersonCsvImport(rawCsv: string): CsvPreviewResult<PersonInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_PERSON_HEADERS);

  const unknownHeaders = parsed.headers.filter((header) => !PERSON_HEADERS.includes(header as (typeof PERSON_HEADERS)[number]));
  const references = buildReferenceMaps();
  const existingPeople = listPeopleDetailed();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];

    if (row.values.length > parsed.headers.length) {
      issues.push({
        field: "_row",
        message: `列数がヘッダー数を超えています (${row.values.length} > ${parsed.headers.length})`
      });
    }

    const cells = mapRowToCells(parsed.headers, row.values);
    const name = cells.name.trim();
    const birthTimeExpression = parseTimeExpressionFromCsv(cells, "birth", issues);
    const deathTimeExpression = parseTimeExpressionFromCsv(cells, "death", issues);
    const inputCandidate = {
      name,
      aliases: parseCommaSeparatedNames(cells.aliases),
      note: normalizeOptionalString(cells.note),
      birthTimeExpression,
      deathTimeExpression,
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues),
      religionIds: resolveReferences("religions", cells.religions, references.religions, issues),
      sectIds: resolveReferences("sects", cells.sects, references.sects, issues),
      periodIds: resolveReferences("periods", cells.periods, references.periods, issues),
      roles: []
    };

    const parsedInput = personSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({
          field: issue.path.join(".") || "_row",
          message: issue.message
        });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const duplicateCandidates =
      issues.length === 0 && parsedInput.success
        ? findPersonDuplicateCandidates(existingPeople, parsedInput.data)
        : [];

    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;

    return {
      rowNumber: row.rowNumber,
      label: name || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<PersonInput>;
  });

  return {
    kind: "person",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewRoleAssignmentCsvImport(rawCsv: string): CsvPreviewResult<RoleAssignmentCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_ROLE_ASSIGNMENT_HEADERS);

  const unknownHeaders = parsed.headers.filter(
    (header) => !ROLE_ASSIGNMENT_HEADERS.includes(header as (typeof ROLE_ASSIGNMENT_HEADERS)[number])
  );
  const references = buildReferenceMaps();
  const people = listPeopleDetailed();
  const peopleById = new Map(people.map((person) => [person.id, person.name]));
  const roles = getRoleAssignmentsByPersonIds(people.map((person) => person.id));
  const polityById = new Map(listPolities().map((polity) => [polity.id, polity.name]));
  const dynastyById = new Map(listDynasties().map((dynasty) => [dynasty.id, dynasty.name]));

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];

    if (row.values.length > parsed.headers.length) {
      issues.push({
        field: "_row",
        message: `列数がヘッダー数を超えています (${row.values.length} > ${parsed.headers.length})`
      });
    }

    const cells = mapRowToCells(parsed.headers, row.values);
    const personName = cells.person.trim();
    const title = cells.title.trim();
    const personId = resolveSingleReference("people", personName, references.people, issues);
    const polityId = resolveSingleReference("polities", normalizeOptionalString(cells.polity), references.polities, issues, false);
    const dynastyId = resolveSingleReference("dynasties", normalizeOptionalString(cells.dynasty), references.dynasties, issues, false);
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);

    const inputCandidate = {
      title,
      polityId,
      dynastyId,
      note: normalizeOptionalString(cells.note),
      isIncumbent: parseOptionalBoolean(cells.is_incumbent, "is_incumbent", issues) ?? false,
      timeExpression
    };

    const parsedInput = roleAssignmentSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({
          field: issue.path.join(".") || "_row",
          message: issue.message
        });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const previewInput =
      issues.length === 0 && parsedInput.success && personId
        ? {
            personId,
            personName: peopleById.get(personId) ?? personName,
            role: parsedInput.data
          }
        : undefined;

    const duplicateCandidates =
      previewInput ? findRoleAssignmentDuplicateCandidates(roles, previewInput, polityById, dynastyById) : [];

    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: personName && title ? `${personName}: ${title}` : title || personName || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<RoleAssignmentCsvInput>;
  });

  return {
    kind: "role-assignment",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewEventRelationCsvImport(rawCsv: string): CsvPreviewResult<EventRelationCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_EVENT_RELATION_HEADERS);

  const unknownHeaders = parsed.headers.filter(
    (header) => !EVENT_RELATION_HEADERS.includes(header as (typeof EVENT_RELATION_HEADERS)[number])
  );
  const existingEvents = listEvents();
  const eventNameMap = new Map(existingEvents.map((event) => [event.title, event.id]));
  const eventById = new Map(existingEvents.map((event) => [event.id, event.title]));
  const existingRelations = buildExistingEventRelationKeys(existingEvents.map((event) => event.id));

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];

    if (row.values.length > parsed.headers.length) {
      issues.push({
        field: "_row",
        message: `列数がヘッダー数を超えています (${row.values.length} > ${parsed.headers.length})`
      });
    }

    const cells = mapRowToCells(parsed.headers, row.values);
    const fromEventTitle = cells.from_event.trim();
    const toEventTitle = cells.to_event.trim();
    const fromEventId = resolveNamedEntity("from_event", fromEventTitle, eventNameMap, issues);
    const toEventId = resolveNamedEntity("to_event", toEventTitle, eventNameMap, issues);
    const relationType = normalizeOptionalString(cells.relation_type);

    if (relationType && !["before", "after", "cause", "related"].includes(relationType)) {
      issues.push({
        field: "relation_type",
        message: "before / after / cause / related のいずれかを指定してください"
      });
    }

    if (fromEventId && toEventId && fromEventId === toEventId) {
      issues.push({
        field: "to_event",
        message: "自己参照は登録できません"
      });
    }

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const previewInput =
      issues.length === 0 && fromEventId && toEventId && relationType
        ? {
            fromEventId,
            fromEventTitle: eventById.get(fromEventId) ?? fromEventTitle,
            relation: {
              toEventId,
              relationType: relationType as "before" | "after" | "cause" | "related"
            }
          }
        : undefined;

    const duplicateCandidates = previewInput
      ? findEventRelationDuplicateCandidates(previewInput, existingRelations, eventById)
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: fromEventTitle && toEventTitle ? `${fromEventTitle} -> ${toEventTitle}` : `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<EventRelationCsvInput>;
  });

  return {
    kind: "event-relation",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewConflictParticipantCsvImport(rawCsv: string): CsvPreviewResult<ConflictParticipantCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_CONFLICT_PARTICIPANT_HEADERS);

  const unknownHeaders = parsed.headers.filter(
    (header) => !CONFLICT_PARTICIPANT_HEADERS.includes(header as (typeof CONFLICT_PARTICIPANT_HEADERS)[number])
  );
  const events = listEvents();
  const eventNameMap = new Map(events.map((event) => [event.title, event]));
  const options = buildParticipantReferenceMaps();
  const existingParticipants = getConflictParticipantsByEventIds(events.map((event) => event.id));

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];

    const cells = mapRowToCells(parsed.headers, row.values);
    const eventTitle = cells.event.trim();
    const event = eventNameMap.get(eventTitle);
    if (!event) {
      issues.push({ field: "event", message: `未登録の参照名です: ${eventTitle}` });
    } else if (!isConflictEventType(event.eventType)) {
      issues.push({ field: "event", message: "war / rebellion / civil_war のイベントだけ登録できます" });
    }

    const participantType = normalizeOptionalString(cells.participant_type);
    if (!participantType || !["polity", "person", "religion", "sect"].includes(participantType)) {
      issues.push({ field: "participant_type", message: "polity / person / religion / sect のいずれかを指定してください" });
    }

    const role = normalizeOptionalString(cells.role);
    if (!role || !["attacker", "defender", "leader", "ally", "other"].includes(role)) {
      issues.push({ field: "role", message: "attacker / defender / leader / ally / other のいずれかを指定してください" });
    }

    const participantId =
      participantType && ["polity", "person", "religion", "sect"].includes(participantType)
        ? resolveNamedEntity(
            "participant_name",
            cells.participant_name.trim(),
            options[participantType as "polity" | "person" | "religion" | "sect"],
            issues
          )
        : null;

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const input =
      issues.length === 0 && event && participantType && role && participantId
        ? {
            eventId: event.id,
            eventTitle: event.title,
            participant: conflictParticipantSchema.parse({
              participantType,
              participantId,
              role,
              note: normalizeOptionalString(cells.note)
            })
          }
        : undefined;

    const duplicateCandidates = input
      ? findConflictParticipantDuplicateCandidates(existingParticipants, input, options)
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: eventTitle && cells.participant_name.trim() ? `${eventTitle}: ${cells.participant_name.trim()}` : `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input
    } satisfies CsvPreviewRow<ConflictParticipantCsvInput>;
  });

  return {
    kind: "conflict-participant",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewConflictOutcomeCsvImport(rawCsv: string): CsvPreviewResult<ConflictOutcomeCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_CONFLICT_OUTCOME_HEADERS);

  const unknownHeaders = parsed.headers.filter(
    (header) => !CONFLICT_OUTCOME_HEADERS.includes(header as (typeof CONFLICT_OUTCOME_HEADERS)[number])
  );
  const events = listEvents();
  const eventNameMap = new Map(events.map((event) => [event.title, event]));
  const options = buildParticipantReferenceMaps();
  const existingOutcomes = getConflictOutcomesByEventIds(events.map((event) => event.id));

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const eventTitle = cells.event.trim();
    const event = eventNameMap.get(eventTitle);

    if (!event) {
      issues.push({ field: "event", message: `未登録の参照名です: ${eventTitle}` });
    } else if (!isConflictEventType(event.eventType)) {
      issues.push({ field: "event", message: "war / rebellion / civil_war のイベントだけ登録できます" });
    }

    const winnerParticipants = parseConflictOutcomeSide(cells.winner_participants, "winner", options, issues, "winner_participants");
    const loserParticipants = parseConflictOutcomeSide(cells.loser_participants, "loser", options, issues, "loser_participants");

    if (winnerParticipants.length === 0 && loserParticipants.length === 0) {
      issues.push({
        field: "winner_participants",
        message: "勝者側または敗者側の参加勢力を 1 件以上指定してください"
      });
    }

    if (unknownHeaders.length > 0) {
      warnings.push({
        field: "_header",
        message: `未対応列は無視されます: ${unknownHeaders.join(", ")}`
      });
    }

    const input =
      issues.length === 0 && event
        ? {
            eventId: event.id,
            eventTitle: event.title,
            outcome: {
              winnerParticipants,
              loserParticipants,
              winnerSummary: normalizeOptionalString(cells.winner_summary),
              loserSummary: normalizeOptionalString(cells.loser_summary),
              settlementSummary: normalizeOptionalString(cells.settlement_summary),
              note: normalizeOptionalString(cells.note)
            }
          }
        : undefined;

    const duplicateCandidates = input ? findConflictOutcomeDuplicateCandidates(existingOutcomes, input) : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: eventTitle || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input
    } satisfies CsvPreviewRow<ConflictOutcomeCsvInput>;
  });

  return {
    kind: "conflict-outcome",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function previewRegionCsvImport(rawCsv: string): CsvPreviewResult<RegionCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_REGION_HEADERS);

  const unknownHeaders = parsed.headers.filter((header) => !REGION_HEADERS.includes(header as (typeof REGION_HEADERS)[number]));
  const regions = listRegions();
  const regionNameMap = new Map(regions.map((region) => [region.name, region.id]));

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);

    const inputCandidate = {
      name: cells.name.trim(),
      parentRegionId: resolveNamedEntityOptional("parent_region", cells.parent_region, regionNameMap, issues),
      aliases: parseCommaSeparatedNames(cells.aliases),
      description: normalizeOptionalString(cells.description),
      note: normalizeOptionalString(cells.note)
    };

    const parsedInput = regionSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }

    if (parsedInput.success && parsedInput.data.parentRegionId && regionNameMap.get(parsedInput.data.name) === parsedInput.data.parentRegionId) {
      issues.push({ field: "parent_region", message: "自己参照は登録できません" });
    }

    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }

    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput ? findNameDuplicateCandidates(regions, previewInput.name, "同名の地域が登録済みです") : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: inputCandidate.name || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<RegionCsvInput>;
  });

  return { kind: "region", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewPeriodCategoryCsvImport(rawCsv: string): CsvPreviewResult<PeriodCategoryCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_PERIOD_CATEGORY_HEADERS);

  const unknownHeaders = parsed.headers.filter(
    (header) => !PERIOD_CATEGORY_HEADERS.includes(header as (typeof PERIOD_CATEGORY_HEADERS)[number])
  );
  const categories = listPeriodCategories();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      name: cells.name.trim(),
      description: normalizeOptionalString(cells.description)
    };

    const parsedInput = periodCategorySchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }

    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? findNameDuplicateCandidates(categories, previewInput.name, "同名の時代区分カテゴリが登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: inputCandidate.name || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<PeriodCategoryCsvInput>;
  });

  return { kind: "period-category", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewPolityCsvImport(rawCsv: string): CsvPreviewResult<PolityCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_POLITY_HEADERS);

  const unknownHeaders = parsed.headers.filter((header) => !POLITY_HEADERS.includes(header as (typeof POLITY_HEADERS)[number]));
  const references = buildReferenceMaps();
  const polities = listPolities();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      name: cells.name.trim(),
      aliases: parseCommaSeparatedNames(cells.aliases),
      note: normalizeOptionalString(cells.note),
      timeExpression: parseTimeExpressionFromCsv(cells, "time", issues),
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues)
    };

    const parsedInput = politySchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }

    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? findNameDuplicateCandidates(polities, previewInput.name, "同名の国家が登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: inputCandidate.name || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<PolityCsvInput>;
  });

  return { kind: "polity", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewReligionCsvImport(rawCsv: string): CsvPreviewResult<ReligionCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_RELIGION_HEADERS);

  const unknownHeaders = parsed.headers.filter((header) => !RELIGION_HEADERS.includes(header as (typeof RELIGION_HEADERS)[number]));
  const references = buildReferenceMaps();
  const religions = listReligions();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      name: cells.name.trim(),
      aliases: parseCommaSeparatedNames(cells.aliases),
      description: normalizeOptionalString(cells.description),
      note: normalizeOptionalString(cells.note),
      timeExpression: parseTimeExpressionFromCsv(cells, "time", issues),
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues),
      founderIds: resolveReferences("people", cells.founders, references.people, issues)
    };

    const parsedInput = religionSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }

    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }

    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? findNameDuplicateCandidates(religions, previewInput.name, "同名の宗教が登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";

    return {
      rowNumber: row.rowNumber,
      label: inputCandidate.name || `row-${row.rowNumber}`,
      status,
      issues,
      warnings,
      duplicateCandidates,
      input: previewInput
    } satisfies CsvPreviewRow<ReligionCsvInput>;
  });

  return { kind: "religion", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function applyEventCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewEventCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;

    for (const row of preview.rows) {
      if (!row.input) {
        continue;
      }

      createEventFromInput(row.input);
      count += 1;
    }

    return count;
  })();

  return {
    kind: "event",
    importedCount
  };
}

export function applyPersonCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPersonCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;

    for (const row of preview.rows) {
      if (!row.input) {
        continue;
      }

      createPersonFromInput(row.input);
      count += 1;
    }

    return count;
  })();

  return {
    kind: "person",
    importedCount
  };
}

export function applyRoleAssignmentCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewRoleAssignmentCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    const grouped = new Map<number, RoleAssignmentInput[]>();

    for (const row of preview.rows) {
      if (!row.input) {
        continue;
      }

      const list = grouped.get(row.input.personId) ?? [];
      list.push(row.input.role);
      grouped.set(row.input.personId, list);
    }

    for (const [personId, roles] of grouped) {
      appendRoleAssignmentsToPerson(personId, roles);
    }

    return preview.rows.length;
  })();

  return {
    kind: "role-assignment",
    importedCount
  };
}

export function applyEventRelationCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewEventRelationCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    const grouped = new Map<number, Array<{ toEventId: number; relationType: "before" | "after" | "cause" | "related" }>>();

    for (const row of preview.rows) {
      if (!row.input) {
        continue;
      }

      const list = grouped.get(row.input.fromEventId) ?? [];
      list.push(row.input.relation);
      grouped.set(row.input.fromEventId, list);
    }

    for (const [eventId, relations] of grouped) {
      appendEventRelationsToEvent(eventId, relations);
    }

    return preview.rows.length;
  })();

  return {
    kind: "event-relation",
    importedCount
  };
}

export function applyConflictParticipantCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewConflictParticipantCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    const grouped = new Map<number, ConflictParticipantCsvInput["participant"][]>();

    for (const row of preview.rows) {
      if (!row.input) continue;
      const list = grouped.get(row.input.eventId) ?? [];
      list.push(row.input.participant);
      grouped.set(row.input.eventId, list);
    }

    for (const [eventId, participants] of grouped) {
      appendConflictParticipantsToEvent(eventId, participants);
    }

    return preview.rows.length;
  })();

  return { kind: "conflict-participant", importedCount };
}

export function applyConflictOutcomeCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewConflictOutcomeCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");

  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    for (const row of preview.rows) {
      if (!row.input) continue;
      appendConflictOutcomeToEvent(row.input.eventId, row.input.outcome);
    }

    return preview.rows.length;
  })();

  return { kind: "conflict-outcome", importedCount };
}

export function applyRegionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewRegionCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");
  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;
    for (const row of preview.rows) {
      if (!row.input) continue;
      createRegionFromInput(row.input);
      count += 1;
    }
    return count;
  })();

  return { kind: "region", importedCount };
}

export function applyPeriodCategoryCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPeriodCategoryCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");
  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;
    for (const row of preview.rows) {
      if (!row.input) continue;
      createPeriodCategoryFromInput(row.input);
      count += 1;
    }
    return count;
  })();

  return { kind: "period-category", importedCount };
}

export function applyPolityCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPolityCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");
  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;
    for (const row of preview.rows) {
      if (!row.input) continue;
      createPolityFromInput(row.input);
      count += 1;
    }
    return count;
  })();

  return { kind: "polity", importedCount };
}

export function applyReligionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewReligionCsvImport(rawCsv);
  const blockingRows = preview.rows.filter((row) => row.status !== "ok");
  if (blockingRows.length > 0) {
    throw new Error("error または duplicate-candidate を含むため import を実行できません");
  }

  const importedCount = sqlite.transaction(() => {
    let count = 0;
    for (const row of preview.rows) {
      if (!row.input) continue;
      createReligionFromInput(row.input);
      count += 1;
    }
    return count;
  })();

  return { kind: "religion", importedCount };
}

export function parseCsv(rawCsv: string): ParsedCsvDocument {
  const normalized = rawCsv.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const matrix = parseCsvMatrix(normalized);

  const nonEmptyRows = matrix.filter((row) => row.some((cell) => cell.trim().length > 0));
  if (nonEmptyRows.length === 0) {
    throw new Error("CSV が空です");
  }

  const [headerRow, ...dataRows] = nonEmptyRows;
  const headers = headerRow.map((cell) => cell.trim());
  if (headers.length === 0 || headers.every((header) => header.length === 0)) {
    throw new Error("ヘッダー行が必要です");
  }

  const duplicateHeaders = findDuplicateValues(headers);
  if (duplicateHeaders.length > 0) {
    throw new Error(`重複したヘッダーがあります: ${duplicateHeaders.join(", ")}`);
  }

  return {
    headers,
    rows: dataRows.map((values, index) => ({
      rowNumber: index + 2,
      values
    }))
  };
}

function summarizeRows<TInput>(rows: CsvPreviewRow<TInput>[]): CsvPreviewSummary {
  return {
    totalRows: rows.length,
    okCount: rows.filter((row) => row.status === "ok").length,
    duplicateCandidateCount: rows.filter((row) => row.status === "duplicate-candidate").length,
    errorCount: rows.filter((row) => row.status === "error").length,
    warningCount: rows.reduce((count, row) => count + row.warnings.length, 0)
  };
}

function buildReferenceMaps(): ReferenceMaps {
  return {
    people: new Map(listPeopleDetailed().map((item) => [item.name, item.id])),
    polities: new Map(listPolities().map((item) => [item.name, item.id])),
    dynasties: new Map(listDynasties().map((item) => [item.name, item.id])),
    periods: new Map(listHistoricalPeriods().map((item) => [item.name, item.id])),
    religions: new Map(listReligions().map((item) => [item.name, item.id])),
    sects: new Map(listSects().map((item) => [item.name, item.id])),
    regions: new Map(listRegions().map((item) => [item.name, item.id]))
  };
}

function validateRequiredHeaders(headers: string[], requiredHeaders: readonly string[]) {
  const missing = requiredHeaders.filter((header) => !headers.includes(header));
  if (missing.length > 0) {
    throw new Error(`必須ヘッダーが不足しています: ${missing.join(", ")}`);
  }
}

function mapRowToCells(headers: string[], values: string[]) {
  return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])) as Record<string, string>;
}

function parseTimeExpressionFromCsv(
  cells: Record<string, string>,
  prefix: "time" | "birth" | "death",
  issues: CsvPreviewIssue[]
): TimeExpressionInput | undefined {
  const label = normalizeOptionalString(cells[`${prefix}_label`]);
  const calendarEraRaw = normalizeOptionalString(cells[`${prefix}_calendar_era`]);
  const startYear = parseOptionalInteger(cells[`${prefix}_start_year`], `${prefix}_start_year`, issues);
  const endYear = parseOptionalInteger(cells[`${prefix}_end_year`], `${prefix}_end_year`, issues);
  const isApproximate = parseOptionalBoolean(cells[`${prefix}_is_approximate`], `${prefix}_is_approximate`, issues);

  if (!label && !calendarEraRaw && startYear === undefined && endYear === undefined && isApproximate === undefined) {
    return undefined;
  }

  const calendarEra = calendarEraRaw ?? "CE";
  if (calendarEra !== "BCE" && calendarEra !== "CE") {
    issues.push({
      field: `${prefix}_calendar_era`,
      message: "BCE または CE を指定してください"
    });
    return undefined;
  }

  if (startYear === undefined && endYear !== undefined) {
    issues.push({
      field: `${prefix}_start_year`,
      message: "終了年だけでは登録できません"
    });
  }

  return {
    calendarEra,
    startYear,
    endYear,
    isApproximate: isApproximate ?? false,
    precision: "year",
    displayLabel: label ?? ""
  };
}

function resolveReferences(
  field: NameReferenceKey,
  rawValue: string | undefined,
  map: Map<string, number>,
  issues: CsvPreviewIssue[]
) {
  const names = parseDelimitedNames(rawValue);
  const ids: number[] = [];

  for (const name of names) {
    const id = map.get(name);
    if (!id) {
      issues.push({
        field,
        message: `未登録の参照名です: ${name}`
      });
      continue;
    }

    ids.push(id);
  }

  return ids;
}

function resolveSingleReference(
  field: NameReferenceKey,
  rawValue: string | undefined,
  map: Map<string, number>,
  issues: CsvPreviewIssue[],
  required = true
) {
  const normalized = normalizeOptionalString(rawValue);
  if (!normalized) {
    if (required) {
      issues.push({
        field,
        message: "必須です"
      });
    }
    return null;
  }

  const id = map.get(normalized);
  if (!id) {
    issues.push({
      field,
      message: `未登録の参照名です: ${normalized}`
    });
    return null;
  }

  return id;
}

function resolveNamedEntity(
  field: string,
  rawValue: string | undefined,
  map: Map<string, number>,
  issues: CsvPreviewIssue[]
) {
  const normalized = normalizeOptionalString(rawValue);
  if (!normalized) {
    issues.push({
      field,
      message: "必須です"
    });
    return null;
  }

  const id = map.get(normalized);
  if (!id) {
    issues.push({
      field,
      message: `未登録の参照名です: ${normalized}`
    });
    return null;
  }

  return id;
}

function resolveNamedEntityOptional(
  field: string,
  rawValue: string | undefined,
  map: Map<string, number>,
  issues: CsvPreviewIssue[]
) {
  const normalized = normalizeOptionalString(rawValue);
  if (!normalized) {
    return null;
  }

  const id = map.get(normalized);
  if (!id) {
    issues.push({
      field,
      message: `未登録の参照名です: ${normalized}`
    });
    return null;
  }

  return id;
}

function parseDelimitedNames(rawValue: string | undefined) {
  if (!rawValue) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .split(MULTI_VALUE_SEPARATOR)
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function parseCommaSeparatedNames(rawValue: string | undefined) {
  if (!rawValue) {
    return [];
  }

  return Array.from(
    new Set(
      rawValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    )
  );
}

function parseOptionalInteger(rawValue: string | undefined, field: string, issues: CsvPreviewIssue[]) {
  const normalized = normalizeOptionalString(rawValue);
  if (!normalized) {
    return undefined;
  }

  const value = Number(normalized);
  if (!Number.isInteger(value)) {
    issues.push({
      field,
      message: "整数年を指定してください"
    });
    return undefined;
  }

  return value;
}

function parseOptionalBoolean(rawValue: string | undefined, field: string, issues: CsvPreviewIssue[]) {
  const normalized = normalizeOptionalString(rawValue)?.toLowerCase();
  if (!normalized) {
    return undefined;
  }

  if (["1", "true", "yes", "on"].includes(normalized)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalized)) {
    return false;
  }

  issues.push({
    field,
    message: "true/false, 1/0, yes/no のいずれかを指定してください"
  });
  return undefined;
}

function normalizeOptionalString(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function findEventDuplicateCandidates(existingEvents: ReturnType<typeof listEvents>, input: EventInput): CsvDuplicateCandidate[] {
  const importedYear = input.timeExpression?.startYear;

  return existingEvents
    .filter((event) => {
      if (event.title !== input.title) {
        return false;
      }

      const existingYear = event.timeStartYear ?? event.startYear ?? null;
      if (importedYear === undefined || existingYear === null) {
        return true;
      }

      return Math.abs(existingYear - importedYear) <= 1;
    })
    .slice(0, 5)
    .map((event) => ({
      id: event.id,
      label: event.title,
      reason:
        importedYear !== undefined && (event.timeStartYear ?? event.startYear ?? null) !== null
          ? "タイトルと年代が近接しています"
          : "タイトルが一致しています"
    }));
}

function findPersonDuplicateCandidates(existingPeople: ReturnType<typeof listPeopleDetailed>, input: PersonInput): CsvDuplicateCandidate[] {
  const birthYear = input.birthTimeExpression?.startYear;
  const deathYear = input.deathTimeExpression?.startYear;

  return existingPeople
    .filter((person) => {
      const personRecord = person as Record<string, unknown>;
      const aliases = String(person.aliases ?? "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const nameMatched = person.name === input.name || aliases.includes(input.name) || input.aliases.includes(person.name);

      if (!nameMatched) {
        return false;
      }

      const existingBirthYear = typeof personRecord.birthStartYear === "number" ? personRecord.birthStartYear : null;
      const existingDeathYear = typeof personRecord.deathStartYear === "number" ? personRecord.deathStartYear : null;
      const birthMatches = birthYear === undefined || existingBirthYear === null ? true : existingBirthYear === birthYear;
      const deathMatches = deathYear === undefined || existingDeathYear === null ? true : existingDeathYear === deathYear;
      return birthMatches && deathMatches;
    })
    .slice(0, 5)
    .map((person) => ({
      id: person.id,
      label: person.name,
      reason:
        birthYear !== undefined || deathYear !== undefined
          ? "氏名または別名と生没年が一致しています"
          : "氏名または別名が一致しています"
    }));
}

function findRoleAssignmentDuplicateCandidates(
  existingRoles: ReturnType<typeof getRoleAssignmentsByPersonIds>,
  input: RoleAssignmentCsvInput,
  polityById: Map<number, string>,
  dynastyById: Map<number, string>
): CsvDuplicateCandidate[] {
  return existingRoles
    .filter((role) => {
      const roleRecord = role as Record<string, unknown>;
      if (role.personId !== input.personId) {
        return false;
      }

      if (role.title !== input.role.title) {
        return false;
      }

      if ((role.polityId ?? null) !== (input.role.polityId ?? null)) {
        return false;
      }

      if ((role.dynastyId ?? null) !== (input.role.dynastyId ?? null)) {
        return false;
      }

      const existingStartYear = typeof roleRecord.timeStartYear === "number" ? roleRecord.timeStartYear : null;
      if (existingStartYear !== (input.role.timeExpression?.startYear ?? null)) {
        return false;
      }

      const existingEndYear = typeof roleRecord.timeEndYear === "number" ? roleRecord.timeEndYear : null;
      if (existingEndYear !== (input.role.timeExpression?.endYear ?? null)) {
        return false;
      }

      return true;
    })
    .slice(0, 5)
    .map((role) => ({
      id: role.id,
      label: [
        role.title,
        role.dynastyId ? dynastyById.get(role.dynastyId) : role.polityId ? polityById.get(role.polityId) : null
      ]
        .filter(Boolean)
        .join(" / "),
      reason: "同一人物に同じ役職履歴が登録済みです"
    }));
}

function buildExistingEventRelationKeys(eventIds: number[]) {
  return new Set(
    getEventRelationsByEventIds(eventIds).map(
      (relation) => `${relation.fromEventId}:${relation.toEventId}:${relation.relationType}`
    )
  );
}

function findEventRelationDuplicateCandidates(
  input: EventRelationCsvInput,
  existingRelations: Set<string>,
  eventById: Map<number, string>
): CsvDuplicateCandidate[] {
  const key = `${input.fromEventId}:${input.relation.toEventId}:${input.relation.relationType}`;
  if (!existingRelations.has(key)) {
    return [];
  }

  return [
    {
      id: input.fromEventId,
      label: `${input.fromEventTitle} -> ${eventById.get(input.relation.toEventId) ?? `#${input.relation.toEventId}`}`,
      reason: "同じイベント関係が登録済みです"
    }
  ];
}

function buildParticipantReferenceMaps() {
  return {
    person: new Map(listPeopleDetailed().map((item) => [item.name, item.id])),
    polity: new Map(listPolities().map((item) => [item.name, item.id])),
    religion: new Map(listReligions().map((item) => [item.name, item.id])),
    sect: new Map(listSects().map((item) => [item.name, item.id]))
  };
}

function isConflictEventType(eventType: string | null | undefined) {
  return eventType === "war" || eventType === "rebellion" || eventType === "civil_war";
}

function parseConflictOutcomeSide(
  rawValue: string | undefined,
  side: "winner" | "loser",
  options: ReturnType<typeof buildParticipantReferenceMaps>,
  issues: CsvPreviewIssue[],
  field: string
) {
  const values = parseDelimitedNames(rawValue);
  const resolved: Array<{ side: "winner" | "loser"; participantType: "polity" | "person" | "religion" | "sect"; participantId: number }> = [];

  for (const value of values) {
    const [participantType, participantName] = value.split(":", 2);
    if (!participantType || !participantName || !["polity", "person", "religion", "sect"].includes(participantType)) {
      issues.push({
        field,
        message: `type:name 形式で指定してください: ${value}`
      });
      continue;
    }

    const participantId = options[participantType as "polity" | "person" | "religion" | "sect"].get(participantName);
    if (!participantId) {
      issues.push({
        field,
        message: `未登録の参照名です: ${value}`
      });
      continue;
    }

    const parsed = conflictOutcomeParticipantSchema.safeParse({
      side,
      participantType,
      participantId
    });

    if (parsed.success) {
      resolved.push(parsed.data);
    }
  }

  return resolved;
}

function findConflictParticipantDuplicateCandidates(
  existingParticipants: ReturnType<typeof getConflictParticipantsByEventIds>,
  input: ConflictParticipantCsvInput,
  options: ReturnType<typeof buildParticipantReferenceMaps>
) {
  const participantMaps = {
    person: new Map(Array.from(options.person.entries()).map(([name, id]) => [id, name])),
    polity: new Map(Array.from(options.polity.entries()).map(([name, id]) => [id, name])),
    religion: new Map(Array.from(options.religion.entries()).map(([name, id]) => [id, name])),
    sect: new Map(Array.from(options.sect.entries()).map(([name, id]) => [id, name]))
  };

  return existingParticipants
    .filter(
      (participant) =>
        participant.eventId === input.eventId &&
        participant.participantType === input.participant.participantType &&
        participant.participantId === input.participant.participantId &&
        participant.role === input.participant.role
    )
    .slice(0, 5)
    .map((participant, index) => ({
      id: participant.eventId * 1000 + index,
      label:
        participantMaps[participant.participantType as "person" | "polity" | "religion" | "sect"].get(participant.participantId) ??
        `#${participant.participantId}`,
      reason: "同じ参加勢力が登録済みです"
    }));
}

function findConflictOutcomeDuplicateCandidates(
  existingOutcomes: ReturnType<typeof getConflictOutcomesByEventIds>,
  input: ConflictOutcomeCsvInput
) {
  return existingOutcomes
    .filter((outcome) => outcome.eventId === input.eventId)
    .slice(0, 5)
    .map((outcome) => ({
      id: outcome.eventId,
      label: input.eventTitle,
      reason: "このイベントには既に結果が登録されています"
    }));
}

function findNameDuplicateCandidates(
  items: Array<{ id: number; name: string }>,
  name: string,
  reason: string
) {
  return items
    .filter((item) => item.name === name)
    .slice(0, 5)
    .map((item) => ({
      id: item.id,
      label: item.name,
      reason
    }));
}

function findDuplicateValues(values: string[]) {
  const counts = new Map<string, number>();

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .filter(([value, count]) => value.length > 0 && count > 1)
    .map(([value]) => value);
}

function parseCsvMatrix(raw: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  for (let index = 0; index < raw.length; index += 1) {
    const character = raw[index];
    const nextCharacter = raw[index + 1];

    if (character === "\"") {
      if (inQuotes && nextCharacter === "\"") {
        cell += "\"";
        index += 1;
        continue;
      }

      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if (character === "\n" && !inQuotes) {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += character;
  }

  if (inQuotes) {
    throw new Error("CSV のクォートが閉じていません");
  }

  row.push(cell);
  rows.push(row);
  return rows;
}
