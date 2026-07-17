import { Temporal } from "temporal-polyfill";
import type { DateInput } from "./constants";
import { toZonedDateTime, toZonedDateTimeOrEpoch } from "./temporal";

// ==================== 时间戳转换 ====================

/**
 * 日期转时间戳（毫秒）
 *
 * @param date 日期输入
 */
export function toTimestamp(date: DateInput): number {
  if (!date) return 0;
  const zdt = toZonedDateTime(date);
  return zdt ? zdt.epochMilliseconds : 0;
}

/**
 * 日期转时间戳（秒）
 *
 * @param date 日期输入
 */
export function toUnixTimestamp(date: DateInput): number {
  if (!date) return 0;
  const zdt = toZonedDateTime(date);
  return zdt ? Math.floor(zdt.epochMilliseconds / 1000) : 0;
}

// ==================== 日期计算 ====================

/**
 * 日期加法
 *
 * @param date 日期输入
 * @param value 增加的值
 * @param unit 单位：day/month/year/hour/minute/second
 */
export function addDate(
  date: DateInput,
  value: number,
  unit: string = "day",
): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  const unitMap: Record<string, string> = {
    day: "days",
    days: "days",
    month: "months",
    months: "months",
    year: "years",
    years: "years",
    hour: "hours",
    hours: "hours",
    minute: "minutes",
    minutes: "minutes",
    second: "seconds",
    seconds: "seconds",
  };
  const key = unitMap[unit] || "days";
  return zdt.add({ [key]: value });
}

/**
 * 日期减法
 *
 * @param date 日期输入
 * @param value 减少的值
 * @param unit 单位：day/month/year/hour/minute/second
 */
export function subtractDate(
  date: DateInput,
  value: number,
  unit: string = "day",
): Temporal.ZonedDateTime {
  const zdt = toZonedDateTimeOrEpoch(date);
  const unitMap: Record<string, string> = {
    day: "days",
    days: "days",
    month: "months",
    months: "months",
    year: "years",
    years: "years",
    hour: "hours",
    hours: "hours",
    minute: "minutes",
    minutes: "minutes",
    second: "seconds",
    seconds: "seconds",
  };
  const key = unitMap[unit] || "days";
  return zdt.subtract({ [key]: value });
}

/**
 * 计算两个日期之间的差值
 *
 * @param date1 日期1
 * @param date2 日期2
 * @param unit 单位：day/month/year/hour/minute/second
 */
export function diffDate(date1: DateInput, date2: DateInput, unit: string = "day"): number {
  const zdt1 = toZonedDateTimeOrEpoch(date1);
  const zdt2 = toZonedDateTimeOrEpoch(date2);
  const unitMap: Record<
    string,
    "years" | "months" | "weeks" | "days" | "hours" | "minutes" | "seconds" | "milliseconds"
  > = {
    day: "days",
    days: "days",
    month: "months",
    months: "months",
    year: "years",
    years: "years",
    hour: "hours",
    hours: "hours",
    minute: "minutes",
    minutes: "minutes",
    second: "seconds",
    seconds: "seconds",
  };
  const largestUnit = unitMap[unit] || "days";
  const duration = zdt2.until(zdt1, { largestUnit });

  const valueMap: Record<string, number> = {
    years: duration.years,
    months: duration.months,
    weeks: duration.weeks,
    days: duration.days,
    hours: duration.hours,
    minutes: duration.minutes,
    seconds: duration.seconds,
    milliseconds: duration.milliseconds,
  };
  return valueMap[largestUnit] || 0;
}

// ==================== 相对时间 ====================

/**
 * 获取相对时间描述（如：3天前、2小时后）
 *
 * @param date 日期输入
 * @param baseDate 基准日期，默认当前时间
 */
export function fromNow(date: DateInput, baseDate?: DateInput): string {
  if (!date) return "";
  const zdt = toZonedDateTime(date);
  if (!zdt) return "";
  const base = toZonedDateTime(baseDate) || Temporal.Now.zonedDateTimeISO();

  // 计算相差的总天数，然后是小时和分钟
  const duration = base.until(zdt, { largestUnit: "days" });
  const days = duration.days;

  if (days === 0) {
    const hours = duration.hours;
    if (hours === 0) {
      const minutes = duration.minutes;
      if (minutes === 0) return "just now";
      return minutes > 0 ? `${minutes} minutes later` : `${Math.abs(minutes)} minutes ago`;
    }
    return hours > 0 ? `${hours} hours later` : `${Math.abs(hours)} hours ago`;
  }
  return days > 0 ? `${days} days later` : `${Math.abs(days)} days ago`;
}

/**
 * 获取到某个时间的相对描述（如：3天后）
 *
 * @param date 日期输入
 * @param baseDate 基准日期，默认当前时间
 */
export function toNow(date: DateInput, baseDate?: DateInput): string {
  if (!date) return "";
  const zdt = toZonedDateTime(date);
  if (!zdt) return "";
  const base = toZonedDateTime(baseDate) || Temporal.Now.zonedDateTimeISO();

  // 从指定日期到基准日期的时长
  const duration = zdt.until(base, { largestUnit: "days" });
  const days = duration.days;

  if (days === 0) {
    const hours = duration.hours;
    if (hours === 0) {
      const minutes = duration.minutes;
      if (minutes === 0) return "just now";
      return minutes > 0 ? `${minutes} minutes later` : `${Math.abs(minutes)} minutes ago`;
    }
    return hours > 0 ? `${hours} hours later` : `${Math.abs(hours)} hours ago`;
  }
  return days > 0 ? `${days} days later` : `${Math.abs(days)} days ago`;
}
