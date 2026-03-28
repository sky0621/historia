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
import { createTagAction, updateTagAction } from "@/features/tags/actions";

type TagFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: {
    id?: number;
    name: string;
  };
};

export function TagForm({ title, description, submitLabel, defaultValues }: TagFormProps) {
  const [createState, createAction] = useActionState(createTagAction, initialCreateFormState);
  const action = defaultValues?.id ? updateTagAction : createAction;

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
