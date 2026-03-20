import { notFound } from "next/navigation";
import { SectForm } from "@/features/religions/components/sect-form";
import { getFounderOptions, getParentSectOptions, getRegionOptions, getReligionOptions, getSectDetailView } from "@/server/services/religions";

export default async function EditSectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getSectDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <SectForm
      title="宗派編集"
      description="既存の宗派情報を更新します。"
      submitLabel="宗派を更新"
      religionOptions={getReligionOptions()}
      parentSectOptions={getParentSectOptions(view.sect.id)}
      regionOptions={getRegionOptions()}
      founderOptions={getFounderOptions()}
      defaultValues={{
        id: view.sect.id,
        religionId: view.sect.religionId,
        parentSectId: view.sect.parentSectId,
        name: view.sect.name,
        aliases: view.sect.aliases ?? "",
        description: view.sect.description ?? "",
        note: view.sect.note ?? "",
        regionIds: view.regions.map((region) => region.id),
        founderIds: view.founders.map((founder) => founder.id),
        timeExpression: view.defaultTimeExpression
      }}
    />
  );
}
