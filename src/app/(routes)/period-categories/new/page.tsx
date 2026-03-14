import { PeriodCategoryForm } from "@/features/periods/components/period-category-form";

export default function NewPeriodCategoryPage() {
  return (
    <PeriodCategoryForm
      title="時代区分カテゴリ作成"
      description="時代区分の分類軸を登録します。"
      submitLabel="カテゴリを作成"
    />
  );
}
