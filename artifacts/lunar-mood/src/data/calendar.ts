import { MoonPhase } from "./day-entry.types";

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function getMonthDays(year: number, month: number): Date[] {
  const days: Date[] = [];
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  // Padding début
  for (let i = 0; i < first.getDay(); i++) {
    days.push(new Date(year, month, -i));
  }
  days.reverse();

  // Jours du mois
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d));
  }

  return days;
}

export function isCurrentMonth(
  date: Date,
  year: number,
  month: number,
): boolean {
  return date.getFullYear() === year && date.getMonth() === month;
}
