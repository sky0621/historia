import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PersonForm } from "@/features/person/components/person-form";
import { getPersonDetailView } from "@/server/services/person";

export const metadata: Metadata = { title: "person" };

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getPersonDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <PersonForm
      title="人物編集"
      description="既存の人物情報を更新します。"
      submitLabel="人物を更新"
      options={view.formOptions}
      defaultValues={{
        id: view.person.id,
        name: view.person.name,
        description: view.person.description ?? "",
        reading: view.person.reading ?? "",
        aliases: view.person.aliases ?? "",
        note: view.person.note ?? "",
        regionIds: view.regions.map((item) => item.id),
        religionIds: view.religions.map((item) => item.id),
        sectIds: view.sects.map((item) => item.id),
        tagIds: view.tags.map((item) => item.id),
        birthTimeExpression: view.defaultBirthTimeExpression,
        deathTimeExpression: view.defaultDeathTimeExpression,
        roles: view.roles.map((role) => ({
          roleId: role.id,
          description: role.description ?? "",
          note: role.note ?? "",
          fromTimeExpression: role.defaultFromTimeExpression,
          toTimeExpression: role.defaultToTimeExpression
        }))
      }}
    />
  );
}
