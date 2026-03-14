import { notFound } from "next/navigation";
import { PeriodCategoryForm } from "@/features/periods/components/period-category-form";
import { getPeriodCategoryView } from "@/server/services/period-categories";

export default async function EditPeriodCategoryPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = getPeriodCategoryView(Number(id));

  if (!category) {
    notFound();
  }

  return (
    <PeriodCategoryForm
      title="時代区分カテゴリ編集"
      description="既存の分類軸を更新します。"
      submitLabel="カテゴリを更新"
      defaultValues={{
        id: category.id,
        name: category.name,
        description: category.description ?? ""
      }}
    />
  );
}
