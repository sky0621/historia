"use client";

import { useActionState } from "react";
import {
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
import { createRegionAction, updateRegionAction } from "@/features/regions/actions";

type RegionOption = {
  id: number;
  name: string;
};

type RegionFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  parentOptions: RegionOption[];
  defaultValues?: {
    id?: number;
    name: string;
    parentRegionId?: number | null;
    description: string;
    note: string;
  };
};

export function RegionForm({
  title,
  description,
  submitLabel,
  parentOptions,
  defaultValues
}: RegionFormProps) {
  const [createState, createAction] = useActionState(createRegionAction, initialCreateFormState);
  const action = defaultValues?.id ? updateRegionAction : createAction;

  return (
    <section className="space-y-6">
      <div className={formHeroClassName}>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={formHeroTextClassName}>{description}</p>
      </div>

      <form action={action} className={formCardClassName}>
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5">
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
            <span className={fieldMetaClassName}>親地域</span>
            <select
              name="parentRegionId"
              defaultValue={defaultValues?.parentRegionId ?? ""}
              className={inputClassName}
            >
              <option value="">未設定</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>説明</span>
            <textarea
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              className={`min-h-28 ${inputClassName}`}
            />
          </label>

          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>メモ</span>
            <textarea
              name="note"
              defaultValue={defaultValues?.note ?? ""}
              className={`min-h-28 ${inputClassName}`}
            />
          </label>
        </div>

        {!defaultValues?.id && createState.error ? <p className={formErrorClassName}>{createState.error}</p> : null}

        <div className="mt-8 flex justify-end gap-3">
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
