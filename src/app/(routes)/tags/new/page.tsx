import type { Metadata } from "next";
import { TagForm } from "@/features/tags/components/tag-form";

export const metadata: Metadata = {
  title: "tag"
};

export default function NewTagPage() {
  return <TagForm title="タグ作成" description="イベント分類用のタグを登録します。" submitLabel="タグを作成" />;
}
