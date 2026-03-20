"use client";

import { useActionState } from "react";
import { importEventCsvAction } from "@/features/csv-import/actions";

const initialState: Awaited<ReturnType<typeof importEventCsvAction>> = {};

export function CsvImportPanel() {
  const [state, action, pending] = useActionState(importEventCsvAction, initialState);

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
      <h2 className="text-lg font-semibold">CSV import</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        `Sprint 2` では `Event CSV` を対象に preview/import を行います。まず preview し、`error` と
        `duplicate-candidate` がないことを確認してから import します。
      </p>

      <form action={action} className="mt-6 space-y-4">
        <label className="grid gap-2 text-sm">
          <span>Payload</span>
          <textarea
            name="payload"
            rows={14}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs"
            placeholder={"title,event_type,time_start_year,people,polities\n平安京遷都,general,794,桓武天皇,日本"}
            required
          />
        </label>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            name="intent"
            value="preview"
            className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            disabled={pending}
          >
            preview
          </button>
          <button
            type="submit"
            name="intent"
            value="import"
            className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white"
            disabled={pending}
          >
            import
          </button>
        </div>
      </form>

      {state.error ? <p className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</p> : null}

      {state.preview ? (
        <div className="mt-6 space-y-5 rounded-3xl border border-[var(--border)] p-5">
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span>rows: {state.preview.summary.totalRows}</span>
            <span>ok: {state.preview.summary.okCount}</span>
            <span>duplicates: {state.preview.summary.duplicateCandidateCount}</span>
            <span>errors: {state.preview.summary.errorCount}</span>
            <span>warnings: {state.preview.summary.warningCount}</span>
          </div>

          {state.preview.unknownHeaders.length > 0 ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              未対応列は無視されます: {state.preview.unknownHeaders.join(", ")}
            </p>
          ) : null}

          <div className="space-y-3">
            {state.preview.rows.map((row) => (
              <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold">row {row.rowNumber}</span>
                  <span className="text-sm">{row.label}</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      row.status === "ok"
                        ? "bg-emerald-100 text-emerald-800"
                        : row.status === "duplicate-candidate"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </div>

                {row.issues.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {row.issues.map((issue, index) => (
                      <p key={`${row.rowNumber}-issue-${index}`} className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        <span className="font-medium">{issue.field}</span>: {issue.message}
                      </p>
                    ))}
                  </div>
                ) : null}

                {row.duplicateCandidates.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {row.duplicateCandidates.map((candidate) => (
                      <p
                        key={`${row.rowNumber}-duplicate-${candidate.id}`}
                        className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                      >
                        既存候補 #{candidate.id}: {candidate.label} ({candidate.reason})
                      </p>
                    ))}
                  </div>
                ) : null}

                {row.warnings.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    {row.warnings.map((warning, index) => (
                      <p
                        key={`${row.rowNumber}-warning-${index}`}
                        className="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                      >
                        <span className="font-medium">{warning.field}</span>: {warning.message}
                      </p>
                    ))}
                  </div>
                ) : null}

                {row.input ? (
                  <div className="mt-3 text-xs text-[var(--muted)]">
                    <p>
                      eventType: {row.input.eventType}
                      {row.input.timeExpression?.startYear ? ` / year: ${row.input.timeExpression.startYear}` : ""}
                    </p>
                    <p>
                      links:
                      {" "}
                      people {row.input.personIds.length},
                      {" "}
                      polities {row.input.polityIds.length},
                      {" "}
                      periods {row.input.periodIds.length},
                      {" "}
                      regions {row.input.regionIds.length},
                      {" "}
                      tags {row.input.tags.length}
                    </p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}

      {state.result ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-900">import 完了</h3>
          <p className="mt-2 text-sm text-emerald-900">追加した Event 件数: {state.result.importedCount}</p>
        </div>
      ) : null}
    </div>
  );
}
