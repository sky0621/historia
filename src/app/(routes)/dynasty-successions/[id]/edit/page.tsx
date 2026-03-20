import { notFound } from "next/navigation";
import { DynastySuccessionForm } from "@/features/relations/components/relation-forms";
import { getDynastySuccessionFormView } from "@/server/services/relations";

export default async function EditDynastySuccessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getDynastySuccessionFormView(Number(id));

  if (!view.succession) {
    notFound();
  }

  return (
    <DynastySuccessionForm
      title="王朝継承を編集"
      description="登録済みの王朝交代を更新します。"
      submitLabel="更新する"
      polityOptions={view.options.polities}
      dynastyOptions={view.options.dynasties}
      defaultValues={view.defaultValues}
    />
  );
}
