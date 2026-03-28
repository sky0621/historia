import { sqlite } from "@/db/client";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord } from "@/lib/time-expression/normalize";

export function buildPeriodCategoriesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT id, name, reading, description
       FROM period_categories
       ORDER BY name`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["id", "name", "reading", "description"]);
}

export function buildHistoricalPeriodsCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         hp.id,
         hp.name,
         (
           SELECT pc.name
           FROM historical_period_category_links hpcl
           JOIN period_categories pc ON pc.id = hpcl.category_id
           WHERE hpcl.period_id = hp.id
           LIMIT 1
         ) AS category,
         (
           SELECT p.name
           FROM historical_period_polity_links hppl
           JOIN polities p ON p.id = hppl.polity_id
           WHERE hppl.period_id = hp.id
           LIMIT 1
         ) AS polity,
         hp.description,
         hp.note,
         hp.from_calendar_era AS time_calendar_era,
         hp.from_year AS time_start_year,
         hp.to_year AS time_end_year,
         CASE
           WHEN coalesce(hp.from_is_approximate, 0) = 1 OR coalesce(hp.to_is_approximate, 0) = 1 THEN 1
           ELSE 0
         END AS time_is_approximate,
         (
           SELECT group_concat(r.name, ', ')
           FROM historical_period_region_links hprl
           JOIN regions r ON r.id = hprl.region_id
           WHERE hprl.period_id = hp.id
         ) AS regions
       FROM historical_periods hp
       ORDER BY hp.name`
    )
    .all() as Array<Record<string, unknown>>;

  const normalizedRows = rows.map((row) => ({
    ...row,
    time_label: formatHistoricalPeriodTime(row)
  }));

  return toCsv(normalizedRows, [
    "id",
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
  ]);
}

export function buildHistoricalPeriodCategoryLinksCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         p.id AS period_id,
         p.name AS period_name
       FROM historical_period_category_links hpcl
       INNER JOIN period_categories c ON hpcl.category_id = c.id
       INNER JOIN historical_periods p ON hpcl.period_id = p.id
       ORDER BY c.id, p.id`
    )
    .all() as Array<Record<string, unknown>>;

  return toCsv(rows, ["category_id", "category_name", "period_id", "period_name"]);
}

export function buildPolitiesCsv() {
  const rows = sqlite
    .prepare(
      `SELECT
         p.id,
         p.name,
         p.note,
         p.from_calendar_era,
         p.from_year,
         p.from_is_approximate,
         p.to_calendar_era,
         p.to_year,
         p.to_is_approximate,
         (
           SELECT group_concat(r.name, ', ')
           FROM polity_region_links prl
           JOIN regions r ON r.id = prl.region_id
           WHERE prl.polity_id = p.id
         ) AS regions
       FROM polities p
       ORDER BY p.name`
    )
    .all() as Array<Record<string, unknown>>;

  const normalizedRows = rows.map((row) => ({
    ...row,
    from_label: formatBoundaryLabel("from", row),
    to_label: formatBoundaryLabel("to", row)
  }));

  return toCsv(normalizedRows, [
    "id",
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
  ]);
}

function formatHistoricalPeriodTime(row: Record<string, unknown>) {
  const expression = fromTimeExpressionRecord({
    calendarEra: (row.time_calendar_era as "BCE" | "CE" | null) ?? "CE",
    startYear: (row.time_start_year as number | null) ?? null,
    endYear: (row.time_end_year as number | null) ?? null,
    isApproximate: Boolean(row.time_is_approximate),
    precision: "year",
    displayLabel: null
  });

  return expression ? formatTimeExpression(expression) : "";
}

function formatBoundaryLabel(prefix: "from" | "to", row: Record<string, unknown>) {
  const calendarEraKey = prefix === "from" ? "from_calendar_era" : "to_calendar_era";
  const yearKey = prefix === "from" ? "from_year" : "to_year";
  const approximateKey = prefix === "from" ? "from_is_approximate" : "to_is_approximate";

  const expression = fromTimeExpressionRecord({
    calendarEra: (row[calendarEraKey] as "BCE" | "CE" | null) ?? "CE",
    startYear: (row[yearKey] as number | null) ?? null,
    endYear: null,
    isApproximate: Boolean(row[approximateKey]),
    precision: "year",
    displayLabel: null
  });

  return expression ? formatTimeExpression(expression) : "";
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
