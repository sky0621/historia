import { notFound } from "next/navigation";
import { RegionForm } from "@/features/regions/components/region-form";
import { getRegionOptions, getRegionView } from "@/server/services/regions";

export default async function EditRegionPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getRegionView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <RegionForm
      title="地域編集"
      description="既存の地域情報を更新します。"
      submitLabel="地域を更新"
      parentOptions={getRegionOptions(view.region.id)}
      defaultValues={{
        id: view.region.id,
        name: view.region.name,
        parentRegionId: view.region.parentRegionId,
        description: view.region.description ?? "",
        note: view.region.note ?? ""
      }}
    />
  );
}
