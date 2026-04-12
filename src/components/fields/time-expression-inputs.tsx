import { eraOptions } from "@/lib/master-labels";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Props = {
  prefix: string;
  label: string;
  defaultValue?: TimeExpressionInput;
  includePrecision?: boolean;
  includeDisplayLabel?: boolean;
  includeEndYear?: boolean;
  startYearLabel?: string;
  calendarEraValue?: string;
  onCalendarEraChange?: (value: string) => void;
  startYearValue?: string;
  onStartYearChange?: (value: string) => void;
};

export function TimeExpressionInputs({
  prefix,
  label,
  defaultValue,
  includePrecision = true,
  includeDisplayLabel = true,
  includeEndYear = true,
  startYearLabel = "開始年",
  calendarEraValue,
  onCalendarEraChange,
  startYearValue,
  onStartYearChange
}: Props) {
  return (
    <fieldset className="historia-inset min-w-0 w-full rounded-[14px] p-5 sm:p-6">
      <legend className="px-2 text-sm font-semibold text-[var(--muted-strong)]">{label}</legend>
      <div className="mt-3 space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">暦</span>
            <select
              name={`${prefix}.calendarEra`}
              value={calendarEraValue}
              defaultValue={calendarEraValue == null ? defaultValue?.calendarEra ?? "CE" : undefined}
              onChange={onCalendarEraChange ? (event) => onCalendarEraChange(event.target.value) : undefined}
              className="w-[calc(4em+1.5rem)] rounded-2xl border border-[var(--border)] bg-black/10 px-2 py-2.5 text-[var(--foreground)]"
            >
              {eraOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
            <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">{startYearLabel}</span>
            <input
              name={`${prefix}.startYear`}
              value={startYearValue}
              defaultValue={startYearValue == null ? defaultValue?.startYear ?? "" : undefined}
              onChange={onStartYearChange ? (event) => onStartYearChange(event.target.value) : undefined}
              className="w-[calc(4ch+1.5rem)] rounded-2xl border border-[var(--border)] bg-black/10 px-2 py-2.5 text-[var(--foreground)]"
              inputMode="numeric"
            />
          </label>
          <label className="flex h-[52px] max-w-full items-center gap-3 whitespace-nowrap rounded-2xl border border-[var(--border)] bg-black/10 px-4 py-3 text-sm text-[var(--muted-strong)]">
            <input
              type="checkbox"
              name={`${prefix}.isApproximate`}
              defaultChecked={defaultValue?.isApproximate ?? false}
            />
            推定値
          </label>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {includePrecision ? (
            <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">精度</span>
              <input
                name={`${prefix}.precision`}
                defaultValue={defaultValue?.precision ?? "year"}
                className="rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-2.5 text-[var(--foreground)]"
              />
            </label>
          ) : null}
          {includeEndYear ? (
            <label className="grid gap-2 text-sm text-[var(--muted-strong)]">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">終了年</span>
              <input
                name={`${prefix}.endYear`}
                defaultValue={defaultValue?.endYear ?? ""}
                className="rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-2.5 text-[var(--foreground)]"
                inputMode="numeric"
              />
            </label>
          ) : null}
          {includeDisplayLabel ? (
            <label className="grid gap-2 text-sm text-[var(--muted-strong)] md:col-span-2">
              <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">表示ラベル</span>
              <input
                name={`${prefix}.displayLabel`}
                defaultValue={defaultValue?.displayLabel ?? ""}
                className="rounded-2xl border border-[var(--border)] bg-black/10 px-3 py-2.5 text-[var(--foreground)]"
                placeholder="794年-1185年"
              />
            </label>
          ) : null}
        </div>
      </div>
    </fieldset>
  );
}
