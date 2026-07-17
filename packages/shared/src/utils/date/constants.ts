import type { Temporal } from "temporal-polyfill";

// ==================== 常用日期格式 ====================
export const DATE_FORMAT = {
  /** 年-月-日 */
  DATE: "YYYY-MM-DD",
  /** 年-月-日 时:分 */
  DATE_TIME_MINUTE: "YYYY-MM-DD HH:mm",
  /** 年-月-日 时:分:秒 */
  DATE_TIME: "YYYY-MM-DD HH:mm:ss",
  /** 时:分:秒 */
  TIME: "HH:mm:ss",
  /** 时:分 */
  TIME_MINUTE: "HH:mm",
  /** 年月 */
  MONTH: "YYYY-MM",
  /** 年 */
  YEAR: "YYYY",
  /** 中文日期 */
  DATE_CN: "YYYY年MM月DD日",
  /** 中文日期时间 */
  DATE_TIME_CN: "YYYY年MM月DD日 HH:mm:ss",
} as const;

// ==================== 日期类型 ====================
export type DateInput =
  | string
  | number
  | Date
  | Temporal.ZonedDateTime
  | Temporal.PlainDateTime
  | Temporal.PlainDate
  | Temporal.Instant
  | null
  | undefined;
