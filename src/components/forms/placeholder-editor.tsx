export function PlaceholderEditor({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      <div className="mt-8 rounded-[24px] border border-dashed border-[var(--border)] bg-white/70 p-8 text-sm text-[var(--muted)]">
        共通フォーム基盤は作成済みです。このドメイン専用フォームは後続スプリントで追加します。
      </div>
    </section>
  );
}
