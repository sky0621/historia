import type { Metadata } from "next";
import Link from "next/link";
import { getRoleListView } from "@/server/services/roles";

export const metadata: Metadata = { title: "role" };

type RolesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RolesPage({ searchParams }: RolesPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingleParam(params.q);
  const roles = getRoleListView({ query });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">役職</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">役職名と説明を管理します。</p>
        </div>
        <Link href="/roles/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規役職
        </Link>
      </div>

      <form className="grid gap-4 rounded-[32px] border border-[var(--border)] bg-white/80 p-6 shadow-sm md:grid-cols-2 xl:grid-cols-4">
        <label className="space-y-2 text-sm md:col-span-2 xl:col-span-4">
          <span className="font-medium text-[var(--muted)]">名称検索</span>
          <input name="q" defaultValue={query} className="w-full rounded-2xl border border-[var(--border)] bg-white px-3 py-2" placeholder="役職名・説明" />
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" className="inline-flex whitespace-nowrap rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            検索
          </button>
          <Link href="/roles" className="inline-flex whitespace-nowrap rounded-full border border-[var(--border)] px-5 py-2.5 text-sm font-medium">
            リセット
          </Link>
          <p className="ml-auto whitespace-nowrap text-sm text-[var(--muted)]">検索結果：{roles.length}件</p>
        </div>
      </form>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">名称</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">国家</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">読み方</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">説明</th>
            </tr>
          </thead>
          <tbody>
            {roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">まだ役職はありません。</td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/roles/${role.id}`} className="font-medium underline-offset-4 hover:underline">
                      {role.title}
                    </Link>
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{role.polityName ?? "-"}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{role.reading ?? "-"}</td>
                  <td className="px-5 py-4 text-[var(--muted)]">{role.description ?? "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function getSingleParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}
