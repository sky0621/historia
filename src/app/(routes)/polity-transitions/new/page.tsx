import { PolityTransitionForm } from "@/features/relations/components/relation-forms";
import { getPolityTransitionFormView } from "@/server/services/relations";

type NewPolityTransitionPageProps = {
  searchParams?: Promise<{ predecessorPolityId?: string; successorPolityId?: string }>;
};

export default async function NewPolityTransitionPage({ searchParams }: NewPolityTransitionPageProps) {
  const params = (await searchParams) ?? {};
  const view = getPolityTransitionFormView(undefined, {
    predecessorPolityId: params.predecessorPolityId ? Number(params.predecessorPolityId) : undefined,
    successorPolityId: params.successorPolityId ? Number(params.successorPolityId) : undefined
  });

  return (
    <PolityTransitionForm
      title="国家変遷を追加"
      description="国家間の継承・改称・分裂・併合を登録します。"
      submitLabel="保存する"
      polityOptions={view.options.polities}
      defaultValues={view.defaultValues}
    />
  );
}
