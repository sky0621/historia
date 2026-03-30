import type { Metadata } from "next";
import { PersonForm } from "@/features/person/components/person-form";
import { getPersonFormOptions } from "@/server/services/person";

export const metadata: Metadata = {
  title: "person"
};

export default function NewPersonPage() {
  return (
    <PersonForm
      title="人物作成"
      description="人物本体の基本情報を登録します。"
      submitLabel="人物を作成"
      options={getPersonFormOptions()}
    />
  );
}
