import { createCitationAction, updateCitationAction } from "@/features/sources/actions";
import type { getCitationFormView } from "@/server/services/sources";

type CitationFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  view: ReturnType<typeof getCitationFormView>;
};

export function CitationForm({ title, description, submitLabel, view }: CitationFormProps) {
  const action = view.citation ? updateCitationAction : createCitationAction;

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {view.citation ? <input type="hidden" name="id" value={view.citation.id} /> : null}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>出典</span>
            <select
              name="sourceId"
              defaultValue={String(view.defaults.sourceId ?? "")}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            >
              <option value="">選択してください</option>
              {view.sources.map((source) => (
                <option key={source.id} value={source.id}>
                  {source.title}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span>対象種別</span>
            <select
              name="targetType"
              defaultValue={String(view.defaults.targetType ?? "event")}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            >
              {view.options.targetTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span>対象 ID</span>
            <input
              name="targetId"
              type="number"
              min={1}
              defaultValue={view.defaults.targetId ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>位置情報</span>
            <input
              name="locator"
              defaultValue={view.citation?.locator ?? ""}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
              placeholder="ページ番号、章、節など"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>引用メモ</span>
            <textarea
              name="quote"
              defaultValue={view.citation?.quote ?? ""}
              rows={4}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm md:col-span-2">
            <span>補足</span>
            <textarea
              name="note"
              defaultValue={view.citation?.note ?? ""}
              rows={4}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
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
