"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { shouldContinueCreating } from "@/features/actions/create-intent";
import type { CreateFormState } from "@/features/actions/create-form-state";
import { parseEventFormData } from "@/features/events/schema";
import { listEvents } from "@/server/repositories/events";
import { createEventFromInput, removeEvent, updateEventFromInput } from "@/server/services/events";

export async function createEventAction(_previousState: CreateFormState, formData: FormData): Promise<CreateFormState> {
  const input = parseEventFormData(formData);
  if (listEvents().some((event) => event.title === input.title)) {
    return { error: "同じタイトルのイベントが登録済みです。" };
  }

  const id = createEventFromInput(input);
  revalidatePath("/events");
  if (shouldContinueCreating(formData)) {
    redirect("/events/new");
  }
  redirect(`/events/${id}`);
}

export async function updateEventAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateEventFromInput(id, parseEventFormData(formData));
  revalidatePath("/events");
  revalidatePath(`/events/${id}`);
  redirect(`/events/${id}`);
}

export async function deleteEventAction(formData: FormData) {
  removeEvent(Number(formData.get("id")));
  revalidatePath("/events");
  redirect("/events");
}
