import { ListingPage } from "@/components/list/listing-page";

export default function ReligionsPage() {
  return (
    <ListingPage
      title="宗教"
      description="宗教本体を管理します。"
      primaryAction={{ href: "/religions/new", label: "新規宗教" }}
      columns={["名称", "開始", "終了", "開祖"]}
      rows={[
        ["仏教", "紀元前後", "継続中", "ゴータマ・シッダールタ"],
        ["キリスト教", "1世紀", "継続中", "イエス"]
      ]}
    />
  );
}
