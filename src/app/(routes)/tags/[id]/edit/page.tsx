import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TagForm } from "@/features/tags/components/tag-form";
import { getTagView } from "@/server/services/tags";

export const metadata: Metadata = { title: "tag" };

export default async function EditTagPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getTagView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <TagForm
      title="タグ編集"
      description="既存タグの名称を更新します。"
      submitLabel="タグを更新"
      defaultValues={{
        id: view.tag.id,
        name: view.tag.name
      }}
    />
  );
}
