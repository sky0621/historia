import { createRegionAction, updateRegionAction } from "@/features/regions/actions";

type RegionOption = {
  id: number;
  name: string;
};

type RegionFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  parentOptions: RegionOption[];
  defaultValues?: {
    id?: number;
    name: string;
    parentRegionId?: number | null;
    aliases: string;
    description: string;
    note: string;
  };
};

export function RegionForm({
  title,
  description,
  submitLabel,
  parentOptions,
  defaultValues
}: RegionFormProps) {
  const action = defaultValues?.id ? updateRegionAction : createRegionAction;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <div className="grid gap-5">
          <label className="grid gap-2 text-sm">
            <span>名称</span>
            <input
              name="name"
              defaultValue={defaultValues?.name ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>親地域</span>
            <select
              name="parentRegionId"
              defaultValue={defaultValues?.parentRegionId ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            >
              <option value="">未設定</option>
              {parentOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span>別名</span>
            <input
              name="aliases"
              defaultValue={defaultValues?.aliases ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              placeholder="近畿, 畿内"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>説明</span>
            <textarea
              name="description"
              defaultValue={defaultValues?.description ?? ""}
              className="min-h-28 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span>メモ</span>
            <textarea
              name="note"
              defaultValue={defaultValues?.note ?? ""}
              className="min-h-28 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
          >
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
