import { createTagAction, updateTagAction } from "@/features/tags/actions";

type TagFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: {
    id?: number;
    name: string;
  };
};

export function TagForm({ title, description, submitLabel, defaultValues }: TagFormProps) {
  const action = defaultValues?.id ? updateTagAction : createTagAction;

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
        </div>

        <div className="mt-8 flex justify-end">
          <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}
