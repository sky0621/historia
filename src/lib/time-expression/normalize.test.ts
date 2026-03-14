import { describe, expect, it } from "vitest";
import { parseTimeExpressionFormData } from "@/lib/time-expression/form-data";
import { fromTimeExpressionRecord, toTimeExpressionRecord } from "@/lib/time-expression/normalize";

describe("time expression normalization", () => {
  it("round-trips between input and record", () => {
    const input = {
      calendarEra: "BCE" as const,
      startYear: 500,
      endYear: 480,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前500年頃 - 紀元前480年頃"
    };

    const record = toTimeExpressionRecord(input);

    expect(record).toEqual({
      calendarEra: "BCE",
      startYear: 500,
      endYear: 480,
      isApproximate: true,
      precision: "year",
      displayLabel: "紀元前500年頃 - 紀元前480年頃"
    });
    expect(fromTimeExpressionRecord(record)).toEqual(input);
  });

  it("parses form data and returns undefined when empty", () => {
    const emptyFormData = new FormData();
    expect(parseTimeExpressionFormData(emptyFormData, "time")).toBeUndefined();

    const filledFormData = new FormData();
    filledFormData.set("time.calendarEra", "CE");
    filledFormData.set("time.startYear", "794");
    filledFormData.set("time.endYear", "1185");
    filledFormData.set("time.isApproximate", "on");
    filledFormData.set("time.precision", "year");
    filledFormData.set("time.displayLabel", "794年 - 1185年");

    expect(parseTimeExpressionFormData(filledFormData, "time")).toEqual({
      calendarEra: "CE",
      startYear: 794,
      endYear: 1185,
      isApproximate: true,
      precision: "year",
      displayLabel: "794年 - 1185年"
    });
  });
});
