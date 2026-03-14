import { SectForm } from "@/features/religions/components/sect-form";
import { getFounderOptions, getRegionOptions, getReligionOptions } from "@/server/services/religions";

export default function NewSectPage() {
  return (
    <SectForm
      title="宗派作成"
      description="所属宗教、開始終了年、開祖、関連地域を登録します。"
      submitLabel="宗派を作成"
      religionOptions={getReligionOptions()}
      regionOptions={getRegionOptions()}
      founderOptions={getFounderOptions()}
    />
  );
}
