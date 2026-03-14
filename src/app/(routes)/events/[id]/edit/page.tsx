import { notFound } from "next/navigation";
import { EventForm } from "@/features/events/components/event-form";
import { getEventDetailView } from "@/server/services/events";

export default async function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const view = getEventDetailView(Number(id));

  if (!view) {
    notFound();
  }

  return (
    <EventForm
      title="イベント編集"
      description="既存のイベント情報を更新します。"
      submitLabel="イベントを更新"
      options={view.formOptions}
      defaultValues={{
        id: view.event.id,
        title: view.event.title,
        description: view.event.description ?? "",
        eventType: view.event.eventType as "general" | "war" | "rebellion" | "civil_war",
        timeExpression: view.defaultTimeExpression,
        startTimeExpression: view.defaultStartTimeExpression,
        endTimeExpression: view.defaultEndTimeExpression,
        personIds: view.linkedPeople.map((item) => item.id),
        polityIds: view.linkedPolities.map((item) => item.id),
        dynastyIds: view.linkedDynasties.map((item) => item.id),
        periodIds: view.linkedPeriods.map((item) => item.id),
        religionIds: view.linkedReligions.map((item) => item.id),
        sectIds: view.linkedSects.map((item) => item.id),
        regionIds: view.linkedRegions.map((item) => item.id),
        relations: view.outgoingRelations.map((relation) => ({
          toEventId: relation.toEventId,
          relationType: relation.relationType as "before" | "after" | "cause" | "related"
        })),
        conflictParticipants: view.conflictParticipants.map((participant) => ({
          participantType: participant.participantType as "polity" | "person" | "religion" | "sect",
          participantId: participant.participantId,
          role: participant.role as "attacker" | "defender" | "leader" | "ally" | "other",
          note: participant.note ?? ""
        })),
        conflictOutcome: view.conflictOutcome
          ? {
              settlementSummary: view.conflictOutcome.settlementSummary ?? "",
              note: view.conflictOutcome.note ?? ""
            }
          : undefined
      }}
    />
  );
}
