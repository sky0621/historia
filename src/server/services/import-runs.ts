import { sqlite } from "@/db/client";

type ImportRunRecordInput = {
  sourceFormat: "csv" | "json";
  targetType: string;
  action: "preview" | "import";
  fileName?: string;
  status: "ok" | "error";
  summary: Record<string, unknown>;
};

type ImportRunRow = {
  id: number;
  source_format: string;
  target_type: string;
  action: string;
  file_name: string | null;
  status: string;
  summary_json: string;
};

export function recordImportRun(input: ImportRunRecordInput) {
  ensureImportRunsTable();
  sqlite
    .prepare(
      `INSERT INTO import_runs (source_format, target_type, "action", file_name, status, summary_json)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(
      input.sourceFormat,
      input.targetType,
      input.action,
      input.fileName ?? null,
      input.status,
      JSON.stringify(input.summary)
    );
}

export function getRecentImportRuns(limit = 20) {
  ensureImportRunsTable();
  const rows = sqlite
    .prepare(
      `SELECT id, source_format, target_type, "action", file_name, status, summary_json
       FROM import_runs
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(limit) as ImportRunRow[];

  return rows.map((row) => ({
    id: row.id,
    sourceFormat: row.source_format,
    targetType: row.target_type,
    action: row.action,
    fileName: row.file_name,
    status: row.status,
    summary: safeParseSummary(row.summary_json)
  }));
}

function ensureImportRunsTable() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS import_runs (
      "id" INTEGER PRIMARY KEY AUTOINCREMENT,
      "source_format" TEXT NOT NULL,
      "target_type" TEXT NOT NULL,
      "action" TEXT NOT NULL,
      "file_name" TEXT,
      "status" TEXT NOT NULL,
      "summary_json" TEXT NOT NULL
    )
  `);
}

function safeParseSummary(raw: string) {
  try {
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return { raw };
  }
}
