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
  polityOptions: Array<{ id: number; name: string; timeLabel?: string }>;
  defaultValues?: {
    id?: number;
    title: string;
    reading: string;
    description: string;
    note: string;
    polityId?: number | null;
  };
};

export function RoleForm({ title, description, submitLabel, polityOptions, defaultValues }: RoleFormProps) {
  const [createState, createAction] = useActionState(createRoleAction, initialCreateFormState);
  const action = defaultValues?.id ? updateRoleAction : createAction;
  const [polityQuery, setPolityQuery] = useState("");
  const deferredPolityQuery = useDeferredValue(polityQuery);
  const filteredPolities = polityOptions.filter((polity) =>
    polity.name.toLocaleLowerCase("ja-JP").includes(deferredPolityQuery.trim().toLocaleLowerCase("ja-JP"))
  );

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
              <span className={fieldMetaClassName}>国家</span>
              <input
                value={polityQuery}
                onChange={(event) => setPolityQuery(event.target.value)}
                className={inputClassName}
                placeholder="国家名で絞り込み"
              />
              <select name="polityId" defaultValue={defaultValues?.polityId?.toString() ?? ""} className={inputClassName}>
                <option value="">未設定</option>
                {filteredPolities.map((polity) => (
                  <option key={polity.id} value={polity.id}>
                    {formatPolityOptionLabel(polity)}
                  </option>
                ))}
              </select>
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
