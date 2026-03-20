import { createChangeHistory, getChangeHistoriesByTarget } from "@/server/repositories/change-histories";

export type HistoryTargetType = "event" | "person" | "polity" | "historical_period";
export type HistoryAction = "create" | "update" | "delete" | "import";

export function recordChangeHistory(params: {
  targetType: HistoryTargetType;
  targetId: number;
  action: HistoryAction;
  snapshot: unknown;
}) {
  createChangeHistory({
    targetType: params.targetType,
    targetId: params.targetId,
    action: params.action,
    snapshotJson: JSON.stringify(params.snapshot),
    changedAt: new Date()
  });
}

export function getHistoryView(targetType: HistoryTargetType, targetId: number, limit = 8) {
  return getChangeHistoriesByTarget(targetType, targetId, limit).map((item) => ({
    ...item,
    changedAtLabel: item.changedAt.toLocaleString("ja-JP"),
    snapshotPreview: summarizeSnapshot(item.snapshotJson)
  }));
}

function summarizeSnapshot(value: string) {
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;

    if (typeof parsed.title === "string") {
      return parsed.title;
    }

    if (typeof parsed.name === "string") {
      return parsed.name;
    }

    if (typeof parsed.id === "number") {
      return `#${parsed.id}`;
    }
  } catch {
    return "snapshot";
  }

  return "snapshot";
}
