import { ListingPage } from "@/components/list/listing-page";

export default function SectsPage() {
  return (
    <ListingPage
      title="宗派"
      description="宗教配下の宗派を管理します。"
      primaryAction={{ href: "/sects/new", label: "新規宗派" }}
      columns={["名称", "宗教", "開始", "終了"]}
      rows={[
        ["禅宗", "仏教", "中国宋代", "継続中"],
        ["ルター派", "キリスト教", "16世紀", "継続中"]
      ]}
    />
  );
}
