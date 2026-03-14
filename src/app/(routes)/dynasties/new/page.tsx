import { DynastyForm } from "@/features/polities/components/dynasty-form";
import { getPolityOptions, getRegionOptions } from "@/server/services/polities";

export default function NewDynastyPage() {
  return (
    <DynastyForm
      title="王朝作成"
      description="所属国家、期間、関連地域を登録します。"
      submitLabel="王朝を作成"
      polityOptions={getPolityOptions()}
      regionOptions={getRegionOptions()}
    />
  );
}
