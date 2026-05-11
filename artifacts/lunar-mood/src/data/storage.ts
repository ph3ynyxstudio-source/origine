import { DayEntry } from "./day-entry.types";
import { parseLocalDate, toLocalNoon } from "./calendar";
import { isDevFallbackEnabled } from "./devFallbacks";
import { getMoonPhase as getDisplayMoonPhase } from "./moon";
import { validateDayEntry } from "./validator";
import { getMoonPhase } from "../services/lunarEngine";

const PREFIX = "lun4rmood:day:";
export const LOCAL_DATA_UPDATED_EVENT = "lun4rmood:local-data-updated";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function logStorageFallback(
  date: string,
  reason: string,
  error?: unknown,
): void {
  if (!import.meta.env.DEV) return;

  console.warn(`[lun4rmood][storage] fallback for ${date}: ${reason}`, error);
}

function notifyLocalDataUpdated() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LOCAL_DATA_UPDATED_EVENT));
}

export function getDayEntry(date: string): DayEntry | null {
  if (isDevFallbackEnabled("missing_local_data")) {
    logStorageFallback(date, "DEV simulated missing local data");
    return null;
  }

  if (isDevFallbackEnabled("corrupted_local_data")) {
    logStorageFallback(date, "DEV simulated corrupted local data");
    return null;
  }

  let raw: string | null = null;

  try {
    raw = localStorage.getItem(PREFIX + date);
  } catch (error) {
    logStorageFallback(date, "localStorage.getItem failed", error);
    return null;
  }

  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as unknown;

    if (!isRecord(parsed)) {
      logStorageFallback(date, "stored value is not an object");
      return null;
    }

    return validateDayEntry({
      ...parsed,
      date,
    });
  } catch (error) {
    logStorageFallback(date, "stored value could not be parsed", error);
    return null;
  }
}

export function saveDayEntry(entry: DayEntry): void {
  if (isDevFallbackEnabled("storage_write_failure")) {
    throw new Error("DEV simulated localStorage write failure");
  }

  const lunarData = getMoonPhase(toLocalNoon(parseLocalDate(entry.date)));
  const entryWithMoon: DayEntry = {
    ...entry,
    moonPhase: entry.moonPhase ?? getDisplayMoonPhase(parseLocalDate(entry.date)),
    moonIllumination: entry.moonIllumination ?? lunarData.illumination,
  };
  const safeEntry = validateDayEntry(entryWithMoon);
  try {
    localStorage.setItem(PREFIX + safeEntry.date, JSON.stringify(safeEntry));
  } catch (error) {
    logStorageFallback(safeEntry.date, "localStorage.setItem failed", error);
    throw error;
  }
  notifyLocalDataUpdated();
}

export function deleteDayEntry(date: string): void {
  try {
    localStorage.removeItem(PREFIX + date);
  } catch (error) {
    logStorageFallback(date, "localStorage.removeItem failed", error);
    throw error;
  }
  notifyLocalDataUpdated();
}

export function getEntriesForDates(
  dates: string[],
): Record<string, DayEntry | null> {
  return dates.reduce<Record<string, DayEntry | null>>((entries, date) => {
    entries[date] = getDayEntry(date);
    return entries;
  }, {});
}

export function getMonthEntries(year: number, month: number): DayEntry[] {
  const entries: DayEntry[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let d = 1; d <= daysInMonth; d++) {
    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const entry = getDayEntry(date);
    if (entry) entries.push(entry);
  }

  return entries;
}
