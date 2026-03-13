import { ListingPage } from "@/components/list/listing-page";

export default function EventsPage() {
  return (
    <ListingPage
      title="イベント"
      description="年表の中心となるイベント一覧です。Sprint 1 では画面骨格のみを提供します。"
      primaryAction={{ href: "/events/new", label: "新規イベント" }}
      columns={["タイトル", "時代", "種別", "関連主体"]}
      rows={[
        ["壬申の乱", "7世紀", "war", "天武天皇 / 日本"],
        ["ルネサンス", "14-16世紀", "general", "ヨーロッパ"]
      ]}
    />
  );
}
