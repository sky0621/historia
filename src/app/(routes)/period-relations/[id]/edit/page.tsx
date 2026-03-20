import { notFound } from "next/navigation";
import { HistoricalPeriodRelationForm } from "@/features/relations/components/relation-forms";
import { getHistoricalPeriodRelationFormView } from "@/server/services/relations";

export default async function EditHistoricalPeriodRelationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getHistoricalPeriodRelationFormView(Number(id));

  if (!view.relation) {
    notFound();
  }

  return (
    <HistoricalPeriodRelationForm
      title="時代区分関係を編集"
      description="登録済みの時代区分関係を更新します。"
      submitLabel="更新する"
      periodOptions={view.options.periods}
      defaultValues={view.defaultValues}
    />
  );
}
