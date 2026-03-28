import type { Metadata } from "next";
import { DynastySuccessionForm } from "@/features/relations/components/relation-forms";
import { getDynastySuccessionFormView } from "@/server/services/relations";

export const metadata: Metadata = { title: "dynasty-succession" };

type NewDynastySuccessionPageProps = {
  searchParams?: Promise<{ polityId?: string; predecessorDynastyId?: string; successorDynastyId?: string }>;
};

export default async function NewDynastySuccessionPage({ searchParams }: NewDynastySuccessionPageProps) {
  const params = (await searchParams) ?? {};
  const view = getDynastySuccessionFormView(undefined, {
    polityId: params.polityId ? Number(params.polityId) : undefined,
    predecessorDynastyId: params.predecessorDynastyId ? Number(params.predecessorDynastyId) : undefined,
    successorDynastyId: params.successorDynastyId ? Number(params.successorDynastyId) : undefined
  });

  return (
    <DynastySuccessionForm
      title="王朝継承を追加"
      description="同一国家内の王朝交代を登録します。"
      submitLabel="保存する"
      polityOptions={view.options.polities}
      dynastyOptions={view.options.dynasties}
      defaultValues={view.defaultValues}
    />
  );
}
