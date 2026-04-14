"use client";

import Link from "next/link";
import { useActionState, useDeferredValue, useEffect, useState } from "react";
import { CollapsibleFormSection } from "@/components/forms/collapsible-form-section";
import { RegionCheckboxTree } from "@/components/forms/region-checkbox-tree";
import { formErrorClassName, secondaryButtonClassName } from "@/components/forms/styles";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { initialCreateFormState } from "@/features/actions/create-form-state";
import { createPersonAction, updatePersonAction } from "@/features/person/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string; parentRegionId?: number | null };
type ReligionOption = { id: number; name: string };
type SectOption = { id: number; name: string; religionId: number };
type TagOption = { id: number; name: string };
type RoleOption = { id: number; title: string; polityName?: string | null };
type MatchedPerson = { id: number; name: string };
type PersonRoleDefaultValue = {
  roleId?: number;
  description: string;
  note: string;
  fromTimeExpression?: TimeExpressionInput;
  toTimeExpression?: TimeExpressionInput;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  options: {
    regions: Option[];
    religions: ReligionOption[];
    sects: SectOption[];
    tags: TagOption[];
    roles: RoleOption[];
  };
  defaultValues?: {
    id?: number;
    name: string;
    description: string;
    reading: string;
    aliases: string;
    note: string;
    regionIds: number[];
    religionIds: number[];
    sectIds: number[];
    tagIds: number[];
    birthTimeExpression?: TimeExpressionInput;
    deathTimeExpression?: TimeExpressionInput;
    roles: PersonRoleDefaultValue[];
  };
};

export function PersonForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const [createState, createAction] = useActionState(createPersonAction, initialCreateFormState);
  const action = defaultValues?.id ? updatePersonAction : createAction;
  const [nameInput, setNameInput] = useState(defaultValues?.name ?? "");
  const deferredNameInput = useDeferredValue(nameInput);
  const [matchedPersons, setMatchedPersons] = useState<MatchedPerson[]>([]);
  const [roleRows, setRoleRows] = useState<PersonRoleDefaultValue[]>(
    defaultValues?.roles.length ? defaultValues.roles : [createEmptyRoleValue()]
  );

  useEffect(() => {
    const normalizedName = deferredNameInput.trim();
    if (normalizedName.length === 0) {
      setMatchedPersons([]);
      return;
    }

    const searchParams = new URLSearchParams({ name: normalizedName });
    if (defaultValues?.id) {
      searchParams.set("excludeId", String(defaultValues.id));
    }

    const abortController = new AbortController();

    fetch(`/api/persons/search?${searchParams.toString()}`, { signal: abortController.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`person search failed: ${response.status}`);
        }

        const payload = (await response.json()) as { items: MatchedPerson[] };
        setMatchedPersons(payload.items);
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setMatchedPersons([]);
        }
      });

    return () => abortController.abort();
  }, [defaultValues?.id, deferredNameInput]);

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
        <input type="hidden" name="roleCount" value={roleRows.length} />

        <SectionCard
          eyebrow="Identity"
          title="基礎情報"
          description="人名表記、別名、読みをまとめて記録します。"
        >
          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="氏名" required>
              <input
                name="name"
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                className={inputClassName}
                required
              />
              {matchedPersons.length > 0 ? (
                <p className="text-xs text-[var(--muted-strong)]">
                  登録済みの氏名：
                  {matchedPersons.map((person, index) => (
                    <span key={person.id}>
                      {index > 0 ? "、" : ""}
                      <Link href={`/person/${person.id}`} className="underline underline-offset-4 hover:text-[var(--foreground-strong)]">
                        {person.name}
                      </Link>
                    </span>
                  ))}
                </p>
              ) : null}
            </Field>
            <Field label="説明" className="lg:col-span-2">
              <textarea name="description" defaultValue={defaultValues?.description ?? ""} className={`min-h-28 ${inputClassName}`} />
            </Field>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Field label="別名">
              <input name="aliases" defaultValue={defaultValues?.aliases ?? ""} className={inputClassName} />
            </Field>
            <Field label="読み方">
              <input name="reading" defaultValue={defaultValues?.reading ?? ""} className={inputClassName} />
            </Field>
          </div>
        </SectionCard>

        <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6">
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

        <div className="grid gap-6 md:grid-cols-2">
          <SelectionGroup name="regionIds" label="関連地域" description="人物の活動圏や出自に関わる地域を選択します。" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} collapsible hierarchical />
          <ReligionSectSelectionGroup
            religions={options.religions}
            sects={options.sects}
            selectedReligionIds={defaultValues?.religionIds ?? []}
            selectedSectIds={defaultValues?.sectIds ?? []}
          />
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <SelectionGroup
            name="tagIds"
            label="タグ"
            description="人物に関する分類タグを選択します。"
            options={options.tags}
            selectedIds={defaultValues?.tagIds ?? []}
            collapsible
          />
        </div>

        <RoleLinkSection
          roleOptions={options.roles}
          roleRows={roleRows}
          onAdd={() => setRoleRows((current) => [...current, createEmptyRoleValue()])}
          onRemove={(index) => setRoleRows((current) => current.filter((_, currentIndex) => currentIndex !== index))}
        />

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
  selectedIds,
  collapsible = false,
  hierarchical = false
}: {
  name: string;
  label: string;
  description: string;
  options: Option[];
  selectedIds: number[];
  collapsible?: boolean;
  hierarchical?: boolean;
}) {
  const content = (
    <>
      <p className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">{description}</p>
      <div className="mt-5">
        {options.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-4 text-sm text-[var(--muted)]">
            選択肢はまだありません。
          </p>
        ) : hierarchical ? (
          <RegionCheckboxTree
            name={name}
            options={options}
            selectedIds={selectedIds}
            itemClassName="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--border-strong)]"
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {options.map((option) => (
              <label
                key={option.id}
                className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--foreground)] hover:border-[var(--border-strong)]"
              >
                <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} />
                {option.name}
              </label>
            ))}
          </div>
        )}
      </div>
    </>
  );

  if (collapsible) {
    return (
      <section className="historia-card rounded-[14px] p-5 sm:p-6">
        <CollapsibleFormSection title={label} defaultOpen={selectedIds.length > 0}>
          {content}
        </CollapsibleFormSection>
      </section>
    );
  }

  return (
    <fieldset className="historia-card rounded-[14px] p-5 sm:p-6">
      <legend className="px-2 text-base font-semibold text-[var(--foreground-strong)]">{label}</legend>
      {content}
    </fieldset>
  );
}

