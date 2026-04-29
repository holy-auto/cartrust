import { describe, it, expect } from "vitest";
import { monthsBackDateStr } from "../followUp";

/**
 * monthsBackDateStr は cron が「今日が施工後 N ヶ月の節目に当たるか」
 * 判定するための日付逆算ヘルパー。同日付一致 + 月末オーバーフロー時は
 * 月末日に丸める仕様。
 */
describe("monthsBackDateStr", () => {
  it("returns same-day date 6 months earlier", () => {
    // 2026-04-29 → 2025-10-29 (普通の同日一致)
    expect(monthsBackDateStr(new Date("2026-04-29T00:00:00Z"), 6)).toBe("2025-10-29");
  });

  it("returns same-day date 12 months earlier", () => {
    expect(monthsBackDateStr(new Date("2026-04-29T00:00:00Z"), 12)).toBe("2025-04-29");
  });

  it("rolls 3/31 back 1 month to 2/28 (non-leap)", () => {
    // setMonth(-1) on 2026-03-31 carries to 2026-03-03; we expect rollback to 2026-02-28
    expect(monthsBackDateStr(new Date("2026-03-31T00:00:00Z"), 1)).toBe("2026-02-28");
  });

  it("rolls 3/31 back 1 month to 2/29 (leap year)", () => {
    expect(monthsBackDateStr(new Date("2024-03-31T00:00:00Z"), 1)).toBe("2024-02-29");
  });

  it("rolls 1/31 back 1 month to 12/31 across year boundary", () => {
    expect(monthsBackDateStr(new Date("2026-01-31T00:00:00Z"), 1)).toBe("2025-12-31");
  });

  it("handles 12-month back across year boundary", () => {
    expect(monthsBackDateStr(new Date("2026-04-29T00:00:00Z"), 12)).toBe("2025-04-29");
  });

  it("handles 24-month back", () => {
    expect(monthsBackDateStr(new Date("2026-04-29T00:00:00Z"), 24)).toBe("2024-04-29");
  });
});
