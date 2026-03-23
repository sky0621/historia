"use client";

import { useActionState, useState } from "react";
import { importCsvAction } from "@/features/csv-import/actions";
import type { EventInput } from "@/features/events/schema";
import type { PersonInput } from "@/features/person/schema";
import type {
  CitationCsvInput,
  CsvPreviewResult,
  CsvPreviewRow,
  ConflictOutcomeCsvInput,
  ConflictParticipantCsvInput,
  DynastyCsvInput,
  DynastySuccessionCsvInput,
  EventRelationCsvInput,
  HistoricalPeriodCsvInput,
  HistoricalPeriodRelationCsvInput,
  PeriodCategoryCsvInput,
  PolityCsvInput,
  PolityTransitionCsvInput,
  RegionCsvInput,
  RegionRelationCsvInput,
  ReligionCsvInput,
  RoleAssignmentCsvInput,
  SectCsvInput,
  SourceCsvInput,
  TagCsvInput
} from "@/server/services/csv-import";

const initialState: Awaited<ReturnType<typeof importCsvAction>> = {
  targetType: "event"
};

export function CsvImportPanel() {
  const [state, action, pending] = useActionState(importCsvAction, initialState);
  const [payload, setPayload] = useState("");
  const [fileName, setFileName] = useState("");
  const targetType = state.targetType ?? "event";

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
      <h2 className="text-lg font-semibold">CSV import</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        `Sprint 10` では `Source / Citation / PolityTransition / DynastySuccession / RegionRelation / HistoricalPeriodRelation CSV`
        も preview/import できます。import は同期方式で、CSV にあるものは `INSERT / UPDATE`、CSV にない既存データは `DELETE`
        します。まず preview し、`error` がないことを確認してから import します。`duplicate-candidate` が 1 件だけの行は更新対象として扱います。
      </p>

      <form action={action} className="mt-6 space-y-4">
        <label className="grid gap-2 text-sm">
          <span>File</span>
          <input
            type="file"
            accept=".csv,text/csv"
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
            onChange={async (event) => {
              const file = event.currentTarget.files?.[0];
              if (!file) {
                setFileName("");
                return;
              }
              setFileName(file.name);
              setPayload(await file.text());
            }}
          />
          <input type="hidden" name="fileName" value={fileName} />
          {fileName ? <span className="text-xs text-[var(--muted)]">selected: {fileName}</span> : null}
        </label>

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
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="conflict-participant"
                defaultChecked={targetType === "conflict-participant"}
              />
              <span>ConflictParticipant</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="conflict-outcome"
                defaultChecked={targetType === "conflict-outcome"}
              />
              <span>ConflictOutcome</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="region" defaultChecked={targetType === "region"} />
              <span>Region</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="period-category"
                defaultChecked={targetType === "period-category"}
              />
              <span>PeriodCategory</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="polity" defaultChecked={targetType === "polity"} />
              <span>Polity</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="religion" defaultChecked={targetType === "religion"} />
              <span>Religion</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="dynasty" defaultChecked={targetType === "dynasty"} />
              <span>Dynasty</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="historical-period"
                defaultChecked={targetType === "historical-period"}
              />
              <span>HistoricalPeriod</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="sect" defaultChecked={targetType === "sect"} />
              <span>Sect</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="tag" defaultChecked={targetType === "tag"} />
              <span>Tag</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="source" defaultChecked={targetType === "source"} />
              <span>Source</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input type="radio" name="targetType" value="citation" defaultChecked={targetType === "citation"} />
              <span>Citation</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="polity-transition"
                defaultChecked={targetType === "polity-transition"}
              />
              <span>PolityTransition</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="dynasty-succession"
                defaultChecked={targetType === "dynasty-succession"}
              />
              <span>DynastySuccession</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="region-relation"
                defaultChecked={targetType === "region-relation"}
              />
              <span>RegionRelation</span>
            </label>
            <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] px-3 py-2 text-sm">
              <input
                type="radio"
                name="targetType"
                value="historical-period-relation"
                defaultChecked={targetType === "historical-period-relation"}
              />
              <span>HistoricalPeriodRelation</span>
            </label>
          </div>
        </fieldset>

        <label className="grid gap-2 text-sm">
          <span>Payload</span>
          <textarea
            name="payload"
            rows={14}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            placeholder={
              targetType === "person"
                ? "name,reading,aliases,from_year,regions\n最澄,さいちょう,伝教大師,767,近江|比叡山"
                : targetType === "role-assignment"
                  ? "person,title,polity,dynasty,time_start_year,time_end_year,is_incumbent\n最澄,天台座主,日本,,804,822,false"
                  : targetType === "event-relation"
                    ? "from_event,to_event,relation_type\n平安京遷都,天台宗の成立,cause"
                    : targetType === "conflict-participant"
                      ? "event,participant_type,participant_name,role,note\n第1回十字軍,person,教皇ウルバヌス2世,leader,呼びかけ"
                      : targetType === "conflict-outcome"
                      ? "event,winner_participants,loser_participants,settlement_summary\n第1回十字軍,person:教皇ウルバヌス2世|polity:ローマ教皇庁,polity:セルジューク朝,エルサレム占領"
                      : targetType === "region"
                        ? "name,parent_region,aliases,description\n近畿,日本,畿内,古代からの中核地域"
                        : targetType === "period-category"
                          ? "name,description\n日本史区分,日本史の区分法"
                          : targetType === "polity"
                            ? "name,aliases,from_year,regions\n日本,日本国,660,日本|東アジア"
                            : targetType === "religion"
                              ? "name,aliases,time_start_year,regions,founders\n仏教,佛教,-566,インド|東アジア,釈迦"
                              : targetType === "dynasty"
                                ? "name,polity,time_start_year,regions\n平安朝,日本,794,日本"
                                : targetType === "historical-period"
                                  ? "name,category,polity,time_start_year,regions\n平安時代,日本史区分,日本,794,日本"
                                  : targetType === "sect"
                                    ? "name,religion,time_start_year,regions,founders\n天台宗,仏教,805,日本,最澄"
                                    : targetType === "tag"
                                      ? "name\n都城"
                                      : targetType === "source"
                                        ? "title,author,publisher,published_at_label,url\n日本書紀,舎人親王,朝廷,720,https://example.com"
                                        : targetType === "citation"
                                          ? "source,target_type,target_name,locator\n日本書紀,event,平安京遷都,巻第38"
                                          : targetType === "polity-transition"
                                            ? "predecessor_polity,successor_polity,transition_type,time_start_year\nローマ共和国,ローマ帝国,succession,-27"
                                            : targetType === "dynasty-succession"
                                              ? "polity,predecessor_dynasty,successor_dynasty,time_start_year\n日本,奈良朝,平安朝,794"
                                              : targetType === "region-relation"
                                                ? "from_region,to_region,relation_type\n日本,東アジア,cultural_sphere"
                                                : targetType === "historical-period-relation"
                                                  ? "from_period,to_period,relation_type\n奈良時代,平安時代,succeeds"
                : "title,event_type,time_start_year,person,polities\n平安京遷都,general,794,桓武天皇,日本"
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

          {state.preview.summary.duplicateCandidateCount > 0 ? (
            <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              重複候補があります。候補が 1 件の行は更新として同期され、複数候補の行は import を止めます。
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
            ) : state.preview.kind === "event-relation" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<EventRelationCsvInput>;
                return preview.rows.map((row) => renderEventRelationRow(row));
              })()
            ) : state.preview.kind === "conflict-participant" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<ConflictParticipantCsvInput>;
                return preview.rows.map((row) => renderConflictParticipantRow(row));
              })()
            ) : state.preview.kind === "conflict-outcome" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<ConflictOutcomeCsvInput>;
                return preview.rows.map((row) => renderConflictOutcomeRow(row));
              })()
            ) : state.preview.kind === "region" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<RegionCsvInput>;
                return preview.rows.map((row) => renderRegionRow(row));
              })()
            ) : state.preview.kind === "period-category" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<PeriodCategoryCsvInput>;
                return preview.rows.map((row) => renderPeriodCategoryRow(row));
              })()
            ) : state.preview.kind === "polity" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<PolityCsvInput>;
                return preview.rows.map((row) => renderPolityRow(row));
              })()
            ) : state.preview.kind === "religion" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<ReligionCsvInput>;
                return preview.rows.map((row) => renderReligionRow(row));
              })()
            ) : state.preview.kind === "dynasty" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<DynastyCsvInput>;
                return preview.rows.map((row) => renderDynastyRow(row));
              })()
            ) : state.preview.kind === "historical-period" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<HistoricalPeriodCsvInput>;
                return preview.rows.map((row) => renderHistoricalPeriodRow(row));
              })()
            ) : state.preview.kind === "sect" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<SectCsvInput>;
                return preview.rows.map((row) => renderSectRow(row));
              })()
            ) : state.preview.kind === "source" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<SourceCsvInput>;
                return preview.rows.map((row) => renderSourceRow(row));
              })()
            ) : state.preview.kind === "citation" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<CitationCsvInput>;
                return preview.rows.map((row) => renderCitationRow(row));
              })()
            ) : state.preview.kind === "polity-transition" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<PolityTransitionCsvInput>;
                return preview.rows.map((row) => renderPolityTransitionRow(row));
              })()
            ) : state.preview.kind === "dynasty-succession" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<DynastySuccessionCsvInput>;
                return preview.rows.map((row) => renderDynastySuccessionRow(row));
              })()
            ) : state.preview.kind === "region-relation" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<RegionRelationCsvInput>;
                return preview.rows.map((row) => renderRegionRelationRow(row));
              })()
            ) : state.preview.kind === "historical-period-relation" ? (
              (() => {
                const preview = state.preview as CsvPreviewResult<HistoricalPeriodRelationCsvInput>;
                return preview.rows.map((row) => renderHistoricalPeriodRelationRow(row));
              })()
            ) : (
              (() => {
                const preview = state.preview as CsvPreviewResult<TagCsvInput>;
                return preview.rows.map((row) => renderTagRow(row));
              })()
            )}
          </div>
        </div>
      ) : null}

      {state.result ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-900">import 完了</h3>
          <p className="mt-2 text-sm text-emerald-900">
            同期した
            {" "}
            {state.result.kind === "person"
              ? "Person"
              : state.result.kind === "role-assignment"
                ? "RoleAssignment"
                : state.result.kind === "event-relation"
                  ? "EventRelation"
                  : state.result.kind === "conflict-participant"
                    ? "ConflictParticipant"
                    : state.result.kind === "conflict-outcome"
                      ? "ConflictOutcome"
                      : state.result.kind === "region"
                        ? "Region"
                        : state.result.kind === "period-category"
                          ? "PeriodCategory"
                            : state.result.kind === "polity"
                              ? "Polity_王朝"
                              : state.result.kind === "religion"
                                ? "Religion"
                                : state.result.kind === "dynasty"
                                  ? "Dynasty"
                                  : state.result.kind === "historical-period"
                                    ? "HistoricalPeriod"
                                    : state.result.kind === "sect"
                                      ? "Sect"
                                      : state.result.kind === "tag"
                                        ? "Tag"
                                        : state.result.kind === "source"
                                          ? "Source"
                                          : state.result.kind === "citation"
                                            ? "Citation"
                                            : state.result.kind === "polity-transition"
                                              ? "PolityTransition"
                                              : state.result.kind === "dynasty-succession"
                                                ? "DynastySuccession"
                                                : state.result.kind === "region-relation"
                                                  ? "RegionRelation"
                                                  : state.result.kind === "historical-period-relation"
                                                    ? "HistoricalPeriodRelation"
                  : "Event"}
            {" "}
            {" "}
            insert: {state.result.insertedCount}
            {" / "}
            update: {state.result.updatedCount}
            {" / "}
            delete: {state.result.deletedCount}
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
            links: person {row.input.personIds.length}, polities {row.input.polityIds.length}, periods {row.input.periodIds.length},
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

function renderConflictParticipantRow(row: CsvPreviewRow<ConflictParticipantCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>event: {row.input.eventTitle}</p>
          <p>
            participantType: {row.input.participant.participantType}
            {" / "}
            participantId: {row.input.participant.participantId}
            {" / "}
            role: {row.input.participant.role}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function renderConflictOutcomeRow(row: CsvPreviewRow<ConflictOutcomeCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />

      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          <p>event: {row.input.eventTitle}</p>
          <p>
            winners: {row.input.outcome.winnerParticipants.length}
            {" / "}
            losers: {row.input.outcome.loserParticipants.length}
          </p>
        </div>
      ) : null}
    </article>
  );
}

