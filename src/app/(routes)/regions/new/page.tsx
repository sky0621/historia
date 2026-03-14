import { RegionForm } from "@/features/regions/components/region-form";
import { getRegionOptions } from "@/server/services/regions";

export default function NewRegionPage() {
  return (
    <RegionForm
      title="地域作成"
      description="地域名、親地域、別名、説明、メモを登録します。"
      submitLabel="地域を作成"
      parentOptions={getRegionOptions()}
    />
  );
}
