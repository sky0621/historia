import Link from "next/link";
import { getPeopleListView } from "@/server/services/people";

export default function PeoplePage() {
  const people = getPeopleListView();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">人物</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            生没年、役職履歴、関連地域、宗教、時代区分を管理します。
          </p>
        </div>
        <Link href="/people/new" className="inline-flex rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
          新規人物
        </Link>
      </div>

      <div className="overflow-hidden rounded-[32px] border border-[var(--border)] bg-white/80 shadow-sm">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-stone-100/70">
            <tr>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">氏名</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">生没年</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">役職</th>
              <th className="px-5 py-4 font-semibold text-[var(--muted)]">地域</th>
            </tr>
          </thead>
          <tbody>
            {people.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-6 text-[var(--muted)]">
                  まだ人物はありません。
                </td>
              </tr>
            ) : (
              people.map((person) => (
                <tr key={person.id} className="border-t border-[var(--border)]">
                  <td className="px-5 py-4">
                    <Link href={`/people/${person.id}`} className="font-medium underline-offset-4 hover:underline">
                      {person.name}
                    </Link>
                  </td>
                  <td className="px-5 py-4">{person.lifeLabel}</td>
                  <td className="px-5 py-4">
                    {person.roles.map((role) => `${role.title}${role.affiliationName ? ` (${role.affiliationName})` : ""}`).join(", ") || "-"}
                  </td>
                  <td className="px-5 py-4 text-[var(--muted)]">{person.regionNames.join(", ") || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
