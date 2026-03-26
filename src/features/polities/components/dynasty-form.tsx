import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createDynastyAction, updateDynastyAction } from "@/features/polities/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type RegionOption = {
  id: number;
  name: string;
};

type PolityOption = {
  id: number;
  name: string;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  polityOptions: PolityOption[];
  regionOptions: RegionOption[];
  defaultValues?: {
    id?: number;
    polityIds: number[];
    name: string;
    note: string;
    regionIds: number[];
    timeExpression?: TimeExpressionInput;
  };
};

export function DynastyForm({
  title,
  description,
  submitLabel,
  polityOptions,
  regionOptions,
  defaultValues
}: Props) {
  const action = defaultValues?.id ? updateDynastyAction : createDynastyAction;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

        <div className="grid gap-5">
          <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
            <legend className="px-2 text-sm font-semibold text-[var(--muted)]">関連国家</legend>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {polityOptions.map((polity) => (
                <label key={polity.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                  <input
                    type="checkbox"
                    name="polityIds"
                    value={polity.id}
                    defaultChecked={defaultValues?.polityIds.includes(polity.id) ?? false}
                  />
                  {polity.name}
                </label>
              ))}
            </div>
          </fieldset>

          <label className="grid gap-2 text-sm">
            <span>名称</span>
            <input
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            />
          </label>
        </div>

        <TimeExpressionInputs prefix="time" label="開始・終了年" defaultValue={defaultValues?.timeExpression} />

        <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--muted)]">関連地域</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {regionOptions.map((region) => (
              <label key={region.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  name="regionIds"
                  value={region.id}
                  defaultChecked={defaultValues?.regionIds.includes(region.id) ?? false}
                />
                {region.name}
              </label>
            ))}
          </div>
        </fieldset>

        <label className="grid gap-2 text-sm">
          <span>メモ</span>
          <textarea
            name="note"
            defaultValue={defaultValues?.note ?? ""}
            className="min-h-32 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
          />
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
