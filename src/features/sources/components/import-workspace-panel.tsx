"use client";

import { useActionState, useState } from "react";
import { importWorkspaceAction } from "@/features/sources/actions";

const initialState: Awaited<ReturnType<typeof importWorkspaceAction>> = {};

export function ImportWorkspacePanel() {
  const [state, action, pending] = useActionState(importWorkspaceAction, initialState);
  const [payload, setPayload] = useState("");
  const [fileName, setFileName] = useState("");

  return (
    <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
      <h2 className="text-lg font-semibold">JSON import</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        export JSON を貼り付けて、まず preview します。import は追加入力ベースで、重複候補は preview に表示します。
      </p>

      <form action={action} className="mt-6 space-y-4">
        <label className="grid gap-2 text-sm">
          <span>File</span>
          <input
            type="file"
            accept=".json,application/json"
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

        <label className="grid gap-2 text-sm">
          <span>Payload</span>
          <textarea
            name="payload"
            rows={14}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2 font-mono text-xs"
            value={payload}
            onChange={(event) => setPayload(event.target.value)}
            placeholder='{"schemaVersion":"historia-export-v1",...}'
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
        <div className="mt-6 space-y-4 rounded-3xl border border-[var(--border)] p-5">
          <div className="flex flex-wrap gap-3 text-sm text-[var(--muted)]">
            <span>schema: {state.preview.schemaVersion}</span>
            <span>exportedAt: {state.preview.exportedAt}</span>
            <span>duplicates: {state.preview.duplicateCount}</span>
          </div>

          <div className="grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(state.preview.tableCounts).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between rounded-2xl border border-[var(--border)] px-3 py-2">
                <span>{table}</span>
                <span className="text-[var(--muted)]">{count}</span>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold">重複候補</h3>
            {state.preview.duplicateCandidates.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--muted)]">候補はありません。</p>
            ) : (
              <div className="mt-3 space-y-2">
                {state.preview.duplicateCandidates.map((item, index) => (
                  <div key={`${item.table}-${item.importId ?? "na"}-${index}`} className="rounded-2xl border border-[var(--border)] px-3 py-2 text-sm">
                    <span className="font-medium">{item.table}</span>: {item.label} <span className="text-[var(--muted)]">({item.reason})</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {state.result ? (
        <div className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5">
          <h3 className="text-sm font-semibold text-emerald-900">import 完了</h3>
          <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
            {Object.entries(state.result.importedCounts).map(([table, count]) => (
              <div key={table} className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-white/80 px-3 py-2">
                <span>{table}</span>
                <span className="text-emerald-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
