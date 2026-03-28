import type { Metadata } from "next";
import { RegionRelationForm } from "@/features/relations/components/relation-forms";
import { getRegionRelationFormView } from "@/server/services/relations";

export const metadata: Metadata = { title: "region-relation" };

type NewRegionRelationPageProps = {
  searchParams?: Promise<{ fromRegionId?: string; toRegionId?: string }>;
};

export default async function NewRegionRelationPage({ searchParams }: NewRegionRelationPageProps) {
  const params = (await searchParams) ?? {};
  const view = getRegionRelationFormView(undefined, {
    fromRegionId: params.fromRegionId ? Number(params.fromRegionId) : undefined,
    toRegionId: params.toRegionId ? Number(params.toRegionId) : undefined
  });

  return (
    <RegionRelationForm
      title="地域関係を追加"
      description="階層とは別に、隣接や文化圏の関係を登録します。"
      submitLabel="保存する"
      regionOptions={view.options.regions}
      defaultValues={view.defaultValues}
    />
  );
}
