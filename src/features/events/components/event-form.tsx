"use client";

import { useState } from "react";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createEventAction, updateEventAction } from "@/features/events/actions";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

type Option = { id: number; name: string };
type RelationDefault = { toEventId: number; relationType: "before" | "after" | "cause" | "related" };
type ParticipantDefault = {
  participantType: "polity" | "person" | "religion" | "sect";
  participantId: number;
  role: "attacker" | "defender" | "leader" | "ally" | "other";
  note: string;
};
type OutcomeParticipantDefault = {
  side: "winner" | "loser";
  participantType: "polity" | "person" | "religion" | "sect";
  participantId: number;
};

type Props = {
  title: string;
  description: string;
  submitLabel: string;
  options: {
    people: Option[];
    polities: Option[];
    dynasties: Option[];
    periods: Option[];
    religions: Option[];
    sects: Option[];
    regions: Option[];
    events: Option[];
  };
  defaultValues?: {
    id?: number;
    title: string;
    description: string;
    eventType: "general" | "war" | "rebellion" | "civil_war";
    timeExpression?: TimeExpressionInput;
    startTimeExpression?: TimeExpressionInput;
    endTimeExpression?: TimeExpressionInput;
    personIds: number[];
    polityIds: number[];
    dynastyIds: number[];
    periodIds: number[];
    religionIds: number[];
    sectIds: number[];
    regionIds: number[];
    relations: RelationDefault[];
    conflictParticipants: ParticipantDefault[];
    conflictOutcome?: {
      winnerParticipants: OutcomeParticipantDefault[];
      loserParticipants: OutcomeParticipantDefault[];
      winnerSummary: string;
      loserSummary: string;
      settlementSummary: string;
      note: string;
    };
  };
};

