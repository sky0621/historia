import {
  conflictOutcomeParticipantSchema,
  conflictParticipantSchema,
  eventSchema,
  type EventInput
} from "@/features/events/schema";
import { periodCategorySchema, type PeriodCategoryInput } from "@/features/periods/schema";
import { personSchema, roleAssignmentSchema, type PersonInput, type RoleAssignmentInput } from "@/features/person/schema";
import { dynastySchema, politySchema, type DynastyInput, type PolityInput } from "@/features/polities/schema";
import {
  dynastySuccessionSchema,
  historicalPeriodRelationSchema,
  polityTransitionSchema,
  regionRelationSchema,
  type DynastySuccessionInput,
  type HistoricalPeriodRelationInput,
  type PolityTransitionInput,
  type RegionRelationInput
} from "@/features/relations/schema";
import { regionSchema, type RegionInput } from "@/features/regions/schema";
import { religionSchema, sectSchema, type ReligionInput, type SectInput } from "@/features/religions/schema";
import { historicalPeriodSchema, type HistoricalPeriodInput } from "@/features/periods/schema";
import { citationSchema, sourceSchema, type CitationInput, type SourceInput } from "@/features/sources/schema";
import { tagSchema, type TagInput } from "@/features/tags/schema";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import { sqlite } from "@/db/client";
import { listCitations } from "@/server/repositories/citations";
import { listDynastySuccessions } from "@/server/repositories/dynasty-successions";
import { listDynasties } from "@/server/repositories/dynasties";
import {
  getConflictOutcomesByEventIds,
  getConflictParticipantsByEventIds,
  getEventRelationsByEventIds,
  listEvents
} from "@/server/repositories/events";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listHistoricalPeriodRelations } from "@/server/repositories/historical-period-relations";
import { listPeriodCategories } from "@/server/repositories/period-categories";
import { listPersonDetailed } from "@/server/repositories/person-detail";
import { listPolities } from "@/server/repositories/polities";
import { listPolityTransitions } from "@/server/repositories/polity-transitions";
import { listRegionRelations } from "@/server/repositories/region-relations";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listSects } from "@/server/repositories/sects";
import { listSources } from "@/server/repositories/sources";
import { listTags } from "@/server/repositories/tags";
import {
  createEventFromInput,
  removeEvent,
  replaceConflictParticipantsOnEvent,
  replaceConflictOutcomeOnEvent,
  replaceEventRelationsOnEvent,
  updateEventFromInput
} from "@/server/services/events";
import {
  createPersonFromInput,
  removePerson,
  replaceRoleAssignmentsOnPerson,
  updatePersonFromInput
} from "@/server/services/person";
import {
  createPeriodCategoryFromInput,
  deletePeriodCategoryById,
  updatePeriodCategoryFromInput
} from "@/server/services/period-categories";
import {
  createDynastyFromInput,
  createPolityFromInput,
  removeDynasty,
  removePolity,
  updateDynastyFromInput,
  updatePolityFromInput
} from "@/server/services/polities";
import {
  createDynastySuccessionFromInput,
  createHistoricalPeriodRelationFromInput,
  createPolityTransitionFromInput,
  createRegionRelationFromInput,
  deleteDynastySuccessionById,
  deleteHistoricalPeriodRelationById,
  deletePolityTransitionById,
  deleteRegionRelationById,
  updateDynastySuccessionFromInput,
  updateHistoricalPeriodRelationFromInput,
  updatePolityTransitionFromInput,
  updateRegionRelationFromInput
} from "@/server/services/relations";
import { createRegionFromInput, deleteRegionById, updateRegionFromInput } from "@/server/services/regions";
import {
  createReligionFromInput,
  createSectFromInput,
  removeReligion,
  removeSect,
  updateReligionFromInput,
  updateSectFromInput
} from "@/server/services/religions";
import {
  createHistoricalPeriodFromInput,
  removeHistoricalPeriod,
  updateHistoricalPeriodFromInput
} from "@/server/services/historical-periods";
import {
  createCitationFromInput,
  createSourceFromInput,
  removeCitation,
  removeSource,
  updateCitationFromInput,
  updateSourceFromInput
} from "@/server/services/sources";
import { createTagFromInput, deleteTagById, updateTagFromInput } from "@/server/services/tags";

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
  "person",
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
  "reading",
  "aliases",
  "note",
  "from_label",
  "from_calendar_era",
  "from_year",
  "from_is_approximate",
  "to_label",
  "to_calendar_era",
  "to_year",
  "to_is_approximate",
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
  "resolution_summary",
  "note"
] as const;
const REQUIRED_CONFLICT_OUTCOME_HEADERS = ["event"] as const;
const REGION_HEADERS = ["name", "parent_region", "description", "note"] as const;
const REQUIRED_REGION_HEADERS = ["name"] as const;
const PERIOD_CATEGORY_HEADERS = ["name", "description"] as const;
const REQUIRED_PERIOD_CATEGORY_HEADERS = ["name"] as const;
const POLITY_HEADERS = [
  "name",
  "note",
  "from_label",
  "from_calendar_era",
  "from_year",
  "from_is_approximate",
  "to_label",
  "to_calendar_era",
  "to_year",
  "to_is_approximate",
  "regions"
] as const;
const REQUIRED_POLITY_HEADERS = ["name"] as const;
const RELIGION_HEADERS = [
  "name",
  "description",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "founders"
] as const;
const REQUIRED_RELIGION_HEADERS = ["name"] as const;
const DYNASTY_HEADERS = [
  "name",
  "polity",
  "polities",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "regions"
] as const;
const REQUIRED_DYNASTY_HEADERS = ["name"] as const;
const HISTORICAL_PERIOD_HEADERS = [
  "name",
  "category",
  "polity",
  "description",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "regions"
] as const;
const REQUIRED_HISTORICAL_PERIOD_HEADERS = ["name", "category"] as const;
const SECT_HEADERS = [
  "name",
  "religion",
  "parent_sect",
  "description",
  "note",
  "time_label",
  "time_calendar_era",
  "time_start_year",
  "time_end_year",
  "time_is_approximate",
  "founders"
] as const;
const REQUIRED_SECT_HEADERS = ["name", "religion"] as const;
const TAG_HEADERS = ["name"] as const;
const REQUIRED_TAG_HEADERS = ["name"] as const;
const SOURCE_HEADERS = ["title", "author", "publisher", "published_at_label", "url", "note"] as const;
const REQUIRED_SOURCE_HEADERS = ["title"] as const;
const CITATION_HEADERS = ["source", "target_type", "target_name", "locator", "quote", "note"] as const;
const REQUIRED_CITATION_HEADERS = ["source", "target_type", "target_name"] as const;
const POLITY_TRANSITION_HEADERS = [
  "predecessor_polity",
  "successor_polity",
  "transition_type"
] as const;
const REQUIRED_POLITY_TRANSITION_HEADERS = ["predecessor_polity", "successor_polity", "transition_type"] as const;
const DYNASTY_SUCCESSION_HEADERS = [
  "polity",
  "predecessor_dynasty",
  "successor_dynasty"
] as const;
const REQUIRED_DYNASTY_SUCCESSION_HEADERS = ["polity", "predecessor_dynasty", "successor_dynasty"] as const;
const REGION_RELATION_HEADERS = ["from_region", "to_region", "relation_type", "note"] as const;
const REQUIRED_REGION_RELATION_HEADERS = ["from_region", "to_region", "relation_type"] as const;
const HISTORICAL_PERIOD_RELATION_HEADERS = ["from_period", "to_period", "relation_type", "note"] as const;
const REQUIRED_HISTORICAL_PERIOD_RELATION_HEADERS = ["from_period", "to_period", "relation_type"] as const;
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
  | "religion"
  | "dynasty"
  | "historical-period"
  | "sect"
  | "tag"
  | "source"
  | "citation"
  | "polity-transition"
  | "dynasty-succession"
  | "region-relation"
  | "historical-period-relation";

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
  insertedCount: number;
  updatedCount: number;
  deletedCount: number;
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
    resolutionSummary?: string;
    note?: string;
  };
};

