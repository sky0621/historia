import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CitationForm } from "@/features/sources/components/citation-form";
import { getCitationFormView } from "@/server/services/sources";

export const metadata: Metadata = { title: "citation" };

export default async function EditCitationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getCitationFormView(Number(id));

  if (!view.citation) {
    notFound();
  }

  return <CitationForm title="引用を編集" description="引用先やメモを更新します。" submitLabel="更新する" view={view} />;
}
