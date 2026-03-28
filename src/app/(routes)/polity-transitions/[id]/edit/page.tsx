import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PolityTransitionForm } from "@/features/relations/components/relation-forms";
import { getPolityTransitionFormView } from "@/server/services/relations";

export const metadata: Metadata = { title: "polity-transition" };

export default async function EditPolityTransitionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getPolityTransitionFormView(Number(id));

  if (!view.transition) {
    notFound();
  }

  return (
    <PolityTransitionForm
      title="国家変遷を編集"
      description="登録済みの国家変遷を更新します。"
      submitLabel="更新する"
      polityOptions={view.options.polities}
      defaultValues={view.defaultValues}
    />
  );
}
