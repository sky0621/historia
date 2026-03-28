import type { Metadata } from "next";
import { SourceForm } from "@/features/sources/components/source-form";

export const metadata: Metadata = {
  title: "source"
};

export default function NewSourcePage() {
  return <SourceForm title="出典を追加" description="書誌情報や URL を登録します。" submitLabel="保存する" />;
}