function renderRegionRow(row: CsvPreviewRow<RegionCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? <div className="mt-3 text-xs text-[var(--muted)]">parentRegionId: {row.input.parentRegionId ?? "-"}</div> : null}
    </article>
  );
}

function renderPeriodCategoryRow(row: CsvPreviewRow<PeriodCategoryCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
    </article>
  );
}

function renderPolityRow(row: CsvPreviewRow<PolityCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          from: {row.input.fromTimeExpression?.startYear ?? "-"} / to: {row.input.toTimeExpression?.startYear ?? "-"} / regions: {row.input.regionIds.length}
        </div>
      ) : null}
    </article>
  );
}

function renderReligionRow(row: CsvPreviewRow<ReligionCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          regions: {row.input.regionIds.length} / founders: {row.input.founderIds.length}
        </div>
      ) : null}
    </article>
  );
}

function renderDynastyRow(row: CsvPreviewRow<DynastyCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? <div className="mt-3 text-xs text-[var(--muted)]">polityId: {row.input.polityId} / regions: {row.input.regionIds.length}</div> : null}
    </article>
  );
}

function renderHistoricalPeriodRow(row: CsvPreviewRow<HistoricalPeriodCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? <div className="mt-3 text-xs text-[var(--muted)]">categoryId: {row.input.categoryId} / regions: {row.input.regionIds.length}</div> : null}
    </article>
  );
}

