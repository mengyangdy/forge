import { Temporal } from "temporal-polyfill";

export interface GetBuildTimeOptions {
  /** Output format passed to Temporal formatting. */
  format?: string;

  /** Timezone used to render build time. */
  timezone?: string;
}

export function getBuildTime(options: GetBuildTimeOptions = {}) {
  const { format = "YYYY-MM-DD HH:mm:ss", timezone: timezoneName = "Asia/Shanghai" } = options;

  const now = Temporal.Now.zonedDateTimeISO(timezoneName);

  const pad = (num: number, size = 2) => String(num).padStart(size, "0");
  return format
    .replace(/YYYY/g, pad(now.year, 4))
    .replace(/YY/g, pad(now.year % 100, 2))
    .replace(/MM/g, pad(now.month, 2))
    .replace(/DD/g, pad(now.day, 2))
    .replace(/HH/g, pad(now.hour, 2))
    .replace(/mm/g, pad(now.minute, 2))
    .replace(/ss/g, pad(now.second, 2));
}
