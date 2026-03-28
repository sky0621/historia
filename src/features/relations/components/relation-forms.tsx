import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import {
  createDynastySuccessionAction,
  createHistoricalPeriodRelationAction,
  createPolityTransitionAction,
  createRegionRelationAction,
  updateDynastySuccessionAction,
  updateHistoricalPeriodRelationAction,
  updatePolityTransitionAction,
  updateRegionRelationAction
} from "@/features/relations/actions";
import {
  historicalPeriodRelationTypeOptions,
  polityTransitionTypeOptions,
  regionRelationTypeOptions
} from "@/lib/master-labels";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
type Option = { id: number; name: string };

export function PolityTransitionForm({
  title,
  description,
  submitLabel,
  polityOptions,
  defaultValues
}: {
  title: string;
  description: string;
  submitLabel: string;
  polityOptions: Option[];
  defaultValues?: {
    id?: number;
    predecessorPolityId: number;
    successorPolityId: number;
    transitionType: "renamed" | "succeeded" | "merged" | "split" | "annexed" | "absorbed" | "restored" | "reorganized" | "other";
  };
}) {
  const action = defaultValues?.id ? updatePolityTransitionAction : createPolityTransitionAction;

  return (
    <RelationFormShell title={title} description={description}>
      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField name="predecessorPolityId" label="前国家" options={polityOptions} defaultValue={defaultValues?.predecessorPolityId} />
          <SelectField name="successorPolityId" label="後国家" options={polityOptions} defaultValue={defaultValues?.successorPolityId} />
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>変遷種別</span>
            <select name="transitionType" defaultValue={defaultValues?.transitionType ?? "succeeded"} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required>
              {polityTransitionTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <SubmitButton label={submitLabel} />
      </form>
    </RelationFormShell>
  );
}

export function DynastySuccessionForm({
  title,
  description,
  submitLabel,
  polityOptions,
  dynastyOptions,
  defaultValues
}: {
  title: string;
  description: string;
  submitLabel: string;
  polityOptions: Option[];
  dynastyOptions: Option[];
  defaultValues?: {
    id?: number;
    polityId: number;
    predecessorDynastyId: number;
    successorDynastyId: number;
  };
}) {
  const action = defaultValues?.id ? updateDynastySuccessionAction : createDynastySuccessionAction;

  return (
    <RelationFormShell title={title} description={description}>
      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField name="polityId" label="国家" options={polityOptions} defaultValue={defaultValues?.polityId} />
          <div />
          <SelectField name="predecessorDynastyId" label="前王朝" options={dynastyOptions} defaultValue={defaultValues?.predecessorDynastyId} />
          <SelectField name="successorDynastyId" label="後王朝" options={dynastyOptions} defaultValue={defaultValues?.successorDynastyId} />
        </div>
        <SubmitButton label={submitLabel} />
      </form>
    </RelationFormShell>
  );
}

export function RegionRelationForm({
  title,
  description,
  submitLabel,
  regionOptions,
  defaultValues
}: {
  title: string;
  description: string;
  submitLabel: string;
  regionOptions: Option[];
  defaultValues?: {
    id?: number;
    fromRegionId: number;
    toRegionId: number;
    relationType: "adjacent" | "cultural_area" | "trade_zone" | "influences" | "related" | "equivalent";
  };
}) {
  const action = defaultValues?.id ? updateRegionRelationAction : createRegionRelationAction;

  return (
    <RelationFormShell title={title} description={description}>
      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField name="fromRegionId" label="起点地域" options={regionOptions} defaultValue={defaultValues?.fromRegionId} />
          <SelectField name="toRegionId" label="終点地域" options={regionOptions} defaultValue={defaultValues?.toRegionId} />
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>関係種別</span>
            <select name="relationType" defaultValue={defaultValues?.relationType ?? "related"} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required>
              {regionRelationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <SubmitButton label={submitLabel} />
      </form>
    </RelationFormShell>
  );
}

export function HistoricalPeriodRelationForm({
  title,
  description,
  submitLabel,
  periodOptions,
  defaultValues
}: {
  title: string;
  description: string;
  submitLabel: string;
  periodOptions: Option[];
  defaultValues?: {
    id?: number;
    fromPeriodId: number;
    toPeriodId: number;
    relationType: "precedes" | "succeeds" | "overlaps" | "includes" | "included_in";
    note: string;
  };
}) {
  const action = defaultValues?.id ? updateHistoricalPeriodRelationAction : createHistoricalPeriodRelationAction;

  return (
    <RelationFormShell title={title} description={description}>
      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5 md:grid-cols-2">
          <SelectField name="fromPeriodId" label="起点時代区分" options={periodOptions} defaultValue={defaultValues?.fromPeriodId} />
          <SelectField name="toPeriodId" label="終点時代区分" options={periodOptions} defaultValue={defaultValues?.toPeriodId} />
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>関係種別</span>
            <select name="relationType" defaultValue={defaultValues?.relationType ?? "succeeds"} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required>
              {historicalPeriodRelationTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TextAreaField name="note" label="メモ" defaultValue={defaultValues?.note} />
        <SubmitButton label={submitLabel} />
      </form>
    </RelationFormShell>
  );
}

function RelationFormShell({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function SelectField({ name, label, options, defaultValue }: { name: string; label: string; options: Option[]; defaultValue?: number }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required>
        <option value="" disabled>
          選択してください
        </option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextAreaField({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="grid gap-2 text-sm">
      <span>{label}</span>
      <textarea name={name} defaultValue={defaultValue ?? ""} rows={5} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
    </label>
  );
}

function SubmitButton({ label }: { label: string }) {
  return (
    <div className="flex justify-end">
      <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
        {label}
      </button>
    </div>
  );
}
