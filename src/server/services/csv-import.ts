import { eventSchema, type EventInput } from "@/features/events/schema";
import { personSchema, roleAssignmentSchema, type PersonInput, type RoleAssignmentInput } from "@/features/people/schema";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import { sqlite } from "@/db/client";
import { listDynasties } from "@/server/repositories/dynasties";
import { listEvents } from "@/server/repositories/events";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPeopleDetailed } from "@/server/repositories/people-detail";
import { listPolities } from "@/server/repositories/polities";
import { listRegions } from "@/server/repositories/regions";
import { listReligions } from "@/server/repositories/religions";
import { getRoleAssignmentsByPersonIds } from "@/server/repositories/role-assignments";
import { listSects } from "@/server/repositories/sects";
import { createEventFromInput } from "@/server/services/events";
import { appendRoleAssignmentsToPerson, createPersonFromInput } from "@/server/services/people";

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
const MULTI_VALUE_SEPARATOR = "|";

type CsvPreviewStatus = "ok" | "duplicate-candidate" | "error";
type CsvImportKind = "event" | "person" | "role-assignment";

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
