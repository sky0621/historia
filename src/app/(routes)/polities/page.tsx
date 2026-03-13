import { ListingPage } from "@/components/list/listing-page";

export default function PolitiesPage() {
  return (
    <ListingPage
      title="国家"
      description="国家・政体の管理画面です。"
      primaryAction={{ href: "/polities/new", label: "新規国家" }}
      columns={["名称", "開始", "終了", "地域"]}
      rows={[
        ["日本", "古代", "継続中", "東アジア"],
        ["神聖ローマ帝国", "962", "1806", "ヨーロッパ"]
      ]}
    />
  );
}
