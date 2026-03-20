import { createSourceAction, updateSourceAction } from "@/features/sources/actions";

type SourceFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  defaultValues?: {
    id?: number;
    title: string;
    author?: string | null;
    publisher?: string | null;
    publishedAtLabel?: string | null;
    url?: string | null;
    note?: string | null;
  };
};

export function SourceForm({ title, description, submitLabel, defaultValues }: SourceFormProps) {
  const action = defaultValues?.id ? updateSourceAction : createSourceAction;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>タイトル</span>
            <input
              name="title"
              defaultValue={defaultValues?.title ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span>著者</span>
            <input name="author" defaultValue={defaultValues?.author ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>出版社 / 媒体</span>
            <input name="publisher" defaultValue={defaultValues?.publisher ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>刊行情報</span>
            <input name="publishedAtLabel" defaultValue={defaultValues?.publishedAtLabel ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm">
            <span>URL</span>
            <input name="url" defaultValue={defaultValues?.url ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>メモ</span>
            <textarea name="note" defaultValue={defaultValues?.note ?? ""} rows={6} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
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
