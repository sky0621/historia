import type { Metadata } from "next";
import { SectForm } from "@/features/religions/components/sect-form";
import { getFounderOptions, getParentSectOptions, getReligionOptions } from "@/server/services/religions";

export const metadata: Metadata = {
  title: "sect"
};

type NewSectPageProps = {
  searchParams?: Promise<{ religionId?: string; parentSectId?: string }>;
};

export default async function NewSectPage({ searchParams }: NewSectPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <SectForm
      title="宗派作成"
      description="所属宗教、開始終了年、開祖を登録します。"
      submitLabel="宗派を作成"
      religionOptions={getReligionOptions()}
      parentSectOptions={getParentSectOptions()}
      founderOptions={getFounderOptions()}
      defaultValues={{
        religionId: params.religionId ? Number(params.religionId) : 0,
        parentSectId: params.parentSectId ? Number(params.parentSectId) : null,
        name: "",
        description: "",
        note: "",
        founderIds: []
      }}
    />
  );
}
