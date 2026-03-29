import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { deleteCitationAction, deleteSourceAction } from "@/features/sources/actions";
import { getSourceView } from "@/server/services/sources";

export const metadata: Metadata = { title: "source" };

export default async function SourceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getSourceView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Source</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.source.title}</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            {view.source.author ?? "著者未設定"} / {view.source.publishedAtLabel ?? view.source.publisher ?? "刊行情報未設定"}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/sources/${view.source.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <Link href={`/citations/new?sourceId=${view.source.id}`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            引用を追加
          </Link>
          <form action={deleteSourceAction}>
            <input type="hidden" name="id" value={view.source.id} />
            <ConfirmSubmitButton className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr,1.1fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">書誌情報</h2>
          <dl className="mt-6 grid gap-4 text-sm">
            <div>
              <dt className="font-medium text-[var(--muted)]">著者</dt>
              <dd className="mt-1">{view.source.author ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">出版社 / 媒体</dt>
              <dd className="mt-1">{view.source.publisher ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">刊行情報</dt>
              <dd className="mt-1">{view.source.publishedAtLabel ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">URL</dt>
              <dd className="mt-1 break-all">{view.source.url ?? "-"}</dd>
            </div>
            <div>
              <dt className="font-medium text-[var(--muted)]">メモ</dt>
              <dd className="mt-1 whitespace-pre-wrap">{view.source.note ?? "-"}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">引用</h2>
            <Link href={`/citations/new?sourceId=${view.source.id}`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
              追加
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {view.citations.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">引用はまだありません。</p>
            ) : (
              view.citations.map((citation) => (
                <article key={citation.id} className="rounded-3xl border border-[var(--border)] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={citation.target.href} className="text-sm font-medium underline-offset-4 hover:underline">
                      {citation.target.label}
                    </Link>
                    <div className="flex gap-2">
                      <Link href={`/citations/${citation.id}/edit`} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs">
                        編集
                      </Link>
                      <form action={deleteCitationAction}>
                        <input type="hidden" name="id" value={citation.id} />
                        <input type="hidden" name="sourceId" value={view.source.id} />
                        <input type="hidden" name="targetType" value={citation.targetType} />
                        <input type="hidden" name="targetId" value={citation.targetId} />
                        <ConfirmSubmitButton className="rounded-full border border-red-300 px-3 py-1.5 text-xs text-red-700">
                          削除
                        </ConfirmSubmitButton>
                      </form>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">対象: {citation.targetType} #{citation.targetId}</p>
                  {citation.locator ? <p className="mt-2 text-sm">位置: {citation.locator}</p> : null}
                  {citation.quote ? <p className="mt-2 whitespace-pre-wrap text-sm">{citation.quote}</p> : null}
                  {citation.note ? <p className="mt-2 whitespace-pre-wrap text-sm text-[var(--muted)]">{citation.note}</p> : null}
                </article>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
