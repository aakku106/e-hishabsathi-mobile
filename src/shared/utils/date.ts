import dayjs from "dayjs";

export function formatDate(date: string | Date | number): string {
  return dayjs(date).format("MMM D, YYYY");
}

export function formatTime(date: string | Date | number): string {
  return dayjs(date).format("hh:mm A");
}

export function formatDateTime(date: string | Date | number): string {
  return dayjs(date).format("MMM D, YYYY hh:mm A");
}

export function startOfDay(date: string | Date | number = new Date()): string {
  return dayjs(date).startOf("day").toISOString();
}

export function startOfWeek(date: string | Date | number = new Date()): string {
  return dayjs(date).startOf("week").toISOString();
}

export function startOfMonth(
  date: string | Date | number = new Date(),
): string {
  return dayjs(date).startOf("month").toISOString();
}

export function startOfYear(date: string | Date | number = new Date()): string {
  return dayjs(date).startOf("year").toISOString();
}

export function daysAgo(days: number): string {
  return dayjs().subtract(days, "day").toISOString();
}

export function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  return dayjs(dueDate).isBefore(dayjs(), "day");
}

/** Rough Gregorian month -> Nepali month mapping (approximate, ±1 month). */
export const NEPALI_MONTHS = [
  "Baisakh",
  "Jestha",
  "Asar",
  "Sawan",
  "Bhadra",
  "Ashoj",
  "Kartik",
  "Mangsir",
  "Poush",
  "Magh",
  "Falgun",
  "Chaitra",
] as const;

export function nepalMonthForDate(
  date: string | Date | number = new Date(),
): string {
  const month = dayjs(date).month();
  return NEPALI_MONTHS[month];
}

export function lastMonths(
  count: number,
  from: string | Date | number = new Date(),
): { label: string; month: string }[] {
  const result: { label: string; month: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const date = dayjs(from).subtract(i, "month");
    result.push({
      label: nepalMonthForDate(date.toDate()),
      month: date.format("YYYY-MM"),
    });
  }
  return result;
}

export function lastWeekdayLabels(
  from: string | Date | number = new Date(),
): { label: string; weekday: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const result: { label: string; weekday: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = dayjs(from).subtract(i, "day");
    result.push({ label: days[date.day()], weekday: date.day() });
  }
  return result;
}
