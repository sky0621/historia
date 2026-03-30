import type { Metadata } from "next";
import { RoleForm } from "@/features/roles/components/role-form";
import { getPolityOptions } from "@/server/services/polities";

export const metadata: Metadata = { title: "role" };

export default function NewRolePage() {
  return (
    <RoleForm
      title="役職作成"
      description="役職名と説明を登録します。"
      submitLabel="役職を作成"
      polityOptions={getPolityOptions()}
    />
  );
}