function ReligionSectSelectionGroup({
  religions,
  sects,
  selectedReligionIds,
  selectedSectIds
}: {
  religions: ReligionOption[];
  sects: SectOption[];
  selectedReligionIds: number[];
  selectedSectIds: number[];
}) {
  const defaultOpen = selectedReligionIds.length > 0 || selectedSectIds.length > 0;

  return (
    <section className="historia-card rounded-[14px] p-5 sm:p-6">
      <CollapsibleFormSection title="宗教" defaultOpen={defaultOpen}>
        <p className="mt-2 text-sm leading-7 text-[var(--muted-strong)]">信仰や所属する宗教を選択し、分かる場合のみ対応する宗派を追加します。</p>
        <div className="mt-5">
          {religions.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-[var(--border-strong)] px-4 py-4 text-sm text-[var(--muted)]">
              選択肢はまだありません。
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {religions.map((religion) => {
                const relatedSects = sects.filter((sect) => sect.religionId === religion.id);
                const hasSelectedChild = relatedSects.some((sect) => selectedSectIds.includes(sect.id));
                const isReligionSelected = selectedReligionIds.includes(religion.id);

                return (
                  <details
                    key={religion.id}
                    open={isReligionSelected || hasSelectedChild}
                    className="group rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3"
                  >
                    <summary className="cursor-pointer list-none text-sm text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
                      <span className="inline-flex items-center gap-3">
                        {relatedSects.length > 0 ? (
                          <>
                            <span className="text-[var(--muted)] group-open:hidden">▶</span>
                            <span className="hidden text-[var(--muted)] group-open:inline">▼</span>
                          </>
                        ) : (
                          <span className="w-3" />
                        )}
                        <input
                          type="checkbox"
                          name="religionIds"
                          value={religion.id}
                          defaultChecked={selectedReligionIds.includes(religion.id)}
                          onClick={(event) => event.stopPropagation()}
                        />
                        {religion.name}
                      </span>
                    </summary>
                    {relatedSects.length > 0 ? (
                      <div className="mt-3 ml-6 border-l border-[var(--border)] pl-4">
                        <div className="grid gap-2">
                          {relatedSects.map((sect) => (
                            <label key={sect.id} className="flex items-center gap-3 text-sm text-[var(--muted-strong)]">
                              <input type="checkbox" name="sectIds" value={sect.id} defaultChecked={selectedSectIds.includes(sect.id)} />
                              {sect.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </details>
                );
              })}
            </div>
          )}
        </div>
      </CollapsibleFormSection>
    </section>
  );
}

function RoleLinkSection({
  roleOptions,
  roleRows,
  onAdd,
  onRemove
}: {
  roleOptions: RoleOption[];
  roleRows: PersonRoleDefaultValue[];
  onAdd: () => void;
  onRemove: (index: number) => void;
}) {
  return (
    <SectionCard
      eyebrow="Role links"
      title="役職"
      description="既存の役職を人物へ複数紐づけできます。人物ごとの説明や期間もここで記録します。"
      action={(
        <button type="button" onClick={onAdd} className={secondaryButtonClassName}>
          役職を追加
        </button>
      )}
    >
      <div className="space-y-5">
        {roleRows.map((roleRow, index) => (
          <RoleLinkCard
            key={`${roleRow.roleId ?? "new"}-${index}`}
            index={index}
            value={roleRow}
            roleOptions={roleOptions}
            removable={roleRows.length > 1}
            onRemove={() => onRemove(index)}
          />
        ))}
      </div>
    </SectionCard>
  );
}

function RoleLinkCard({
  index,
  value,
  roleOptions,
  removable,
  onRemove
}: {
  index: number;
  value: PersonRoleDefaultValue;
  roleOptions: RoleOption[];
  removable: boolean;
  onRemove: () => void;
}) {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = deferredQuery.trim().toLocaleLowerCase("ja-JP");
  const filteredRoleOptions = roleOptions.filter((role) =>
    formatRoleOptionLabel(role).toLocaleLowerCase("ja-JP").includes(normalizedQuery)
  );

  return (
    <div className="min-w-0 rounded-2xl border border-[var(--border)] p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-[var(--foreground-strong)]">役職 {index + 1}</p>
        {removable ? (
          <button type="button" onClick={onRemove} className={secondaryButtonClassName}>
            削除
          </button>
        ) : null}
      </div>

      <div className="mt-5 grid min-w-0 gap-4">
        <Field label="役職" required>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={inputClassName}
            placeholder="役職名で絞り込み"
          />
          <select
            name={`roles.${index}.roleId`}
            defaultValue={value.roleId?.toString() ?? ""}
            className={inputClassName}
          >
            <option value="">選択してください</option>
            {filteredRoleOptions.map((role) => (
              <option key={role.id} value={role.id}>
                {formatRoleOptionLabel(role)}
              </option>
            ))}
          </select>
        </Field>

        <Field label="説明">
          <textarea
            name={`roles.${index}.description`}
            defaultValue={value.description}
            className={`min-h-24 ${inputClassName}`}
          />
        </Field>

        <div className="grid min-w-0 gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <TimeExpressionInputs
              prefix={`roles.${index}.fromTime`}
              label="開始年"
              defaultValue={value.fromTimeExpression}
              includePrecision={false}
              includeDisplayLabel={false}
              includeEndYear={false}
            />
          </div>
          <div className="min-w-0">
            <TimeExpressionInputs
              prefix={`roles.${index}.toTime`}
              label="終了年"
              defaultValue={value.toTimeExpression}
              includePrecision={false}
              includeDisplayLabel={false}
              includeEndYear={false}
            />
          </div>
        </div>

        <Field label="メモ">
          <textarea
            name={`roles.${index}.note`}
            defaultValue={value.note}
            className={`min-h-24 ${inputClassName}`}
          />
        </Field>
      </div>
    </div>
  );
}

const inputClassName =
  "min-w-0 w-full rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-2.5 text-[var(--foreground)]";

function createEmptyRoleValue(): PersonRoleDefaultValue {
  return {
    roleId: undefined,
    description: "",
    note: ""
  };
}

function formatRoleOptionLabel(role: RoleOption) {
  return role.polityName ? `${role.title}（${role.polityName}）` : role.title;
}