export type RegionCsvInput = RegionInput;
export type PeriodCategoryCsvInput = PeriodCategoryInput;
export type PolityCsvInput = PolityInput;
export type ReligionCsvInput = ReligionInput;
export type DynastyCsvInput = DynastyInput;
export type HistoricalPeriodCsvInput = HistoricalPeriodInput;
export type SectCsvInput = SectInput;
export type TagCsvInput = TagInput;
export type SourceCsvInput = SourceInput;
export type CitationCsvInput = CitationInput;
export type PolityTransitionCsvInput = PolityTransitionInput;
export type DynastySuccessionCsvInput = DynastySuccessionInput;
export type RegionRelationCsvInput = RegionRelationInput;
export type HistoricalPeriodRelationCsvInput = HistoricalPeriodRelationInput;

type ParsedCsvRow = {
  rowNumber: number;
  values: string[];
};

type ParsedCsvDocument = {
  headers: string[];
  rows: ParsedCsvRow[];
};

type NameReferenceKey = "person" | "polities" | "dynasties" | "periods" | "religions" | "sects" | "regions";

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
      fromTimeExpression: timeExpression
        ? {
            calendarEra: timeExpression.calendarEra,
            startYear: timeExpression.startYear,
            isApproximate: timeExpression.isApproximate,
            precision: "year",
            displayLabel: ""
          }
        : undefined,
      toTimeExpression:
        timeExpression && timeExpression.endYear !== undefined
          ? {
              calendarEra: timeExpression.calendarEra,
              startYear: timeExpression.endYear,
              isApproximate: timeExpression.isApproximate,
              precision: "year",
              displayLabel: ""
            }
          : undefined,
      personIds: resolveReferences("person", cells.person, references.person, issues),
      polityIds: resolveReferences("polities", cells.polities, references.polities, issues),
      dynastyIds: resolveReferences("dynasties", cells.dynasties, references.dynasties, issues),
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
  const existingPerson = listPersonDetailed();

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
    const birthTimeExpression = parsePersonTimeExpressionFromCsv(cells, "from", issues);
    const deathTimeExpression = parsePersonTimeExpressionFromCsv(cells, "to", issues);
    const inputCandidate = {
      name,
      reading: normalizeOptionalString(cells.reading),
      aliases: parseCommaSeparatedNames(cells.aliases),
      note: normalizeOptionalString(cells.note),
      birthTimeExpression,
      deathTimeExpression,
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues),
      religionIds: resolveReferences("religions", cells.religions, references.religions, issues),
      sectIds: resolveReferences("sects", cells.sects, references.sects, issues),
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
        ? findPersonDuplicateCandidates(existingPerson, parsedInput.data)
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
  const person = listPersonDetailed();
  const personById = new Map(person.map((person) => [person.id, person.name]));
  const roles = getRoleAssignmentsByPersonIds(person.map((person) => person.id));
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
    const personId = resolveSingleReference("person", personName, references.person, issues);
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
            personName: personById.get(personId) ?? personName,
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
              resolutionSummary: normalizeOptionalString(cells.resolution_summary),
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
      note: normalizeOptionalString(cells.note),
      fromTimeExpression: parsePersonTimeExpressionFromCsv(cells, "from", issues),
      toTimeExpression: parsePersonTimeExpressionFromCsv(cells, "to", issues),
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
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);
    const inputCandidate = {
      name: cells.name.trim(),
      description: normalizeOptionalString(cells.description),
      note: normalizeOptionalString(cells.note),
      ...toBoundaryTimeExpressions(timeExpression),
      founderIds: resolveReferences("person", cells.founders, references.person, issues)
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

export function previewDynastyCsvImport(rawCsv: string): CsvPreviewResult<DynastyCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_DYNASTY_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !DYNASTY_HEADERS.includes(header as (typeof DYNASTY_HEADERS)[number]));
  const references = buildReferenceMaps();
  const dynasties = listDynasties();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const polityNames = normalizeOptionalString(cells.polities) ?? normalizeOptionalString(cells.polity) ?? "";
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);
    const inputCandidate = {
      polityIds: resolveReferences("polities", polityNames, references.polities, issues),
      name: cells.name.trim(),
      note: normalizeOptionalString(cells.note),
      ...toBoundaryTimeExpressions(timeExpression),
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues)
    };
    const parsedInput = dynastySchema.safeParse(inputCandidate);
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
      ? findNameDuplicateCandidates(dynasties, previewInput.name, "同名の王朝が登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: inputCandidate.name || `row-${row.rowNumber}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<DynastyCsvInput>;
  });

  return { kind: "dynasty", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewHistoricalPeriodCsvImport(rawCsv: string): CsvPreviewResult<HistoricalPeriodCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_HISTORICAL_PERIOD_HEADERS);
  const unknownHeaders = parsed.headers.filter(
    (header) => !HISTORICAL_PERIOD_HEADERS.includes(header as (typeof HISTORICAL_PERIOD_HEADERS)[number])
  );
  const references = buildReferenceMaps();
  const categories = new Map(listPeriodCategories().map((item) => [item.name, item.id]));
  const periods = listHistoricalPeriods();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);
    const inputCandidate = {
      categoryId: resolveNamedEntity("category", cells.category, categories, issues),
      polityId: resolveNamedEntityOptional("polity", cells.polity, references.polities, issues),
      name: cells.name.trim(),
      description: normalizeOptionalString(cells.description),
      note: normalizeOptionalString(cells.note),
      ...toBoundaryTimeExpressions(timeExpression),
      regionIds: resolveReferences("regions", cells.regions, references.regions, issues)
    };
    const parsedInput = historicalPeriodSchema.safeParse(inputCandidate);
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
      ? periods
          .filter((period) => period.name === previewInput.name && period.categoryId === previewInput.categoryId)
          .map((period) => ({
            id: period.id,
            label: period.name,
            reason: "同じカテゴリ内に同じ名称の時代区分が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: inputCandidate.name || `row-${row.rowNumber}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<HistoricalPeriodCsvInput>;
  });

  return { kind: "historical-period", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewSectCsvImport(rawCsv: string): CsvPreviewResult<SectCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_SECT_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !SECT_HEADERS.includes(header as (typeof SECT_HEADERS)[number]));
  const references = buildReferenceMaps();
  const sectNameMap = new Map(listSects().map((item) => [item.name, item.id]));
  const sects = listSects();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const timeExpression = parseTimeExpressionFromCsv(cells, "time", issues);
    const inputCandidate = {
      religionId: resolveSingleReference("religions", cells.religion, references.religions, issues),
      parentSectId: resolveNamedEntityOptional("parent_sect", cells.parent_sect, sectNameMap, issues),
      name: cells.name.trim(),
      description: normalizeOptionalString(cells.description),
      note: normalizeOptionalString(cells.note),
      ...toBoundaryTimeExpressions(timeExpression),
      founderIds: resolveReferences("person", cells.founders, references.person, issues)
    };
    const parsedInput = sectSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }
    if (parsedInput.success && parsedInput.data.parentSectId && sectNameMap.get(parsedInput.data.name) === parsedInput.data.parentSectId) {
      issues.push({ field: "parent_sect", message: "自己参照は登録できません" });
    }
    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? findNameDuplicateCandidates(sects, previewInput.name, "同名の宗派が登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: inputCandidate.name || `row-${row.rowNumber}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<SectCsvInput>;
  });

  return { kind: "sect", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewTagCsvImport(rawCsv: string): CsvPreviewResult<TagCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_TAG_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !TAG_HEADERS.includes(header as (typeof TAG_HEADERS)[number]));
  const tags = listTags();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = { name: cells.name.trim() };
    const parsedInput = tagSchema.safeParse(inputCandidate);
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
      ? findNameDuplicateCandidates(tags, previewInput.name, "同名のタグが登録済みです")
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: inputCandidate.name || `row-${row.rowNumber}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<TagCsvInput>;
  });

  return { kind: "tag", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function applyEventCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewEventCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listEvents(),
      getExistingKey: (item) => item.title,
      getInputKey: (input) => input.title,
      createItem: createEventFromInput,
      updateItem: updateEventFromInput,
      deleteItem: removeEvent
    })
  )();

  return { kind: "event", ...result };
}

export function applyPersonCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPersonCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listPersonDetailed(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createPersonFromInput,
      updateItem: updatePersonFromInput,
      deleteItem: removePerson
    })
  )();

  return { kind: "person", ...result };
}

export function applyRoleAssignmentCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewRoleAssignmentCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() => {
    const syncRows = collectSyncRows(preview.rows, (input) => buildRoleAssignmentSyncKey(input));
    const allPerson = listPersonDetailed();
    const existingRoles = getRoleAssignmentsByPersonIds(allPerson.map((person) => person.id));
    const existingKeys = new Set(
      existingRoles.map((role) => {
        const record = role as Record<string, unknown>;

        return [
          role.personId,
          role.title,
          role.polityId ?? "",
          role.dynastyId ?? "",
          (record.fromCalendarEra as string | null) ?? (record.timeCalendarEra as string | null) ?? "",
          (record.fromYear as number | null) ?? (record.timeStartYear as number | null) ?? "",
          (record.toYear as number | null) ?? (record.timeEndYear as number | null) ?? ""
        ].join(":");
      })
    );

    const desiredKeys = new Set(syncRows.map((row) => row.key));
    const grouped = new Map<number, RoleAssignmentInput[]>();

    for (const row of syncRows) {
      const list = grouped.get(row.input.personId) ?? [];
      list.push(row.input.role);
      grouped.set(row.input.personId, list);
    }

    for (const person of allPerson) {
      replaceRoleAssignmentsOnPerson(person.id, grouped.get(person.id) ?? []);
    }

    return buildSyncCounts(existingKeys, desiredKeys);
  })();

  return { kind: "role-assignment", ...result };
}

export function applyEventRelationCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewEventRelationCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() => {
    const syncRows = collectSyncRows(preview.rows, buildEventRelationSyncKey);
    const allEvents = listEvents();
    const existingRelations = getEventRelationsByEventIds(allEvents.map((event) => event.id));
    const existingKeys = new Set(existingRelations.map((relation) => `${relation.fromEventId}:${relation.toEventId}:${relation.relationType}`));
    const desiredKeys = new Set(syncRows.map((row) => row.key));
    const grouped = new Map<number, Array<{ toEventId: number; relationType: "before" | "after" | "cause" | "related" }>>();

    for (const row of syncRows) {
      const list = grouped.get(row.input.fromEventId) ?? [];
      list.push(row.input.relation);
      grouped.set(row.input.fromEventId, list);
    }

    for (const event of allEvents) {
      replaceEventRelationsOnEvent(event.id, grouped.get(event.id) ?? []);
    }

    return buildSyncCounts(existingKeys, desiredKeys);
  })();

  return { kind: "event-relation", ...result };
}

export function applyConflictParticipantCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewConflictParticipantCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() => {
    const syncRows = collectSyncRows(preview.rows, buildConflictParticipantSyncKey);
    const conflictEvents = listEvents().filter((event) => isConflictEventType(event.eventType));
    const existingParticipants = getConflictParticipantsByEventIds(conflictEvents.map((event) => event.id));
    const existingKeys = new Set(
      existingParticipants.map(
        (participant) =>
          `${participant.eventId}:${participant.participantType}:${participant.participantId}:${participant.role}`
      )
    );
    const desiredKeys = new Set(syncRows.map((row) => row.key));
    const grouped = new Map<number, ConflictParticipantCsvInput["participant"][]>();

    for (const row of syncRows) {
      const list = grouped.get(row.input.eventId) ?? [];
      list.push(row.input.participant);
      grouped.set(row.input.eventId, list);
    }

    for (const event of conflictEvents) {
      replaceConflictParticipantsOnEvent(event.id, grouped.get(event.id) ?? []);
    }

    return buildSyncCounts(existingKeys, desiredKeys);
  })();

  return { kind: "conflict-participant", ...result };
}

export function applyConflictOutcomeCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewConflictOutcomeCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() => {
    const syncRows = collectSyncRows(preview.rows, (input) => String(input.eventId));
    const conflictEvents = listEvents().filter((event) => isConflictEventType(event.eventType));
    const existingOutcomes = getConflictOutcomesByEventIds(conflictEvents.map((event) => event.id));
    const existingKeys = new Set(existingOutcomes.map((outcome) => String(outcome.eventId)));
    const desiredKeys = new Set(syncRows.map((row) => row.key));
    const desiredByEventId = new Map(syncRows.map((row) => [row.input.eventId, row.input.outcome]));

    for (const event of conflictEvents) {
      replaceConflictOutcomeOnEvent(event.id, desiredByEventId.get(event.id) ?? null);
    }

    return buildSyncCounts(existingKeys, desiredKeys);
  })();

  return { kind: "conflict-outcome", ...result };
}

export function applyRegionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewRegionCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listRegions(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createRegionFromInput,
      updateItem: updateRegionFromInput,
      deleteItem: deleteRegionById
    })
  )();

  return { kind: "region", ...result };
}

export function applyPeriodCategoryCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPeriodCategoryCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listPeriodCategories(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createPeriodCategoryFromInput,
      updateItem: updatePeriodCategoryFromInput,
      deleteItem: deletePeriodCategoryById
    })
  )();

  return { kind: "period-category", ...result };
}

export function applyPolityCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPolityCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listPolities(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createPolityFromInput,
      updateItem: updatePolityFromInput,
      deleteItem: removePolity
    })
  )();

  return { kind: "polity", ...result };
}

export function applyReligionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewReligionCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listReligions(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createReligionFromInput,
      updateItem: updateReligionFromInput,
      deleteItem: removeReligion
    })
  )();

  return { kind: "religion", ...result };
}

export function applyDynastyCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewDynastyCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listDynasties(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createDynastyFromInput,
      updateItem: updateDynastyFromInput,
      deleteItem: removeDynasty
    })
  )();

  return { kind: "dynasty", ...result };
}

export function applyHistoricalPeriodCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewHistoricalPeriodCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listHistoricalPeriods(),
      getExistingKey: (item) => `${item.categoryId}:${item.name}`,
      getInputKey: (input) => `${input.categoryId}:${input.name}`,
      createItem: createHistoricalPeriodFromInput,
      updateItem: updateHistoricalPeriodFromInput,
      deleteItem: removeHistoricalPeriod
    })
  )();

  return { kind: "historical-period", ...result };
}

export function applySectCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewSectCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listSects(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createSectFromInput,
      updateItem: updateSectFromInput,
      deleteItem: removeSect
    })
  )();

  return { kind: "sect", ...result };
}

export function applyTagCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewTagCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listTags(),
      getExistingKey: (item) => item.name,
      getInputKey: (input) => input.name,
      createItem: createTagFromInput,
      updateItem: updateTagFromInput,
      deleteItem: deleteTagById
    })
  )();

  return { kind: "tag", ...result };
}

export function previewSourceCsvImport(rawCsv: string): CsvPreviewResult<SourceCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_SOURCE_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !SOURCE_HEADERS.includes(header as (typeof SOURCE_HEADERS)[number]));
  const sources = listSources();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      title: cells.title.trim(),
      author: normalizeOptionalString(cells.author) ?? undefined,
      publisher: normalizeOptionalString(cells.publisher) ?? undefined,
      publishedAtLabel: normalizeOptionalString(cells.published_at_label) ?? undefined,
      url: normalizeOptionalString(cells.url) ?? undefined,
      note: normalizeOptionalString(cells.note) ?? undefined
    };
    const parsedInput = sourceSchema.safeParse(inputCandidate);
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
      ? sources
          .filter((item) => item.title === previewInput.title)
          .map((item) => ({
            id: item.id,
            label: item.title,
            reason: "同名の出典が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: inputCandidate.title || `row-${row.rowNumber}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<SourceCsvInput>;
  });

  return { kind: "source", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewCitationCsvImport(rawCsv: string): CsvPreviewResult<CitationCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_CITATION_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !CITATION_HEADERS.includes(header as (typeof CITATION_HEADERS)[number]));
  const sources = new Map(listSources().map((item) => [item.title, item.id]));
  const citations = listCitations();
  const targetMaps = {
    event: new Map(listEvents().map((item) => [item.title, item.id])),
    person: new Map(listPersonDetailed().map((item) => [item.name, item.id])),
    polity: new Map(listPolities().map((item) => [item.name, item.id])),
    historical_period: new Map(listHistoricalPeriods().map((item) => [item.name, item.id])),
    religion: new Map(listReligions().map((item) => [item.name, item.id]))
  } satisfies Record<CitationInput["targetType"], Map<string, number>>;

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const sourceId = resolveNamedEntity("source", cells.source, sources, issues);
    const targetType = normalizeOptionalString(cells.target_type);
    if (!targetType) {
      issues.push({ field: "target_type", message: "必須です" });
    } else if (!["event", "person", "polity", "historical_period", "religion"].includes(targetType)) {
      issues.push({ field: "target_type", message: "event / person / polity / historical_period / religion のいずれかを指定してください" });
    }
    const targetId =
      targetType && ["event", "person", "polity", "historical_period", "religion"].includes(targetType)
        ? resolveNamedEntity("target_name", cells.target_name, targetMaps[targetType as CitationInput["targetType"]], issues)
        : null;
    const inputCandidate = {
      sourceId,
      targetType: targetType as CitationInput["targetType"],
      targetId,
      locator: normalizeOptionalString(cells.locator) ?? undefined,
      quote: normalizeOptionalString(cells.quote) ?? undefined,
      note: normalizeOptionalString(cells.note) ?? undefined
    };
    const parsedInput = citationSchema.safeParse(inputCandidate);
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
      ? citations
          .filter((item) =>
            item.sourceId === previewInput.sourceId &&
            item.targetType === previewInput.targetType &&
            item.targetId === previewInput.targetId &&
            (item.locator ?? "") === (previewInput.locator ?? "")
          )
          .map((item) => ({
            id: item.id,
            label: `${cells.source} -> ${cells.target_name}`,
            reason: "同一の引用が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: `${cells.source || "?"} -> ${cells.target_name || "?"}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<CitationCsvInput>;
  });

  return { kind: "citation", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewPolityTransitionCsvImport(rawCsv: string): CsvPreviewResult<PolityTransitionCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_POLITY_TRANSITION_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !POLITY_TRANSITION_HEADERS.includes(header as (typeof POLITY_TRANSITION_HEADERS)[number]));
  const references = buildReferenceMaps();
  const transitions = listPolityTransitions();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      predecessorPolityId: resolveSingleReference("polities", cells.predecessor_polity, references.polities, issues),
      successorPolityId: resolveSingleReference("polities", cells.successor_polity, references.polities, issues),
      transitionType: cells.transition_type.trim()
    };
    const parsedInput = polityTransitionSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }
    if (parsedInput.success && parsedInput.data.predecessorPolityId === parsedInput.data.successorPolityId) {
      issues.push({ field: "successor_polity", message: "同一国家同士の遷移は登録できません" });
    }
    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? transitions
          .filter((item) =>
            item.predecessorPolityId === previewInput.predecessorPolityId &&
            item.successorPolityId === previewInput.successorPolityId &&
            item.transitionType === previewInput.transitionType
          )
          .map((item) => ({
            id: item.id,
            label: `${cells.predecessor_polity} -> ${cells.successor_polity}`,
            reason: "同一の国家遷移が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: `${cells.predecessor_polity || "?"} -> ${cells.successor_polity || "?"}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<PolityTransitionCsvInput>;
  });

  return { kind: "polity-transition", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewDynastySuccessionCsvImport(rawCsv: string): CsvPreviewResult<DynastySuccessionCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_DYNASTY_SUCCESSION_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !DYNASTY_SUCCESSION_HEADERS.includes(header as (typeof DYNASTY_SUCCESSION_HEADERS)[number]));
  const references = buildReferenceMaps();
  const successions = listDynastySuccessions();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      polityId: resolveSingleReference("polities", cells.polity, references.polities, issues),
      predecessorDynastyId: resolveSingleReference("dynasties", cells.predecessor_dynasty, references.dynasties, issues),
      successorDynastyId: resolveSingleReference("dynasties", cells.successor_dynasty, references.dynasties, issues)
    };
    const parsedInput = dynastySuccessionSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }
    if (parsedInput.success && parsedInput.data.predecessorDynastyId === parsedInput.data.successorDynastyId) {
      issues.push({ field: "successor_dynasty", message: "同一王朝同士の継承は登録できません" });
    }
    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? successions
          .filter((item) =>
            item.polityId === previewInput.polityId &&
            item.predecessorDynastyId === previewInput.predecessorDynastyId &&
            item.successorDynastyId === previewInput.successorDynastyId
          )
          .map((item) => ({
            id: item.id,
            label: `${cells.predecessor_dynasty} -> ${cells.successor_dynasty}`,
            reason: "同一の王朝継承が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: `${cells.predecessor_dynasty || "?"} -> ${cells.successor_dynasty || "?"}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<DynastySuccessionCsvInput>;
  });

  return { kind: "dynasty-succession", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewRegionRelationCsvImport(rawCsv: string): CsvPreviewResult<RegionRelationCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_REGION_RELATION_HEADERS);
  const unknownHeaders = parsed.headers.filter((header) => !REGION_RELATION_HEADERS.includes(header as (typeof REGION_RELATION_HEADERS)[number]));
  const references = buildReferenceMaps();
  const relations = listRegionRelations();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      fromRegionId: resolveSingleReference("regions", cells.from_region, references.regions, issues),
      toRegionId: resolveSingleReference("regions", cells.to_region, references.regions, issues),
      relationType: cells.relation_type.trim(),
      note: normalizeOptionalString(cells.note) ?? undefined
    };
    const parsedInput = regionRelationSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }
    if (parsedInput.success && parsedInput.data.fromRegionId === parsedInput.data.toRegionId) {
      issues.push({ field: "to_region", message: "同一地域同士の関係は登録できません" });
    }
    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? relations
          .filter((item) =>
            item.fromRegionId === previewInput.fromRegionId &&
            item.toRegionId === previewInput.toRegionId &&
            item.relationType === previewInput.relationType
          )
          .map((item) => ({
            id: item.id,
            label: `${cells.from_region} -> ${cells.to_region}`,
            reason: "同一の地域関係が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: `${cells.from_region || "?"} -> ${cells.to_region || "?"}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<RegionRelationCsvInput>;
  });

  return { kind: "region-relation", headers: parsed.headers, unknownHeaders, summary: summarizeRows(rows), rows };
}

