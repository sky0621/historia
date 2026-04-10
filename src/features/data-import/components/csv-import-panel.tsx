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
  { value: "persons", label: "人物" },
  { value: "regions", label: "地域" },
  { value: "polities", label: "国家" },
  { value: "dynasties", label: "王朝" },
  { value: "dynasty-polity-links", label: "王朝国家紐付け" },
  { value: "role-polity-links", label: "役職国家紐付け" },
  { value: "person-role-links", label: "人物役職紐付け" },
  { value: "person-region-links", label: "人物地域紐付け" },
  { value: "person-religion-links", label: "人物宗教紐付け" },
  { value: "person-sect-links", label: "人物宗派紐付け" },
  { value: "polity-region-links", label: "国家地域紐付け" },
  { value: "polity-tag-links", label: "国家タグ紐付け" },
  { value: "dynasty-tag-links", label: "王朝タグ紐付け" },
  { value: "dynasty-region-links", label: "王朝地域紐付け" },
  { value: "roles", label: "役職" },
  { value: "period-categories", label: "時代区分カテゴリ" },
  { value: "tags", label: "タグ" },
  { value: "historical-periods", label: "時代区分" },
  { value: "historical-period-category-links", label: "時代区分カテゴリ紐付け" },
  { value: "religions", label: "宗教" },
  { value: "sects", label: "宗派" }
] as const satisfies ReadonlyArray<{ value: string; label: string }>;

const sortedTargetOptions = [...targetOptions].sort((left, right) => left.label.localeCompare(right.label, "ja-JP"));

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
            {sortedTargetOptions.map((option) => (
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
  persons: "人物",
  regions: "地域",
  polities: "国家",
  dynasties: "王朝",
  "dynasty-polity-links": "王朝国家紐付け",
  "role-polity-links": "役職国家紐付け",
  "person-role-links": "人物役職紐付け",
  "person-region-links": "人物地域紐付け",
  "person-religion-links": "人物宗教紐付け",
  "person-sect-links": "人物宗派紐付け",
  "polity-region-links": "国家地域紐付け",
  "polity-tag-links": "国家タグ紐付け",
  "dynasty-tag-links": "王朝タグ紐付け",
  "dynasty-region-links": "王朝地域紐付け",
  roles: "役職",
  "period-categories": "時代区分カテゴリ",
  tags: "タグ",
  "historical-periods": "時代区分",
  "historical-period-category-links": "時代区分カテゴリ紐付け",
  religions: "宗教",
  sects: "宗派"
} as const;
