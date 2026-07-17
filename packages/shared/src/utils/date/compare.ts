import { Temporal } from "temporal-polyfill";
import type { DateInput } from "./constants";
import { toZonedDateTime } from "./temporal";

/**
 * 判断是否为有效日期
 *
 * @param date 日期输入
 */
export function isValidDate(date: DateInput): boolean {
  if (!date) return false;
  try {
    const zdt = toZonedDateTime(date);
    return zdt !== null;
  } catch {
    return false;
  }
}

/**
 * 判断日期是否在某个日期之前
 *
 * @param date 日期输入
 * @param compareDate 比较日期
 */
export function isBefore(date: DateInput, compareDate: DateInput): boolean {
  const zdt1 = toZonedDateTime(date);
  const zdt2 = toZonedDateTime(compareDate);
  if (!zdt1 || !zdt2) return false;
  return Temporal.ZonedDateTime.compare(zdt1, zdt2) < 0;
}

/**
 * 判断日期是否在某个日期之后
 *
 * @param date 日期输入
 * @param compareDate 比较日期
 */
export function isAfter(date: DateInput, compareDate: DateInput): boolean {
  const zdt1 = toZonedDateTime(date);
  const zdt2 = toZonedDateTime(compareDate);
  if (!zdt1 || !zdt2) return false;
  return Temporal.ZonedDateTime.compare(zdt1, zdt2) > 0;
}

/**
 * 判断两个日期是否相同
 *
 * @param date1 日期1
 * @param date2 日期2
 * @param unit 比较精度：year / month / day / hour / minute / second
 */
export function isSame(date1: DateInput, date2: DateInput, unit?: string): boolean {
  const zdt1 = toZonedDateTime(date1);
  const zdt2 = toZonedDateTime(date2);
  if (!zdt1 || !zdt2) return false;

  if (!unit) {
    return Temporal.ZonedDateTime.compare(zdt1, zdt2) === 0;
  }

  const normalizedUnit = unit.toLowerCase();

  if (normalizedUnit === "year" || normalizedUnit === "years") {
    return zdt1.year === zdt2.year;
  }

  if (normalizedUnit === "month" || normalizedUnit === "months") {
    return zdt1.year === zdt2.year && zdt1.month === zdt2.month;
  }

  if (normalizedUnit === "day" || normalizedUnit === "days") {
    return zdt1.year === zdt2.year && zdt1.month === zdt2.month && zdt1.day === zdt2.day;
  }

  if (normalizedUnit === "hour" || normalizedUnit === "hours") {
    return (
      zdt1.year === zdt2.year &&
      zdt1.month === zdt2.month &&
      zdt1.day === zdt2.day &&
      zdt1.hour === zdt2.hour
    );
  }

  if (normalizedUnit === "minute" || normalizedUnit === "minutes") {
    return (
      zdt1.year === zdt2.year &&
      zdt1.month === zdt2.month &&
      zdt1.day === zdt2.day &&
      zdt1.hour === zdt2.hour &&
      zdt1.minute === zdt2.minute
    );
  }

  return Temporal.ZonedDateTime.compare(zdt1, zdt2) === 0;
}

/**
 * 判断是否是今天
 *
 * @param date 日期输入
 */
export function isToday(date: DateInput): boolean {
  return isSame(date, Temporal.Now.zonedDateTimeISO(), "day");
}

/**
 * 判断是否是昨天
 *
 * @param date 日期输入
 */
export function isYesterday(date: DateInput): boolean {
  const yesterday = Temporal.Now.zonedDateTimeISO().subtract({ days: 1 });
  return isSame(date, yesterday, "day");
}

/**
 * 判断是否是明天
 *
 * @param date 日期输入
 */
export function isTomorrow(date: DateInput): boolean {
  const tomorrow = Temporal.Now.zonedDateTimeISO().add({ days: 1 });
  return isSame(date, tomorrow, "day");
}
