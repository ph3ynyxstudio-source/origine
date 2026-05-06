import { DayEntry } from "./day-entry.types";

const PREFIX = "lun4rmood:day:";

export function getDayEntry(date: string): DayEntry | null {
  const raw = localStorage.getItem(PREFIX + date);
  if (!raw) return null;
  return JSON.parse(raw) as DayEntry;
}

export function saveDayEntry(entry: DayEntry): void {
  localStorage.setItem(PREFIX + entry.date, JSON.stringify(entry));
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
