import { ListingPage } from "@/components/list/listing-page";

export default function DynastiesPage() {
  return (
    <ListingPage
      title="王朝"
      description="国家配下の王朝を管理します。"
      primaryAction={{ href: "/dynasties/new", label: "新規王朝" }}
      columns={["名称", "所属国家", "開始", "終了"]}
      rows={[
        ["平安朝", "日本", "794", "1185"],
        ["カロリング朝", "フランク王国", "751", "987"]
      ]}
    />
  );
}