export function previewHistoricalPeriodRelationCsvImport(rawCsv: string): CsvPreviewResult<HistoricalPeriodRelationCsvInput> {
  const parsed = parseCsv(rawCsv);
  validateRequiredHeaders(parsed.headers, REQUIRED_HISTORICAL_PERIOD_RELATION_HEADERS);
  const unknownHeaders = parsed.headers.filter(
    (header) => !HISTORICAL_PERIOD_RELATION_HEADERS.includes(header as (typeof HISTORICAL_PERIOD_RELATION_HEADERS)[number])
  );
  const references = buildReferenceMaps();
  const relations = listHistoricalPeriodRelations();

  const rows = parsed.rows.map((row) => {
    const issues: CsvPreviewIssue[] = [];
    const warnings: CsvPreviewIssue[] = [];
    const cells = mapRowToCells(parsed.headers, row.values);
    const inputCandidate = {
      fromPeriodId: resolveSingleReference("periods", cells.from_period, references.periods, issues),
      toPeriodId: resolveSingleReference("periods", cells.to_period, references.periods, issues),
      relationType: cells.relation_type.trim(),
      note: normalizeOptionalString(cells.note) ?? undefined
    };
    const parsedInput = historicalPeriodRelationSchema.safeParse(inputCandidate);
    if (!parsedInput.success) {
      for (const issue of parsedInput.error.issues) {
        issues.push({ field: issue.path.join(".") || "_row", message: issue.message });
      }
    }
    if (parsedInput.success && parsedInput.data.fromPeriodId === parsedInput.data.toPeriodId) {
      issues.push({ field: "to_period", message: "同一時代区分同士の関係は登録できません" });
    }
    if (unknownHeaders.length > 0) {
      warnings.push({ field: "_header", message: `未対応列は無視されます: ${unknownHeaders.join(", ")}` });
    }
    const previewInput = issues.length === 0 && parsedInput.success ? parsedInput.data : undefined;
    const duplicateCandidates = previewInput
      ? relations
          .filter((item) =>
            item.fromPeriodId === previewInput.fromPeriodId &&
            item.toPeriodId === previewInput.toPeriodId &&
            item.relationType === previewInput.relationType
          )
          .map((item) => ({
            id: item.id,
            label: `${cells.from_period} -> ${cells.to_period}`,
            reason: "同一の時代区分関係が登録済みです"
          }))
      : [];
    const status = issues.length > 0 ? "error" : duplicateCandidates.length > 0 ? "duplicate-candidate" : "ok";
    return { rowNumber: row.rowNumber, label: `${cells.from_period || "?"} -> ${cells.to_period || "?"}`, status, issues, warnings, duplicateCandidates, input: previewInput } satisfies CsvPreviewRow<HistoricalPeriodRelationCsvInput>;
  });

  return {
    kind: "historical-period-relation",
    headers: parsed.headers,
    unknownHeaders,
    summary: summarizeRows(rows),
    rows
  };
}