function renderSectRow(row: CsvPreviewRow<SectCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? <div className="mt-3 text-xs text-[var(--muted)]">religionId: {row.input.religionId} / founders: {row.input.founderIds.length}</div> : null}
    </article>
  );
}

function renderTagRow(row: CsvPreviewRow<TagCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
    </article>
  );
}

function renderSourceRow(row: CsvPreviewRow<SourceCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          author: {row.input.author || "-"} / publisher: {row.input.publisher || "-"}
        </div>
      ) : null}
    </article>
  );
}

function renderCitationRow(row: CsvPreviewRow<CitationCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          sourceId: {row.input.sourceId} / target: {row.input.targetType} #{row.input.targetId}
        </div>
      ) : null}
    </article>
  );
}

function renderPolityTransitionRow(row: CsvPreviewRow<PolityTransitionCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          predecessor: {row.input.predecessorPolityId} / successor: {row.input.successorPolityId} / type: {row.input.transitionType}
        </div>
      ) : null}
    </article>
  );
}

function renderDynastySuccessionRow(row: CsvPreviewRow<DynastySuccessionCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          polityId: {row.input.polityId} / predecessor: {row.input.predecessorDynastyId} / successor: {row.input.successorDynastyId}
        </div>
      ) : null}
    </article>
  );
}

function renderRegionRelationRow(row: CsvPreviewRow<RegionRelationCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          from: {row.input.fromRegionId} / to: {row.input.toRegionId} / type: {row.input.relationType}
        </div>
      ) : null}
    </article>
  );
}

function renderHistoricalPeriodRelationRow(row: CsvPreviewRow<HistoricalPeriodRelationCsvInput>) {
  return (
    <article key={row.rowNumber} className="rounded-3xl border border-[var(--border)] px-4 py-4">
      <RowHeader row={row} />
      <RowIssues row={row} />
      {row.input ? (
        <div className="mt-3 text-xs text-[var(--muted)]">
          from: {row.input.fromPeriodId} / to: {row.input.toPeriodId} / type: {row.input.relationType}
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
