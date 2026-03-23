import { z } from "zod";
import { sqlite } from "@/db/client";
import type { CitationTargetType } from "@/server/services/citation-targets";
import { recordChangeHistory } from "@/server/services/history";

const exportSchema = z.object({
  schemaVersion: z.literal("historia-export-v1"),
  exportedAt: z.string(),
  tables: z.record(z.array(z.record(z.string(), z.unknown())))
});

const ID_TABLES = [
  "regions",
  "period_categories",
  "tags",
  "polities",
  "dynasties",
  "persons",
  "role_assignments",
  "historical_periods",
  "religions",
  "sects",
  "polity_transitions",
  "dynasty_successions",
  "region_relations",
  "historical_period_relations",
  "events",
  "event_relations",
  "conflict_participants",
  "conflict_outcomes",
  "conflict_outcome_participants",
  "sources",
  "citations",
  "change_histories"
] as const;

const LINK_TABLES = [
  "event_person_links",
  "event_polity_links",
  "event_dynasty_links",
  "event_period_links",
  "event_religion_links",
  "event_sect_links",
  "event_region_links",
  "event_tag_links",
  "person_region_links",
  "polity_region_links",
  "dynasty_region_links",
  "period_region_links",
  "religion_region_links",
  "sect_region_links",
  "person_religion_links",
  "person_sect_links",
  "person_period_links",
  "religion_founder_links",
  "sect_founder_links"
] as const;

const ALL_TABLES = [...ID_TABLES, ...LINK_TABLES] as const;

type TableName = (typeof ALL_TABLES)[number];

type PreviewCandidate = {
  table: string;
  importId: number | null;
  label: string;
  reason: string;
};

export function buildExportPayload() {
  const tables = Object.fromEntries(
    ALL_TABLES.map((table) => [table, sqlite.prepare(`SELECT * FROM ${table}`).all()])
  );

  return {
    schemaVersion: "historia-export-v1" as const,
    exportedAt: new Date().toISOString(),
    tables
  };
}

export function buildEventsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT id, title, event_type, time_display_label, start_year, end_year, updated_at
       FROM events
       ORDER BY title`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "title", "event_type", "time_display_label", "start_year", "end_year", "updated_at"]);
}

export function buildPersonCsv() {
  const rows = sqlite
    .prepare(
      `SELECT id, name, reading, aliases, birth_display_label, death_display_label
       FROM persons
       ORDER BY name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "name", "reading", "aliases", "birth_display_label", "death_display_label"]);
}

export function previewImportPayload(rawJson: string) {
  const payload = exportSchema.parse(JSON.parse(rawJson));
  const candidates = collectDuplicateCandidates(payload.tables);

  return {
    schemaVersion: payload.schemaVersion,
    exportedAt: payload.exportedAt,
    tableCounts: Object.fromEntries(Object.entries(payload.tables).map(([key, value]) => [key, value.length])),
    duplicateCandidates: candidates,
    duplicateCount: candidates.length
  };
}

export function applyImportPayload(rawJson: string) {
  const payload = exportSchema.parse(JSON.parse(rawJson));
  const duplicateCandidates = collectDuplicateCandidates(payload.tables);

  const importedCounts = sqlite.transaction(() => {
    const idMaps = new Map<string, Map<number, number>>();
    const counts = new Map<string, number>();

    for (const table of ID_TABLES) {
      idMaps.set(table, new Map<number, number>());
      counts.set(table, 0);
      const rows = payload.tables[table] ?? [];

      for (const row of rows) {
        const importedId = typeof row.id === "number" ? row.id : null;
        const existingId = importedId ? findExistingEntityId(table, row, importedId) : null;

        if (existingId) {
          if (importedId) {
            idMaps.get(table)?.set(importedId, existingId);
          }
          continue;
        }

        const insertedId = insertEntityRow(table, row, idMaps);

        if (importedId && insertedId) {
          idMaps.get(table)?.set(importedId, insertedId);
        }

        counts.set(table, (counts.get(table) ?? 0) + 1);
      }
    }

    for (const table of LINK_TABLES) {
      counts.set(table, 0);
      const rows = payload.tables[table] ?? [];

      for (const row of rows) {
        const mappedRow = mapLinkRow(table, row, idMaps);
        if (!mappedRow || linkExists(table, mappedRow)) {
          continue;
        }

        insertRow(table, mappedRow);
        counts.set(table, (counts.get(table) ?? 0) + 1);
      }
    }

    maybeRecordImportedHistories(payload.tables.change_histories ?? [], idMaps);

    return Object.fromEntries(counts);
  })();

  return {
    importedCounts,
    duplicateCandidates,
    duplicateCount: duplicateCandidates.length
  };
}

