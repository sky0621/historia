import type { Metadata } from "next";
import { CitationForm } from "@/features/sources/components/citation-form";
import { getCitationFormView } from "@/server/services/sources";

export const metadata: Metadata = {
  title: "citation"
};

type CitationNewPageProps = {
  searchParams?: Promise<{ sourceId?: string; targetType?: string; targetId?: string }>;
};

export default async function NewCitationPage({ searchParams }: CitationNewPageProps) {
  const params = (await searchParams) ?? {};
  const view = getCitationFormView(undefined, {
    sourceId: params.sourceId ? Number(params.sourceId) : undefined,
    targetType: params.targetType,
    targetId: params.targetId ? Number(params.targetId) : undefined
  });

  return <CitationForm title="引用を追加" description="出典と対象主体を紐づけます。" submitLabel="保存する" view={view} />;
}
