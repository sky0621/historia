const ERA_LABELS = {
  BCE: "紀元前",
  CE: "西暦"
} as const;

const EVENT_TYPE_LABELS = {
  general: "一般",
  war: "戦争",
  rebellion: "反乱",
  civil_war: "内戦",
  treaty: "条約",
  battle: "戦闘",
  coup: "クーデター",
  revolution: "革命",
  founding: "成立",
  collapse: "崩壊",
  succession: "継承",
  reform: "改革",
  law: "法令",
  migration: "移動",
  religious_event: "宗教",
  cultural_event: "文化",
  disaster: "災害",
  discovery: "発見",
  diplomatic_event: "外交",
  economic_event: "経済"
} as const;

const EVENT_RELATION_TYPE_LABELS = {
  before: "先行",
  after: "後続",
  cause: "原因",
  related: "関連"
} as const;

const EVENT_CONFLICT_PARTICIPANT_TYPE_LABELS = {
  person: "人物",
  polity: "国家",
  religion: "宗教",
  sect: "宗派"
} as const;

const EVENT_CONFLICT_PARTICIPANT_ROLE_LABELS = {
  attacker: "攻撃側",
  defender: "防御側",
  leader: "指導者",
  ally: "同盟者",
  other: "その他"
} as const;

const EVENT_CONFLICT_SIDE_LABELS = {
  winner: "勝者側",
  loser: "敗者側"
} as const;

const HISTORICAL_PERIOD_RELATION_TYPE_LABELS = {
  precedes: "先行",
  succeeds: "後続",
  overlaps: "重複",
  includes: "包含",
  included_in: "被包含"
} as const;

const POLITY_TRANSITION_TYPE_LABELS = {
  renamed: "改称",
  succeeded: "後継",
  merged: "統合",
  split: "分裂",
  annexed: "併合",
  absorbed: "吸収",
  restored: "復興",
  reorganized: "再編",
  other: "その他"
} as const;

const CHANGE_HISTORY_ACTION_LABELS = {
  create: "作成",
  update: "更新",
  delete: "削除",
  import: "インポート"
} as const;

type LabelMap = Record<string, string>;

function lookupLabel(map: LabelMap, code: string | null | undefined) {
  if (!code) {
    return "";
  }

  return map[code] ?? code;
}

function buildOptions<T extends LabelMap>(map: T) {
  return Object.entries(map).map(([value, label]) => ({ value, label }));
}

export const eventTypeOptions = buildOptions(EVENT_TYPE_LABELS);
export const eraOptions = buildOptions(ERA_LABELS);
export const eventRelationTypeOptions = buildOptions(EVENT_RELATION_TYPE_LABELS);
export const eventConflictParticipantTypeOptions = buildOptions(EVENT_CONFLICT_PARTICIPANT_TYPE_LABELS);
export const eventConflictParticipantRoleOptions = buildOptions(EVENT_CONFLICT_PARTICIPANT_ROLE_LABELS);
export const eventConflictSideOptions = buildOptions(EVENT_CONFLICT_SIDE_LABELS);
export const historicalPeriodRelationTypeOptions = buildOptions(HISTORICAL_PERIOD_RELATION_TYPE_LABELS);
export const polityTransitionTypeOptions = buildOptions(POLITY_TRANSITION_TYPE_LABELS);

export function getEraLabel(code: string | null | undefined) {
  return lookupLabel(ERA_LABELS, code);
}

export function getEventTypeLabel(code: string | null | undefined) {
  return lookupLabel(EVENT_TYPE_LABELS, code);
}

export function getEventRelationTypeLabel(code: string | null | undefined) {
  return lookupLabel(EVENT_RELATION_TYPE_LABELS, code);
}

export function getEventConflictParticipantTypeLabel(code: string | null | undefined) {
  return lookupLabel(EVENT_CONFLICT_PARTICIPANT_TYPE_LABELS, code);
}

export function getEventConflictParticipantRoleLabel(code: string | null | undefined) {
  return lookupLabel(EVENT_CONFLICT_PARTICIPANT_ROLE_LABELS, code);
}

export function getEventConflictSideLabel(code: string | null | undefined) {
  return lookupLabel(EVENT_CONFLICT_SIDE_LABELS, code);
}

export function getHistoricalPeriodRelationTypeLabel(code: string | null | undefined) {
  return lookupLabel(HISTORICAL_PERIOD_RELATION_TYPE_LABELS, code);
}

export function getPolityTransitionTypeLabel(code: string | null | undefined) {
  return lookupLabel(POLITY_TRANSITION_TYPE_LABELS, code);
}

export function getChangeHistoryActionLabel(code: string | null | undefined) {
  return lookupLabel(CHANGE_HISTORY_ACTION_LABELS, code);
}