function collectDuplicateCandidates(tables: Record<string, Array<Record<string, unknown>>>) {
  const candidates: PreviewCandidate[] = [];

  for (const table of ID_TABLES) {
    const rows = tables[table] ?? [];

    for (const row of rows) {
      const importedId = typeof row.id === "number" ? row.id : null;
      const existing = findDuplicateEntity(table, row, importedId);
      if (!existing) {
        continue;
      }

      candidates.push({
        table,
        importId: importedId,
        label: getRowLabel(row),
        reason: existing.reason
      });
    }
  }

  return candidates.slice(0, 100);
}

function findExistingEntityId(table: string, row: Record<string, unknown>, importedId: number) {
  const duplicate = findDuplicateEntity(table, row, importedId);
  return duplicate?.id ?? null;
}

function findDuplicateEntity(table: string, row: Record<string, unknown>, importedId: number | null) {
  if (importedId !== null) {
    const byId = sqlite.prepare(`SELECT * FROM ${table} WHERE id = ?`).get(importedId) as Record<string, unknown> | undefined;
    if (byId) {
      return { id: importedId, reason: "ID一致" };
    }
  }

  if (typeof row.name === "string") {
    const byName = sqlite.prepare(`SELECT id FROM ${table} WHERE name = ? LIMIT 1`).get(row.name) as { id: number } | undefined;
    if (byName) {
      return { id: byName.id, reason: "名称一致" };
    }
  }

  if (typeof row.title === "string" && table === "events") {
    const byTitle = sqlite
      .prepare("SELECT id FROM events WHERE title = ? AND coalesce(time_start_year, start_year) IS ? LIMIT 1")
      .get(row.title, typeof row.time_start_year === "number" ? row.time_start_year : row.start_year ?? null) as { id: number } | undefined;
    if (byTitle) {
      return { id: byTitle.id, reason: "タイトル + 年代一致" };
    }
  }

  if (typeof row.aliases === "string" && typeof row.name === "string" && hasAliasMatch(table, row.aliases)) {
    const aliasMatch = sqlite
      .prepare(`SELECT id FROM ${table} WHERE aliases LIKE ? LIMIT 1`)
      .get(`%${String(row.name)}%`) as { id: number } | undefined;
    if (aliasMatch) {
      return { id: aliasMatch.id, reason: "別名候補一致" };
    }
  }

  return null;
}

function hasAliasMatch(table: string, aliases: string) {
  if (!["regions", "polities", "dynasties", "persons", "historical_periods", "religions", "sects"].includes(table)) {
    return false;
  }

  return aliases.trim().length > 0;
}

