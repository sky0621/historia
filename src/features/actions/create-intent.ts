export function shouldContinueCreating(formData: FormData) {
  return String(formData.get("intent") ?? "") === "create-and-continue";
}