export function EventForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const action = defaultValues?.id ? updateEventAction : createEventAction;
  const [eventType, setEventType] = useState<"general" | "war" | "rebellion" | "civil_war">(
    defaultValues?.eventType ?? "general"
  );
  const [relationCount, setRelationCount] = useState(Math.max(defaultValues?.relations.length ?? 0, 1));
  const [participantCount, setParticipantCount] = useState(
    Math.max(defaultValues?.conflictParticipants.length ?? 0, 1)
  );
  const [participantTypes, setParticipantTypes] = useState<Array<ParticipantDefault["participantType"]>>(
    Array.from({ length: Math.max(defaultValues?.conflictParticipants.length ?? 0, 1) }, (_, index) => {
      return defaultValues?.conflictParticipants[index]?.participantType ?? "polity";
    })
  );
  const [participantIds, setParticipantIds] = useState<Array<number>>(
    Array.from({ length: Math.max(defaultValues?.conflictParticipants.length ?? 0, 1) }, (_, index) => {
      return defaultValues?.conflictParticipants[index]?.participantId ?? 0;
    })
  );
  const isConflictEvent = eventType !== "general";

  const addParticipant = () => {
    setParticipantCount((count) => count + 1);
    setParticipantTypes((current) => [...current, "polity"]);
    setParticipantIds((current) => [...current, 0]);
  };

  const updateParticipantType = (index: number, value: ParticipantDefault["participantType"]) => {
    setParticipantTypes((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
    setParticipantIds((current) => current.map((item, itemIndex) => (itemIndex === index ? 0 : item)));
  };

  const updateParticipantId = (index: number, value: number) => {
    setParticipantIds((current) => current.map((item, itemIndex) => (itemIndex === index ? value : item)));
  };

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">{description}</p>
      </div>

      <form action={action} className="space-y-6 rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <input type="hidden" name="relationCount" value={relationCount} />
        <input type="hidden" name="participantCount" value={participantCount} />

        <div className="grid gap-5">
          <label className="grid gap-2 text-sm">
            <span>タイトル</span>
            <input name="title" defaultValue={defaultValues?.title ?? ""} className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2" required />
          </label>
          <label className="grid gap-2 text-sm">
            <span>種別</span>
            <select
              name="eventType"
              value={eventType}
              onChange={(event) => setEventType(event.target.value as "general" | "war" | "rebellion" | "civil_war")}
              className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
            >
              <option value="general">general</option>
              <option value="war">war</option>
              <option value="rebellion">rebellion</option>
              <option value="civil_war">civil_war</option>
            </select>
          </label>
          <label className="grid gap-2 text-sm">
            <span>説明</span>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} className="min-h-36 rounded-2xl border border-[var(--border)] bg-white px-3 py-2" />
          </label>
        </div>

        <TimeExpressionInputs prefix="time" label="時点または全体期間" defaultValue={defaultValues?.timeExpression} />

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs prefix="startTime" label="開始年" defaultValue={defaultValues?.startTimeExpression} />
          <TimeExpressionInputs prefix="endTime" label="終了年" defaultValue={defaultValues?.endTimeExpression} />
        </div>

        <SelectionGroup name="personIds" label="人物" options={options.people} selectedIds={defaultValues?.personIds ?? []} />
        <SelectionGroup name="polityIds" label="国家" options={options.polities} selectedIds={defaultValues?.polityIds ?? []} />
        <SelectionGroup name="dynastyIds" label="王朝" options={options.dynasties} selectedIds={defaultValues?.dynastyIds ?? []} />
        <SelectionGroup name="periodIds" label="時代区分" options={options.periods} selectedIds={defaultValues?.periodIds ?? []} />
        <SelectionGroup name="religionIds" label="宗教" options={options.religions} selectedIds={defaultValues?.religionIds ?? []} />
        <SelectionGroup name="sectIds" label="宗派" options={options.sects} selectedIds={defaultValues?.sectIds ?? []} />
        <SelectionGroup name="regionIds" label="地域" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} />

        <section className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--muted)]">関連イベント</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">前後関係や因果関係を登録します。</p>
            </div>
            <button
              type="button"
              onClick={() => setRelationCount((count) => count + 1)}
              className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
            >
              関係を追加
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: relationCount }).map((_, index) => {
              const relation = defaultValues?.relations[index];
              return (
                <div key={index} className="grid gap-4 rounded-2xl border border-[var(--border)] p-4 lg:grid-cols-[1fr,200px]">
                  <label className="grid gap-2 text-sm">
                    <span>対象イベント</span>
                    <select
                      name={`relations.${index}.toEventId`}
                      defaultValue={relation?.toEventId ?? ""}
                      className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    >
                      <option value="">未設定</option>
                      {options.events.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>関係種別</span>
                    <select
                      name={`relations.${index}.relationType`}
                      defaultValue={relation?.relationType ?? "related"}
                      className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    >
                      <option value="before">before</option>
                      <option value="after">after</option>
                      <option value="cause">cause</option>
                      <option value="related">related</option>
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--muted)]">戦争・乱の専用項目</h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {isConflictEvent ? "参加勢力と結果要約を登録します。" : "種別を war / rebellion / civil_war にすると入力できます。"}
              </p>
            </div>
          </div>

          {!isConflictEvent ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[var(--border)] px-4 py-6 text-sm text-[var(--muted)]">
              通常イベントでは戦争・乱の専用項目は使用しません。
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--muted)]">参加勢力</h3>
                    <p className="mt-1 text-sm text-[var(--muted)]">国家、人物、宗教、宗派から参加主体を選択します。</p>
                  </div>
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="rounded-full border border-[var(--border)] px-4 py-2 text-sm"
                  >
                    参加者を追加
                  </button>
                </div>
                {Array.from({ length: participantCount }).map((_, index) => {
                  const participant = defaultValues?.conflictParticipants[index];
                  const participantType = participantTypes[index] ?? "polity";
                  const participantOptions = getParticipantOptions(participantType, options);

                  return (
                    <div key={index} className="space-y-4 rounded-2xl border border-[var(--border)] p-4">
                      <div className="grid gap-4 lg:grid-cols-3">
                        <label className="grid gap-2 text-sm">
                          <span>主体種別</span>
                          <select
                            name={`participants.${index}.participantType`}
                            value={participantType}
                            onChange={(event) =>
                              updateParticipantType(index, event.target.value as ParticipantDefault["participantType"])
                            }
                            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                          >
                            <option value="polity">polity</option>
                            <option value="person">person</option>
                            <option value="religion">religion</option>
                            <option value="sect">sect</option>
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm">
                          <span>対象</span>
                          <select
                            name={`participants.${index}.participantId`}
                            value={participantIds[index] > 0 ? String(participantIds[index]) : ""}
                            onChange={(event) => updateParticipantId(index, Number(event.target.value) || 0)}
                            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                          >
                            <option value="">未設定</option>
                            {participantOptions.map((item) => (
                              <option key={`${participantType}-${item.id}`} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="grid gap-2 text-sm">
                          <span>役割</span>
                          <select
                            name={`participants.${index}.role`}
                            defaultValue={participant?.role ?? "other"}
                            className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                          >
                            <option value="attacker">attacker</option>
                            <option value="defender">defender</option>
                            <option value="leader">leader</option>
                            <option value="ally">ally</option>
                            <option value="other">other</option>
                          </select>
                        </label>
                      </div>
                      <label className="grid gap-2 text-sm">
                        <span>メモ</span>
                        <textarea
                          name={`participants.${index}.note`}
                          defaultValue={participant?.note ?? ""}
                          className="min-h-24 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--muted)]">結果要約</h3>
                <div className="grid gap-6 lg:grid-cols-2">
                  <OutcomeParticipantSelection
                    label="勝者側参加勢力"
                    name="conflictOutcome.winnerParticipants"
                    participants={buildOutcomeParticipantOptions(participantTypes, participantIds, options)}
                    selectedValues={toSelectedOutcomeValues(defaultValues?.conflictOutcome?.winnerParticipants ?? [])}
                  />
                  <OutcomeParticipantSelection
                    label="敗者側参加勢力"
                    name="conflictOutcome.loserParticipants"
                    participants={buildOutcomeParticipantOptions(participantTypes, participantIds, options)}
                    selectedValues={toSelectedOutcomeValues(defaultValues?.conflictOutcome?.loserParticipants ?? [])}
                  />
                </div>
                <div className="grid gap-4">
                  <label className="grid gap-2 text-sm">
                    <span>勝者側</span>
                    <textarea
                      name="conflictOutcome.winnerSummary"
                      defaultValue={defaultValues?.conflictOutcome?.winnerSummary ?? ""}
                      className="min-h-20 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>敗者側</span>
                    <textarea
                      name="conflictOutcome.loserSummary"
                      defaultValue={defaultValues?.conflictOutcome?.loserSummary ?? ""}
                      className="min-h-20 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>講和・停戦要約</span>
                    <textarea
                      name="conflictOutcome.settlementSummary"
                      defaultValue={defaultValues?.conflictOutcome?.settlementSummary ?? ""}
                      className="min-h-24 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>
                  <label className="grid gap-2 text-sm">
                    <span>補足メモ</span>
                    <textarea
                      name="conflictOutcome.note"
                      defaultValue={defaultValues?.conflictOutcome?.note ?? ""}
                      className="min-h-24 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>

        <div className="flex justify-end">
          <button type="submit" className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white">
            {submitLabel}
          </button>
        </div>
      </form>
    </section>
  );
}

function getParticipantOptions(
  participantType: ParticipantDefault["participantType"],
  options: Props["options"]
) {
  switch (participantType) {
    case "person":
      return options.people;
    case "religion":
      return options.religions;
    case "sect":
      return options.sects;
    case "polity":
    default:
      return options.polities;
  }
}

function buildOutcomeParticipantOptions(
  participantTypes: Array<ParticipantDefault["participantType"]>,
  participantIds: number[],
  options: Props["options"]
) {
  return participantTypes
    .map((participantType, index) => {
      const participantId = participantIds[index] ?? 0;
      if (participantId <= 0) {
        return null;
      }

      const option = getParticipantOptions(participantType, options).find((item) => item.id === participantId);
      if (!option) {
        return null;
      }

      return {
        value: `${participantType}:${participantId}`,
        label: option.name
      };
    })
    .filter((item, index, values): item is { value: string; label: string } => {
      if (!item) {
        return false;
      }

      return values.findIndex((candidate) => candidate?.value === item.value) === index;
    });
}

function toSelectedOutcomeValues(values: OutcomeParticipantDefault[]) {
  return values.map((value) => `${value.participantType}:${value.participantId}`);
}

function OutcomeParticipantSelection({
  label,
  name,
  participants,
  selectedValues
}: {
  label: string;
  name: string;
  participants: Array<{ value: string; label: string }>;
  selectedValues: string[];
}) {
  return (
    <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
      <legend className="px-2 text-sm font-semibold text-[var(--muted)]">{label}</legend>
      <div className="mt-3 grid gap-3">
        {participants.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">先に参加勢力を選択してください。</p>
        ) : (
          participants.map((participant) => (
            <label key={participant.value} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              <input type="checkbox" name={name} value={participant.value} defaultChecked={selectedValues.includes(participant.value)} />
              {participant.label}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}

function SelectionGroup({
  name,
  label,
  options,
  selectedIds
}: {
  name: string;
  label: string;
  options: Option[];
  selectedIds: number[];
}) {
  return (
    <fieldset className="rounded-[24px] border border-[var(--border)] bg-white/80 p-5">
      <legend className="px-2 text-sm font-semibold text-[var(--muted)]">{label}</legend>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {options.length === 0 ? (
          <p className="text-sm text-[var(--muted)]">選択肢はまだありません。</p>
        ) : (
          options.map((option) => (
            <label key={option.id} className="flex items-center gap-3 rounded-2xl border border-[var(--border)] px-4 py-3 text-sm">
              <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} />
              {option.name}
            </label>
          ))
        )}
      </div>
    </fieldset>
  );
}
