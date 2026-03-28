import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReligionForm } from "@/features/religions/components/religion-form";
import { getFounderOptions, getReligionDetailView } from "@/server/services/religions";

export const metadata: Metadata = { title: "religion" };

export default async function EditReligionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getReligionDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <ReligionForm
      title="宗教編集"
      description="既存の宗教情報を更新します。"
      submitLabel="宗教を更新"
      founderOptions={getFounderOptions()}
      defaultValues={{
        id: view.religion.id,
        name: view.religion.name,
        description: view.religion.description ?? "",
        note: view.religion.note ?? "",
        founderIds: view.founders.map((founder) => founder.id),
        fromTimeExpression: view.defaultFromTimeExpression,
        toTimeExpression: view.defaultToTimeExpression
      }}
    />
  );
}
