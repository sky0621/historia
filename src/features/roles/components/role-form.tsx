"use client";

import { useActionState, useDeferredValue, useState } from "react";
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
import { createRoleAction, updateRoleAction } from "@/features/roles/actions";

type RoleFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  polityOptions: Array<{ id: number; name: string; timeLabel?: string; tagNames?: string[] }>;
  tagOptions: Array<{ id: number; name: string }>;
  defaultValues?: {
    id?: number;
    title: string;
    reading: string;
    description: string;
    note: string;
    polityIds: number[];
    tagIds: number[];
  };
};

export function RoleForm({ title, description, submitLabel, polityOptions, tagOptions, defaultValues }: RoleFormProps) {
  const [createState, createAction] = useActionState(createRoleAction, initialCreateFormState);
  const action = defaultValues?.id ? updateRoleAction : createAction;
  const [polityQuery, setPolityQuery] = useState("");
  const [polityTagQuery, setPolityTagQuery] = useState("");
  const deferredPolityQuery = useDeferredValue(polityQuery);
  const deferredPolityTagQuery = useDeferredValue(polityTagQuery);
  const normalizedPolityQuery = deferredPolityQuery.trim().toLocaleLowerCase("ja-JP");
  const normalizedPolityTagQuery = deferredPolityTagQuery.trim().toLocaleLowerCase("ja-JP");
  const filteredPolities = polityOptions.filter((polity) => {
    const matchesName = normalizedPolityQuery.length === 0 || polity.name.toLocaleLowerCase("ja-JP").includes(normalizedPolityQuery);
    const matchesTag =
      normalizedPolityTagQuery.length === 0 ||
      (polity.tagNames ?? []).some((tagName) => tagName.toLocaleLowerCase("ja-JP").includes(normalizedPolityTagQuery));

    return matchesName && matchesTag;
  });

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
              <span className={fieldMetaClassName}>名称</span>
              <input name="title" defaultValue={defaultValues?.title ?? ""} className={inputClassName} required />
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldMetaClassName}>読み方</span>
              <input name="reading" defaultValue={defaultValues?.reading ?? ""} className={inputClassName} />
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldMetaClassName}>説明</span>
              <textarea name="description" defaultValue={defaultValues?.description ?? ""} className={`min-h-28 ${inputClassName}`} />
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldMetaClassName}>タグ</span>
              <div className="grid gap-3 md:grid-cols-2">
                {tagOptions.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--border-strong)]"
                  >
                    <input
                      type="checkbox"
                      name="tagIds"
                      value={tag.id}
                      defaultChecked={defaultValues?.tagIds.includes(tag.id) ?? false}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </label>
            <label className={fieldLabelClassName}>
              <span className={fieldMetaClassName}>国家</span>
              <input
                value={polityQuery}
                onChange={(event) => setPolityQuery(event.target.value)}
                className={inputClassName}
                placeholder="国家名で絞り込み"
              />
              <input
                value={polityTagQuery}
                onChange={(event) => setPolityTagQuery(event.target.value)}
                className={inputClassName}
                placeholder="タグで絞り込み"
              />
              <div className="grid gap-3 md:grid-cols-2">
                {filteredPolities.map((polity) => (
                  <label
                    key={polity.id}
                    className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--border-strong)]"
                  >
                    <input
                      type="checkbox"
                      name="polityIds"
                      value={polity.id}
                      defaultChecked={defaultValues?.polityIds.includes(polity.id) ?? false}
                    />
                    {formatPolityOptionLabel(polity)}
                  </label>
                ))}
              </div>
            </label>
          </div>
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

function formatPolityOptionLabel(polity: { name: string; timeLabel?: string }) {
  return polity.timeLabel ? `${polity.name}（${polity.timeLabel}）` : polity.name;
}
