"use client";

import { useState } from "react";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createEventAction, updateEventAction } from "@/features/events/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string };
type RelationDefault = { toEventId: number; relationType: "before" | "after" | "cause" | "related" };

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  options: {
    people: Option[];
    polities: Option[];
    dynasties: Option[];
    periods: Option[];
    religions: Option[];
    sects: Option[];
    regions: Option[];
    events: Option[];
  };
  defaultValues?: {
    id?: number;
    title: string;
    description: string;
    eventType: "general" | "war" | "rebellion" | "civil_war";
    timeExpression?: TimeExpressionInput;
    startTimeExpression?: TimeExpressionInput;
    endTimeExpression?: TimeExpressionInput;
    personIds: number[];
    polityIds: number[];
    dynastyIds: number[];
    periodIds: number[];
    religionIds: number[];
    sectIds: number[];
    regionIds: number[];
    relations: RelationDefault[];
  };
};

export function EventForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const action = defaultValues?.id ? updateEventAction : createEventAction;
  const [relationCount, setRelationCount] = useState(Math.max(defaultValues?.relations.length ?? 0, 1));

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <input type="hidden" name="relationCount" value={relationCount} />

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm">
            <span>タイトル</span>
            <input name="title" defaultValue={defaultValues?.title ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>種別</span>
            <select name="eventType" defaultValue={defaultValues?.eventType ?? "general"} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2">
              <option value="general">general</option>
              <option value="war">war</option>
              <option value="rebellion">rebellion</option>
              <option value="civil_war">civil_war</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span>説明</span>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} className="min-h-36 rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
        </div>

        <TimeExpressionInputs prefix="time" label="時点または全体期間" defaultValue={defaultValues?.timeExpression} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs prefix="startTime" label="開始年" defaultValue={defaultValues?.startTimeExpression} />
          <TimeExpressionInputs prefix="endTime" label="終了年" defaultValue={defaultValues?.endTimeExpression} />
        </div>

        <SelectionGroup name="personIds" label="人物" options={options.people} selectedIds={defaultValues?.personIds ?? []} />
        <SelectionGroup name="polityIds" label="国家" options={options.polities} selectedIds={defaultValues?.polityIds ?? []} />
        <SelectionGroup name="dynastyIds" label="王朝" options={options.dynasties} selectedIds={defaultValues?.dynastyIds ?? []} />
        <SelectionGroup name="periodIds" label="時代区分" options={options.periods} selectedIds={defaultValues?.periodIds ?? []} />
        <SelectionGroup name="religionIds" label="宗教" options={options.religions} selectedIds={defaultValues?.religionIds ?? []} />
        <SelectionGroup name="sectIds" label="宗派" options={options.sects} selectedIds={defaultValues?.sectIds ?? []} />
        <SelectionGroup name="regionIds" label="地域" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} />

        <section className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--muted)]">関連イベント</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">前後関係や因果関係を登録します。</p>
            </div>
            <button
              type="button"
              onClick={() => setRelationCount((count) => count + 1)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              関係を追加
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: relationCount }).map((_, index) => {
              const relation = defaultValues?.relations[index];
              return (
                <div key={index} className="grid gap-4 rounded-2xl border border-[var(--border)] p-4 lg:grid-cols-[1fr,200px]">
                  <label className="grid gap-2 text-sm">
                    <span>対象イベント</span>
                    <select
                      name={`relations.${index}.toEventId`}
                      defaultValue={relation?.toEventId ?? ""}
                      className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    >
                      <option value="">未設定</option>
                      {options.events.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>関係種別</span>
                    <select
                      name={`relations.${index}.relationType`}
                      defaultValue={relation?.relationType ?? "related"}
                      className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    >
                      <option value="before">before</option>
                      <option value="after">after</option>
                      <option value="cause">cause</option>
                      <option value="related">related</option>
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

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
