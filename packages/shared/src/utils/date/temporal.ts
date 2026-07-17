import { Temporal } from "temporal-polyfill";
import type { DateInput } from "./constants";

export { Temporal };

/**
 * 将各种格式的 DateInput 转换为 ZonedDateTime
 *
 * @param date 输入时间
 * @param timeZone 目标时区，默认系统本地时区
 */
export function toZonedDateTime(
  date: DateInput,
  timeZone: string = Temporal.Now.timeZoneId(),
): Temporal.ZonedDateTime | null {
  if (!date) return null;
  if (date instanceof Temporal.ZonedDateTime) return date;
  if (date instanceof Temporal.Instant) return date.toZonedDateTimeISO(timeZone);
  if (date instanceof Temporal.PlainDateTime) return date.toZonedDateTime(timeZone);
  if (date instanceof Temporal.PlainDate) return date.toPlainDateTime().toZonedDateTime(timeZone);

  if (date instanceof Date) {
    return Temporal.Instant.fromEpochMilliseconds(date.getTime()).toZonedDateTimeISO(timeZone);
  }

  if (typeof date === "number") {
    // 自动识别秒级和毫秒级时间戳
    const ms = date < 10000000000 ? date * 1000 : date;
    return Temporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(timeZone);
  }

  if (typeof date === "string") {
    const trimmed = date.trim();
    if (trimmed === "") return null;
    try {
      // 尝试解析带时区的 ISO 字符串
      return Temporal.ZonedDateTime.from(trimmed);
    } catch {
      try {
        // 尝试解析不带时区的 ISO 字符串 (2024-03-15T10:30:00)
        const plainDateTime = Temporal.PlainDateTime.from(trimmed);
        return plainDateTime.toZonedDateTime(timeZone);
      } catch {
        try {
          // 尝试解析纯日期 (2024-03-15)
          const plainDate = Temporal.PlainDate.from(trimmed);
          return plainDate.toPlainDateTime().toZonedDateTime(timeZone);
        } catch {
          // 最终尝试使用 JS 原生 Date 解析
          const ms = Date.parse(trimmed);
          if (!isNaN(ms)) {
            return Temporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(timeZone);
          }
        }
      }
    }
  }

  return null;
}

/**
 * 强制转换为 ZonedDateTime，转换失败时回退至 Epoch 零点 (1970-01-01T00:00:00Z)
 */
export function toZonedDateTimeOrEpoch(
  date: DateInput,
  timeZone: string = Temporal.Now.timeZoneId(),
): Temporal.ZonedDateTime {
  return (
    toZonedDateTime(date, timeZone) ||
    Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO(timeZone)
  );
}
