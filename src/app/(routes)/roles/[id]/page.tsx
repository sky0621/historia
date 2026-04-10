import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmSubmitButton } from "@/components/forms/confirm-submit-button";
import { deleteRoleAction } from "@/features/roles/actions";
import { getRoleDetailView } from "@/server/services/roles";

export const metadata: Metadata = { title: "role" };

export default async function RoleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getRoleDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--muted)]">Role</p>
          <h1 className="mt-2 text-3xl font-semibold">{view.role.title}</h1>
          {view.role.reading ? <p className="mt-2 text-sm leading-6 text-[var(--muted)]">読み方: {view.role.reading}</p> : null}
        </div>
        <div className="flex gap-3">
          <Link href={`/roles/${view.role.id}/edit`} className="rounded-full border border-[var(--border)] px-4 py-2 text-sm">
            編集
          </Link>
          <form action={deleteRoleAction}>
            <input type="hidden" name="id" value={view.role.id} />
            <ConfirmSubmitButton className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700">
              削除
            </ConfirmSubmitButton>
          </form>
        </div>
      </div>

      <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">基本情報</h2>
        <dl className="mt-6 grid gap-4 text-sm">
          <div>
            <dt className="font-medium text-[var(--muted)]">名称</dt>
            <dd className="mt-1">{view.role.title}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">国家</dt>
            <dd className="mt-1">
              {view.polities.length > 0
                ? view.polities.map((polity, index) => (
                    <span key={polity.id}>
                      {index > 0 ? ", " : null}
                      <Link href={`/polities/${polity.id}`} className="underline-offset-4 hover:underline">
                        {polity.name}
                      </Link>
                    </span>
                  ))
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">タグ</dt>
            <dd className="mt-1">
              {view.tags.length > 0
                ? view.tags.map((tag, index) => (
                    <span key={tag.id}>
                      {index > 0 ? ", " : null}
                      {tag.name}
                    </span>
                  ))
                : "-"}
            </dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">読み方</dt>
            <dd className="mt-1">{view.role.reading ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">説明</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.role.description ?? "-"}</dd>
          </div>
          <div>
            <dt className="font-medium text-[var(--muted)]">メモ</dt>
            <dd className="mt-1 whitespace-pre-wrap">{view.role.note ?? "-"}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
