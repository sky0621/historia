import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSectAction } from "@/features/religions/actions";
import { getSectDetailView } from "@/server/services/religions";

export default async function SectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getSectDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Sect</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.sect.name}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">期間: {view.timeLabel}</p>
        </div>
        <div className="flex gap-3">
          <Link href={`/sects/${view.sect.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteSectAction}>
            <input type="hidden" name="id" value={view.sect.id} />
            <button type="submit" className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-medium text-[var(--muted)]">所属宗教</dt>
            <dd className="mt-1">
              {view.religion ? <Link href={`/religions/${view.religion.id}`} className="underline-offset-4 hover:underline">{view.religion.name}</Link> : "不明"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">開祖</dt>
            <dd className="mt-1">{view.founders.map((founder) => founder.name).join(", ") || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">関連地域</dt>
            <dd className="mt-1">{view.regions.map((region) => region.name).join(", ") || "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">説明</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.sect.description ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">メモ</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.sect.note ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
