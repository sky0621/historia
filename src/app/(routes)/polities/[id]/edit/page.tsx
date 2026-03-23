import { notFound } from "next/navigation";
import { PolityForm } from "@/features/polities/components/polity-form";
import { getPolityDetailView, getRegionOptions } from "@/server/services/polities";

export default async function EditPolityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getPolityDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <PolityForm
      title="国家編集"
      description="既存の国家情報を更新します。"
      submitLabel="国家を更新"
      regionOptions={getRegionOptions()}
      defaultValues={{
        id: view.polity.id,
        name: view.polity.name,
        aliases: view.polity.aliases ?? "",
        note: view.polity.note ?? "",
        regionIds: view.regions.map((region) => region.id),
        fromTimeExpression: view.defaultFromTimeExpression,
        toTimeExpression: view.defaultToTimeExpression
      }}
    />
  );
}
