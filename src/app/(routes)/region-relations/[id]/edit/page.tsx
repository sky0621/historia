import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RegionRelationForm } from "@/features/relations/components/relation-forms";
import { getRegionRelationFormView } from "@/server/services/relations";

export const metadata: Metadata = { title: "region-relation" };

export default async function EditRegionRelationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getRegionRelationFormView(Number(id));

  if (!view.relation) {
    notFound();
  }

  return (
    <RegionRelationForm
      title="地域関係を編集"
      description="登録済みの地域関係を更新します。"
      submitLabel="更新する"
      regionOptions={view.options.regions}
      defaultValues={view.defaultValues}
    />
  );
}
