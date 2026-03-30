import type { Metadata } from "next";
import Link from "next/link";
import { getSourceListView } from "@/server/services/sources";

export const metadata: Metadata = {
  title: "source"
};

type SourcesPageProps = {
  searchParams?: Promise<{ q?: string }>;
};

export default async function SourcesPage({ searchParams }: SourcesPageProps) {
  const params = (await searchParams) ?? {};
  const sources = getSourceListView(params.q);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">出典</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            書誌情報や URL を管理し、各主体・イベントへの引用を紐づけます。
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/manage/data" className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            データ運用
          </Link>
          <Link href="/sources/new" className="rounded-full bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white">
            新規作成
          </Link>
        </div>
      </div>

      <form className="rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm">
        <label className="grid gap-2 text-sm md:max-w-md">
          <span>検索</span>
          <input name="q" defaultValue={params.q ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
        </label>
        <div className="mt-4 flex items-center gap-3">
          <button type="submit" className="whitespace-nowrap rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            絞り込む
          </button>
          <p className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">検索結果：{sources.length}件</p>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full divide-y divide-[var(--border)] text-sm">
          <thead className="bg-[var(--surface)]">
            <tr>
              <th className="px-4 py-3 text-left font-medium">タイトル</th>
              <th className="px-4 py-3 text-left font-medium">著者</th>
              <th className="px-4 py-3 text-left font-medium">刊行情報</th>
              <th className="px-4 py-3 text-left font-medium">引用数</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {sources.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3">
                  <Link href={`/sources/${item.id}`} className="underline-offset-4 hover:underline">
                    {item.title}
                  </Link>
                </td>
                <td className="px-4 py-3">{item.author ?? "-"}</td>
                <td className="px-4 py-3">{item.publishedAtLabel ?? item.publisher ?? "-"}</td>
                <td className="px-4 py-3">{item.citationCount}</td>
              </tr>
            ))}
            {sources.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-[var(--muted)]">
                  一致する出典はありません。
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
