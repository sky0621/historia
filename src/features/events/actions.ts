"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseEventFormData } from "@/features/events/schema";
import { createEventFromInput, removeEvent, updateEventFromInput } from "@/server/services/events";

export async function createEventAction(formData: FormData) {
  const id = createEventFromInput(parseEventFormData(formData));
  revalidatePath("/events");
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
