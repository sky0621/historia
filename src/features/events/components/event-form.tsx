"use client";

import { useActionState, useState } from "react";
import {
  checkboxCardClassName,
  emptyStateClassName,
  fieldLabelClassName,
  fieldMetaClassName,
  formCardClassName,
  formErrorClassName,
  formHeroClassName,
  formHeroTextClassName,
  formInsetClassName,
  inputClassName,
  primaryButtonClassName,
  secondaryButtonClassName
} from "@/components/forms/styles";
import { CollapsibleFormSection } from "@/components/forms/collapsible-form-section";
import { RegionCheckboxTree } from "@/components/forms/region-checkbox-tree";
import { initialCreateFormState } from "@/features/actions/create-form-state";
import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { createEventAction, updateEventAction } from "@/features/events/actions";
import {
  eventConflictParticipantRoleOptions,
  eventConflictParticipantTypeOptions,
  eventRelationTypeOptions,
  getEventTypeLabel,
  eventTypeOptions
} from "@/lib/master-labels";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";
import { polityContainsRange } from "@/lib/time-expression/polity-range";

type Option = {
  id: number;
  name: string;
  parentRegionId?: number | null;
  timeLabel?: string;
  fromCalendarEra?: string | null;
  fromYear?: number | null;
  toCalendarEra?: string | null;
  toYear?: number | null;
};
type ReligionOption = { id: number; name: string };
type SectOption = { id: number; name: string; religionId: number };
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
    person: Option[];
    polities: Option[];
    dynasties: Option[];
    religions: ReligionOption[];
    sects: SectOption[];
    tags: Option[];
    regions: Option[];
    events: Option[];
  };
  defaultValues?: {
    id?: number;
    title: string;
    description: string;
    tags: string[];
    eventType: "general" | "war" | "rebellion" | "civil_war";
    fromTimeExpression?: TimeExpressionInput;
    toTimeExpression?: TimeExpressionInput;
    personIds: number[];
    polityIds: number[];
    dynastyIds: number[];
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
      resolutionSummary: string;
      note: string;
    };
  };
};

