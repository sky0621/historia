import { ListingPage } from "@/components/list/listing-page";

export default function PeoplePage() {
  return (
    <ListingPage
      title="人物"
      description="人物台帳の一覧です。Sprint 2 で本実装します。"
      primaryAction={{ href: "/people/new", label: "新規人物" }}
      columns={["氏名", "生没年", "役職", "地域"]}
      rows={[
        ["聖徳太子", "574-622", "摂政", "日本"],
        ["レオナルド・ダ・ヴィンチ", "1452-1519", "芸術家", "イタリア"]
      ]}
    />
  );
}
