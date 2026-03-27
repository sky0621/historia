import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createReligionAction, updateReligionAction } from "@/features/religions/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string };

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  regionOptions: Option[];
  founderOptions: Option[];
  defaultValues?: {
    id?: number;
    name: string;
    description: string;
    note: string;
    regionIds: number[];
    founderIds: number[];
    fromTimeExpression?: TimeExpressionInput;
    toTimeExpression?: TimeExpressionInput;
  };
};

export function ReligionForm({
  title,
  description,
  submitLabel,
  regionOptions,
  founderOptions,
  defaultValues
}: Props) {
  const action = defaultValues?.id ? updateReligionAction : createReligionAction;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm">
            <span>名称</span>
            <input name="name" defaultValue={defaultValues?.name ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>説明</span>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} className="min-h-28 rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs
            prefix="fromTime"
            label="開始年"
            defaultValue={defaultValues?.fromTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
          />
          <TimeExpressionInputs
            prefix="toTime"
            label="終了年"
            defaultValue={defaultValues?.toTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
          />
        </div>

        <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--muted)]">関連地域</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {regionOptions.map((region) => (
              <label key={region.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                <input type="checkbox" name="regionIds" value={region.id} defaultChecked={defaultValues?.regionIds.includes(region.id) ?? false} />
                {region.name}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <legend className="px-2 text-sm font-semibold text-[var(--muted)]">開祖</legend>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {founderOptions.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">人物が未登録のため、開祖は後から追加できます。</p>
            ) : (
              founderOptions.map((person) => (
                <label key={person.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                  <input type="checkbox" name="founderIds" value={person.id} defaultChecked={defaultValues?.founderIds.includes(person.id) ?? false} />
                  {person.name}
                </label>
              ))
            )}
          </div>
        </fieldset>

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
