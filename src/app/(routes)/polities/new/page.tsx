import { PolityForm } from "@/features/polities/components/polity-form";
import { getRegionOptions } from "@/server/services/polities";

export default function NewPolityPage() {
  return (
    <PolityForm
      title="国家作成"
      description="名称、開始終了年、関連地域を登録します。"
      submitLabel="国家を作成"
      regionOptions={getRegionOptions()}
    />
  );
}
