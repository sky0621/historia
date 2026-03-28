"use client";

import { useActionState } from "react";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { CollapsibleFormSection } from "@/components/forms/collapsible-form-section";
import { RegionCheckboxTree } from "@/components/forms/region-checkbox-tree";
import {
  checkboxCardClassName,
  fieldLabelClassName,
  fieldMetaClassName,
  formCardClassName,
  formErrorClassName,
  formHeroClassName,
  formHeroTextClassName,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "@/components/forms/styles";
import { initialCreateFormState } from "@/features/actions/create-form-state";
import { createHistoricalPeriodAction, updateHistoricalPeriodAction } from "@/features/periods/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string; parentRegionId?: number | null };

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  options: {
    categories: Option[];
    polities: Option[];
    regions: Option[];
  };
  defaultValues?: {
    id?: number;
    categoryId: number;
    polityId?: number | null;
    name: string;
    description: string;
    note: string;
    regionIds: number[];
    fromTimeExpression?: TimeExpressionInput;
    toTimeExpression?: TimeExpressionInput;
  };
};

export function HistoricalPeriodForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const [createState, createAction] = useActionState(createHistoricalPeriodAction, initialCreateFormState);
  const action = defaultValues?.id ? updateHistoricalPeriodAction : createAction;

  return (
    <section className="space-y-6">
      <div className={formHeroClassName}>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={formHeroTextClassName}>{description}</p>
      </div>

      <form action={action} className="space-y-6">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

        <section className={formCardClassName}>
          <div className="grid gap-5">
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>カテゴリ</span>
            <select
              name="categoryId"
              defaultValue={defaultValues?.categoryId ?? ""}
              className={inputClassName}
              required
            >
              <option value="" disabled>
                カテゴリを選択
              </option>
              {options.categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>対象国家</span>
            <select
              name="polityId"
              defaultValue={defaultValues?.polityId ?? ""}
              className={inputClassName}
            >
              <option value="">未設定</option>
              {options.polities.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>名称</span>
            <input name="name" defaultValue={defaultValues?.name ?? ""} className={inputClassName} required />
          </label>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>説明</span>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} className={`min-h-28 ${inputClassName}`} />
          </label>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs
            prefix="fromTime"
            label="開始年"
            defaultValue={defaultValues?.fromTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
          />
          <TimeExpressionInputs
            prefix="toTime"
            label="終了年"
            defaultValue={defaultValues?.toTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
            startYearLabel="終了年"
          />
        </div>

        <section className={formCardClassName}>
          <CollapsibleFormSection title="関連地域" defaultOpen={(defaultValues?.regionIds.length ?? 0) > 0}>
            <RegionCheckboxTree
              name="regionIds"
              options={options.regions}
              selectedIds={defaultValues?.regionIds ?? []}
              itemClassName={checkboxCardClassName}
            />
          </CollapsibleFormSection>
        </section>

        <section className={formCardClassName}>
        <label className={fieldLabelClassName}>
          <span className={fieldMetaClassName}>メモ</span>
          <textarea name="note" defaultValue={defaultValues?.note ?? ""} className={`min-h-32 ${inputClassName}`} />
        </label>
        </section>

        {!defaultValues?.id && createState.error ? <p className={formErrorClassName}>{createState.error}</p> : null}

        <div className="flex justify-end gap-3">
          {!defaultValues?.id ? (
            <button type="submit" name="intent" value="create-and-continue" className={secondaryButtonClassName}>
              続けて作成
            </button>
          ) : null}
          <button type="submit" className={primaryButtonClassName}>
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
