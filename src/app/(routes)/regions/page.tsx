import { ListingPage } from "@/components/list/listing-page";

export default function RegionsPage() {
  return (
    <ListingPage
      title="地域"
      description="地理的・文化的なまとまりを管理します。"
      primaryAction={{ href: "/regions/new", label: "新規地域" }}
      columns={["名称", "親地域", "説明"]}
      rows={[
        ["東アジア", "-", "文化圏"],
        ["日本", "東アジア", "国家・地域の両文脈で利用"]
      ]}
    />
  );
}
