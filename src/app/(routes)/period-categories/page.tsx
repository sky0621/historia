import { ListingPage } from "@/components/list/listing-page";

export default function PeriodCategoriesPage() {
  return (
    <ListingPage
      title="時代区分カテゴリ"
      description="日本史区分や考古学区分などの分類軸です。"
      primaryAction={{ href: "/period-categories/new", label: "新規カテゴリ" }}
      columns={["名称", "説明"]}
      rows={[
        ["日本史区分", "日本史の時代区分"],
        ["西洋史区分", "西洋史の時代区分"]
      ]}
    />
  );
}
