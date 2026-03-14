import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePersonAction } from "@/features/people/actions";
import { getPersonDetailView } from "@/server/services/people";

export default async function PersonDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getPersonDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Person</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.person.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">生没年: {view.lifeLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/people/${view.person.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deletePersonAction}>
            <input type="hidden" name="id" value={view.person.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">基本情報</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted)]">別名</dt>
              <dd className="mt-1">{view.person.aliases ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">関連地域</dt>
              <dd className="mt-1">{view.regions.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">宗教</dt>
              <dd className="mt-1">{view.religions.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">宗派</dt>
              <dd className="mt-1">{view.sects.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">時代区分</dt>
              <dd className="mt-1">{view.periods.map((item) => item.name).join(", ") || "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.person.note ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">役職履歴</h2>
          <div className="mt-4 space-y-3">
            {view.roles.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">役職はまだありません。</p>
            ) : (
              view.roles.map((role) => (
                <div key={role.id} className="rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
                  <div className="font-medium">{role.title}</div>
                  <div className="mt-1 text-[var(--muted)]">
                    {role.dynastyName ?? role.polityName ?? "所属なし"} / {role.timeLabel}
                  </div>
                  {role.note ? <div className="mt-2 whitespace-pre-wrap text-[var(--muted)]">{role.note}</div> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
