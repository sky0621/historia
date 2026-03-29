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
import { createDynastyAction, updateDynastyAction } from "@/features/polities/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type RegionOption = {
  id: number;
  name: string;
  parentRegionId?: number | null;
};

type PolityOption = {
  id: number;
  name: string;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  polityOptions: PolityOption[];
  regionOptions: RegionOption[];
  defaultValues?: {
    id?: number;
    polityIds: number[];
    name: string;
    description: string;
    note: string;
    regionIds: number[];
    fromTimeExpression?: TimeExpressionInput;
    toTimeExpression?: TimeExpressionInput;
  };
};

export function DynastyForm({
  title,
  description,
  submitLabel,
  polityOptions,
  regionOptions,
  defaultValues
}: Props) {
  const [createState, createAction] = useActionState(createDynastyAction, initialCreateFormState);
  const action = defaultValues?.id ? updateDynastyAction : createAction;

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
          <fieldset className={formCardClassName}>
            <legend className="px-2 text-base font-semibold text-[var(--foreground-strong)]">関連国家</legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {polityOptions.map((polity) => (
                <label key={polity.id} className={checkboxCardClassName}>
                  <input
                    type="checkbox"
                    name="polityIds"
                    value={polity.id}
                    defaultChecked={defaultValues?.polityIds.includes(polity.id) ?? false}
                  />
                  {polity.name}
                </label>
              ))}
            </div>
          </fieldset>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>名称</span>
            <input
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              className={inputClassName}
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>説明</span>
            <textarea
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              className={`min-h-28 ${inputClassName}`}
            />
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
              options={regionOptions}
              selectedIds={defaultValues?.regionIds ?? []}
              itemClassName={checkboxCardClassName}
            />
          </CollapsibleFormSection>
        </section>

        <section className={formCardClassName}>
        <label className={fieldLabelClassName}>
          <span className={fieldMetaClassName}>メモ</span>
          <textarea
            name="note"
            defaultValue={defaultValues?.note ?? ""}
            className={`min-h-32 ${inputClassName}`}
          />
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