function insertEntityRow(table: TableName, row: Record<string, unknown>, idMaps: Map<string, Map<number, number>>) {
  const prepared = { ...row };

  if (table === "dynasties" && typeof row.polity_id === "number") {
    prepared.polity_id = idMaps.get("polities")?.get(row.polity_id) ?? row.polity_id;
  }

  if (table === "historical_periods") {
    if (typeof row.category_id === "number") {
      prepared.category_id = idMaps.get("period_categories")?.get(row.category_id) ?? row.category_id;
    }
    if (typeof row.polity_id === "number") {
      prepared.polity_id = idMaps.get("polities")?.get(row.polity_id) ?? row.polity_id;
    }
  }

  if (table === "sects" && typeof row.religion_id === "number") {
    prepared.religion_id = idMaps.get("religions")?.get(row.religion_id) ?? row.religion_id;
    if (typeof row.parent_sect_id === "number") {
      prepared.parent_sect_id = idMaps.get("sects")?.get(row.parent_sect_id) ?? row.parent_sect_id;
    }
  }

  if (table === "polity_transitions") {
    if (typeof row.predecessor_polity_id === "number") {
      prepared.predecessor_polity_id = idMaps.get("polities")?.get(row.predecessor_polity_id) ?? row.predecessor_polity_id;
    }
    if (typeof row.successor_polity_id === "number") {
      prepared.successor_polity_id = idMaps.get("polities")?.get(row.successor_polity_id) ?? row.successor_polity_id;
    }
  }

  if (table === "dynasty_successions") {
    if (typeof row.polity_id === "number") {
      prepared.polity_id = idMaps.get("polities")?.get(row.polity_id) ?? row.polity_id;
    }
    if (typeof row.predecessor_dynasty_id === "number") {
      prepared.predecessor_dynasty_id =
        idMaps.get("dynasties")?.get(row.predecessor_dynasty_id) ?? row.predecessor_dynasty_id;
    }
    if (typeof row.successor_dynasty_id === "number") {
      prepared.successor_dynasty_id =
        idMaps.get("dynasties")?.get(row.successor_dynasty_id) ?? row.successor_dynasty_id;
    }
  }

  if (table === "region_relations") {
    if (typeof row.from_region_id === "number") {
      prepared.from_region_id = idMaps.get("regions")?.get(row.from_region_id) ?? row.from_region_id;
    }
    if (typeof row.to_region_id === "number") {
      prepared.to_region_id = idMaps.get("regions")?.get(row.to_region_id) ?? row.to_region_id;
    }
  }

  if (table === "historical_period_relations") {
    if (typeof row.from_period_id === "number") {
      prepared.from_period_id = idMaps.get("historical_periods")?.get(row.from_period_id) ?? row.from_period_id;
    }
    if (typeof row.to_period_id === "number") {
      prepared.to_period_id = idMaps.get("historical_periods")?.get(row.to_period_id) ?? row.to_period_id;
    }
  }

  if (table === "role_assignments") {
    if (typeof row.person_id === "number") {
      prepared.person_id = idMaps.get("persons")?.get(row.person_id) ?? row.person_id;
    }
    if (typeof row.polity_id === "number") {
      prepared.polity_id = idMaps.get("polities")?.get(row.polity_id) ?? row.polity_id;
    }
    if (typeof row.dynasty_id === "number") {
      prepared.dynasty_id = idMaps.get("dynasties")?.get(row.dynasty_id) ?? row.dynasty_id;
    }
  }

  if (table === "event_relations") {
    if (typeof row.from_event_id === "number") {
      prepared.from_event_id = idMaps.get("events")?.get(row.from_event_id) ?? row.from_event_id;
    }
    if (typeof row.to_event_id === "number") {
      prepared.to_event_id = idMaps.get("events")?.get(row.to_event_id) ?? row.to_event_id;
    }
  }

  if (table === "conflict_participants" || table === "conflict_outcomes" || table === "conflict_outcome_participants") {
    if (typeof row.event_id === "number") {
      prepared.event_id = idMaps.get("events")?.get(row.event_id) ?? row.event_id;
    }
  }

  if ((table === "conflict_participants" || table === "conflict_outcome_participants") && typeof row.participant_id === "number") {
    prepared.participant_id = mapParticipantId(String(row.participant_type ?? ""), row.participant_id, idMaps);
  }

  if (table === "sources") {
    if (!prepared.created_at) {
      prepared.created_at = Date.now();
    }
    if (!prepared.updated_at) {
      prepared.updated_at = Date.now();
    }
  }

  if (table === "citations") {
    if (typeof row.source_id === "number") {
      prepared.source_id = idMaps.get("sources")?.get(row.source_id) ?? row.source_id;
    }
    prepared.target_id = mapCitationTargetId(
      String(row.target_type ?? ""),
      typeof row.target_id === "number" ? row.target_id : 0,
      idMaps
    );
    if (!prepared.created_at) {
      prepared.created_at = Date.now();
    }
    if (!prepared.updated_at) {
      prepared.updated_at = Date.now();
    }
  }

  if (table === "change_histories") {
    prepared.target_id = mapHistoryTargetId(
      String(row.target_type ?? ""),
      typeof row.target_id === "number" ? row.target_id : 0,
      idMaps
    );
    if (!prepared.changed_at) {
      prepared.changed_at = Date.now();
    }
  }

  return insertRow(table, prepared);
}

