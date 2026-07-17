import { describe, expect, it } from "vitest";
import { Temporal } from "temporal-polyfill";
import {
  endOfDay,
  endOfMonth,
  endOfWeek,
  endOfYear,
  getLastDaysRange,
  getThisMonthRange,
  getThisWeekRange,
  getThisYearRange,
  getTodayRange,
  getYesterdayRange,
  startOfDay,
  startOfMonth,
  startOfWeek,
  startOfYear,
} from "../../../src/utils/date/boundary.js";
import { formatDate, formatTime } from "../../../src/utils/date/format.js";

// ==================== 日期边界 ====================

describe("startOfDay / endOfDay", () => {
  it("startOfDay 应返回 00:00:00", () => {
    const result = startOfDay("2024-03-15T10:30:00");
    expect(formatTime(result)).toBe("00:00:00");
    expect(formatDate(result)).toBe("2024-03-15");
  });

  it("endOfDay 应返回 23:59:59", () => {
    const result = endOfDay("2024-03-15T10:30:00");
    expect(formatTime(result)).toBe("23:59:59");
  });
});

describe("startOfWeek / endOfWeek", () => {
  it("应返回有效的 ZonedDateTime 对象并符合先后顺序", () => {
    const start = startOfWeek("2024-03-15");
    const end = endOfWeek("2024-03-15");
    expect(start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(end).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(Temporal.ZonedDateTime.compare(start, end)).toBeLessThan(0);
  });
});

describe("startOfMonth / endOfMonth", () => {
  it("startOfMonth 应返回月初", () => {
    const result = startOfMonth("2024-03-15");
    expect(formatDate(result)).toBe("2024-03-01");
  });

  it("endOfMonth 应返回月末", () => {
    const result = endOfMonth("2024-03-15");
    expect(formatDate(result)).toBe("2024-03-31");
  });
});

describe("startOfYear / endOfYear", () => {
  it("startOfYear 应返回年初", () => {
    const result = startOfYear("2024-03-15");
    expect(formatDate(result)).toBe("2024-01-01");
  });

  it("endOfYear 应返回年末", () => {
    const result = endOfYear("2024-03-15");
    expect(formatDate(result)).toBe("2024-12-31");
  });
});

// ==================== 日期范围 ====================

describe("getTodayRange", () => {
  it("应返回包含两个元素的元组", () => {
    const [start, end] = getTodayRange();
    expect(start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(end).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(Temporal.ZonedDateTime.compare(start, end)).toBeLessThan(0);
  });

  it("start 应为 00:00:00, end 应为 23:59:59", () => {
    const [start, end] = getTodayRange();
    expect(formatTime(start)).toBe("00:00:00");
    expect(formatTime(end)).toBe("23:59:59");
  });
});

describe("getYesterdayRange", () => {
  it("应返回昨天的日期范围", () => {
    const [start, end] = getYesterdayRange();
    expect(start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(end).toBeInstanceOf(Temporal.ZonedDateTime);

    const [todayStart] = getTodayRange();
    expect(Temporal.ZonedDateTime.compare(start, todayStart)).toBeLessThan(0);
  });
});

describe("getThisWeekRange", () => {
  it("应返回有效的周范围", () => {
    const [start, end] = getThisWeekRange();
    expect(start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(end).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(Temporal.ZonedDateTime.compare(start, end)).toBeLessThan(0);
  });
});

describe("getThisMonthRange", () => {
  it("应返回有效的月范围", () => {
    const [start, end] = getThisMonthRange();
    expect(start).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(end).toBeInstanceOf(Temporal.ZonedDateTime);
    expect(start.day).toBe(1);
  });
});

describe("getThisYearRange", () => {
  it("应返回有效的年范围", () => {
    const [start, end] = getThisYearRange();
    expect(formatDate(start, "MM-DD")).toBe("01-01");
    expect(formatDate(end, "MM-DD")).toBe("12-31");
  });
});

describe("getLastDaysRange", () => {
  it("最近 7 天应包含 7 天跨度", () => {
    const [start, end] = getLastDaysRange(7);
    const startPlain = start.toPlainDate();
    const endPlain = end.toPlainDate();
    const diff = startPlain.until(endPlain).days;
    expect(diff).toBe(6); // 6 天差 + 当天 = 7 天
  });

  it("最近 1 天应为今天", () => {
    const [start, end] = getLastDaysRange(1);
    expect(formatDate(start)).toBe(formatDate(end));
  });
});
