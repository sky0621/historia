"use client";

import { useState } from "react";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createPersonAction, updatePersonAction } from "@/features/person/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string };
type RoleDefault = {
  title: string;
  polityId?: number | null;
  dynastyId?: number | null;
  note: string;
  isIncumbent: boolean;
  timeExpression?: TimeExpressionInput;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  options: {
    regions: Option[];
    religions: Option[];
    sects: Option[];
    periods: Option[];
    polities: Option[];
    dynasties: Option[];
  };
  defaultValues?: {
    id?: number;
    name: string;
    reading: string;
    aliases: string;
    note: string;
    regionIds: number[];
    religionIds: number[];
    sectIds: number[];
    periodIds: number[];
    birthTimeExpression?: TimeExpressionInput;
    deathTimeExpression?: TimeExpressionInput;
    roles: RoleDefault[];
  };
};

export function PersonForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const action = defaultValues?.id ? updatePersonAction : createPersonAction;
  const [roleCount, setRoleCount] = useState(Math.max(defaultValues?.roles.length ?? 0, 1));

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <input type="hidden" name="roleCount" value={roleCount} />

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm">
            <span>氏名</span>
            <input name="name" defaultValue={defaultValues?.name ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>別名</span>
            <input name="aliases" defaultValue={defaultValues?.aliases ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>読み方</span>
            <input name="reading" defaultValue={defaultValues?.reading ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs prefix="birthTime" label="生年" defaultValue={defaultValues?.birthTimeExpression} />
          <TimeExpressionInputs prefix="deathTime" label="没年" defaultValue={defaultValues?.deathTimeExpression} />
        </div>

        <SelectionGroup name="regionIds" label="関連地域" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} />
        <SelectionGroup name="religionIds" label="宗教" options={options.religions} selectedIds={defaultValues?.religionIds ?? []} />
        <SelectionGroup name="sectIds" label="宗派" options={options.sects} selectedIds={defaultValues?.sectIds ?? []} />
        <SelectionGroup name="periodIds" label="時代区分" options={options.periods} selectedIds={defaultValues?.periodIds ?? []} />

        <section className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--muted)]">役職履歴</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">国家または王朝に紐づく役職を登録します。</p>
            </div>
            <button
              type="button"
              onClick={() => setRoleCount((count) => count + 1)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              役職を追加
            </button>
          </div>

          <div className="mt-4 space-y-5">
            {Array.from({ length: roleCount }).map((_, index) => {
              const role = defaultValues?.roles[index];
              return (
                <div key={index} className="rounded-[24px] border border-[var(--border)] bg-stone-50/80 p-5">
                  <div className="grid gap-4">
                    <label className="grid gap-2 text-sm">
                      <span>役職名</span>
                      <input
                        name={`roles.${index}.title`}
                        defaultValue={role?.title ?? ""}
                        className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                      />
                    </label>
                    <div className="grid gap-4 lg:grid-cols-2">
                      <label className="grid gap-2 text-sm">
                        <span>国家</span>
                        <select
                          name={`roles.${index}.polityId`}
                          defaultValue={role?.polityId ?? ""}
                          className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                        >
                          <option value="">未設定</option>
                          {options.polities.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm">
                        <span>王朝</span>
                        <select
                          name={`roles.${index}.dynastyId`}
                          defaultValue={role?.dynastyId ?? ""}
                          className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                        >
                          <option value="">未設定</option>
                          {options.dynasties.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
                    <TimeExpressionInputs
                      prefix={`roles.${index}.time`}
                      label="在任期間"
                      defaultValue={role?.timeExpression}
                    />
                    <label className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        name={`roles.${index}.isIncumbent`}
                        defaultChecked={role?.isIncumbent ?? false}
                      />
                      現職
                    </label>
                    <label className="grid gap-2 text-sm">
                      <span>メモ</span>
                      <textarea
                        name={`roles.${index}.note`}
                        defaultValue={role?.note ?? ""}
                        className="min-h-24 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <label className="grid gap-2 text-sm">
          <span>メモ</span>
          <textarea name="note" defaultValue={defaultValues?.note ?? ""} className="min-h-32 rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
        </label>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

function SelectionGroup({
  name,
  label,
  options,
  selectedIds
}: {
  name: string;
  label: string;
  options: Option[];
  selectedIds: number[];
}) {
  return (
    <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
      <legend className="px-2 text-sm font-semibold text-[var(--muted)]">{label}</legend>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {options.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">選択肢はまだありません。</p>
        ) : (
          options.map((option) => (
            <label key={option.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} />
              {option.name}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}
