import { notFound } from "next/navigation";
import { HistoricalPeriodForm } from "@/features/periods/components/historical-period-form";
import { getHistoricalPeriodDetailView } from "@/server/services/historical-periods";

export default async function EditHistoricalPeriodPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const view = getHistoricalPeriodDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <HistoricalPeriodForm
      title="時代区分編集"
      description="既存の時代区分を更新します。"
      submitLabel="時代区分を更新"
      options={view.formOptions}
      defaultValues={{
        id: view.period.id,
        categoryId: view.period.categoryId,
        polityId: view.period.polityId,
        name: view.period.name,
        description: view.period.description ?? "",
        note: view.period.note ?? "",
        regionIds: view.regions.map((item) => item.id),
        fromTimeExpression: view.defaultFromTimeExpression,
        toTimeExpression: view.defaultToTimeExpression
      }}
    />
  );
}
