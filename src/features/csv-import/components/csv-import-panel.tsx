"use client";

import { useActionState } from "react";
import { importCsvAction } from "@/features/csv-import/actions";
import type { EventInput } from "@/features/events/schema";
import type { PersonInput } from "@/features/people/schema";
import type {
  CsvPreviewResult,
  CsvPreviewRow,
  EventRelationCsvInput,
  RoleAssignmentCsvInput
} from "@/server/services/csv-import";

const initialState: Awaited<ReturnType<typeof importCsvAction>> = {
  targetType: "event"
};

export function CsvImportPanel() {
  const [state, action, pending] = useActionState(importCsvAction, initialState);
  const targetType = state.targetType ?? "event";

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
      <h2 className="text-lg font-semibold">CSV import</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        `Sprint 6` では `Event / Person / RoleAssignment / EventRelation CSV` を preview/import できます。まず
        preview し、`error` と `duplicate-candidate` がないことを確認してから import します。
      </p>

      <form action={action} className="mt-6 space-y-4">
        <fieldset className="space-y-2">
          <legend className="text-sm">Target</legend>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="event" defaultChecked={targetType === "event"} />
              <span>Event</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="person" defaultChecked={targetType === "person"} />
              <span>Person</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="role-assignment"
                defaultChecked={targetType === "role-assignment"}
              />
              <span>RoleAssignment</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="event-relation"
                defaultChecked={targetType === "event-relation"}
              />
              <span>EventRelation</span>
            </label>
          </div>
        </fieldset>

        <label className="grid gap-2 text-sm">
          <span>Payload</span>
          <textarea
            name="payload"
            rows={14}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs"
            placeholder={
              targetType === "person"
                ? "name,aliases,birth_start_year,regions\n最澄,伝教大師,767,近江|比叡山"
                : targetType === "role-assignment"
                  ? "person,title,polity,dynasty,time_start_year,time_end_year,is_incumbent\n最澄,天台座主,日本,,804,822,false"
                  : targetType === "event-relation"
                    ? "from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause"
                : "title,event_type,time_start_year,people,polities\n平安京遷都,general,794,桓武天皇,日本"
            }
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
            <span>target: {state.preview.kind}</span>
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
            {state.preview.kind === "event" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<EventInput>;
                return preview.rows.map((row) => renderEventRow(row));
              })()
            ) : state.preview.kind === "person" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<PersonInput>;
                return preview.rows.map((row) => renderPersonRow(row));
              })()
            ) : state.preview.kind === "role-assignment" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<RoleAssignmentCsvInput>;
                return preview.rows.map((row) => renderRoleAssignmentRow(row));
              })()
            ) : (
              (() => {
                const preview = state.preview as CsvPreviewResult<EventRelationCsvInput>;
                return preview.rows.map((row) => renderEventRelationRow(row));
              })()
            )}
          </div>
        </div>
      ) : null}

      {state.result ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-900">import 完了</h3>
          <p className="mt-2 text-sm text-emerald-900">
            追加した
            {" "}
            {state.result.kind === "person"
              ? "Person"
              : state.result.kind === "role-assignment"
                ? "RoleAssignment"
                : state.result.kind === "event-relation"
                  ? "EventRelation"
                  : "Event"}
            {" "}
            件数: {state.result.importedCount}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function renderEventRow(row: CsvPreviewRow<EventInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>
            eventType: {row.input.eventType}
            {row.input.timeExpression?.startYear ? ` / year: ${row.input.timeExpression.startYear}` : ""}
          </p>
          <p>
            links: people {row.input.personIds.length}, polities {row.input.polityIds.length}, periods {row.input.periodIds.length},
            {" "}
            regions {row.input.regionIds.length}, tags {row.input.tags.length}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function renderPersonRow(row: CsvPreviewRow<PersonInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>
            aliases: {row.input.aliases.length}
            {row.input.birthTimeExpression?.startYear ? ` / birth: ${row.input.birthTimeExpression.startYear}` : ""}
            {row.input.deathTimeExpression?.startYear ? ` / death: ${row.input.deathTimeExpression.startYear}` : ""}
          </p>
          <p>
            links: regions {row.input.regionIds.length}, religions {row.input.religionIds.length}, sects {row.input.sectIds.length},
            {" "}
            periods {row.input.periodIds.length}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function renderRoleAssignmentRow(row: CsvPreviewRow<RoleAssignmentCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>
            person: {row.input.personName}
            {row.input.role.timeExpression?.startYear ? ` / from: ${row.input.role.timeExpression.startYear}` : ""}
            {row.input.role.timeExpression?.endYear ? ` / to: ${row.input.role.timeExpression.endYear}` : ""}
          </p>
          <p>
            polity: {row.input.role.polityId ?? "-"}
            {" / "}
            dynasty: {row.input.role.dynastyId ?? "-"}
            {" / "}
            incumbent: {row.input.role.isIncumbent ? "true" : "false"}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function renderEventRelationRow(row: CsvPreviewRow<EventRelationCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>from: {row.input.fromEventTitle}</p>
          <p>
            toEventId: {row.input.relation.toEventId}
            {" / "}
            relationType: {row.input.relation.relationType}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function RowHeader<TInput>({ row }: { row: CsvPreviewRow<TInput> }) {
  return (
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
  );
}

function RowIssues<TInput>({ row }: { row: CsvPreviewRow<TInput> }) {
  return (
    <>
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
    </>
  );
}
