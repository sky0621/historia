import type { Metadata } from "next";
import { ReligionForm } from "@/features/religions/components/religion-form";
import { getFounderOptions, getRegionOptions } from "@/server/services/religions";

export const metadata: Metadata = {
  title: "religion"
};

export default function NewReligionPage() {
  return (
    <ReligionForm
      title="宗教作成"
      description="名称、開始終了年、開祖、関連地域を登録します。"
      submitLabel="宗教を作成"
      regionOptions={getRegionOptions()}
      founderOptions={getFounderOptions()}
    />
  );
}
