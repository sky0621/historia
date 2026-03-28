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
import { createSourceAction, updateSourceAction } from "@/features/sources/actions";

type SourceFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: {
    id?: number;
    title: string;
    author?: string | null;
    publisher?: string | null;
    publishedAtLabel?: string | null;
    url?: string | null;
    note?: string | null;
  };
};

export function SourceForm({ title, description, submitLabel, defaultValues }: SourceFormProps) {
  const [createState, createAction] = useActionState(createSourceAction, initialCreateFormState);
  const action = defaultValues?.id ? updateSourceAction : createAction;

  return (
    <section className="space-y-6">
      <div className={formHeroClassName}>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={formHeroTextClassName}>{description}</p>
      </div>

      <form action={action} className={formCardClassName}>
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>タイトル</span>
            <input
              name="title"
              defaultValue={defaultValues?.title ?? ""}
              className={inputClassName}
              required
            />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>著者</span>
            <input name="author" defaultValue={defaultValues?.author ?? ""} className={inputClassName} />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>出版社 / 媒体</span>
            <input name="publisher" defaultValue={defaultValues?.publisher ?? ""} className={inputClassName} />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>刊行情報</span>
            <input name="publishedAtLabel" defaultValue={defaultValues?.publishedAtLabel ?? ""} className={inputClassName} />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>URL</span>
            <input name="url" defaultValue={defaultValues?.url ?? ""} className={inputClassName} />
          </label>
          <label className={`${fieldLabelClassName} md:col-span-2`}>
            <span className={fieldMetaClassName}>メモ</span>
            <textarea name="note" defaultValue={defaultValues?.note ?? ""} rows={6} className={inputClassName} />
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
