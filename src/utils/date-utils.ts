/**
 * Date utilities for RRV Green Basket Admin Dashboard.
 * Ensures that whenever the admin website opens, the current system date
 * is dynamically computed and used as the default date across all 7 modules.
 */

export const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const FULL_MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Returns date formatted as "DD MMM YYYY", e.g., "28 Oct 2026"
 */
export function getSystemDateFormatted(date: Date = new Date()): string {
  const d = date.getDate();
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
}

/**
 * Returns date formatted with weekday name, e.g., "Wed, 28 Oct 2026"
 */
export function getSystemDateWithDay(date: Date = new Date()): string {
  const dayName = DAY_NAMES[date.getDay()];
  return `${dayName}, ${getSystemDateFormatted(date)}`;
}

/**
 * Returns system time in 12-hour AM/PM format, e.g., "09:30 AM"
 */
export function getSystemTimeFormatted(date: Date = new Date()): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hoursStr}:${minutesStr} ${ampm}`;
}

/**
 * Returns date offset by given number of days (+1 for tomorrow, -1 for yesterday, etc.)
 */
export function getOffsetDateFormatted(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return getSystemDateFormatted(d);
}

/**
 * Returns month range string, e.g., "01 Oct 2026 - 28 Oct 2026"
 */
export function getCurrentMonthRangeFormatted(date: Date = new Date()): string {
  const m = MONTH_NAMES[date.getMonth()];
  const y = date.getFullYear();
  const today = getSystemDateFormatted(date);
  return `01 ${m} ${y} - ${today}`;
}

/**
 * Generates dynamic presets list for date selectors (Today, Tomorrow, Yesterday, etc.)
 */
export function getDynamicDatePresets() {
  const today = getSystemDateFormatted();
  const tomorrow = getOffsetDateFormatted(1);
  const yesterday = getOffsetDateFormatted(-1);
  const day2 = getOffsetDateFormatted(-2);
  const day3 = getOffsetDateFormatted(-3);

  return [
    { label: `Today (${today})`, value: today },
    { label: `Tomorrow (${tomorrow})`, value: tomorrow },
    { label: `Yesterday (${yesterday})`, value: yesterday },
    { label: day2, value: day2 },
    { label: day3, value: day3 },
  ];
}
