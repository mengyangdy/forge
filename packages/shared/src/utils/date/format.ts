import { Temporal } from "temporal-polyfill";
import { DATE_FORMAT } from "./constants";
import type { DateInput } from "./constants";
import { toZonedDateTime } from "./temporal";

/**
 * 将 ZonedDateTime 按照指定的模板格式化为字符串
 */
export function formatZonedDateTime(zdt: Temporal.ZonedDateTime, template: string): string {
  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return template
    .replace(/YYYY/g, pad(zdt.year, 4))
    .replace(/YY/g, pad(zdt.year % 100, 2))
    .replace(/MM/g, pad(zdt.month, 2))
    .replace(/DD/g, pad(zdt.day, 2))
    .replace(/HH/g, pad(zdt.hour, 2))
    .replace(/mm/g, pad(zdt.minute, 2))
    .replace(/ss/g, pad(zdt.second, 2));
}

/**
 * 格式化日期
 *
 * @param date 日期输入
 * @param format 格式化模板，默认 YYYY-MM-DD
 */
export function formatDate(date: DateInput, format: string = DATE_FORMAT.DATE): string {
  if (!date) return "";
  const zdt = toZonedDateTime(date);
  if (!zdt) return "";
  return formatZonedDateTime(zdt, format);
}

/**
 * 格式化日期时间
 *
 * @param date 日期输入
 * @param format 格式化模板，默认 YYYY-MM-DD HH:mm:ss
 */
export function formatDateTime(date: DateInput, format: string = DATE_FORMAT.DATE_TIME): string {
  if (!date) return "";
  const zdt = toZonedDateTime(date);
  if (!zdt) return "";
  return formatZonedDateTime(zdt, format);
}

/**
 * 格式化时间
 *
 * @param date 日期输入
 * @param format 格式化模板，默认 HH:mm:ss
 */
export function formatTime(date: DateInput, format: string = DATE_FORMAT.TIME): string {
  if (!date) return "";
  const zdt = toZonedDateTime(date);
  if (!zdt) return "";
  return formatZonedDateTime(zdt, format);
}

/**
 * 时间戳转日期字符串
 *
 * @param timestamp 时间戳（毫秒或秒）
 * @param format 格式化模板
 */
export function fromTimestamp(timestamp: number, format: string = DATE_FORMAT.DATE_TIME): string {
  if (!timestamp) return "";
  const zdt = toZonedDateTime(timestamp);
  if (!zdt) return "";
  return formatZonedDateTime(zdt, format);
}

/**
 * 格式化持续时间（毫秒转为可读格式）
 *
 * @param milliseconds 毫秒数
 * @param format 格式化模板，默认 HH:mm:ss
 */
export function formatDuration(milliseconds: number, format: string = "HH:mm:ss"): string {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, "0");
  return format
    .replace(/HH/g, pad(hours))
    .replace(/mm/g, pad(minutes))
    .replace(/ss/g, pad(seconds));
}

/**
 * 获取持续时间的人性化描述
 *
 * @param milliseconds 毫秒数
 */
export function humanizeDuration(milliseconds: number): string {
  const totalSeconds = Math.round(milliseconds / 1000);
  if (totalSeconds < 60) return "a few seconds";
  const minutes = Math.round(totalSeconds / 60);
  if (minutes === 1) return "a minute";
  if (minutes < 60) return `${minutes} minutes`;
  const hours = Math.round(minutes / 60);
  if (hours === 1) return "an hour";
  if (hours < 24) return `${hours} hours`;
  const days = Math.round(hours / 24);
  if (days === 1) return "a day";
  return `${days} days`;
}
