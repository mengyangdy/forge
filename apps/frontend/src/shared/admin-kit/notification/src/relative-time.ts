const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const MINUTE_IN_MS = 60 * 1000;
const HOUR_IN_MS = 60 * MINUTE_IN_MS;
const DAY_IN_MS = 24 * HOUR_IN_MS;

/**
 * Format a timestamp into a short relative string for notification rows.
 */
export function formatNotificationRelativeTime(
  date: Date | number | string,
  baseTime = Date.now(),
) {
  const targetTime = new Date(date).getTime();

  if (Number.isNaN(targetTime)) {
    return "";
  }

  const diff = targetTime - baseTime;
  const absDiff = Math.abs(diff);

  if (absDiff < MINUTE_IN_MS) {
    return RELATIVE_TIME_FORMATTER.format(0, "minute");
  }

  if (absDiff < HOUR_IN_MS) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(diff / MINUTE_IN_MS), "minute");
  }

  if (absDiff < DAY_IN_MS) {
    return RELATIVE_TIME_FORMATTER.format(Math.round(diff / HOUR_IN_MS), "hour");
  }

  return RELATIVE_TIME_FORMATTER.format(Math.round(diff / DAY_IN_MS), "day");
}
