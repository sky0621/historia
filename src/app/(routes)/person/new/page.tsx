import { PersonForm } from "@/features/person/components/person-form";
import { getPersonFormOptions } from "@/server/services/person";

export default function NewPersonPage() {
  return (
    <PersonForm
      title="人物作成"
      description="人物本体と役職履歴を登録します。"
      submitLabel="人物を作成"
      options={getPersonFormOptions()}
    />
  );
}
