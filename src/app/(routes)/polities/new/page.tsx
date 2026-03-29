import type { Metadata } from "next";
import { PolityForm } from "@/features/polities/components/polity-form";
import { getRegionOptions } from "@/server/services/polities";

export const metadata: Metadata = {
  title: "polity"
};

export default function NewPolityPage() {
  return (
    <PolityForm
      title="国家・政体作成"
      description="名称、開始年・終了年、関連地域を登録します。"
      submitLabel="国家・政体を作成"
      regionOptions={getRegionOptions()}
    />
  );
}
