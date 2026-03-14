import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Props = {
  prefix: string;
  label: string;
  defaultValue?: TimeExpressionInput;
};

export function TimeExpressionInputs({ prefix, label, defaultValue }: Props) {
  return (
    <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
      <legend className="px-2 text-sm font-semibold text-[var(--muted)]">{label}</legend>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span>暦</span>
          <select
            name={`${prefix}.calendarEra`}
            defaultValue={defaultValue?.calendarEra ?? "CE"}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
          >
            <option value="CE">CE</option>
            <option value="BCE">BCE</option>
          </select>
        </label>
        <label className="grid gap-2 text-sm">
          <span>精度</span>
          <input
            name={`${prefix}.precision`}
            defaultValue={defaultValue?.precision ?? "year"}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>開始年</span>
          <input
            name={`${prefix}.startYear`}
            defaultValue={defaultValue?.startYear ?? ""}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            inputMode="numeric"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span>終了年</span>
          <input
            name={`${prefix}.endYear`}
            defaultValue={defaultValue?.endYear ?? ""}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            inputMode="numeric"
          />
        </label>
        <label className="grid gap-2 text-sm md:col-span-2">
          <span>表示ラベル</span>
          <input
            name={`${prefix}.displayLabel`}
            defaultValue={defaultValue?.displayLabel ?? ""}
            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            placeholder="794年-1185年"
          />
        </label>
        <label className="flex items-center gap-3 text-sm md:col-span-2">
          <input
            type="checkbox"
            name={`${prefix}.isApproximate`}
            defaultChecked={defaultValue?.isApproximate ?? false}
          />
          推定値
        </label>
      </div>
    </fieldset>
  );
}
