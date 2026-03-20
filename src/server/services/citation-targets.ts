import { listEvents } from "@/server/repositories/events";
import { listHistoricalPeriods } from "@/server/repositories/historical-periods";
import { listPeopleDetailed } from "@/server/repositories/people-detail";
import { listPolities } from "@/server/repositories/polities";
import { listReligions } from "@/server/repositories/religions";

export type CitationTargetType = "event" | "person" | "polity" | "historical_period" | "religion";

export function getCitationTargetOptions() {
  return {
    targetTypes: [
      { value: "event", label: "イベント" },
      { value: "person", label: "人物" },
      { value: "polity", label: "国家" },
      { value: "historical_period", label: "時代区分" },
      { value: "religion", label: "宗教" }
    ] as Array<{ value: CitationTargetType; label: string }>,
    events: listEvents().map((item) => ({ id: item.id, name: item.title })),
    people: listPeopleDetailed().map((item) => ({ id: item.id, name: item.name })),
    polities: listPolities().map((item) => ({ id: item.id, name: item.name })),
    periods: listHistoricalPeriods().map((item) => ({ id: item.id, name: item.name })),
    religions: listReligions().map((item) => ({ id: item.id, name: item.name }))
  };
}

export function resolveCitationTarget(type: CitationTargetType, id: number) {
  const options = getCitationTargetOptions();

  switch (type) {
    case "event":
      return {
        label: options.events.find((item) => item.id === id)?.name ?? `イベント #${id}`,
        href: `/events/${id}`
      };
    case "person":
      return {
        label: options.people.find((item) => item.id === id)?.name ?? `人物 #${id}`,
        href: `/people/${id}`
      };
    case "polity":
      return {
        label: options.polities.find((item) => item.id === id)?.name ?? `国家 #${id}`,
        href: `/polities/${id}`
      };
    case "historical_period":
      return {
        label: options.periods.find((item) => item.id === id)?.name ?? `時代区分 #${id}`,
        href: `/periods/${id}`
      };
    case "religion":
      return {
        label: options.religions.find((item) => item.id === id)?.name ?? `宗教 #${id}`,
        href: `/religions/${id}`
      };
  }
}