function mapLinkRow(table: string, row: Record<string, unknown>, idMaps: Map<string, Map<number, number>>) {
  const mapped = { ...row };
  const mappings: Record<string, string> = {
    event_person_links: "events:persons",
    event_polity_links: "events:polities",
    event_dynasty_links: "events:dynasties",
    event_period_links: "events:historical_periods",
    event_religion_links: "events:religions",
    event_sect_links: "events:sects",
    event_region_links: "events:regions",
    event_tag_links: "events:tags",
    person_region_links: "persons:regions",
    polity_region_links: "polities:regions",
    dynasty_region_links: "dynasties:regions",
    period_region_links: "historical_periods:regions",
    religion_region_links: "religions:regions",
    sect_region_links: "sects:regions",
    person_religion_links: "persons:religions",
    person_sect_links: "persons:sects",
    person_period_links: "persons:historical_periods",
    religion_founder_links: "religions:persons",
    sect_founder_links: "sects:persons"
  };

  const mapping = mappings[table];
  if (!mapping) {
    return null;
  }

  const [leftTable, rightTable] = mapping.split(":");
  const keys = Object.keys(row);

  if (keys.length !== 2) {
    return null;
  }

  const [leftKey, rightKey] = keys;
  const leftValue = typeof row[leftKey] === "number" ? row[leftKey] : null;
  const rightValue = typeof row[rightKey] === "number" ? row[rightKey] : null;

  if (leftValue === null || rightValue === null) {
    return null;
  }

  mapped[leftKey] = idMaps.get(leftTable)?.get(leftValue) ?? leftValue;
  mapped[rightKey] = idMaps.get(rightTable)?.get(rightValue) ?? rightValue;
  return mapped;
}

function linkExists(table: string, row: Record<string, unknown>) {
  const keys = Object.keys(row);
  const whereClause = keys.map((key) => `${key} = @${key}`).join(" AND ");
  return Boolean(sqlite.prepare(`SELECT 1 FROM ${table} WHERE ${whereClause} LIMIT 1`).get(row));
}

function insertRow(table: string, row: Record<string, unknown>) {
  const columns = Object.keys(row);
  const placeholders = columns.map((column) => `@${column}`).join(", ");
  const result = sqlite.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`).run(row);
  return Number(result.lastInsertRowid || row.id || 0);
}

function maybeRecordImportedHistories(rows: Array<Record<string, unknown>>, idMaps: Map<string, Map<number, number>>) {
  for (const row of rows) {
    if (typeof row.target_type !== "string" || typeof row.target_id !== "number") {
      continue;
    }

    const mappedTargetId = mapHistoryTargetId(row.target_type, row.target_id, idMaps);
    if (!mappedTargetId || !["event", "person", "polity", "historical_period"].includes(row.target_type)) {
      continue;
    }

    recordChangeHistory({
      targetType: row.target_type as "event" | "person" | "polity" | "historical_period",
      targetId: mappedTargetId,
      action: "import",
      snapshot: { importedHistoryId: row.id ?? null }
    });
  }
}

function mapCitationTargetId(targetType: string, targetId: number, idMaps: Map<string, Map<number, number>>) {
  const mapping: Record<CitationTargetType, string> = {
    event: "events",
    person: "persons",
    polity: "polities",
    historical_period: "historical_periods",
    religion: "religions"
  };

  const table = mapping[targetType as CitationTargetType];
  return table ? idMaps.get(table)?.get(targetId) ?? targetId : targetId;
}

function mapHistoryTargetId(targetType: string, targetId: number, idMaps: Map<string, Map<number, number>>) {
  const mapping: Record<string, string> = {
    event: "events",
    person: "persons",
    polity: "polities",
    historical_period: "historical_periods"
  };

  const table = mapping[targetType];
  return table ? idMaps.get(table)?.get(targetId) ?? targetId : targetId;
}

function mapParticipantId(participantType: string, participantId: number, idMaps: Map<string, Map<number, number>>) {
  const mapping: Record<string, string> = {
    person: "persons",
    polity: "polities",
    religion: "religions",
    sect: "sects"
  };

  const table = mapping[participantType];
  return table ? idMaps.get(table)?.get(participantId) ?? participantId : participantId;
}

function getRowLabel(row: Record<string, unknown>) {
  if (typeof row.title === "string") {
    return row.title;
  }
  if (typeof row.name === "string") {
    return row.name;
  }
  return typeof row.id === "number" ? `#${row.id}` : "row";
}

function toCsv(rows: Array<Record<string, unknown>>, columns: string[]) {
  const lines = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((column) => escapeCsvValue(row[column]))
        .join(",")
    )
  ];

  return lines.join("\n");
}

function escapeCsvValue(value: unknown) {
  const stringValue =
    value instanceof Date
      ? value.toISOString()
      : value === null || value === undefined
        ? ""
        : String(value);

  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replaceAll("\"", "\"\"")}"`;
  }

  return stringValue;
}
