"use client";

import { useActionState, useState } from "react";
import { formErrorClassName, secondaryButtonClassName } from "@/components/forms/styles";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { initialCreateFormState } from "@/features/actions/create-form-state";
import { createPersonAction, updatePersonAction } from "@/features/person/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string };
type RoleDefault = {
  title: string;
  polityId?: number | null;
  dynastyId?: number | null;
  note: string;
  isIncumbent: boolean;
  fromTimeExpression?: TimeExpressionInput;
  toTimeExpression?: TimeExpressionInput;
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
  const [createState, createAction] = useActionState(createPersonAction, initialCreateFormState);
  const action = defaultValues?.id ? updatePersonAction : createAction;
  const [roleCount, setRoleCount] = useState(Math.max(defaultValues?.roles.length ?? 0, 1));

  return (
    <section className="space-y-8">
      <header className="historia-panel rounded-[14px] p-6 sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
          <div>
            <p className="historia-label">Person dossier</p>
            <h1 className="historia-title mt-3 text-4xl font-semibold sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--muted-strong)] sm:text-base">{description}</p>
          </div>
          <div className="historia-inset rounded-[14px] p-5">
            <p className="historia-label">Editorial notes</p>
            <p className="mt-3 text-sm leading-7 text-[var(--muted-strong)]">
              基本プロフィール、年代、関連主体、役職履歴を1画面で整理します。主要入力は上段、周辺情報は下段へ配置します。
            </p>
          </div>
        </div>
      </header>

      <form action={action} className="space-y-6">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <input type="hidden" name="roleCount" value={roleCount} />

        <SectionCard
          eyebrow="Identity"
          title="基礎情報"
          description="人名表記、別名、読みをまとめて記録します。"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="氏名" required>
              <input name="name" defaultValue={defaultValues?.name ?? ""} className={inputClassName} required />
            </Field>
            <Field label="別名">
              <input name="aliases" defaultValue={defaultValues?.aliases ?? ""} className={inputClassName} />
            </Field>
            <Field label="読み方">
              <input name="reading" defaultValue={defaultValues?.reading ?? ""} className={inputClassName} />
            </Field>
          </div>
        </SectionCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <TimeExpressionInputs
            prefix="birthTime"
            label="生年"
            defaultValue={defaultValues?.birthTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
          />
          <TimeExpressionInputs
            prefix="deathTime"
            label="没年"
            defaultValue={defaultValues?.deathTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <SelectionGroup name="regionIds" label="関連地域" description="人物の活動圏や出自に関わる地域を選択します。" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} />
          <SelectionGroup name="periodIds" label="時代区分" description="主要な時代区分を紐づけます。" options={options.periods} selectedIds={defaultValues?.periodIds ?? []} />
          <SelectionGroup name="religionIds" label="宗教" description="信仰や所属する宗教を選択します。" options={options.religions} selectedIds={defaultValues?.religionIds ?? []} />
          <SelectionGroup name="sectIds" label="宗派" description="宗派や分派が分かる場合のみ追加します。" options={options.sects} selectedIds={defaultValues?.sectIds ?? []} />
        </div>

        <SectionCard
          eyebrow="Career"
          title="役職履歴"
          description="国家または王朝に紐づく役職を、在任期間ごとに整理します。"
          action={(
            <button
              type="button"
              onClick={() => setRoleCount((count) => count + 1)}
              className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--button-foreground)] hover:border-[var(--accent-strong)]"
            >
              役職を追加
            </button>
          )}
        >
          <div className="space-y-5">
            {Array.from({ length: roleCount }).map((_, index) => {
              const role = defaultValues?.roles[index];
              return (
                <div key={index} className="historia-inset rounded-[14px] p-5 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="historia-label">Role {String(index + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 text-xl font-semibold text-[var(--foreground-strong)]">
                        {role?.title || "新しい役職"}
                      </h3>
                    </div>
                    <label className="rounded-[14px] border border-[var(--border)] bg-black/10 px-4 py-2 text-sm text-[var(--muted-strong)]">
                      <input
                        type="checkbox"
                        name={`roles.${index}.isIncumbent`}
                        defaultChecked={role?.isIncumbent ?? false}
                        className="mr-2"
                      />
                      現職
                    </label>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-2">
                    <Field label="役職名">
                      <input
                        name={`roles.${index}.title`}
                        defaultValue={role?.title ?? ""}
                        className={inputClassName}
                      />
                    </Field>
                    <Field label="国家">
                      <select
                        name={`roles.${index}.polityId`}
                        defaultValue={role?.polityId ?? ""}
                        className={inputClassName}
                      >
                        <option value="">未設定</option>
                        {options.polities.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="王朝" className="lg:col-span-2">
                      <select
                        name={`roles.${index}.dynastyId`}
                        defaultValue={role?.dynastyId ?? ""}
                        className={inputClassName}
                      >
                        <option value="">未設定</option>
                        {options.dynasties.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.name}
                          </option>
                        ))}
                      </select>
                    </Field>
                  </div>

                  <div className="mt-5">
                    <div className="grid gap-6 xl:grid-cols-2">
                      <TimeExpressionInputs
                        prefix={`roles.${index}.fromTime`}
                        label="開始年"
                        defaultValue={role?.fromTimeExpression}
                        includePrecision={false}
                        includeDisplayLabel={false}
                        includeEndYear={false}
                      />
                      <TimeExpressionInputs
                        prefix={`roles.${index}.toTime`}
                        label="終了年"
                        defaultValue={role?.toTimeExpression}
                        includePrecision={false}
                        includeDisplayLabel={false}
                        includeEndYear={false}
                        startYearLabel="終了年"
                      />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Field label="メモ">
                      <textarea
                        name={`roles.${index}.note`}
                        defaultValue={role?.note ?? ""}
                        className={`${inputClassName} min-h-24`}
                      />
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Editorial"
          title="補足メモ"
          description="本文化しない編集メモや注釈を記録します。"
        >
          <Field label="メモ">
            <textarea
              name="note"
              defaultValue={defaultValues?.note ?? ""}
              className={`${inputClassName} min-h-40`}
            />
          </Field>
        </SectionCard>

        {!defaultValues?.id && createState.error ? <p className={formErrorClassName}>{createState.error}</p> : null}

        <div className="flex justify-end gap-3">
          {!defaultValues?.id ? (
            <button
              type="submit"
              name="intent"
              value="create-and-continue"
              className={secondaryButtonClassName}
            >
              続けて作成
            </button>
          ) : null}
          <button
            type="submit"
            className="rounded-[14px] border border-[var(--accent-strong)] bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[var(--button-foreground-contrast)] hover:bg-[var(--accent-strong)]"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

function SectionCard({
  eyebrow,
  title,
  description,
  children,
  action
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="historia-card rounded-[14px] p-6 sm:p-8">
      <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="historia-label">{eyebrow}</p>
          <h2 className="mt-2 text-2xl font-semibold text-[var(--foreground-strong)]">{title}</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[var(--muted-strong)]">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({
  label,
  children,
  className,
  required = false
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <label className={["grid gap-2 text-sm text-[var(--muted-strong)]", className].filter(Boolean).join(" ")}>
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function SelectionGroup({
  name,
  label,
  description,
  options,
  selectedIds
}: {
  name: string;
  label: string;
  description: string;
  options: Option[];
  selectedIds: number[];
}) {
  return (
    <fieldset className="historia-card rounded-[14px] p-5 sm:p-6">
      <legend className="px-2 text-base font-semibold text-[var(--foreground-strong)]">{label}</legend>
      <p className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{description}</p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {options.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-4 text-sm text-[var(--muted)]">
            選択肢はまだありません。
          </p>
        ) : (
          options.map((option) => (
            <label
              key={option.id}
              className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--border-strong)]"
            >
              <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} />
              {option.name}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

const inputClassName =
  "rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-2.5 text-[var(--foreground)]";
