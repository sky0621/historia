import type { Metadata } from "next";
import { ReligionForm } from "@/features/religions/components/religion-form";
import { getFounderOptions } from "@/server/services/religions";

export const metadata: Metadata = {
  title: "religion"
};

export default function NewReligionPage() {
  return (
    <ReligionForm
      title="宗教作成"
      description="名称、開始終了年、開祖を登録します。"
      submitLabel="宗教を作成"
      founderOptions={getFounderOptions()}
    />
  );
}
