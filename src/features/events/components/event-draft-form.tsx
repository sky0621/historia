"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { TimeExpressionField } from "@/components/fields/time-expression-field";
import { eventDraftSchema, type EventDraftInput } from "@/features/events/schema";

export function EventDraftForm() {
  const methods = useForm<EventDraftInput>({
    resolver: zodResolver(eventDraftSchema),
    defaultValues: {
      title: "",
      description: "",
      eventType: "general",
      timeExpression: {
        calendarEra: "CE",
        precision: "year",
        isApproximate: false,
        displayLabel: ""
      }
    }
  });

  const onSubmit = methods.handleSubmit(() => {
    // Sprint 1 では送信配線よりも共通フォーム骨格を優先する。
  });

  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">イベント作成</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          `TimeExpression` と共通フォーム基盤の確認用画面です。永続化は Sprint 3 で接続します。
        </p>
      </div>

      <FormProvider {...methods}>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
            <div className="grid gap-5">
              <label className="grid gap-2 text-sm">
                <span>タイトル</span>
                <input
                  {...methods.register("title")}
                  className="rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                  placeholder="壬申の乱"
                />
              </label>
              <label className="grid gap-2 text-sm">
                <span>種別</span>
                <select
                  {...methods.register("eventType")}
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
                <textarea
                  {...methods.register("description")}
                  className="min-h-36 rounded-2xl border border-[var(--border)] bg-white px-3 py-2"
                  placeholder="イベント概要"
                />
              </label>
            </div>
          </div>

          <TimeExpressionField name="timeExpression" label="時間表現" />

          <div className="flex justify-end">
            <button
              type="submit"
              className="rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white"
            >
              下書き保存準備
            </button>
          </div>
        </form>
      </FormProvider>
    </section>
  );
}
