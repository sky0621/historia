import { ListingPage } from "@/components/list/listing-page";

export default function BootstrapListingSamplePage() {
  return (
    <ListingPage
      title="イベント一覧プレースホルダ"
      description="Sprint 1 の時点で想定していた一覧骨格です。現在の実装済み一覧とは別に、共通 UI 部品の確認用として残します。"
      columns={["タイトル", "時代", "種別", "状態"]}
      rows={[
        ["平安京遷都", "794", "general", "sample"],
        ["応仁の乱", "1467-1477", "war", "sample"],
        ["第1回十字軍", "1096-1099", "war", "sample"]
      ]}
      primaryAction={{
        href: "/bootstrap/form-sample",
        label: "プレースホルダ作成画面"
      }}
    />
  );
}
