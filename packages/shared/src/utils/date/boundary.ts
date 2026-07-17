import { Temporal } from "temporal-polyfill";
import type { DateInput } from "./constants";
import { toZonedDateTimeOrEpoch } from "./temporal";

// ==================== 日期边界 ====================

/**
 * 获取一天的开始时间 00:00:00
 *
 * @param date 日期输入
 */
export function startOfDay(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({ hour: 0, minute: 0, second: 0, millisecond: 0, microsecond: 0, nanosecond: 0 });
}

/**
 * 获取一天的结束时间 23:59:59
 *
 * @param date 日期输入
 */
export function endOfDay(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

/**
 * 获取一周的开始
 *
 * @param date 日期输入
 */
export function startOfWeek(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  // Temporal 的 dayOfWeek: 1 = 周一, 7 = 周日。
  // 我们基于周一作为一周的开始：
  const start = zdt.subtract({ days: zdt.dayOfWeek - 1 });
  return start.with({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

/**
 * 获取一周的结束
 *
 * @param date 日期输入
 */
export function endOfWeek(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  const end = zdt.add({ days: 7 - zdt.dayOfWeek });
  return end.with({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

/**
 * 获取一月的开始
 *
 * @param date 日期输入
 */
export function startOfMonth(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

/**
 * 获取一月的结束
 *
 * @param date 日期输入
 */
export function endOfMonth(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({
    day: zdt.daysInMonth,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

/**
 * 获取一年的开始
 *
 * @param date 日期输入
 */
export function startOfYear(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({
    month: 1,
    day: 1,
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    microsecond: 0,
    nanosecond: 0,
  });
}

/**
 * 获取一年的结束
 *
 * @param date 日期输入
 */
export function endOfYear(date: DateInput): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  return zdt.with({
    month: 12,
    day: 31,
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
    microsecond: 999,
    nanosecond: 999,
  });
}

// ==================== 日期范围 ====================

/** 获取今天的日期范围 */
export function getTodayRange(): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const today = Temporal.Now.zonedDateTimeISO();
  return [startOfDay(today), endOfDay(today)];
}

/** 获取昨天的日期范围 */
export function getYesterdayRange(): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const yesterday = Temporal.Now.zonedDateTimeISO().subtract({ days: 1 });
  return [startOfDay(yesterday), endOfDay(yesterday)];
}

/** 获取本周的日期范围 */
export function getThisWeekRange(): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const today = Temporal.Now.zonedDateTimeISO();
  return [startOfWeek(today), endOfWeek(today)];
}

/** 获取本月的日期范围 */
export function getThisMonthRange(): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const today = Temporal.Now.zonedDateTimeISO();
  return [startOfMonth(today), endOfMonth(today)];
}

/** 获取本年的日期范围 */
export function getThisYearRange(): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const today = Temporal.Now.zonedDateTimeISO();
  return [startOfYear(today), endOfYear(today)];
}

/**
 * 获取最近 N 天的日期范围
 *
 * @param days 天数
 */
export function getLastDaysRange(days: number): [Temporal.ZonedDateTime, Temporal.ZonedDateTime] {
  const today = Temporal.Now.zonedDateTimeISO();
  const start = today.subtract({ days: days - 1 });
  return [startOfDay(start), endOfDay(today)];
}
