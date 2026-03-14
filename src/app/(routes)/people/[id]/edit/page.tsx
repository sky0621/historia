import { notFound } from "next/navigation";
import { PersonForm } from "@/features/people/components/person-form";
import { getPersonDetailView } from "@/server/services/people";

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
        aliases: view.person.aliases ?? "",
        note: view.person.note ?? "",
        regionIds: view.regions.map((item) => item.id),
        religionIds: view.religions.map((item) => item.id),
        sectIds: view.sects.map((item) => item.id),
        periodIds: view.periods.map((item) => item.id),
        birthTimeExpression: view.defaultBirthTimeExpression,
        deathTimeExpression: view.defaultDeathTimeExpression,
        roles: view.roles.map((role) => ({
          title: role.title,
          polityId: role.polityId,
          dynastyId: role.dynastyId,
          note: role.note ?? "",
          isIncumbent: Boolean(role.isIncumbent),
          timeExpression: role.defaultTimeExpression
        }))
      }}
    />
  );
}
