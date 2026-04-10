import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoleForm } from "@/features/roles/components/role-form";
import { getRoleDetailView } from "@/server/services/roles";

export const metadata: Metadata = { title: "role" };

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getRoleDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <RoleForm
      title="役職編集"
      description="役職名と説明を更新します。"
      submitLabel="役職を更新"
      polityOptions={view.formOptions.polities}
      tagOptions={view.formOptions.tags}
      defaultValues={{
        id: view.role.id,
        title: view.role.title,
        reading: view.role.reading ?? "",
        description: view.role.description ?? "",
        note: view.role.note ?? "",
        polityIds: view.role.polityIds,
        tagIds: view.role.tagIds
      }}
    />
  );
}
