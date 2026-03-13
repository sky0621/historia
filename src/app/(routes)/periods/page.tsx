import { ListingPage } from "@/components/list/listing-page";

export default function PeriodsPage() {
  return (
    <ListingPage
      title="時代区分"
      description="カテゴリ付きの時代区分を管理します。"
      primaryAction={{ href: "/periods/new", label: "新規時代区分" }}
      columns={["名称", "カテゴリ", "対象", "期間"]}
      rows={[
        ["平安時代", "日本史区分", "日本", "794-1185"],
        ["ルネサンス", "西洋史区分", "ヨーロッパ", "14-16世紀"]
      ]}
    />
  );
}