export function EventForm({ title, description, submitLabel, options, defaultValues }: Props) {
  const [createState, createAction] = useActionState(createEventAction, initialCreateFormState);
  const action = defaultValues?.id ? updateEventAction : createAction;
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
  const [fromCalendarEra, setFromCalendarEra] = useState<"BCE" | "CE">(defaultValues?.fromTimeExpression?.calendarEra ?? "CE");
  const [fromYearInput, setFromYearInput] = useState(defaultValues?.fromTimeExpression?.startYear?.toString() ?? "");
  const [toCalendarEra, setToCalendarEra] = useState<"BCE" | "CE">(defaultValues?.toTimeExpression?.calendarEra ?? "CE");
  const [toYearInput, setToYearInput] = useState(defaultValues?.toTimeExpression?.startYear?.toString() ?? "");
  const filteredPolityOptions = options.polities.filter((polity) =>
    polityContainsRange(polity, fromCalendarEra, fromYearInput, toCalendarEra, toYearInput)
  );

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
      <div className={formHeroClassName}>
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className={formHeroTextClassName}>{description}</p>
      </div>

      <form action={action} className="space-y-6">
        {defaultValues?.id ? <input type="hidden" name="id" value={defaultValues.id} /> : null}
        <input type="hidden" name="relationCount" value={relationCount} />
        <input type="hidden" name="participantCount" value={participantCount} />

        <section className={formCardClassName}>
        <div className="grid gap-5">
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>タイトル</span>
            <input name="title" defaultValue={defaultValues?.title ?? ""} className={inputClassName} required />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>種別</span>
            <select
              name="eventType"
              value={eventType}
              onChange={(event) => setEventType(event.target.value as "general" | "war" | "rebellion" | "civil_war")}
              className={inputClassName}
            >
              {eventTypeOptions
                .filter((option) => ["general", "war", "rebellion", "civil_war"].includes(option.value))
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>説明</span>
            <textarea name="description" defaultValue={defaultValues?.description ?? ""} className={`min-h-36 ${inputClassName}`} />
          </label>
          <label className={fieldLabelClassName}>
            <span className={fieldMetaClassName}>タグ</span>
            <input
              name="tags"
              defaultValue={defaultValues?.tags.join(", ") ?? ""}
              className={inputClassName}
              placeholder="戦争, 宗教, 文化"
            />
          </label>
        </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <TimeExpressionInputs
            prefix="fromTime"
            label="開始年"
            defaultValue={defaultValues?.fromTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
            calendarEraValue={fromCalendarEra}
            onCalendarEraChange={(value) => setFromCalendarEra(value as "BCE" | "CE")}
            startYearValue={fromYearInput}
            onStartYearChange={setFromYearInput}
          />
          <TimeExpressionInputs
            prefix="toTime"
            label="終了年"
            defaultValue={defaultValues?.toTimeExpression}
            includePrecision={false}
            includeDisplayLabel={false}
            includeEndYear={false}
            startYearLabel="終了年"
            calendarEraValue={toCalendarEra}
            onCalendarEraChange={(value) => setToCalendarEra(value as "BCE" | "CE")}
            startYearValue={toYearInput}
            onStartYearChange={setToYearInput}
          />
        </div>

        <SelectionGroup name="personIds" label="人物" options={options.person} selectedIds={defaultValues?.personIds ?? []} />
        <SelectionGroup
          name="polityIds"
          label="国家"
          options={filteredPolityOptions}
          selectedIds={defaultValues?.polityIds ?? []}
          optionLabel={formatPolityOptionLabel}
        />
        <SelectionGroup name="dynastyIds" label="王朝" options={options.dynasties} selectedIds={defaultValues?.dynastyIds ?? []} />
        <ReligionSectSelectionGroup
          religions={options.religions}
          sects={options.sects}
          selectedReligionIds={defaultValues?.religionIds ?? []}
          selectedSectIds={defaultValues?.sectIds ?? []}
        />
        <SelectionGroup name="regionIds" label="地域" options={options.regions} selectedIds={defaultValues?.regionIds ?? []} collapsible hierarchical />

        <section className={formCardClassName}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground-strong)]">関連イベント</h2>
              <p className="mt-1 text-sm text-[var(--muted-strong)]">前後関係や因果関係を登録します。</p>
            </div>
            <button
              type="button"
              onClick={() => setRelationCount((count) => count + 1)}
              className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--button-foreground)] hover:border-[var(--accent-strong)]"
            >
              関係を追加
            </button>
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: relationCount }).map((_, index) => {
              const relation = defaultValues?.relations[index];
              return (
                <div key={index} className={`${formInsetClassName} grid gap-4 lg:grid-cols-[1fr,200px]`}>
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>対象イベント</span>
                    <select
                      name={`relations.${index}.toEventId`}
                      defaultValue={relation?.toEventId ?? ""}
                      className={inputClassName}
                    >
                      <option value="">未設定</option>
                      {options.events.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>関係種別</span>
                    <select
                      name={`relations.${index}.relationType`}
                      defaultValue={relation?.relationType ?? "related"}
                      className={inputClassName}
                    >
                      {eventRelationTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              );
            })}
          </div>
        </section>

        <section className={formCardClassName}>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-[var(--foreground-strong)]">戦争・乱の専用項目</h2>
              <p className="mt-1 text-sm text-[var(--muted-strong)]">
                {isConflictEvent
                  ? "参加勢力と結果要約を登録します。"
                  : `種別を ${getEventTypeLabel("war")} / ${getEventTypeLabel("rebellion")} / ${getEventTypeLabel("civil_war")} にすると入力できます。`}
              </p>
            </div>
          </div>

          {!isConflictEvent ? (
            <div className={`mt-4 ${emptyStateClassName}`}>
              通常イベントでは戦争・乱の専用項目は使用しません。
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-semibold text-[var(--foreground-strong)]">参加勢力</h3>
                    <p className="mt-1 text-sm text-[var(--muted-strong)]">国家、人物、宗教、宗派から参加主体を選択します。</p>
                  </div>
                  <button
                    type="button"
                    onClick={addParticipant}
                    className="rounded-[14px] border border-[var(--border-strong)] bg-[var(--accent-soft)] px-4 py-2 text-sm font-medium text-[var(--button-foreground)] hover:border-[var(--accent-strong)]"
                  >
                    参加者を追加
                  </button>
                </div>
                {Array.from({ length: participantCount }).map((_, index) => {
                  const participant = defaultValues?.conflictParticipants[index];
                  const participantType = participantTypes[index] ?? "polity";
                  const participantOptions = getParticipantOptions(participantType, options);

                  return (
                    <div key={index} className={`space-y-4 ${formInsetClassName}`}>
                      <div className="grid gap-4 lg:grid-cols-3">
                        <label className={fieldLabelClassName}>
                          <span className={fieldMetaClassName}>主体種別</span>
                          <select
                            name={`participants.${index}.participantType`}
                            value={participantType}
                            onChange={(event) =>
                              updateParticipantType(index, event.target.value as ParticipantDefault["participantType"])
                            }
                            className={inputClassName}
                          >
                            {eventConflictParticipantTypeOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={fieldLabelClassName}>
                          <span className={fieldMetaClassName}>対象</span>
                          <select
                            name={`participants.${index}.participantId`}
                            value={participantIds[index] > 0 ? String(participantIds[index]) : ""}
                            onChange={(event) => updateParticipantId(index, Number(event.target.value) || 0)}
                            className={inputClassName}
                          >
                            <option value="">未設定</option>
                            {participantOptions.map((item) => (
                              <option key={`${participantType}-${item.id}`} value={item.id}>
                                {item.name}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className={fieldLabelClassName}>
                          <span className={fieldMetaClassName}>役割</span>
                          <select
                            name={`participants.${index}.role`}
                            defaultValue={participant?.role ?? "other"}
                            className={inputClassName}
                          >
                            {eventConflictParticipantRoleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <label className={fieldLabelClassName}>
                        <span className={fieldMetaClassName}>メモ</span>
                        <textarea
                          name={`participants.${index}.note`}
                          defaultValue={participant?.note ?? ""}
                          className={`min-h-24 ${inputClassName}`}
                        />
                      </label>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-4">
                <h3 className="text-base font-semibold text-[var(--foreground-strong)]">結果要約</h3>
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
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>勝者側</span>
                    <textarea
                      name="conflictOutcome.winnerSummary"
                      defaultValue={defaultValues?.conflictOutcome?.winnerSummary ?? ""}
                      className={`min-h-20 ${inputClassName}`}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>敗者側</span>
                    <textarea
                      name="conflictOutcome.loserSummary"
                      defaultValue={defaultValues?.conflictOutcome?.loserSummary ?? ""}
                      className={`min-h-20 ${inputClassName}`}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>決着要約</span>
                    <textarea
                      name="conflictOutcome.resolutionSummary"
                      defaultValue={defaultValues?.conflictOutcome?.resolutionSummary ?? ""}
                      className={`min-h-24 ${inputClassName}`}
                    />
                  </label>
                  <label className={fieldLabelClassName}>
                    <span className={fieldMetaClassName}>補足メモ</span>
                    <textarea
                      name="conflictOutcome.note"
                      defaultValue={defaultValues?.conflictOutcome?.note ?? ""}
                      className={`min-h-24 ${inputClassName}`}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </section>

        {!defaultValues?.id && createState.error ? <p className={formErrorClassName}>{createState.error}</p> : null}

        <div className="flex justify-end gap-3">
          {!defaultValues?.id ? (
            <button type="submit" name="intent" value="create-and-continue" className={secondaryButtonClassName}>
              続けて作成
            </button>
          ) : null}
          <button type="submit" className={primaryButtonClassName}>
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
      return options.person;
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
    <fieldset className={formCardClassName}>
      <legend className="px-2 text-base font-semibold text-[var(--foreground-strong)]">{label}</legend>
      <div className="mt-3 grid gap-3">
        {participants.length === 0 ? (
          <p className={emptyStateClassName}>先に参加勢力を選択してください。</p>
        ) : (
          participants.map((participant) => (
            <label key={participant.value} className={checkboxCardClassName}>
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
  selectedIds,
  collapsible = false,
  hierarchical = false,
  optionLabel = (option: Option) => option.name
}: {
  name: string;
  label: string;
  options: Option[];
  selectedIds: number[];
  collapsible?: boolean;
  hierarchical?: boolean;
  optionLabel?: (option: Option) => string;
}) {
  const content = (
    options.length === 0 ? (
      <p className={emptyStateClassName}>選択肢はまだありません。</p>
    ) : hierarchical ? (
      <RegionCheckboxTree name={name} options={options} selectedIds={selectedIds} itemClassName={checkboxCardClassName} />
    ) : (
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {options.map((option) => (
          <label key={option.id} className={checkboxCardClassName}>
            <input type="checkbox" name={name} value={option.id} defaultChecked={selectedIds.includes(option.id)} />
            {optionLabel(option)}
          </label>
        ))}
      </div>
    )
  );

  if (collapsible) {
    return (
      <section className={formCardClassName}>
        <CollapsibleFormSection title={label} defaultOpen={selectedIds.length > 0}>
          {content}
        </CollapsibleFormSection>
      </section>
    );
  }

  return (
    <fieldset className={formCardClassName}>
      <legend className="px-2 text-base font-semibold text-[var(--foreground-strong)]">{label}</legend>
      {content}
    </fieldset>
  );
}

function formatPolityOptionLabel(option: Option) {
  return option.timeLabel ? `${option.name}（${option.timeLabel}）` : option.name;
}

function ReligionSectSelectionGroup({
  religions,
  sects,
  selectedReligionIds,
  selectedSectIds
}: {
  religions: ReligionOption[];
  sects: SectOption[];
  selectedReligionIds: number[];
  selectedSectIds: number[];
}) {
  const defaultOpen = selectedReligionIds.length > 0 || selectedSectIds.length > 0;

  return (
    <section className={formCardClassName}>
      <CollapsibleFormSection title="宗教" defaultOpen={defaultOpen}>
        {religions.length === 0 ? (
          <p className={emptyStateClassName}>選択肢はまだありません。</p>
        ) : (
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {religions.map((religion) => {
              const relatedSects = sects.filter((sect) => sect.religionId === religion.id);
              const hasSelectedChild = relatedSects.some((sect) => selectedSectIds.includes(sect.id));
              const isReligionSelected = selectedReligionIds.includes(religion.id);

              return (
                <details
                  key={religion.id}
                  open={isReligionSelected || hasSelectedChild}
                  className={`${checkboxCardClassName} group`}
                >
                  <summary className="cursor-pointer list-none text-sm text-[var(--foreground)] [&::-webkit-details-marker]:hidden">
                    <span className="inline-flex items-center gap-3">
                      {relatedSects.length > 0 ? (
                        <>
                          <span className="text-[var(--muted)] group-open:hidden">▶</span>
                          <span className="hidden text-[var(--muted)] group-open:inline">▼</span>
                        </>
                      ) : (
                        <span className="w-3" />
                      )}
                      <input
                        type="checkbox"
                        name="religionIds"
                        value={religion.id}
                        defaultChecked={selectedReligionIds.includes(religion.id)}
                        onClick={(event) => event.stopPropagation()}
                      />
                      {religion.name}
                    </span>
                  </summary>
                  {relatedSects.length > 0 ? (
                    <div className="mt-3 ml-6 border-l border-[var(--border)] pl-4">
                      <div className="grid gap-2">
                        {relatedSects.map((sect) => (
                          <label key={sect.id} className="flex items-center gap-3 text-sm text-[var(--muted-strong)]">
                            <input type="checkbox" name="sectIds" value={sect.id} defaultChecked={selectedSectIds.includes(sect.id)} />
                            {sect.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </details>
              );
            })}
          </div>
        )}
      </CollapsibleFormSection>
    </section>
  );
}
