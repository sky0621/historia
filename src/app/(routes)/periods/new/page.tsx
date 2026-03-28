import type { Metadata } from "next";
import { HistoricalPeriodForm } from "@/features/periods/components/historical-period-form";
import { getHistoricalPeriodFormOptions } from "@/server/services/historical-periods";

export const metadata: Metadata = {
  title: "period"
};

export default function NewPeriodPage() {
  return (
    <HistoricalPeriodForm
      title="時代区分作成"
      description="カテゴリ、対象国家・地域、期間、関連地域を登録します。"
      submitLabel="時代区分を作成"
      options={getHistoricalPeriodFormOptions()}
    />
  );
}
