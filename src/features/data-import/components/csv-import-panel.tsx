"use client";

import { useActionState } from "react";
import {
  formCardClassName,
  fieldLabelClassName,
  fieldMetaClassName,
  formErrorClassName,
  inputClassName,
  primaryButtonClassName
} from "@/components/forms/styles";
import { importCsvAction, type CsvImportState } from "@/features/data-import/actions";

const initialState: CsvImportState = {};

const targetOptions = [
  { value: "regions", label: "地域" },
  { value: "polities", label: "国家" },
  { value: "dynasties", label: "王朝" },
  { value: "dynasty-polity-links", label: "王朝国家紐付け" },
  { value: "polity-region-links", label: "国家地域紐付け" },
  { value: "dynasty-region-links", label: "王朝地域紐付け" },
  { value: "roles", label: "役職" },
  { value: "period-categories", label: "時代区分カテゴリ" },
  { value: "historical-periods", label: "時代区分" },
  { value: "historical-period-category-links", label: "時代区分カテゴリ紐付け" },
  { value: "religions", label: "宗教" },
  { value: "sects", label: "宗派" }
] as const;

export function CsvImportPanel() {
  const [state, action, pending] = useActionState(importCsvAction, initialState);

  return (
    <div className={formCardClassName}>
      <h2 className="text-lg font-semibold">CSV import</h2>
      <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
        `id` が空なら新規作成、`id` があれば更新、CSV に存在しない既存 `id` は削除します。
      </p>

      <form action={action} className="mt-6 grid gap-5">
        <label className={fieldLabelClassName}>
          <span className={fieldMetaClassName}>取込対象</span>
          <select name="targetType" className={inputClassName} defaultValue="polities" required>
            {targetOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className={fieldLabelClassName}>
          <span className={fieldMetaClassName}>CSV ファイル</span>
          <input name="file" type="file" accept=".csv,text/csv" className={inputClassName} required />
        </label>

        {state.error ? <p className={formErrorClassName}>{state.error}</p> : null}

        {state.result ? (
          <div className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-4 text-sm text-[var(--muted-strong)]">
            <p>対象: {labelByTarget[state.result.targetType]}</p>
            <p>行数: {state.result.totalRows}</p>
            <p>新規: {state.result.createdCount}</p>
            <p>更新: {state.result.updatedCount}</p>
            <p>削除: {state.result.deletedCount}</p>
          </div>
        ) : null}

        <div className="flex justify-end">
          <button type="submit" className={primaryButtonClassName} disabled={pending}>
            {pending ? "取込中..." : "取り込む"}
          </button>
        </div>
      </form>
    </div>
  );
}

const labelByTarget = {
  regions: "地域",
  polities: "国家",
  dynasties: "王朝",
  "dynasty-polity-links": "王朝国家紐付け",
  "polity-region-links": "国家地域紐付け",
  "dynasty-region-links": "王朝地域紐付け",
  roles: "役職",
  "period-categories": "時代区分カテゴリ",
  "historical-periods": "時代区分",
  "historical-period-category-links": "時代区分カテゴリ紐付け",
  religions: "宗教",
  sects: "宗派"
} as const;
