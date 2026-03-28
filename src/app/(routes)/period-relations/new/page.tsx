import type { Metadata } from "next";
import { HistoricalPeriodRelationForm } from "@/features/relations/components/relation-forms";
import { getHistoricalPeriodRelationFormView } from "@/server/services/relations";

export const metadata: Metadata = { title: "period-relation" };

type NewHistoricalPeriodRelationPageProps = {
  searchParams?: Promise<{ fromPeriodId?: string; toPeriodId?: string }>;
};

export default async function NewHistoricalPeriodRelationPage({ searchParams }: NewHistoricalPeriodRelationPageProps) {
  const params = (await searchParams) ?? {};
  const view = getHistoricalPeriodRelationFormView(undefined, {
    fromPeriodId: params.fromPeriodId ? Number(params.fromPeriodId) : undefined,
    toPeriodId: params.toPeriodId ? Number(params.toPeriodId) : undefined
  });

  return (
    <HistoricalPeriodRelationForm
      title="時代区分関係を追加"
      description="包含・重複・継承関係を登録します。"
      submitLabel="保存する"
      periodOptions={view.options.periods}
      defaultValues={view.defaultValues}
    />
  );
}