export function applySourceCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewSourceCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncNamedRows({
      rows: preview.rows,
      existingItems: listSources(),
      getExistingKey: (item) => item.title,
      getInputKey: (input) => input.title,
      createItem: createSourceFromInput,
      updateItem: updateSourceFromInput,
      deleteItem: removeSource
    })
  )();

  return { kind: "source", ...result };
}

export function applyCitationCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewCitationCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncCompositeRows({
      rows: preview.rows,
      existingItems: listCitations(),
      getExistingKey: buildCitationSyncKey,
      getInputKey: buildCitationSyncKey,
      createItem: createCitationFromInput,
      updateItem: updateCitationFromInput,
      deleteItem: removeCitation
    })
  )();

  return { kind: "citation", ...result };
}

export function applyPolityTransitionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewPolityTransitionCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncCompositeRows({
      rows: preview.rows,
      existingItems: listPolityTransitions(),
      getExistingKey: buildPolityTransitionSyncKey,
      getInputKey: buildPolityTransitionSyncKey,
      createItem: createPolityTransitionFromInput,
      updateItem: updatePolityTransitionFromInput,
      deleteItem: deletePolityTransitionById
    })
  )();

  return { kind: "polity-transition", ...result };
}

export function applyDynastySuccessionCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewDynastySuccessionCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncCompositeRows({
      rows: preview.rows,
      existingItems: listDynastySuccessions(),
      getExistingKey: buildDynastySuccessionSyncKey,
      getInputKey: buildDynastySuccessionSyncKey,
      createItem: createDynastySuccessionFromInput,
      updateItem: updateDynastySuccessionFromInput,
      deleteItem: deleteDynastySuccessionById
    })
  )();

  return { kind: "dynasty-succession", ...result };
}

