import Link from "next/link";
import { PlaceholderEditor } from "@/components/forms/placeholder-editor";

export default function BootstrapFormSamplePage() {
  return (
    <div className="space-y-6">
      <PlaceholderEditor
        title="イベント作成プレースホルダ"
        description="Sprint 1 の時点で想定していたフォーム骨格です。現在の実イベント作成画面とは別に、共通フォーム確認用として残します。"
      />
      <div className="rounded-[28px] border border-[var(--border)] bg-white/80 p-6 text-sm text-[var(--muted)] shadow-sm">
        実装済みの本画面は
        {" "}
        <Link href="/events/new" className="underline-offset-4 hover:underline">
          /events/new
        </Link>
        {" "}
        です。
      </div>
    </div>
  );
}
