import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { DynastyForm } from "@/features/polities/components/dynasty-form";
import { getDynastyDetailView, getPolityOptions, getRegionOptions } from "@/server/services/polities";

export const metadata: Metadata = { title: "dynasty" };

export default async function EditDynastyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getDynastyDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <DynastyForm
      title="王朝編集"
      description="既存の王朝情報を更新します。"
      submitLabel="王朝を更新"
      polityOptions={getPolityOptions()}
      regionOptions={getRegionOptions()}
      defaultValues={{
        id: view.dynasty.id,
        polityIds: view.dynasty.polityIds,
        name: view.dynasty.name,
        description: view.dynasty.description ?? "",
        note: view.dynasty.note ?? "",
        regionIds: view.regions.map((region) => region.id),
        fromTimeExpression: view.defaultFromTimeExpression,
        toTimeExpression: view.defaultToTimeExpression
      }}
    />
  );
}
