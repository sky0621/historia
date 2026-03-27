"use client";

import { useFormContext } from "react-hook-form";
import { eraOptions } from "@/lib/master-labels";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Props = {
  name: string;
  label: string;
};

export function TimeExpressionField({ name, label }: Props) {
  const { register } = useFormContext<Record<string, TimeExpressionInput>>();

  return (
    <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
      <legend className="px-2 text-sm font-semibold text-[var(--muted)]">{label}</legend>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>暦</span>
          <select
            {...register(`${name}.calendarEra`)}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue="CE"
          >
            {eraOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span>精度</span>
          <input
            {...register(`${name}.precision`)}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            defaultValue="year"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>開始年</span>
          <input
            {...register(`${name}.startYear`)}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            inputMode="numeric"
            placeholder="794"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>終了年</span>
          <input
            {...register(`${name}.endYear`)}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            inputMode="numeric"
            placeholder="1185"
          />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span>表示ラベル</span>
          <input
            {...register(`${name}.displayLabel`)}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="794年-1185年"
          />
        </label>
        <label className="flex items-center gap-3 text-sm md:col-span-2">
          <input type="checkbox" {...register(`${name}.isApproximate`)} />
          推定値
        </label>
      </div>
    </fieldset>
  );
}
