import type { Metadata } from "next";
import { EventForm } from "@/features/events/components/event-form";
import { getEventFormOptions } from "@/server/services/events";

export const metadata: Metadata = {
  title: "event"
};

export default function NewEventPage() {
  return (
    <EventForm
      title="イベント作成"
      description="イベント本体、関連主体、イベント間関係を登録します。"
      submitLabel="イベントを作成"
      options={getEventFormOptions()}
      defaultValues={{
        title: "",
        description: "",
        tags: [],
        eventType: "general",
        personIds: [],
        polityIds: [],
        dynastyIds: [],
        religionIds: [],
        sectIds: [],
        regionIds: [],
        relations: [],
        conflictParticipants: []
      }}
    />
  );
}
