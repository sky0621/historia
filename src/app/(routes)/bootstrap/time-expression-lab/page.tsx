import { TimeExpressionInputs } from "@/components/fields/time-expression-inputs";
import { formatTimeExpression } from "@/lib/time-expression/format";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";
import type { TimeExpressionInput } from "@/lib/time-expression/schema";

const samples: Array<{ title: string; value: TimeExpressionInput | undefined }> = [
  {
    title: "単年 CE",
    value: { calendarEra: "CE", startYear: 794, isApproximate: false, precision: "year", displayLabel: "" }
  },
  {
    title: "範囲 BCE",
    value: { calendarEra: "BCE", startYear: 500, endYear: 300, isApproximate: false, precision: "year", displayLabel: "" }
  },
  {
    title: "推定年",
    value: { calendarEra: "CE", startYear: 550, isApproximate: true, precision: "year", displayLabel: "" }
  },
  {
    title: "表示ラベル優先",
    value: { calendarEra: "CE", isApproximate: false, precision: "year", displayLabel: "弥生時代後期ごろ" }
  },
  {
    title: "不明年",
    value: undefined
  }
] as const;

export default function TimeExpressionLabPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--surface)] p-8 shadow-sm">
        <h1 className="text-3xl font-semibold">TimeExpression Lab</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          `TimeExpression` の表示、保存形式への変換、入力部品を単体で確認するためのページです。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr,1fr]">
        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">表示と変換サンプル</h2>
          <div className="mt-6 space-y-4">
            {samples.map((sample) => {
              const record = toTimeExpressionRecord(sample.value);
              const restored = fromTimeExpressionRecord(record);

              return (
                <div key={sample.title} className="rounded-[24px] border border-[var(--border)] p-5">
                  <h3 className="text-sm font-semibold">{sample.title}</h3>
                  <dl className="mt-3 grid gap-2 text-sm">
                    <div>
                      <dt className="font-medium text-[var(--muted)]">表示</dt>
                      <dd className="mt-1">{sample.value ? formatTimeExpression(sample.value) : "年未詳"}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--muted)]">入力値</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-all text-[var(--muted)]">
                        {JSON.stringify(sample.value ?? null, null, 2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--muted)]">保存形式</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-all text-[var(--muted)]">
                        {JSON.stringify(record, null, 2)}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-[var(--muted)]">復元値</dt>
                      <dd className="mt-1 whitespace-pre-wrap break-all text-[var(--muted)]">
                        {JSON.stringify(restored ?? null, null, 2)}
                      </dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-[32px] border border-[var(--border)] bg-white/80 p-8 shadow-sm">
          <h2 className="text-lg font-semibold">入力部品サンプル</h2>
          <form className="mt-6 space-y-4">
            <TimeExpressionInputs
              prefix="sampleTime"
              label="TimeExpression"
              defaultValue={{ calendarEra: "CE", startYear: 794, endYear: 1185, isApproximate: false, precision: "year", displayLabel: "" }}
            />
          </form>
        </div>
      </div>
    </section>
  );
}