export function applyRegionRelationCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewRegionRelationCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncCompositeRows({
      rows: preview.rows,
      existingItems: listRegionRelations(),
      getExistingKey: buildRegionRelationSyncKey,
      getInputKey: buildRegionRelationSyncKey,
      createItem: createRegionRelationFromInput,
      updateItem: updateRegionRelationFromInput,
      deleteItem: deleteRegionRelationById
    })
  )();

  return { kind: "region-relation", ...result };
}

export function applyHistoricalPeriodRelationCsvImport(rawCsv: string): CsvImportResult {
  const preview = previewHistoricalPeriodRelationCsvImport(rawCsv);
  assertSyncableRows(preview.rows);

  const result = sqlite.transaction(() =>
    syncCompositeRows({
      rows: preview.rows,
      existingItems: listHistoricalPeriodRelations(),
      getExistingKey: buildHistoricalPeriodRelationSyncKey,
      getInputKey: buildHistoricalPeriodRelationSyncKey,
      createItem: createHistoricalPeriodRelationFromInput,
      updateItem: updateHistoricalPeriodRelationFromInput,
      deleteItem: deleteHistoricalPeriodRelationById
    })
  )();

  return { kind: "historical-period-relation", ...result };
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

function getSyncBlockingRows<TInput>(rows: CsvPreviewRow<TInput>[]) {
  return rows.filter((row) => row.status === "error" || (row.status === "duplicate-candidate" && row.duplicateCandidates.length !== 1));
}

function getSingleMergeCandidateId<TInput>(row: CsvPreviewRow<TInput>) {
  return row.status === "duplicate-candidate" && row.duplicateCandidates.length === 1 ? row.duplicateCandidates[0]?.id ?? null : null;
}

function assertSyncableRows<TInput>(rows: CsvPreviewRow<TInput>[]) {
  const blockingRows = getSyncBlockingRows(rows);
  if (blockingRows.length > 0) {
    throw new Error("error または複数候補の duplicate-candidate を含むため import を実行できません");
  }
}

function collectSyncRows<TInput>(rows: CsvPreviewRow<TInput>[], getKey: (input: TInput) => string) {
  const seen = new Map<string, number>();

  return rows
    .filter((row): row is CsvPreviewRow<TInput> & { input: TInput } => Boolean(row.input))
    .map((row) => {
      const key = getKey(row.input);
      const previous = seen.get(key);
      if (previous) {
        throw new Error(`CSV 内で同じ同期キーが重複しています: ${row.label} (row ${previous} / ${row.rowNumber})`);
      }

      seen.set(key, row.rowNumber);
      return {
        row,
        input: row.input,
        key,
        updateId: getSingleMergeCandidateId(row)
      };
    });
}

function syncNamedRows<TInput, TExisting extends { id: number }>(args: {
  rows: CsvPreviewRow<TInput>[];
  existingItems: TExisting[];
  getExistingKey: (item: TExisting) => string;
  getInputKey: (input: TInput) => string;
  createItem: (input: TInput) => number | void;
  updateItem: (id: number, input: TInput) => void;
  deleteItem: (id: number) => void;
}) {
  const syncRows = collectSyncRows(args.rows, args.getInputKey);
  const existingByKey = new Map<string, TExisting[]>();

  for (const item of args.existingItems) {
    const key = args.getExistingKey(item);
    const current = existingByKey.get(key) ?? [];
    current.push(item);
    existingByKey.set(key, current);
  }

  const desiredKeys = new Set<string>();
  let insertedCount = 0;
  let updatedCount = 0;

  for (const row of syncRows) {
    desiredKeys.add(row.key);
    const exactMatches = existingByKey.get(row.key) ?? [];
    const updateId = row.updateId ?? (exactMatches.length === 1 ? exactMatches[0]?.id ?? null : null);

    if (updateId !== null) {
      args.updateItem(updateId, row.input);
      updatedCount += 1;
      continue;
    }

    if (exactMatches.length > 1) {
      throw new Error(`既存データに同じ同期キーが複数あります: ${row.key}`);
    }

    args.createItem(row.input);
    insertedCount += 1;
  }

  let deletedCount = 0;
  for (const item of args.existingItems) {
    if (!desiredKeys.has(args.getExistingKey(item))) {
      args.deleteItem(item.id);
      deletedCount += 1;
    }
  }

  return { insertedCount, updatedCount, deletedCount };
}

function syncCompositeRows<TInput, TExisting extends { id: number }>(args: {
  rows: CsvPreviewRow<TInput>[];
  existingItems: TExisting[];
  getExistingKey: (item: TExisting) => string;
  getInputKey: (input: TInput) => string;
  createItem: (input: TInput) => number | void;
  updateItem: (id: number, input: TInput) => void;
  deleteItem: (id: number) => void;
}) {
  return syncNamedRows(args);
}

function buildSyncCounts(existingKeys: Set<string>, desiredKeys: Set<string>) {
  let insertedCount = 0;
  let updatedCount = 0;
  let deletedCount = 0;

  for (const key of desiredKeys) {
    if (existingKeys.has(key)) {
      updatedCount += 1;
    } else {
      insertedCount += 1;
    }
  }

  for (const key of existingKeys) {
    if (!desiredKeys.has(key)) {
      deletedCount += 1;
    }
  }

  return { insertedCount, updatedCount, deletedCount };
}

function buildRoleAssignmentSyncKey(input: RoleAssignmentCsvInput) {
  return [
    input.personId,
    input.role.title,
    input.role.polityId ?? "",
    input.role.dynastyId ?? "",
    input.role.fromTimeExpression?.calendarEra ?? "",
    input.role.fromTimeExpression?.startYear ?? "",
    input.role.toTimeExpression?.calendarEra ?? "",
    input.role.toTimeExpression?.startYear ?? ""
  ].join(":");
}

function buildEventRelationSyncKey(input: EventRelationCsvInput) {
  return `${input.fromEventId}:${input.relation.toEventId}:${input.relation.relationType}`;
}

function buildConflictParticipantSyncKey(input: ConflictParticipantCsvInput) {
  return `${input.eventId}:${input.participant.participantType}:${input.participant.participantId}:${input.participant.role}`;
}

function buildCitationSyncKey(input: CitationCsvInput | { sourceId: number; targetType: string; targetId: number; locator: string | null }) {
  return `${input.sourceId}:${input.targetType}:${input.targetId}:${input.locator ?? ""}`;
}

function buildPolityTransitionSyncKey(
  input: PolityTransitionCsvInput | { predecessorPolityId: number; successorPolityId: number; transitionType: string }
) {
  return `${input.predecessorPolityId}:${input.successorPolityId}:${input.transitionType}`;
}

function buildDynastySuccessionSyncKey(
  input: DynastySuccessionCsvInput | { polityId: number; predecessorDynastyId: number; successorDynastyId: number }
) {
  return `${input.polityId}:${input.predecessorDynastyId}:${input.successorDynastyId}`;
}

function buildRegionRelationSyncKey(
  input: RegionRelationCsvInput | { fromRegionId: number; toRegionId: number; relationType: string }
) {
  return `${input.fromRegionId}:${input.toRegionId}:${input.relationType}`;
}

function buildHistoricalPeriodRelationSyncKey(
  input: HistoricalPeriodRelationCsvInput | { fromPeriodId: number; toPeriodId: number; relationType: string }
) {
  return `${input.fromPeriodId}:${input.toPeriodId}:${input.relationType}`;
}

function buildReferenceMaps(): ReferenceMaps {
  return {
    person: new Map(listPersonDetailed().map((item) => [item.name, item.id])),
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
  issues: CsvPreviewIssue[],
  allowEndYear = true
): TimeExpressionInput | undefined {
  const label = normalizeOptionalString(cells[`${prefix}_label`]);
  const calendarEraRaw = normalizeOptionalString(cells[`${prefix}_calendar_era`]);
  const startYear = parseOptionalInteger(cells[`${prefix}_start_year`], `${prefix}_start_year`, issues);
  const endYear = allowEndYear
    ? parseOptionalInteger(cells[`${prefix}_end_year`], `${prefix}_end_year`, issues)
    : undefined;
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

  if (allowEndYear && startYear === undefined && endYear !== undefined) {
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

function parsePersonTimeExpressionFromCsv(
  cells: Record<string, string>,
  prefix: "from" | "to",
  issues: CsvPreviewIssue[]
): TimeExpressionInput | undefined {
  const label = normalizeOptionalString(cells[`${prefix}_label`]);
  const calendarEraRaw = normalizeOptionalString(cells[`${prefix}_calendar_era`]);
  const startYear = parseOptionalInteger(cells[`${prefix}_year`], `${prefix}_year`, issues);
  const isApproximate = parseOptionalBoolean(cells[`${prefix}_is_approximate`], `${prefix}_is_approximate`, issues);

  if (!label && !calendarEraRaw && startYear === undefined && isApproximate === undefined) {
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

  return {
    calendarEra,
    startYear,
    isApproximate: isApproximate ?? false,
    precision: "year",
    displayLabel: label ?? ""
  };
}

function toBoundaryTimeExpressions(timeExpression: TimeExpressionInput | undefined) {
  return {
    fromTimeExpression: timeExpression
      ? {
          calendarEra: timeExpression.calendarEra,
          startYear: timeExpression.startYear,
          isApproximate: timeExpression.isApproximate,
          precision: "year",
          displayLabel: ""
        }
      : undefined,
    toTimeExpression:
      timeExpression && timeExpression.endYear !== undefined
        ? {
            calendarEra: timeExpression.calendarEra,
            startYear: timeExpression.endYear,
            isApproximate: timeExpression.isApproximate,
            precision: "year",
            displayLabel: ""
          }
        : undefined
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
        message: formatUnknownReferenceMessage(name, map)
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
      message: formatUnknownReferenceMessage(normalized, map)
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
      message: formatUnknownReferenceMessage(normalized, map)
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
      message: formatUnknownReferenceMessage(normalized, map)
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
  const importedYear = input.fromTimeExpression?.startYear;

  return existingEvents
    .filter((event) => {
      if (event.title !== input.title) {
        return false;
      }

      const existingYear = event.fromYear ?? null;
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
        importedYear !== undefined && event.fromYear !== null
          ? "タイトルと年代が近接しています"
          : "タイトルが一致しています"
    }));
}

function findPersonDuplicateCandidates(existingPerson: ReturnType<typeof listPersonDetailed>, input: PersonInput): CsvDuplicateCandidate[] {
  const birthYear = input.birthTimeExpression?.startYear;
  const deathYear = input.deathTimeExpression?.startYear;

  return existingPerson
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

      const existingBirthYear = typeof personRecord.fromYear === "number" ? personRecord.fromYear : null;
      const existingDeathYear = typeof personRecord.toYear === "number" ? personRecord.toYear : null;
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

      const existingStartYear =
        typeof roleRecord.fromYear === "number"
          ? roleRecord.fromYear
          : typeof roleRecord.timeStartYear === "number"
            ? roleRecord.timeStartYear
            : null;
      if (existingStartYear !== (input.role.fromTimeExpression?.startYear ?? null)) {
        return false;
      }

      const existingEndYear =
        typeof roleRecord.toYear === "number"
          ? roleRecord.toYear
          : typeof roleRecord.timeEndYear === "number"
            ? roleRecord.timeEndYear
            : null;
      if (existingEndYear !== (input.role.toTimeExpression?.startYear ?? null)) {
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
    person: new Map(listPersonDetailed().map((item) => [item.name, item.id])),
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

function formatUnknownReferenceMessage(name: string, map: Map<string, number>) {
  const suggestions = findReferenceSuggestions(name, Array.from(map.keys()));
  return suggestions.length > 0
    ? `未登録の参照名です: ${name} / 候補: ${suggestions.join(", ")}`
    : `未登録の参照名です: ${name}`;
}

function findReferenceSuggestions(name: string, candidates: string[]) {
  const normalized = normalizeSearchText(name);
  if (normalized.length === 0) {
    return [];
  }

  const ranked = candidates
    .map((candidate) => {
      const current = normalizeSearchText(candidate);
      const score =
        current === normalized
          ? 100
          : current.includes(normalized) || normalized.includes(current)
            ? 80
            : current.startsWith(normalized) || normalized.startsWith(current)
              ? 70
              : sharedCharacterScore(normalized, current);
      return { candidate, score };
    })
    .filter((item) => item.score >= 2)
    .sort((a, b) => b.score - a.score || a.candidate.localeCompare(b.candidate, "ja-JP"))
    .slice(0, 5);

  return ranked.map((item) => item.candidate);
}

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase("ja-JP").replace(/\s+/g, "");
}

function sharedCharacterScore(left: string, right: string) {
  const chars = new Set(left);
  let score = 0;
  for (const char of right) {
    if (chars.has(char)) {
      score += 1;
    }
  }
  return score;
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
