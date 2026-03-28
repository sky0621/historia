import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SourceForm } from "@/features/sources/components/source-form";
import { getSourceView } from "@/server/services/sources";

export const metadata: Metadata = { title: "source" };

export default async function EditSourcePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getSourceView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <SourceForm
      title="出典を編集"
      description="登録済みの出典情報を更新します。"
      submitLabel="更新する"
      defaultValues={view.source}
    />
  );
}
