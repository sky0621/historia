import Link from "next/link";

const links = [
  {
    href: "/bootstrap/listing-sample",
    title: "プレースホルダ一覧",
    description: "Sprint 1 で想定していた共通一覧骨格を確認するページ。"
  },
  {
    href: "/bootstrap/form-sample",
    title: "プレースホルダ作成",
    description: "Sprint 1 で想定していた共通フォーム骨格を確認するページ。"
  },
  {
    href: "/bootstrap/time-expression-lab",
    title: "TimeExpression確認",
    description: "型・表示・保存形式の対応を単体で確認するページ。"
  }
] as const;

export default function BootstrapIndexPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">Bootstrap Samples</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          `plan/sprint-1-bootstrap-spec.md` に書かれていた Sprint 1 用の確認ページを、現在の実装とは独立したサンプル導線として残します。
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 shadow-sm transition hover:border-[var(--accent)]"
          >
            <h2 className="text-lg font-semibold">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
